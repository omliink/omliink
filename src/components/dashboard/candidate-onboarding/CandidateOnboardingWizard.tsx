'use client'

import { useState, useTransition } from 'react'
import { supabase } from '@/lib/supabase'
import AddressAutocomplete from '@/components/ui/AddressAutocomplete'
import { submitCandidateOnboarding } from '@/lib/actions/onboarding-candidate'
import type { Database } from '@/types/database.types'

type ServiceCategory = Database['public']['Tables']['service_categories']['Row']
type SkillTaxonomy = Database['public']['Tables']['skill_taxonomy']['Row']

interface CandidateOnboardingWizardProps {
  userId: string
  email: string
  initialFullName: string | null
  initialPhone: string | null
  categories: ServiceCategory[]
  skillTaxonomy: SkillTaxonomy[]
}

interface LanguageEntry {
  language: string
  is_native: boolean
}

interface SelectedSkill {
  category_id: string
  skill_tag: string
}

interface WizardState {
  gender: string
  firstName: string
  lastName: string
  address: { label: string; lat: number; lng: number } | null
  birthDate: string
  birthPlace: string
  nativeLanguage: string
  phone: string
  phoneVisible: boolean
  languages: LanguageEntry[]
  photoFile: File | null
  serviceCategoryIds: string[]
  supplementCodes: string[]
  experienceLevel: string
  hourlyRate: number
  employmentStatus: string
  selectedSkills: SelectedSkill[]
  bioTitle: string
  bioText: string
}

const STEP_LABELS = [
  'À propos de vous',
  'Plus d’informations',
  'Photo',
  'Types de services',
  'Suppléments',
  'Expérience et tarif',
  'Compétences',
  'Bio / présentation',
]

const EXPERIENCE_LEVEL_OPTIONS = [
  { value: 'debutant', label: 'Débutant' },
  { value: '1-3ans', label: '1 à 3 ans d’expérience' },
  { value: '3-5ans', label: '3 à 5 ans d’expérience' },
  { value: '5ans-plus', label: 'Plus de 5 ans d’expérience' },
]

const SUPPLEMENT_OPTIONS = [
  { code: 'premiers_secours', label: 'Formation premiers secours' },
  { code: 'motorise', label: 'Véhiculé / motorisé' },
  { code: 'permis_conduire', label: 'Permis de conduire' },
  { code: 'dispo_immediate', label: 'Disponibilité immédiate' },
]

const EMPLOYMENT_STATUS_OPTIONS = [
  {
    value: 'particulier_employeur',
    label: 'Particulier employeur (emploi déclaré)',
    hint: "L'employeur (la famille) reste votre employeur légal, via le CESU officiel.",
    legalMention: 'Tarif net, congés payés inclus (10%).',
  },
  {
    value: 'auto_entrepreneur',
    label: 'Auto-entrepreneur',
    hint: "Vous facturez vos prestations comme travailleur indépendant, payé via Stripe Connect.",
    legalMention: 'Non applicable aux auto-entrepreneurs.',
  },
] as const

const inputClass =
  'block w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500'

function splitName(fullName: string | null): [string, string] {
  if (!fullName) return ['', '']
  const parts = fullName.trim().split(/\s+/)
  if (parts.length === 1) return [parts[0], '']
  return [parts[0], parts.slice(1).join(' ')]
}

