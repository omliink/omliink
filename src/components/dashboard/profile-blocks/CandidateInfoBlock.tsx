'use client'

import { useActionState, useState } from 'react'
import { useFormStatus } from 'react-dom'
import AddressAutocomplete from '@/components/ui/AddressAutocomplete'
import ProfileBlockCard from './ProfileBlockCard'
import { updateCandidateInfo, type ProfileFormState } from '@/lib/actions/profile'
import type { Database } from '@/types/database.types'

type Profile = Database['public']['Tables']['profiles']['Row']
type CandidateProfile = Database['public']['Tables']['candidate_profiles']['Row']
type CandidateLanguage = Database['public']['Tables']['candidate_languages']['Row']

interface CandidateInfoBlockProps {
  profile: Profile
  candidateProfile: CandidateProfile
  languages: CandidateLanguage[]
}

interface LanguageEntry {
  language: string
  is_native: boolean
}

const RADIUS_OPTIONS_KM = [5, 10, 20, 30, 50]
const initialState: ProfileFormState = {}

const inputClass =
  'block w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500'

function splitName(fullName: string | null): [string, string] {
  if (!fullName) return ['', '']
  const parts = fullName.trim().split(/\s+/)
  if (parts.length === 1) return [parts[0], '']
  return [parts[0], parts.slice(1).join(' ')]
}

function formatDate(value: string | null) {
  if (!value) return 'Non renseignée'
  return new Date(value).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
}

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-lg bg-indigo-500 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-600 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? 'Enregistrement…' : 'Enregistrer'}
    </button>
  )
}

