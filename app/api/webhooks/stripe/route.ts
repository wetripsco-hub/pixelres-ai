import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createAdminClient } from '@/lib/supabase/admin';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder', {
  apiVersion: '2025-02-24.acacia',
});

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(req: Request) {
  const body = await req.text();
  const sig = req.headers.get('stripe-signature');

  let event: Stripe.Event;

  try {
    if (!sig || !endpointSecret) {
      throw new Error('Missing Stripe signature or webhook secret');
    }
    event = stripe.webhooks.constructEvent(body, sig, endpointSecret);
  } catch (err: any) {
    console.error(`Webhook Error: ${err.message}`);
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  // Handle the event
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;

    // Retrieve metadata
    const orderId = session.metadata?.orderId;

    if (orderId) {
      const adminClient = createAdminClient();

      // Update the order in Supabase
      const { error } = await adminClient
        .from('orders')
        .update({
          status: 'processing',
          amount_paid: session.amount_total ? session.amount_total / 100 : 0,
          currency: session.currency?.toUpperCase() || 'USD'
        })
        .eq('id', orderId);

      if (error) {
        console.error('Error updating order status:', error);
        return NextResponse.json({ error: 'Failed to update order in database' }, { status: 500 });
      }

      console.log(`Order ${orderId} successfully marked as processing.`);
    }
  }

  return NextResponse.json({ received: true });
}
