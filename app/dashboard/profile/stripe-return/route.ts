import { NextResponse } from 'next/server'
import { syncStripeConnectStatus } from '@/lib/actions/stripe-connect'

// Intermediate stop for Stripe Connect's onboarding return_url. Checking
// account status and updating stripe_connect_onboarded here (a Route
// Handler) rather than in the /dashboard/profile page's render body avoids
// "revalidatePath used during render" — Next.js requires that kind of
// mutation to happen outside of rendering a Server Component.
export async function GET(request: Request) {
  await syncStripeConnectStatus()
  return NextResponse.redirect(new URL('/dashboard/profile', request.url))
}
