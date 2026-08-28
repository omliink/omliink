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
  const [employerStep, setEmployerStep] = useState<'form' | 'photo'>('form')
  const [nationality, setNationality] = useState('')
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  if (showCandidateWizard) {
    return (
      <CandidateOnboardingWizard
        userId={userId}
        email={email}
        initialFullName={fullName}
        initialPhone={phone}
        categories={categories}
        skillTaxonomy={skillTaxonomy}
      />
    )
  }

  const finalizeEmployerOnboarding = async (finalPhotoFile: File | null) => {
    setError('')
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

      let photoUrl: string | null = null
      if (finalPhotoFile) {
        const photoPath = `${userId}/${Date.now()}-${finalPhotoFile.name}`
        const { error: uploadError } = await supabase.storage.from('employer-photos').upload(photoPath, finalPhotoFile)
        if (uploadError) throw uploadError
        photoUrl = supabase.storage.from('employer-photos').getPublicUrl(photoPath).data.publicUrl
      }

      const { error: subProfileError } = await supabase.from('employer_profiles').upsert(
        {
          user_id: userId,
          company_name: null,
          bio: null,
          nationality: nationality.trim() || null,
          photo_url: photoUrl,
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

    // Employers get one extra optional step (photo) before the upsert.
    setEmployerStep('photo')
  }

  if (accountType === 'employer' && employerStep === 'photo') {
    return (
      <div className="flex flex-col gap-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Photo de profil (optionnelle)</h2>
          <p className="mt-1 text-sm text-gray-600">Une photo rassure les candidats, mais elle n&apos;est pas obligatoire.</p>
        </div>

        <input
          type="file"
          accept="image/*"
          onChange={(e) => setPhotoFile(e.target.files?.[0] ?? null)}
          className="block w-full text-sm text-gray-700 file:mr-3 file:rounded-lg file:border-0 file:bg-indigo-500 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-indigo-600"
        />
        {photoFile && <p className="text-sm text-emerald-600">Photo sélectionnée : {photoFile.name}</p>}

        {error && (
          <div role="alert" aria-live="polite" className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
            {error}
          </div>
        )}

        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            disabled={loading}
            onClick={() => finalizeEmployerOnboarding(null)}
            className="flex w-full items-center justify-center rounded-lg border border-gray-300 px-6 py-2.5 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
          >
            Ignorer pour l&apos;instant
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={() => finalizeEmployerOnboarding(photoFile)}
            className="flex w-full items-center justify-center rounded-lg bg-indigo-500 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
          >
            {loading ? 'Enregistrement…' : 'Terminer'}
          </button>
        </div>
      </div>
    )
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

      {accountType === 'employer' && (
        <div>
          <label htmlFor="nationality" className="mb-1 block text-sm font-medium text-gray-700">
            Nationalité
          </label>
          <input
            id="nationality"
            type="text"
            value={nationality}
            onChange={(e) => setNationality(e.target.value)}
            placeholder="Française"
            className="block w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      )}

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
