import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder', {
  apiVersion: '2025-02-24.acacia',
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { orderId, tier, currency, amount, customerEmail, userId, enhancementType } = body;

    if (!orderId || !tier || !currency || !amount) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    // Convert amount to cents/smallest currency unit. Note: PKR and INR also use smallest unit (paisa) in Stripe, meaning multiply by 100.
    // JPY doesn't, but USD, PKR, INR do.
    const unitAmount = Math.round(amount * 100);

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      customer_email: customerEmail || undefined,
      line_items: [
        {
          price_data: {
            currency: currency.toLowerCase(),
            product_data: {
              name: `PixelRes AI - ${tier.toUpperCase()} Upscale`,
              description: `Enhancement: ${enhancementType}`,
            },
            unit_amount: unitAmount,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${baseUrl}/dashboard?payment=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/dashboard?payment=cancelled`,
      metadata: {
        orderId,
        userId: userId || 'guest',
        resolutionTier: tier,
        enhancementType,
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    console.error('Error creating checkout session:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
