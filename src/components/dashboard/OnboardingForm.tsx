'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import CandidateOnboardingWizard from '@/components/dashboard/candidate-onboarding/CandidateOnboardingWizard'
import type { Database } from '@/types/database.types'

type ServiceCategory = Database['public']['Tables']['service_categories']['Row']
type SkillTaxonomy = Database['public']['Tables']['skill_taxonomy']['Row']

type AccountType = 'employer' | 'candidate'

interface OnboardingFormProps {
  userId: string
  email: string
  fullName: string | null
  phone: string | null
  initialAccountType: AccountType | null
  categories: ServiceCategory[]
  skillTaxonomy: SkillTaxonomy[]
}

export default function OnboardingForm({
  userId,
  email,
  fullName,
  phone,
  initialAccountType,
  categories,
  skillTaxonomy,
}: OnboardingFormProps) {
  const [accountType, setAccountType] = useState<AccountType | null>(initialAccountType)
  const [showCandidateWizard, setShowCandidateWizard] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  if (showCandidateWizard) {
    return (
      <CandidateOnboardingWizard
        email={email}
        initialFullName={fullName}
        initialPhone={phone}
        categories={categories}
        skillTaxonomy={skillTaxonomy}
      />
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!accountType) {
      setError('Merci de choisir un type de compte')
      return
    }

    // Candidates get the full 9-step wizard instead of an immediate upsert —
    // it handles creating profiles/candidate_profiles itself once complete.
    if (accountType === 'candidate') {
      setShowCandidateWizard(true)
      return
    }

    setLoading(true)
    try {
      const { error: profileError } = await supabase.from('profiles').upsert({
        id: userId,
        email,
        full_name: fullName,
        phone,
        is_employer: true,
        is_candidate: false,
        is_verified: false,
        verification_type: null,
        account_status: 'active',
        avatar_url: null,
      })
      if (profileError) throw profileError

      const { error: subProfileError } = await supabase.from('employer_profiles').upsert(
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
      if (subProfileError) throw subProfileError

      // Full navigation rather than router.push(): the dashboard layout reads
      // the profile server-side, and a client-side push/refresh can race the
      // in-flight transition and leave the page blank until a manual reload.
      // eslint-disable-next-line @next/next/no-location-assign-relative-destination
      window.location.href = '/dashboard'
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue')
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
