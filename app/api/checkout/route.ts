import { NextResponse } from "next/server";
import Stripe from "stripe";

function getBaseUrl(req: Request): string {
  // 1. Try origin header (sent automatically by browser on fetch POST)
  const origin = req.headers.get("origin");
  if (origin && !origin.includes("localhost")) {
    return origin;
  }

  // 2. Try referer header (e.g. https://your-domain.vercel.app/studio)
  const referer = req.headers.get("referer");
  if (referer) {
    try {
      const url = new URL(referer);
      if (!url.hostname.includes("localhost")) {
        return url.origin;
      }
    } catch {}
  }

  // 3. Try host header + x-forwarded-proto
  const host = req.headers.get("host");
  if (host && !host.includes("localhost")) {
    const proto = req.headers.get("x-forwarded-proto") || "https";
    return `${proto}://${host}`;
  }

  // 4. Try Vercel environment variables
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL;
  }
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL;
  }

  // 5. Fallback to origin or localhost
  return origin || "http://localhost:3000";
}

export async function POST(req: Request) {
  const baseUrl = getBaseUrl(req);

  try {
    const body = await req.json();
    const { orderId, tier, currency, amount, customerEmail, userId, enhancementType } = body;

    if (!orderId || !tier || !currency || !amount) {
      return NextResponse.json({ error: "Missing required parameters" }, { status: 400 });
    }

    const stripeKey = process.env.STRIPE_SECRET_KEY;

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
      success_url: `${baseUrl}/dashboard?payment=success&session_id={CHECKOUT_SESSION_ID}&order_id=${orderId}`,
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

    const orderId = (await req.clone().json().catch(() => ({})))?.orderId || "unknown";

    return NextResponse.json({
      url: `${baseUrl}/dashboard?payment=success&order_id=${orderId}`,
    });
  }
}
