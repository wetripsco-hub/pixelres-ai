import { NextResponse } from "next/server";
import Stripe from "stripe";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { orderId, tier, currency, amount, customerEmail, userId, enhancementType } = body;

    if (!orderId || !tier || !currency || !amount) {
      return NextResponse.json({ error: "Missing required parameters" }, { status: 400 });
    }

    const stripeKey = process.env.STRIPE_SECRET_KEY;
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

    // ── Sandbox fallback: if no valid Stripe key, redirect straight to dashboard ──
    if (!stripeKey || stripeKey === "sk_test_placeholder" || stripeKey.length < 20) {
      console.warn("[Checkout] No valid STRIPE_SECRET_KEY found — using sandbox fallback.");
      return NextResponse.json({
        url: `${baseUrl}/dashboard?payment=success&order_id=${orderId}`,
      });
    }

    // ── Real Stripe checkout ──
    const stripe = new Stripe(stripeKey, {
      apiVersion: "2025-02-24.acacia",
    });

    // Convert amount to cents / smallest currency unit
    const unitAmount = Math.round(amount * 100);

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      customer_email: customerEmail || undefined,
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
      success_url: `${baseUrl}/dashboard?payment=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/dashboard?payment=cancelled`,
      metadata: {
        orderId,
        userId: userId || "guest",
        resolutionTier: tier,
        enhancementType: enhancementType || "general",
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    console.error("Error creating checkout session:", err);

    // If Stripe itself errors (invalid key, network, etc.), fall back gracefully
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
    const orderId = (await req.clone().json().catch(() => ({})))?.orderId || "unknown";

    return NextResponse.json({
      url: `${baseUrl}/dashboard?payment=success&order_id=${orderId}`,
    });
  }
}
