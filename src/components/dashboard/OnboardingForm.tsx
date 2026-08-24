'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

type AccountType = 'employer' | 'candidate'

interface OnboardingFormProps {
  userId: string
  email: string
  fullName: string | null
  phone: string | null
  initialAccountType: AccountType | null
}

export default function OnboardingForm({ userId, email, fullName, phone, initialAccountType }: OnboardingFormProps) {
  const [accountType, setAccountType] = useState<AccountType | null>(initialAccountType)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!accountType) {
      setError('Merci de choisir un type de compte')
      return
    }

    setLoading(true)
    try {
      const { error: profileError } = await supabase.from('profiles').upsert({
        id: userId,
        email,
        full_name: fullName,
        phone,
        is_employer: accountType === 'employer',
        is_candidate: accountType === 'candidate',
        is_verified: false,
        verification_type: null,
        account_status: 'active',
        avatar_url: null,
      })
      if (profileError) throw profileError

      const { error: subProfileError } =
        accountType === 'employer'
          ? await supabase.from('employer_profiles').upsert(
              {
                user_id: userId,
                company_name: null,
                bio: null,
                total_missions_posted: 0,
                total_spent: 0,
                rating: 0,
                payment_verified: false,
                stripe_customer_id: null,
              },
              { onConflict: 'user_id' }
            )
          : await supabase.from('candidate_profiles').upsert(
              {
                user_id: userId,
                bio: null,
                years_experience: null,
                skills: null,
                languages: null,
                hourly_rate: null,
                availability_status: 'available',
                rating: 0,
                total_missions_completed: 0,
                response_rate: 0,
                no_show_count: 0,
              },
              { onConflict: 'user_id' }
            )
      if (subProfileError) throw subProfileError

      router.push('/dashboard')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-6">
      <div
        role="radiogroup"
        aria-describedby={error ? 'account-type-error' : undefined}
        className="grid gap-4 sm:grid-cols-2"
      >
        {(
          [
            { value: 'employer', label: 'Je suis employeur', hint: 'Je publie des missions et recrute des candidats' },
            { value: 'candidate', label: 'Je suis candidat', hint: 'Je réponds à des missions proposées' },
          ] as const
        ).map((option) => (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={accountType === option.value}
            onClick={() => {
              setAccountType(option.value)
              setError('')
            }}
            className={`rounded-xl border p-5 text-left transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
              accountType === option.value
                ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                : 'border-gray-200 text-gray-700 hover:border-gray-300'
            }`}
          >
            <span className="block text-base font-semibold">{option.label}</span>
            <span className="mt-1 block text-sm text-gray-500">{option.hint}</span>
          </button>
        ))}
      </div>

      {error && (
        <div
          id="account-type-error"
          role="alert"
          aria-live="polite"
          className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600"
        >
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-500 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
      >
        {loading ? 'Enregistrement…' : 'Continuer'}
      </button>
    </form>
  )
}
