import { NextResponse } from "next/server"
import { stripe } from "@/lib/stripe"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { priceId, credits } = body

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"

    // If Stripe key is set, attempt to create real Checkout Session
    if (process.env.STRIPE_SECRET_KEY && process.env.STRIPE_SECRET_KEY !== "sk_test_placeholder") {
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: [
          {
            price_data: {
              currency: "usd",
              product_data: {
                name: `PixelRes AI - ${credits} Credits Package`,
                description: "AI 8K Super-resolution processing credits",
              },
              unit_amount: credits * 15, // Mock calculation
            },
            quantity: 1,
          },
        ],
        mode: "payment",
        success_url: `${appUrl}/dashboard?success=true&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${appUrl}/dashboard?canceled=true`,
        metadata: {
          credits: credits.toString(),
        },
      })

      return NextResponse.json({ sessionId: session.id, url: session.url })
    }

    // Mock fallback mode for local development/testing without live Stripe keys
    return NextResponse.json({
      status: "success",
      mock: true,
      message: `Checkout session initialized for ${credits} credits.`,
      mockSessionUrl: `${appUrl}/dashboard?mock_success=true&credits=${credits}`,
    })
  } catch (error: any) {
    console.error("Stripe Checkout Error:", error)
    return NextResponse.json(
      { error: error.message || "Failed to create Stripe checkout session" },
      { status: 500 }
    )
  }
}
