import { headers } from 'next/headers'

/**
 * Derives the current request's origin from its Host header — used to build
 * absolute return/redirect URLs for Stripe (Connect onboarding, Checkout)
 * without needing a separate env var kept in sync across environments.
 */
export async function getBaseUrl(): Promise<string> {
  const headersList = await headers()
  const host = headersList.get('host') ?? 'localhost:3000'
  const protocol = host.startsWith('localhost') ? 'http' : 'https'
  return `${protocol}://${host}`
}
