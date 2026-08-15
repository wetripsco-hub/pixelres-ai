import Stripe from "stripe"
import { loadStripe, Stripe as StripeJs } from "@stripe/stripe-js"

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "sk_test_placeholder", {
  typescript: true,
})

let stripePromise: Promise<StripeJs | null>

export const getStripe = () => {
  if (!stripePromise) {
    stripePromise = loadStripe(
      process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "pk_test_placeholder"
    )
  }
  return stripePromise
}
