import { NextResponse } from "next/server"
import { headers } from "next/headers"
import { stripe } from "@/lib/stripe"

export async function POST(req: Request) {
  const body = await req.text()
  const headerList = await headers()
  const signature = headerList.get("stripe-signature")

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

  let event: any

  try {
    if (webhookSecret && signature && webhookSecret !== "whsec_your_stripe_webhook_secret") {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    } else {
      // Development mode fallback when real webhook secret is not configured
      event = JSON.parse(body)
    }
  } catch (err: any) {
    console.error(`Webhook signature verification failed: ${err.message}`)
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 })
  }

  // Handle Stripe Webhook Events
  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object
      const creditsAllocated = session.metadata?.credits
      console.log(`[Stripe Webhook] Payment received for session ${session.id}. Credits: ${creditsAllocated}`)
      // Update Supabase DB user credits balance here
      break
    }
    case "payment_intent.succeeded": {
      const paymentIntent = event.data.object
      console.log(`[Stripe Webhook] PaymentIntent ${paymentIntent.id} succeeded.`)
      break
    }
    default:
      console.log(`[Stripe Webhook] Unhandled event type: ${event.type}`)
  }

  return NextResponse.json({ received: true })
}
