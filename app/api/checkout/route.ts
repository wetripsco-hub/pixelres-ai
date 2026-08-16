import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2025-02-24.acacia' as any })
  : null;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { orderId, tier, currency, amount, customerEmail, userId } = body;

    const origin = req.headers.get('origin') || process.env.NEXT_PUBLIC_APP_URL || 'https://pixelres-ai.vercel.app';

    // Graceful fallback if Stripe secret key is not configured in environment
    if (!stripe) {
      return NextResponse.json({
        url: `${origin}/dashboard?payment=success&order_id=${orderId}`
      });
    }

    const unitAmount = Math.round(Number(amount) * 100);

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: (currency || 'usd').toLowerCase(),
            product_data: {
              name: `PixelRes AI - ${tier.toUpperCase()} Upscale`,
              description: `Order ID: ${orderId}`,
            },
            unit_amount: unitAmount,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      customer_email: customerEmail || undefined,
      metadata: {
        orderId,
        userId: userId || 'guest',
        tier,
      },
      success_url: `${origin}/dashboard?payment=success&order_id=${orderId}`,
      cancel_url: `${origin}/studio?payment=cancelled`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error('Stripe Checkout Error:', error);
    return NextResponse.json({ error: error.message || 'Checkout failed' }, { status: 500 });
  }
}