export default function CandidateInfoBlock({ profile, candidateProfile, languages }: CandidateInfoBlockProps) {
  const [editing, setEditing] = useState(false)
  const [state, formAction] = useActionState(updateCandidateInfo, initialState)

  const [firstName0, lastName0] = splitName(profile.full_name)
  const [gender, setGender] = useState(candidateProfile.gender ?? '')
  const [firstName, setFirstName] = useState(firstName0)
  const [lastName, setLastName] = useState(lastName0)
  const [address, setAddress] = useState<{ label: string; lat: number; lng: number } | null>(
    candidateProfile.location_address && candidateProfile.location_lat != null && candidateProfile.location_lng != null
      ? { label: candidateProfile.location_address, lat: candidateProfile.location_lat, lng: candidateProfile.location_lng }
      : null
  )
  const [phone, setPhone] = useState(profile.phone ?? '')
  const [phoneVisible, setPhoneVisible] = useState(candidateProfile.phone_visible)
  const [languageEntries, setLanguageEntries] = useState<LanguageEntry[]>(
    languages.map((l) => ({ language: l.language, is_native: l.is_native }))
  )

  const [prevState, setPrevState] = useState(state)
  if (state !== prevState) {
    setPrevState(state)
    if (state.success) setEditing(false)
  }

  return (
    <ProfileBlockCard
      title="Mes informations personnelles"
      editing={editing}
      onEdit={() => setEditing(true)}
      onCancel={() => setEditing(false)}
      readView={
        <dl className="grid gap-4 sm:grid-cols-2">
          <div>
            <dt className="text-xs font-medium text-gray-500">Sexe</dt>
            <dd className="mt-0.5 text-sm text-gray-900">{candidateProfile.gender === 'femme' ? 'Femme' : candidateProfile.gender === 'homme' ? 'Homme' : 'Non renseigné'}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-gray-500">Nom complet</dt>
            <dd className="mt-0.5 text-sm text-gray-900">{profile.full_name ?? 'Non renseigné'}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-gray-500">Date de naissance</dt>
            <dd className="mt-0.5 text-sm text-gray-900">{formatDate(candidateProfile.birth_date)}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-gray-500">Lieu de naissance</dt>
            <dd className="mt-0.5 text-sm text-gray-900">{candidateProfile.birth_place ?? 'Non renseigné'}</dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-xs font-medium text-gray-500">Adresse</dt>
            <dd className="mt-0.5 text-sm text-gray-900">{candidateProfile.location_address ?? 'Non renseignée'}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-gray-500">Téléphone</dt>
            <dd className="mt-0.5 text-sm text-gray-900">
              {profile.phone ?? 'Non renseigné'}{' '}
              <span className="text-xs text-gray-400">({candidateProfile.phone_visible ? 'visible' : 'masqué'})</span>
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-gray-500">Langue maternelle</dt>
            <dd className="mt-0.5 text-sm text-gray-900">{candidateProfile.native_language ?? 'Non renseignée'}</dd>
          </div>
          {languages.length > 0 && (
            <div className="sm:col-span-2">
              <dt className="text-xs font-medium text-gray-500">Autres langues</dt>
              <dd className="mt-1 flex flex-wrap gap-1.5">
                {languages.map((l) => (
                  <span key={l.id} className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-700">
                    {l.language}
                    {l.is_native ? ' (native)' : ''}
                  </span>
                ))}
              </dd>
            </div>
          )}
          {state.success && (
            <p className="sm:col-span-2 text-sm text-emerald-600">Informations mises à jour avec succès.</p>
          )}
        </dl>
      }
      editView={
        <form action={formAction} className="flex flex-col gap-4">
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
                  aria-checked={gender === option.value}
                  onClick={() => setGender(option.value)}
                  className={`rounded-lg border px-4 py-2 text-sm transition-colors ${
                    gender === option.value
                      ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                      : 'border-gray-300 text-gray-700 hover:border-gray-400'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
            <input type="hidden" name="gender" value={gender} />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="first_name" className="mb-1 block text-sm font-medium text-gray-700">
                Prénom
              </label>
              <input
                id="first_name"
                name="first_name"
                className={inputClass}
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="last_name" className="mb-1 block text-sm font-medium text-gray-700">
                Nom
              </label>
              <input
                id="last_name"
                name="last_name"
                className={inputClass}
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="birth_date" className="mb-1 block text-sm font-medium text-gray-700">
                Date de naissance
              </label>
              <input
                id="birth_date"
                name="birth_date"
                type="date"
                defaultValue={candidateProfile.birth_date ?? ''}
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="birth_place" className="mb-1 block text-sm font-medium text-gray-700">
                Lieu de naissance
              </label>
              <input
                id="birth_place"
                name="birth_place"
                defaultValue={candidateProfile.birth_place ?? ''}
                className={inputClass}
              />
            </div>
          </div>

          <AddressAutocomplete
            id="candidate_info_address"
            name="location_address"
            latName="location_lat"
            lngName="location_lng"
            label="Adresse"
            defaultValue={address?.label}
            defaultLat={address?.lat}
            defaultLng={address?.lng}
            onSelect={(s) => setAddress(s)}
          />

          <div>
            <label htmlFor="radius_km" className="mb-1 block text-sm font-medium text-gray-700">
              Rayon de déplacement accepté
            </label>
            <select id="radius_km" name="radius_km" defaultValue={candidateProfile.radius_km} className={inputClass}>
              {RADIUS_OPTIONS_KM.map((km) => (
                <option key={km} value={km}>
                  {km} km
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="native_language" className="mb-1 block text-sm font-medium text-gray-700">
              Langue maternelle
            </label>
            <input
              id="native_language"
              name="native_language"
              defaultValue={candidateProfile.native_language ?? ''}
              className={inputClass}
            />
          </div>

          <div>
            <span className="mb-1 block text-sm font-medium text-gray-700">Autres langues parlées</span>
            <div className="flex flex-col gap-2">
              {languageEntries.map((lang, index) => (
                <div key={index} className="flex items-center gap-2">
                  <input
                    className={inputClass}
                    placeholder="Langue"
                    value={lang.language}
                    onChange={(e) => {
                      const next = [...languageEntries]
                      next[index] = { ...next[index], language: e.target.value }
                      setLanguageEntries(next)
                    }}
                  />
                  <label className="flex flex-shrink-0 items-center gap-1.5 text-xs text-gray-600">
                    <input
                      type="checkbox"
                      checked={lang.is_native}
                      onChange={(e) => {
                        const next = [...languageEntries]
                        next[index] = { ...next[index], is_native: e.target.checked }
                        setLanguageEntries(next)
                      }}
                    />
                    Native
                  </label>
                  <button
                    type="button"
                    onClick={() => setLanguageEntries(languageEntries.filter((_, i) => i !== index))}
                    className="flex-shrink-0 text-xs text-red-500 hover:text-red-600"
                  >
                    Retirer
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => setLanguageEntries([...languageEntries, { language: '', is_native: false }])}
                className="w-fit text-sm font-medium text-indigo-600 hover:text-indigo-700"
              >
                + Ajouter une langue
              </button>
            </div>
            <input type="hidden" name="languages_json" value={JSON.stringify(languageEntries)} />
          </div>

          <div>
            <label htmlFor="phone" className="mb-1 block text-sm font-medium text-gray-700">
              Téléphone
            </label>
            <input id="phone" name="phone" value={phone} onChange={(e) => setPhone(e.target.value)} className={inputClass} />
            <label className="mt-2 flex items-center gap-2 text-xs text-gray-600">
              <input type="checkbox" checked={phoneVisible} onChange={(e) => setPhoneVisible(e.target.checked)} />
              Rendre mon téléphone visible aux employeurs
            </label>
            <input type="hidden" name="phone_visible" value={String(phoneVisible)} />
          </div>

          {state.error && (
            <p role="alert" className="text-sm text-red-600">
              {state.error}
            </p>
          )}

          <div>
            <SubmitButton />
          </div>
        </form>
      }
    />
  )
}