export default function CandidateOnboardingWizard({
  userId,
  email,
  initialFullName,
  initialPhone,
  categories,
  skillTaxonomy,
}: CandidateOnboardingWizardProps) {
  const [firstName0, lastName0] = splitName(initialFullName)
  const [step, setStep] = useState(1)
  const [stepError, setStepError] = useState('')
  const [isPending, startTransition] = useTransition()

  const [form, setForm] = useState<WizardState>({
    gender: '',
    firstName: firstName0,
    lastName: lastName0,
    address: null,
    birthDate: '',
    birthPlace: '',
    nativeLanguage: '',
    phone: initialPhone ?? '',
    phoneVisible: true,
    languages: [],
    photoFile: null,
    serviceCategoryIds: [],
    supplementCodes: [],
    experienceLevel: '',
    hourlyRate: 15,
    employmentStatus: 'particulier_employeur',
    selectedSkills: [],
    bioTitle: '',
    bioText: '',
  })

  const update = <K extends keyof WizardState>(key: K, value: WizardState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const toggleInArray = (arr: string[], value: string) =>
    arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value]

  const toggleSkill = (categoryId: string, skillTag: string) => {
    setForm((prev) => {
      const exists = prev.selectedSkills.some((s) => s.category_id === categoryId && s.skill_tag === skillTag)
      return {
        ...prev,
        selectedSkills: exists
          ? prev.selectedSkills.filter((s) => !(s.category_id === categoryId && s.skill_tag === skillTag))
          : [...prev.selectedSkills, { category_id: categoryId, skill_tag: skillTag }],
      }
    })
  }

  const validateStep = (): string | null => {
    switch (step) {
      case 1:
        if (!form.gender) return 'Merci de choisir votre sexe.'
        if (!form.firstName.trim()) return 'Le prénom est requis.'
        if (!form.lastName.trim()) return 'Le nom est requis.'
        if (!form.address) return 'Merci de sélectionner une adresse dans la liste de suggestions.'
        return null
      case 2:
        if (!form.birthDate) return 'La date de naissance est requise.'
        if (!form.birthPlace.trim()) return 'Le lieu de naissance est requis.'
        if (!form.nativeLanguage.trim()) return 'La langue maternelle est requise.'
        if (!form.phone.trim()) return 'Le téléphone est requis.'
        return null
      case 3:
        if (!form.photoFile) return 'Une photo de profil est obligatoire pour continuer.'
        return null
      case 4:
        if (form.serviceCategoryIds.length === 0) return 'Sélectionnez au moins un type de service.'
        return null
      case 5:
        return null
      case 6:
        if (!form.experienceLevel) return 'Merci de choisir votre niveau d’expérience.'
        if (!form.employmentStatus) return 'Merci de choisir votre statut.'
        if (!form.hourlyRate || form.hourlyRate <= 0) return 'Merci d’indiquer un tarif horaire valide.'
        return null
      case 7:
        return null
      case 8: {
        const title = form.bioTitle.trim()
        const text = form.bioText.trim()
        if (title.length < 10 || title.length > 60) return 'Le titre doit contenir entre 10 et 60 caractères.'
        if (text.length < 30 || text.length > 2000) return 'La présentation doit contenir entre 30 et 2000 caractères.'
        return null
      }
      default:
        return null
    }
  }

  const handleSubmitFinal = () => {
    startTransition(async () => {
      // Uploaded here, client -> Storage directly, rather than sent through
      // the Server Action's request body: a raw File in that payload would
      // cross Next.js's default 1MB Server Action limit on any realistic
      // photo. Only the resulting public URL travels to
      // submitCandidateOnboarding below.
      const photoFile = form.photoFile as File
      const photoPath = `${userId}/${Date.now()}-${photoFile.name}`
      const { error: uploadError } = await supabase.storage.from('candidate-photos').upload(photoPath, photoFile)
      if (uploadError) {
        setStepError(`Échec de l'upload de la photo : ${uploadError.message}`)
        return
      }
      const {
        data: { publicUrl: photoUrl },
      } = supabase.storage.from('candidate-photos').getPublicUrl(photoPath)

      const fd = new FormData()
      fd.set('gender', form.gender)
      fd.set('first_name', form.firstName)
      fd.set('last_name', form.lastName)
      fd.set('location_address', form.address!.label)
      fd.set('location_lat', String(form.address!.lat))
      fd.set('location_lng', String(form.address!.lng))
      fd.set('birth_date', form.birthDate)
      fd.set('birth_place', form.birthPlace)
      fd.set('native_language', form.nativeLanguage)
      fd.set('phone', form.phone)
      fd.set('phone_visible', String(form.phoneVisible))
      fd.set('languages_json', JSON.stringify(form.languages))
      fd.set('photo_url', photoUrl)
      form.serviceCategoryIds.forEach((id) => fd.append('service_categories', id))
      form.supplementCodes.forEach((code) => fd.append('supplements', code))
      fd.set('experience_level', form.experienceLevel)
      fd.set('hourly_rate', String(form.hourlyRate))
      fd.set('employment_status', form.employmentStatus)
      fd.set('skills_json', JSON.stringify(form.selectedSkills))
      fd.set('bio_title', form.bioTitle)
      fd.set('bio_text', form.bioText)

      const result = await submitCandidateOnboarding(fd)
      if (result.error) {
        setStepError(result.error)
        return
      }
      // Full navigation rather than a client-side step change: this route
      // shares app/dashboard/layout.tsx's "kick out once onboarded" redirect
      // with /dashboard, so step 9 (suggested missions) renders on the real
      // dashboard instead — see getSuggestedMissionsForCandidate.
      // eslint-disable-next-line @next/next/no-location-assign-relative-destination
      window.location.href = '/dashboard?onboarded=1'
    })
  }

  const handleNext = () => {
    const error = validateStep()
    if (error) {
      setStepError(error)
      return
    }
    setStepError('')
    if (step === 8) {
      handleSubmitFinal()
    } else {
      setStep((s) => s + 1)
    }
  }

  const handleBack = () => {
    setStepError('')
    setStep((s) => Math.max(1, s - 1))
  }

  const firstSelectedCategoryName =
    categories.find((c) => c.id === form.serviceCategoryIds[0])?.name ?? 'vos services'

  const percent = Math.round((step / STEP_LABELS.length) * 100)

  return (
    <div className="flex flex-col gap-8 sm:flex-row sm:gap-10">
      <aside className="sm:w-56 sm:flex-shrink-0">
        <p className="mb-2 text-xs font-semibold text-gray-500">{percent}% complété</p>
        <div className="mb-4 h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
          <div className="h-full rounded-full bg-indigo-500 transition-all" style={{ width: `${percent}%` }} />
        </div>
        <ol className="flex flex-row flex-wrap gap-2 sm:flex-col sm:gap-1">
          {STEP_LABELS.map((label, index) => {
            const stepNumber = index + 1
            const isDone = stepNumber < step
            const isCurrent = stepNumber === step
            return (
              <li
                key={label}
                className={`flex items-center gap-2 rounded-lg px-2 py-1.5 text-xs sm:text-sm ${
                  isCurrent ? 'bg-indigo-50 font-semibold text-indigo-700' : isDone ? 'text-emerald-600' : 'text-gray-400'
                }`}
              >
                <span
                  className={`flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${
                    isCurrent
                      ? 'bg-indigo-500 text-white'
                      : isDone
                        ? 'bg-emerald-500 text-white'
                        : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  {isDone ? '✓' : stepNumber}
                </span>
                {label}
              </li>
            )
          })}
        </ol>
      </aside>

      <div className="min-w-0 flex-1">
        {step === 1 && (
          <div className="flex flex-col gap-4">
            <h2 className="text-lg font-semibold text-gray-900">À propos de vous</h2>
            <div>
              <span className="mb-1 block text-sm font-medium text-gray-700">Sexe</span>
              <div role="radiogroup" className="flex gap-3">
                {[
                  { value: 'homme', label: 'Homme' },
                  { value: 'femme', label: 'Femme' },
                ].map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    role="radio"
                    aria-checked={form.gender === option.value}
                    onClick={() => update('gender', option.value)}
                    className={`rounded-lg border px-4 py-2 text-sm transition-colors ${
                      form.gender === option.value
                        ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                        : 'border-gray-300 text-gray-700 hover:border-gray-400'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="first_name" className="mb-1 block text-sm font-medium text-gray-700">
                  Prénom
                </label>
                <input
                  id="first_name"
                  className={inputClass}
                  value={form.firstName}
                  onChange={(e) => update('firstName', e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="last_name" className="mb-1 block text-sm font-medium text-gray-700">
                  Nom
                </label>
                <input
                  id="last_name"
                  className={inputClass}
                  value={form.lastName}
                  onChange={(e) => update('lastName', e.target.value)}
                />
              </div>
            </div>
            <AddressAutocomplete
              id="onboarding_address"
              name="onboarding_address_display"
              latName="onboarding_lat_display"
              lngName="onboarding_lng_display"
              label="Adresse"
              defaultValue={form.address?.label}
              onSelect={(s) => update('address', s)}
            />
            <div>
              <label htmlFor="email" className="mb-1 block text-sm font-medium text-gray-700">
                Email
              </label>
              <input id="email" className={inputClass} value={email} readOnly disabled />
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="flex flex-col gap-4">
            <h2 className="text-lg font-semibold text-gray-900">Plus d’informations</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="birth_date" className="mb-1 block text-sm font-medium text-gray-700">
                  Date de naissance
                </label>
                <input
                  id="birth_date"
                  type="date"
                  className={inputClass}
                  value={form.birthDate}
                  onChange={(e) => update('birthDate', e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="birth_place" className="mb-1 block text-sm font-medium text-gray-700">
                  Lieu de naissance
                </label>
                <input
                  id="birth_place"
                  className={inputClass}
                  value={form.birthPlace}
                  onChange={(e) => update('birthPlace', e.target.value)}
                />
              </div>
            </div>
            <div>
              <label htmlFor="native_language" className="mb-1 block text-sm font-medium text-gray-700">
                Langue maternelle
              </label>
              <input
                id="native_language"
                className={inputClass}
                value={form.nativeLanguage}
                onChange={(e) => update('nativeLanguage', e.target.value)}
              />
            </div>

            <div>
              <span className="mb-1 block text-sm font-medium text-gray-700">Autres langues parlées</span>
              <div className="flex flex-col gap-2">
                {form.languages.map((lang, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <input
                      className={inputClass}
                      placeholder="Langue"
                      value={lang.language}
                      onChange={(e) => {
                        const next = [...form.languages]
                        next[index] = { ...next[index], language: e.target.value }
                        update('languages', next)
                      }}
                    />
                    <label className="flex flex-shrink-0 items-center gap-1.5 text-xs text-gray-600">
                      <input
                        type="checkbox"
                        checked={lang.is_native}
                        onChange={(e) => {
                          const next = [...form.languages]
                          next[index] = { ...next[index], is_native: e.target.checked }
                          update('languages', next)
                        }}
                      />
                      Native
                    </label>
                    <button
                      type="button"
                      onClick={() => update('languages', form.languages.filter((_, i) => i !== index))}
                      className="flex-shrink-0 text-xs text-red-500 hover:text-red-600"
                      aria-label="Retirer cette langue"
                    >
                      Retirer
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => update('languages', [...form.languages, { language: '', is_native: false }])}
                  className="w-fit text-sm font-medium text-indigo-600 hover:text-indigo-700"
                >
                  + Ajouter une langue
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="phone" className="mb-1 block text-sm font-medium text-gray-700">
                Téléphone
              </label>
              <input id="phone" className={inputClass} value={form.phone} onChange={(e) => update('phone', e.target.value)} />
              <label className="mt-2 flex items-center gap-2 text-xs text-gray-600">
                <input
                  type="checkbox"
                  checked={form.phoneVisible}
                  onChange={(e) => update('phoneVisible', e.target.checked)}
                />
                Rendre mon téléphone visible aux employeurs
              </label>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="flex flex-col gap-4 sm:flex-row sm:gap-8">
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-gray-900">Photo de profil</h2>
              <p className="mt-1 text-sm text-gray-600">Une photo est obligatoire pour continuer.</p>
              <div className="mt-4">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => update('photoFile', e.target.files?.[0] ?? null)}
                  className="block w-full text-sm text-gray-700 file:mr-3 file:rounded-lg file:border-0 file:bg-indigo-500 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-indigo-600"
                />
                {form.photoFile && (
                  <p className="mt-2 text-sm text-emerald-600">Photo sélectionnée : {form.photoFile.name}</p>
                )}
              </div>
            </div>
            <div className="flex-1 rounded-xl border border-gray-100 bg-gray-50 p-5">
              <h3 className="text-sm font-semibold text-gray-900">Pourquoi une photo ?</h3>
              <ul className="mt-3 flex flex-col gap-2 text-sm text-gray-600">
                <li>✓ Les profils avec photo reçoivent bien plus de réponses</li>
                <li>✓ Rassure les employeurs avant l’entretien visio</li>
                <li>✓ Renforce la confiance sur la plateforme</li>
              </ul>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="flex flex-col gap-4">
            <h2 className="text-lg font-semibold text-gray-900">Types de services</h2>
            <p className="text-sm text-gray-600">Sélectionnez tous les services que vous proposez.</p>
            <div className="grid gap-2 sm:grid-cols-2">
              {categories.map((category) => (
                <label
                  key={category.id}
                  className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2.5 text-sm transition-colors ${
                    form.serviceCategoryIds.includes(category.id)
                      ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                      : 'border-gray-300 text-gray-700 hover:border-gray-400'
                  }`}
                >
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    checked={form.serviceCategoryIds.includes(category.id)}
                    onChange={() => update('serviceCategoryIds', toggleInArray(form.serviceCategoryIds, category.id))}
                  />
                  {category.name}
                </label>
              ))}
            </div>
          </div>
        )}

        {step === 5 && (
          <div className="flex flex-col gap-4">
            <h2 className="text-lg font-semibold text-gray-900">Suppléments</h2>
            <p className="text-sm text-gray-600">Facultatif — ces informations vous distinguent auprès des employeurs.</p>
            <div className="grid gap-2 sm:grid-cols-2">
              {SUPPLEMENT_OPTIONS.map((option) => (
                <label
                  key={option.code}
                  className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2.5 text-sm transition-colors ${
                    form.supplementCodes.includes(option.code)
                      ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                      : 'border-gray-300 text-gray-700 hover:border-gray-400'
                  }`}
                >
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    checked={form.supplementCodes.includes(option.code)}
                    onChange={() => update('supplementCodes', toggleInArray(form.supplementCodes, option.code))}
                  />
                  {option.label}
                </label>
              ))}
            </div>
          </div>
        )}

        {step === 6 && (
          <div className="flex flex-col gap-5">
            <h2 className="text-lg font-semibold text-gray-900">Expérience et tarif</h2>
            <div>
              <label htmlFor="experience_level" className="mb-1 block text-sm font-medium text-gray-700">
                Niveau d’expérience
              </label>
              <select
                id="experience_level"
                className={inputClass}
                value={form.experienceLevel}
                onChange={(e) => update('experienceLevel', e.target.value)}
              >
                <option value="">Choisir…</option>
                {EXPERIENCE_LEVEL_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <span className="mb-1 block text-sm font-medium text-gray-700">Tarif horaire</span>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => update('hourlyRate', Math.max(0, Math.round((form.hourlyRate - 0.5) * 10) / 10))}
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
                  aria-label="Diminuer le tarif"
                >
                  −
                </button>
                <span className="w-20 text-center text-base font-semibold text-gray-900">{form.hourlyRate.toFixed(2)} €</span>
                <button
                  type="button"
                  onClick={() => update('hourlyRate', Math.round((form.hourlyRate + 0.5) * 10) / 10)}
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
                  aria-label="Augmenter le tarif"
                >
                  +
                </button>
              </div>
            </div>

            <div>
              <span className="mb-1 block text-sm font-medium text-gray-700">Statut</span>
              <div role="radiogroup" className="grid gap-3 sm:grid-cols-2">
                {EMPLOYMENT_STATUS_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    role="radio"
                    aria-checked={form.employmentStatus === option.value}
                    onClick={() => update('employmentStatus', option.value)}
                    className={`rounded-xl border p-4 text-left transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                      form.employmentStatus === option.value
                        ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                        : 'border-gray-200 text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <span className="block text-sm font-semibold">{option.label}</span>
                    <span className="mt-1 block text-xs text-gray-500">{option.hint}</span>
                  </button>
                ))}
              </div>
              {form.employmentStatus && (
                <p className="mt-2 text-xs font-medium text-indigo-600">
                  {EMPLOYMENT_STATUS_OPTIONS.find((o) => o.value === form.employmentStatus)?.legalMention}
                </p>
              )}
            </div>
          </div>
        )}

        {step === 7 && (
          <div className="flex flex-col gap-4">
            <h2 className="text-lg font-semibold text-gray-900">Compétences</h2>
            <p className="text-sm text-gray-600">Facultatif — précisez vos compétences par service.</p>
            {form.serviceCategoryIds.map((categoryId) => {
              const category = categories.find((c) => c.id === categoryId)
              const tags = skillTaxonomy.filter((s) => s.category_id === categoryId)
              if (!category || tags.length === 0) return null
              return (
                <div key={categoryId}>
                  <h3 className="mb-2 text-sm font-semibold text-gray-800">{category.name}</h3>
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag) => {
                      const isSelected = form.selectedSkills.some(
                        (s) => s.category_id === categoryId && s.skill_tag === tag.skill_tag
                      )
                      return (
                        <button
                          key={tag.id}
                          type="button"
                          onClick={() => toggleSkill(categoryId, tag.skill_tag)}
                          className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                            isSelected
                              ? 'border-indigo-500 bg-indigo-500 text-white'
                              : 'border-gray-300 text-gray-700 hover:border-gray-400'
                          }`}
                        >
                          {tag.label}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {step === 8 && (
          <div className="flex flex-col gap-4">
            <h2 className="text-lg font-semibold text-gray-900">Bio / présentation</h2>
            <div>
              <label htmlFor="bio_title" className="mb-1 block text-sm font-medium text-gray-700">
                Titre ({form.bioTitle.length}/60)
              </label>
              <input
                id="bio_title"
                className={inputClass}
                maxLength={60}
                placeholder={`Ex : Spécialiste ${firstSelectedCategoryName.toLowerCase()} depuis 5 ans`}
                value={form.bioTitle}
                onChange={(e) => update('bioTitle', e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="bio_text" className="mb-1 block text-sm font-medium text-gray-700">
                Présentation ({form.bioText.length}/2000)
              </label>
              <textarea
                id="bio_text"
                rows={6}
                maxLength={2000}
                className={inputClass}
                placeholder={`Ex : Passionné(e) par ${firstSelectedCategoryName.toLowerCase()}, je mets à votre service mon expérience et mon sérieux pour vous accompagner au quotidien…`}
                value={form.bioText}
                onChange={(e) => update('bioText', e.target.value)}
              />
            </div>
          </div>
        )}

        {stepError && (
          <div role="alert" aria-live="polite" className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
            {stepError}
          </div>
        )}

        <div className="mt-6 flex items-center justify-between">
          <button
            type="button"
            onClick={handleBack}
            disabled={step === 1}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Précédent
          </button>
          <button
            type="button"
            disabled={isPending || (step === 3 && !form.photoFile)}
            onClick={handleNext}
            className="rounded-lg bg-indigo-500 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-600 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isPending ? 'Enregistrement…' : step === 8 ? 'Terminer mon profil' : 'Étape suivante'}
          </button>
        </div>
      </div>
    </div>
  )
}
