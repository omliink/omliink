'use client'

import { useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import LoginIllustration from '@/components/LoginIllustration'

const benefits = [
  '100% légal (déclaration URSSAF automatique)',
  'Visioconférence obligatoire avant chaque mission',
  'Paiements sécurisés',
]

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { signIn } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await signIn(email, password)
      router.push('/')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to sign in')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 pt-4">
      <div className="grid h-[calc(100vh-1rem)] overflow-hidden lg:grid-cols-[35%_65%]">
        <aside className="hidden flex-col overflow-y-auto rounded-tr-3xl bg-indigo-600 px-8 py-7 text-white shadow-[inset_-8px_0_16px_rgba(0,0,0,0.15)] lg:flex xl:px-10">
          <div>
            <Link href="/" className="flex items-center gap-2 text-base font-bold">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-white text-xs font-bold text-indigo-600">
                O
              </span>
              OMLIINK
            </Link>

            <h2 className="mt-6 text-2xl font-bold leading-tight xl:text-3xl">
              La plateforme de services entre particuliers
            </h2>

            <ul className="mt-5 space-y-3">
              {benefits.map((benefit) => (
                <li key={benefit} className="flex items-start gap-2.5 text-xs text-indigo-50">
                  <svg viewBox="0 0 20 20" className="mt-0.5 h-4 w-4 flex-shrink-0" aria-hidden="true">
                    <circle cx="10" cy="10" r="10" fill="white" fillOpacity="0.15" />
                    <path d="M6 10l2.5 2.5L14 7" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                  </svg>
                  {benefit}
                </li>
              ))}
            </ul>
          </div>

          <div className="animate-illustration-in flex flex-1 items-center justify-center">
            <div className="h-72 w-full">
              <LoginIllustration />
            </div>
          </div>

          <p className="text-xs text-indigo-100">
            Pas encore de compte ?{' '}
            <Link href="/auth/signup" className="font-semibold text-white underline underline-offset-2 hover:text-indigo-50">
              S&apos;inscrire
            </Link>
          </p>
        </aside>

        <main className="flex items-center justify-center overflow-y-auto bg-white px-4 py-8 sm:px-6">
          <div className="w-full max-w-md">
            <div className="mb-6 lg:hidden">
              <Link href="/" className="flex items-center gap-2 text-xl font-bold text-gray-900">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500 text-sm font-bold text-white">
                  O
                </span>
                OMLIINK
              </Link>
            </div>

            <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">Se Connecter</h1>
            <p className="mt-1.5 text-sm text-gray-600">Accédez à votre compte OMLIINK.</p>

            <form onSubmit={handleSubmit} noValidate className="mt-6 flex flex-col gap-3.5">
              <div>
                <label htmlFor="email" className="mb-1 block text-sm font-medium text-gray-700">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="vous@exemple.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <div className="mb-1 flex items-center justify-between">
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                    Mot de passe
                  </label>
                  <Link href="/auth/forgot-password" className="text-xs font-medium text-indigo-600 underline hover:text-indigo-700">
                    Mot de passe oublié ?
                  </Link>
                </div>
                <input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {error && (
                <div role="alert" aria-live="polite" className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="mt-1 flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-500 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading && (
                  <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.25" />
                    <path d="M22 12a10 10 0 00-10-10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                  </svg>
                )}
                {loading ? 'Connexion…' : 'Se connecter'}
              </button>
            </form>

            <p className="mt-5 text-center text-sm text-gray-600 lg:hidden">
              Pas encore de compte ?{' '}
              <Link href="/auth/signup" className="font-medium text-indigo-600 underline hover:text-indigo-700">
                S&apos;inscrire
              </Link>
            </p>

            <div className="mt-6 flex justify-center gap-4 text-xs text-gray-500">
              <Link href="/cgu" className="hover:text-gray-700">CGU</Link>
              <span aria-hidden="true">·</span>
              <Link href="/politique-confidentialite" className="hover:text-gray-700">Politique</Link>
              <span aria-hidden="true">·</span>
              <Link href="/contact" className="hover:text-gray-700">Contact</Link>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
