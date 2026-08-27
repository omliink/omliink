'use client'

import { useActionState, useState } from 'react'
import { useFormStatus } from 'react-dom'
import { createMission, updateMission, type CreateMissionState, type UpdateMissionState } from '@/lib/actions/missions'
import AddressAutocomplete from '@/components/ui/AddressAutocomplete'
import type { Database } from '@/types/database.types'

type ServiceCategory = Database['public']['Tables']['service_categories']['Row']
type MissionNeedTaxonomy = Database['public']['Tables']['mission_need_taxonomy']['Row']
type Mission = Database['public']['Tables']['missions']['Row']

interface MissionFormProps {
  categories: ServiceCategory[]
  missionNeedTaxonomy: MissionNeedTaxonomy[]
  mode?: 'create' | 'edit'
  mission?: Mission
  initialNeedTags?: string[]
}

const inputClass =
  'block w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500'

const DESCRIPTION_PLACEHOLDERS: Record<string, string> = {
  'garde-enfants': "Ex : Nous cherchons une personne pour la sortie d'école de nos deux enfants (6 et 9 ans) les mardis et jeudis, avec aide aux devoirs jusqu'à notre retour vers 19h…",
  menage: "Ex : Appartement de 70m², 2 pièces à entretenir chaque semaine — sols, sanitaires, cuisine et poussière. Produits fournis…",
  jardinage: "Ex : Jardin de 300m² avec pelouse et haies à entretenir régulièrement, tonte tous les 15 jours en saison…",
}

function CreateSubmitButtons() {
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

function EditSubmitButton() {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className="flex w-full items-center justify-center rounded-lg bg-indigo-500 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
    >
      {pending ? 'Enregistrement…' : 'Enregistrer les modifications'}
    </button>
  )
}

export default function MissionForm({
  categories,
  missionNeedTaxonomy,
  mode = 'create',
  mission,
  initialNeedTags = [],
}: MissionFormProps) {
  const boundAction = mode === 'edit' && mission ? updateMission.bind(null, mission.id) : createMission
  const initialState: CreateMissionState | UpdateMissionState = {}
  const [state, formAction] = useActionState(boundAction, initialState)

  const [categoryId, setCategoryId] = useState(mission?.category_id ?? '')
  const [title, setTitle] = useState(mission?.title ?? '')
  const [description, setDescription] = useState(mission?.description ?? '')
  const [needTags, setNeedTags] = useState<string[]>(initialNeedTags)

  const toggleNeedTag = (tag: string) => {
    setNeedTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]))
  }

  const categorySlug = categories.find((c) => c.id === categoryId)?.slug
  const descriptionPlaceholder =
    (categorySlug && DESCRIPTION_PLACEHOLDERS[categorySlug]) ||
    'Décrivez la mission, les attentes, le contexte…'
  const needsForCategory = missionNeedTaxonomy.filter((n) => n.category_id === categoryId)

  return (
    <form action={formAction} noValidate className="flex flex-col gap-5">
      <div>
        <label htmlFor="title" className="mb-1 block text-sm font-medium text-gray-700">
          Titre de la mission ({title.length}/60)
        </label>
        <input
          id="title"
          name="title"
          type="text"
          required
          maxLength={60}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Ex : Garde d'enfants le mercredi après-midi"
          className={inputClass}
        />
        <p className="mt-1 text-xs text-gray-500">Entre 10 et 60 caractères.</p>
      </div>

      <div>
        <label htmlFor="description" className="mb-1 block text-sm font-medium text-gray-700">
          Description ({description.length}/2000)
        </label>
        <textarea
          id="description"
          name="description"
          rows={5}
          maxLength={2000}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder={descriptionPlaceholder}
          className={inputClass}
        />
        <p className="mt-1 text-xs text-gray-500">Si renseignée, entre 30 et 2000 caractères.</p>
      </div>

      <div>
        <label htmlFor="category_id" className="mb-1 block text-sm font-medium text-gray-700">
          Catégorie
        </label>
        <select
          id="category_id"
          name="category_id"
          required
          value={categoryId}
          onChange={(e) => {
            setCategoryId(e.target.value)
            setNeedTags([])
          }}
          className={inputClass}
        >
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

      {needsForCategory.length > 0 && (
        <div>
          <span className="mb-1 block text-sm font-medium text-gray-700">Mes besoins</span>
          <p className="mb-2 text-xs text-gray-500">Précisez le type de besoin pour affiner le profil recherché.</p>
          <div className="grid gap-2 sm:grid-cols-2">
            {needsForCategory.map((need) => (
              <label
                key={need.id}
                className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-colors ${
                  needTags.includes(need.need_tag)
                    ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                    : 'border-gray-300 text-gray-700 hover:border-gray-400'
                }`}
              >
                <input
                  type="checkbox"
                  name="need_tags"
                  value={need.need_tag}
                  checked={needTags.includes(need.need_tag)}
                  onChange={() => toggleNeedTag(need.need_tag)}
                  className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                {need.label}
              </label>
            ))}
          </div>
        </div>
      )}

      <AddressAutocomplete
        id="location_address"
        name="location_address"
        latName="location_lat"
        lngName="location_lng"
        label="Adresse"
        defaultValue={mission?.location_address ?? undefined}
        defaultLat={mission?.location_lat}
        defaultLng={mission?.location_lng}
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label htmlFor="mission_date" className="mb-1 block text-sm font-medium text-gray-700">
            Date
          </label>
          <input
            id="mission_date"
            name="mission_date"
            type="date"
            defaultValue={mission?.mission_date ?? ''}
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="mission_time_start" className="mb-1 block text-sm font-medium text-gray-700">
            Heure de début
          </label>
          <input
            id="mission_time_start"
            name="mission_time_start"
            type="time"
            defaultValue={mission?.mission_time_start ?? ''}
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="mission_time_end" className="mb-1 block text-sm font-medium text-gray-700">
            Heure de fin
          </label>
          <input
            id="mission_time_end"
            name="mission_time_end"
            type="time"
            defaultValue={mission?.mission_time_end ?? ''}
            className={inputClass}
          />
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
            defaultValue={mission?.estimated_duration_hours ?? ''}
            placeholder="3"
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="budget" className="mb-1 block text-sm font-medium text-gray-700">
            Budget (€)
          </label>
          <input
            id="budget"
            name="budget"
            type="number"
            min="0"
            step="1"
            defaultValue={mission?.budget ?? ''}
            placeholder="60"
            className={inputClass}
          />
        </div>
      </div>

      {state.error && (
        <div role="alert" aria-live="polite" className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
          {state.error}
        </div>
      )}

      {mode === 'edit' ? <EditSubmitButton /> : <CreateSubmitButtons />}
    </form>
  )
}
