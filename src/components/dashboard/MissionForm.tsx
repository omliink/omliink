'use client'

import { useActionState } from 'react'
import { useFormStatus } from 'react-dom'
import { createMission, type CreateMissionState } from '@/lib/actions/missions'
import AddressAutocomplete from '@/components/ui/AddressAutocomplete'
import type { Database } from '@/types/database.types'

type ServiceCategory = Database['public']['Tables']['service_categories']['Row']

interface MissionFormProps {
  categories: ServiceCategory[]
}

const initialState: CreateMissionState = {}

const inputClass =
  'block w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500'

function SubmitButtons() {
  const { pending } = useFormStatus()

  return (
    <div className="flex flex-col gap-3 sm:flex-row">
      <button
        type="submit"
        name="status"
        value="draft"
        disabled={pending}
        className="flex w-full items-center justify-center rounded-lg border border-gray-300 px-6 py-2.5 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
      >
        {pending ? 'Enregistrement…' : 'Enregistrer en brouillon'}
      </button>
      <button
        type="submit"
        name="status"
        value="published"
        disabled={pending}
        className="flex w-full items-center justify-center rounded-lg bg-[#ff5a3d] px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#ff5a3d]/90 focus:outline-none focus:ring-2 focus:ring-[#ff5a3d] focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
      >
        {pending ? 'Publication…' : 'Publier la mission'}
      </button>
    </div>
  )
}

export default function MissionForm({ categories }: MissionFormProps) {
  const [state, formAction] = useActionState(createMission, initialState)

  return (
    <form action={formAction} noValidate className="flex flex-col gap-5">

      <div>
        <label htmlFor="title" className="mb-1 block text-sm font-medium text-gray-700">
          Titre de la mission
        </label>
        <input id="title" name="title" type="text" required placeholder="Ex : Garde d'enfants le mercredi" className={inputClass} />
      </div>

      <div>
        <label htmlFor="description" className="mb-1 block text-sm font-medium text-gray-700">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          rows={5}
          placeholder="Décrivez la mission, les attentes, le contexte…"
          className={inputClass}
        />
      </div>

      <div>
        <label htmlFor="category_id" className="mb-1 block text-sm font-medium text-gray-700">
          Catégorie
        </label>
        <select id="category_id" name="category_id" required defaultValue="" className={inputClass}>
          <option value="" disabled>
            Choisir une catégorie
          </option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </div>

      <AddressAutocomplete
        id="location_address"
        name="location_address"
        latName="location_lat"
        lngName="location_lng"
        label="Adresse"
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label htmlFor="mission_date" className="mb-1 block text-sm font-medium text-gray-700">
            Date
          </label>
          <input id="mission_date" name="mission_date" type="date" className={inputClass} />
        </div>
        <div>
          <label htmlFor="mission_time_start" className="mb-1 block text-sm font-medium text-gray-700">
            Heure de début
          </label>
          <input id="mission_time_start" name="mission_time_start" type="time" className={inputClass} />
        </div>
        <div>
          <label htmlFor="mission_time_end" className="mb-1 block text-sm font-medium text-gray-700">
            Heure de fin
          </label>
          <input id="mission_time_end" name="mission_time_end" type="time" className={inputClass} />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="estimated_duration_hours" className="mb-1 block text-sm font-medium text-gray-700">
            Durée estimée (heures)
          </label>
          <input
            id="estimated_duration_hours"
            name="estimated_duration_hours"
            type="number"
            min="0"
            step="0.5"
            placeholder="3"
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="budget" className="mb-1 block text-sm font-medium text-gray-700">
            Budget (€)
          </label>
          <input id="budget" name="budget" type="number" min="0" step="1" placeholder="60" className={inputClass} />
        </div>
      </div>

      {state.error && (
        <div role="alert" aria-live="polite" className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
          {state.error}
        </div>
      )}

      <SubmitButtons />
    </form>
  )
}
