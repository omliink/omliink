'use client'

import { useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import Link from 'next/link'
import SignupIllustration from '@/components/SignupIllustration'

type AccountType = 'employer' | 'candidate'

interface FormErrors {
  email?: string
  password?: string
  confirmPassword?: string
  fullName?: string
  phone?: string
  accountType?: string
  terms?: string
}

const benefits = ['Inscription rapide (2 min)', 'Vérification KYC incluse', 'Accès immédiat aux missions']

const hasMinLength = (value: string) => value.length >= 12
const hasUppercase = (value: string) => /[A-Z]/.test(value)
const hasDigit = (value: string) => /[0-9]/.test(value)
const isPasswordValid = (value: string) => hasMinLength(value) && hasUppercase(value) && hasDigit(value)

function CheckIcon({ ok }: { ok: boolean }) {
  return (
    <svg viewBox="0 0 16 16" className="h-3 w-3 flex-shrink-0" aria-hidden="true">
      {ok ? (
        <path d="M3 8.5l3 3 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      ) : (
        <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none" />
      )}
    </svg>
  )
}

export default function SignupPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [accountType, setAccountType] = useState<AccountType | null>(null)
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [errors, setErrors] = useState<FormErrors>({})
  const [submitError, setSubmitError] = useState('')
  const [loading, setLoading] = useState(false)

  const { signUp } = useAuth()

  const passwordChecks = [
    { key: 'length', label: '12 caractères', ok: hasMinLength(password) },
    { key: 'uppercase', label: '1 majuscule', ok: hasUppercase(password) },
    { key: 'digit', label: '1 chiffre', ok: hasDigit(password) },
  ]

  const validate = (): FormErrors => {
    const next: FormErrors = {}

    if (!email.trim()) {
      next.email = "L'email est requis"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      next.email = 'Format email invalide'
    }

    if (!password) {
      next.password = 'Le mot de passe est requis'
    } else if (!isPasswordValid(password)) {
      next.password = 'Le mot de passe ne respecte pas les critères ci-dessous'
    }

    if (!confirmPassword) {
      next.confirmPassword = 'Merci de confirmer votre mot de passe'
    } else if (password !== confirmPassword) {
      next.confirmPassword = 'Les mots de passe ne correspondent pas'
    }

    if (!fullName.trim()) {
      next.fullName = 'Le nom complet est requis'
    }

    if (!phone.trim()) {
      next.phone = 'Le téléphone est requis'
    }

    if (!accountType) {
      next.accountType = 'Merci de choisir un type de compte'
    }

    if (!termsAccepted) {
      next.terms = "Merci d'accepter les CGU pour continuer"
    }

    return next
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitError('')

    const validationErrors = validate()
    setErrors(validationErrors)
    if (Object.keys(validationErrors).length > 0) return

    setLoading(true)
    try {
      const { session } = await signUp(email, password, {
        fullName: fullName.trim(),
        phone: phone.trim(),
        accountType: accountType as AccountType,
      })

      // Full navigation rather than router.push(): the server (proxy.ts +
      // Server Components) needs to see the just-set session cookie on a
      // fresh request. A client-side push/refresh can race the in-flight
      // transition and leave the page blank until a manual reload.
      if (session) {
        // Email confirmation is disabled: a session is already active, so we
        // can go straight to the dashboard instead of bouncing through login.
        // eslint-disable-next-line @next/next/no-location-assign-relative-destination
        window.location.href = '/dashboard'
      } else {
        // eslint-disable-next-line @next/next/no-location-assign-relative-destination
        window.location.href = '/auth/login?message=Vérifiez votre email pour confirmer votre compte'
      }
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Échec de l'inscription")
    } finally {
      setLoading(false)
    }
  }

  const clearError = (field: keyof FormErrors) => {
    setErrors((prev) => {
      if (!prev[field]) return prev
      const next = { ...prev }
      delete next[field]
      return next
    })
  }

  const inputClass = (hasError?: string) =>
    `block w-full rounded-lg border px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#ff5a3d] ${
      hasError ? 'border-red-300 focus:border-red-400' : 'border-gray-300 focus:border-[#ff5a3d]'
    }`

  return (
    <div className="min-h-screen bg-gray-100 pt-4">
      <div className="grid h-[calc(100vh-1rem)] overflow-hidden lg:grid-cols-[35%_65%]">
        <aside className="hidden flex-col overflow-y-auto rounded-tr-3xl bg-[#ff6b4a] px-8 py-8 text-white shadow-[inset_-8px_0_16px_rgba(0,0,0,0.15)] lg:flex xl:px-10">
          <div>
            <Link href="/" className="flex items-center gap-2 text-base font-bold">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-white text-xs font-bold text-[#ff5a3d]">
                O
              </span>
              OMLIINK
            </Link>

            <h2 className="mt-8 text-2xl font-bold leading-tight xl:text-3xl">Créer un Compte OMLIINK</h2>
            <p className="mt-2 text-sm text-orange-50">Rejoignez 50 000+ particuliers vérifiés</p>

            <ul className="mt-6 space-y-3">
              {benefits.map((benefit) => (
                <li key={benefit} className="flex items-start gap-2.5 text-xs text-orange-50">
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
              <SignupIllustration />
            </div>
          </div>

          <p className="text-xs text-orange-50">
            Déjà inscrit ?{' '}
            <Link href="/auth/login" className="font-semibold text-white underline underline-offset-2 hover:text-orange-100">
              Se connecter
            </Link>
          </p>
        </aside>

        <main className="flex items-center justify-center overflow-y-auto bg-white px-4 py-6 sm:px-6">
          <div className="w-full max-w-md">
            <div className="mb-4 lg:hidden">
              <Link href="/" className="flex items-center gap-2 text-xl font-bold text-gray-900">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#ff5a3d] text-sm font-bold text-white">
                  O
                </span>
                OMLIINK
              </Link>
            </div>

            <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">Créer un Compte OMLIINK</h1>
            <p className="mt-1 text-sm text-gray-600">Rejoignez 50 000+ particuliers vérifiés.</p>

            <form onSubmit={handleSubmit} noValidate className="mt-4 flex flex-col gap-3">
              {/* Section: Compte */}
              <fieldset className="flex flex-col gap-2.5">
                <legend className="mb-0.5 text-xs font-semibold uppercase tracking-wide text-gray-500">Compte</legend>

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
                    onChange={(e) => {
                      setEmail(e.target.value)
                      clearError('email')
                    }}
                    aria-describedby={errors.email ? 'email-error' : undefined}
                    aria-invalid={Boolean(errors.email)}
                    className={inputClass(errors.email)}
                  />
                  {errors.email && (
                    <p id="email-error" role="alert" className="mt-1 text-xs text-red-600">
                      {errors.email}
                    </p>
                  )}
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label htmlFor="password" className="mb-1 block text-sm font-medium text-gray-700">
                      Mot de passe
                    </label>
                    <input
                      id="password"
                      type="password"
                      autoComplete="new-password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value)
                        clearError('password')
                      }}
                      aria-describedby="password-requirements"
                      aria-invalid={Boolean(errors.password)}
                      className={inputClass(errors.password)}
                    />
                    {errors.password && (
                      <p role="alert" className="mt-1 text-xs text-red-600">
                        {errors.password}
                      </p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="confirmPassword" className="mb-1 block text-sm font-medium text-gray-700">
                      Confirmer
                    </label>
                    <input
                      id="confirmPassword"
                      type="password"
                      autoComplete="new-password"
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => {
                        setConfirmPassword(e.target.value)
                        clearError('confirmPassword')
                      }}
                      aria-invalid={Boolean(errors.confirmPassword)}
                      className={inputClass(errors.confirmPassword)}
                    />
                    {errors.confirmPassword && (
                      <p role="alert" className="mt-1 text-xs text-red-600">
                        {errors.confirmPassword}
                      </p>
                    )}
                  </div>
                </div>

                <div id="password-requirements" aria-live="polite" className="-mt-1 flex flex-wrap gap-x-3 gap-y-1">
                  {passwordChecks.map((check) => (
                    <span
                      key={check.key}
                      className={`inline-flex items-center gap-1 text-[11px] font-medium ${
                        check.ok ? 'text-emerald-600' : 'text-red-500'
                      }`}
                    >
                      <CheckIcon ok={check.ok} />
                      {check.label}
                      <span className="sr-only">{check.ok ? ' — respecté' : ' — manquant'}</span>
                    </span>
                  ))}
                </div>
              </fieldset>

              {/* Section: Infos */}
              <fieldset className="flex flex-col gap-2.5">
                <legend className="mb-0.5 text-xs font-semibold uppercase tracking-wide text-gray-500">Infos</legend>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label htmlFor="fullName" className="mb-1 block text-sm font-medium text-gray-700">
                      Nom complet
                    </label>
                    <input
                      id="fullName"
                      type="text"
                      autoComplete="name"
                      placeholder="Jeanne Dupont"
                      value={fullName}
                      onChange={(e) => {
                        setFullName(e.target.value)
                        clearError('fullName')
                      }}
                      aria-invalid={Boolean(errors.fullName)}
                      className={inputClass(errors.fullName)}
                    />
                    {errors.fullName && (
                      <p role="alert" className="mt-1 text-xs text-red-600">
                        {errors.fullName}
                      </p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="phone" className="mb-1 block text-sm font-medium text-gray-700">
                      Téléphone
                    </label>
                    <input
                      id="phone"
                      type="tel"
                      autoComplete="tel"
                      placeholder="06 12 34 56 78"
                      value={phone}
                      onChange={(e) => {
                        setPhone(e.target.value)
                        clearError('phone')
                      }}
                      aria-invalid={Boolean(errors.phone)}
                      className={inputClass(errors.phone)}
                    />
                    {errors.phone && (
                      <p role="alert" className="mt-1 text-xs text-red-600">
                        {errors.phone}
                      </p>
                    )}
                  </div>
                </div>
              </fieldset>

              {/* Section: Type */}
              <fieldset>
                <legend className="mb-0.5 text-xs font-semibold uppercase tracking-wide text-gray-500">Type</legend>

                <div
                  className="mt-1.5 grid gap-2.5 sm:grid-cols-2"
                  role="radiogroup"
                  aria-describedby={errors.accountType ? 'account-type-error' : undefined}
                >
                  {(
                    [
                      { value: 'employer', label: 'Employeur', hint: 'Je publie des missions' },
                      { value: 'candidate', label: 'Candidat', hint: 'Je réponds à des missions' },
                    ] as const
                  ).map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      role="radio"
                      aria-checked={accountType === option.value}
                      onClick={() => {
                        setAccountType(option.value)
                        clearError('accountType')
                      }}
                      className={`rounded-lg border px-3 py-2 text-left text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-[#ff5a3d] ${
                        accountType === option.value
                          ? 'border-[#ff5a3d] bg-orange-50 text-[#ff5a3d]'
                          : 'border-gray-300 text-gray-700 hover:border-gray-400'
                      }`}
                    >
                      <span className="block font-semibold">{option.label}</span>
                      <span className="mt-0.5 block text-xs text-gray-500">{option.hint}</span>
                    </button>
                  ))}
                </div>
                {errors.accountType && (
                  <p id="account-type-error" role="alert" className="mt-1 text-xs text-red-600">
                    {errors.accountType}
                  </p>
                )}
              </fieldset>

              {/* Section: Légal */}
              <fieldset>
                <legend className="mb-0.5 text-xs font-semibold uppercase tracking-wide text-gray-500">Légal</legend>

                <label htmlFor="terms" className="mt-1.5 flex items-start gap-2 text-sm text-gray-600">
                  <input
                    id="terms"
                    type="checkbox"
                    checked={termsAccepted}
                    onChange={(e) => {
                      setTermsAccepted(e.target.checked)
                      clearError('terms')
                    }}
                    aria-describedby={errors.terms ? 'terms-error' : undefined}
                    aria-invalid={Boolean(errors.terms)}
                    className="mt-0.5 h-4 w-4 rounded border-gray-300 text-[#ff5a3d] focus:ring-2 focus:ring-[#ff5a3d]"
                  />
                  <span>
                    J&apos;accepte les{' '}
                    <Link href="/cgu" className="font-medium text-[#ff5a3d] underline hover:text-[#ff5a3d]/80">
                      CGU
                    </Link>{' '}
                    et la{' '}
                    <Link href="/politique-confidentialite" className="font-medium text-[#ff5a3d] underline hover:text-[#ff5a3d]/80">
                      politique de confidentialité
                    </Link>
                  </span>
                </label>
                {errors.terms && (
                  <p id="terms-error" role="alert" className="mt-1 text-xs text-red-600">
                    {errors.terms}
                  </p>
                )}
              </fieldset>

              {submitError && (
                <div role="alert" aria-live="polite" className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
                  {submitError}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#ff5a3d] px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#ff5a3d]/90 focus:outline-none focus:ring-2 focus:ring-[#ff5a3d] focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading && (
                  <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.25" />
                    <path d="M22 12a10 10 0 00-10-10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                  </svg>
                )}
                {loading ? 'Création du compte…' : 'Créer un compte'}
              </button>
            </form>

            <p className="mt-4 text-center text-sm text-gray-600 lg:hidden">
              Déjà inscrit ?{' '}
              <Link href="/auth/login" className="font-medium text-[#ff5a3d] underline hover:text-[#ff5a3d]/80">
                Se connecter
              </Link>
            </p>

            <div className="mt-4 flex justify-center gap-4 text-xs text-gray-500">
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
