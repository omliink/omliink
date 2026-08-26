import Stripe from 'stripe'

const secretKey = process.env.STRIPE_SECRET_KEY
if (!secretKey) {
  throw new Error('Missing STRIPE_SECRET_KEY environment variable')
}

// Server-only client — STRIPE_SECRET_KEY must never reach the browser bundle.
export const stripe = new Stripe(secretKey)
