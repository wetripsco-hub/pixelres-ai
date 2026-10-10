import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createAdminClient } from "@/lib/supabase/admin";
import { getGlobalPricing, getPriceForTierAndCurrency, ResolutionTier, CurrencyCode } from "@/lib/pricing";

function getBaseUrl(req: Request): string {
  // Redirect targets must not be controlled by request headers (Origin/Referer/Host can be spoofed).
  if (process.env.NEXT_PUBLIC_APP_URL) return process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, "");
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return new URL(req.url).origin;
}

export async function POST(req: Request) {
  const baseUrl = getBaseUrl(req);

  try {
    const body = await req.json();
    const { orderId, customerEmail } = body;

    if (!orderId) {
      return NextResponse.json({ error: "Missing required parameters" }, { status: 400 });
    }

    // Everything that affects the price comes from the order stored on the server,
    // not from the request body.
    const admin = createAdminClient();
    const { data: order } = await admin
      .from("orders")
      .select("id, user_id, guest_email, target_resolution, enhancement_type, currency, status")
      .eq("id", orderId)
      .maybeSingle();

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }
    if (order.status !== "pending") {
      return NextResponse.json({ error: "Order is already paid or processed" }, { status: 409 });
    }

    const tier = order.target_resolution as ResolutionTier;
    const currency = order.currency as CurrencyCode;
    const enhancementType = order.enhancement_type;
    const userId = order.user_id;

    const globalPricing = await getGlobalPricing();
    const verifiedPrice = getPriceForTierAndCurrency(globalPricing, tier, currency);

    const stripeKey = process.env.STRIPE_SECRET_KEY;

    // ── Sandbox fallback: if no valid Stripe key, redirect straight to dashboard ──
    if (!stripeKey || stripeKey === "sk_test_placeholder" || stripeKey.length < 20) {
      // Never let production hand out free orders because a key is missing.
      if (process.env.NODE_ENV === "production") {
        console.error("[Checkout] STRIPE_SECRET_KEY is not configured.");
        return NextResponse.json({ error: "Payments are not configured." }, { status: 503 });
      }
      console.warn("[Checkout] No valid STRIPE_SECRET_KEY found — using local sandbox fallback.");
      await admin.from("orders").update({ status: "processing" }).eq("id", orderId);
      return NextResponse.json({
        url: `${baseUrl}/dashboard?payment=success&order_id=${orderId}`,
      });
    }

    // ── Real Stripe checkout ──
    const stripe = new Stripe(stripeKey, {
      apiVersion: "2025-02-24.acacia",
    });

    // Convert verified price to cents / smallest currency unit
    const unitAmount = Math.round(verifiedPrice * 100);

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      customer_email: order.guest_email || customerEmail || undefined,
      line_items: [
        {
          price_data: {
            currency: currency.toLowerCase(),
            product_data: {
              name: `PixelRes AI - ${tier.toUpperCase()} Upscale`,
              description: `Enhancement: ${enhancementType || "general"}`,
            },
            unit_amount: unitAmount,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${baseUrl}/dashboard?payment=success&session_id={CHECKOUT_SESSION_ID}&order_id=${orderId}`,
      cancel_url: `${baseUrl}/studio?payment=cancelled`,
      metadata: {
        orderId,
        userId: userId || "guest",
        resolutionTier: tier,
        enhancementType: enhancementType || "general",
        amountPaid: verifiedPrice.toString(),
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    console.error("Error creating checkout session:", err);

    // Return a proper error so the client-side can display it to the user
    return NextResponse.json(
      { error: "Failed to create checkout session. Please try again." },
      { status: 500 }
    );
  }
}
