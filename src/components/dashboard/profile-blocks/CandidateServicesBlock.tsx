'use client'

import { useActionState, useState } from 'react'
import { useFormStatus } from 'react-dom'
import ProfileBlockCard from './ProfileBlockCard'
import { updateCandidateServices, type ProfileFormState } from '@/lib/actions/profile'
import type { Database } from '@/types/database.types'

type ServiceCategory = Database['public']['Tables']['service_categories']['Row']
type SkillTaxonomy = Database['public']['Tables']['skill_taxonomy']['Row']

interface SelectedSkill {
  category_id: string
  skill_tag: string
}

interface CandidateServicesBlockProps {
  categories: ServiceCategory[]
  skillTaxonomy: SkillTaxonomy[]
  initialCategoryIds: string[]
  initialSupplementCodes: string[]
  initialSkills: SelectedSkill[]
}

const SUPPLEMENT_OPTIONS = [
  { code: 'premiers_secours', label: 'Formation premiers secours' },
  { code: 'motorise', label: 'Véhiculé / motorisé' },
  { code: 'permis_conduire', label: 'Permis de conduire' },
  { code: 'dispo_immediate', label: 'Disponibilité immédiate' },
]

const initialState: ProfileFormState = {}

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

export default function CandidateServicesBlock({
  categories,
  skillTaxonomy,
  initialCategoryIds,
  initialSupplementCodes,
  initialSkills,
}: CandidateServicesBlockProps) {
  const [editing, setEditing] = useState(false)
  const [state, formAction] = useActionState(updateCandidateServices, initialState)

  const [categoryIds, setCategoryIds] = useState<string[]>(initialCategoryIds)
  const [supplementCodes, setSupplementCodes] = useState<string[]>(initialSupplementCodes)
  const [selectedSkills, setSelectedSkills] = useState<SelectedSkill[]>(initialSkills)

  const [prevState, setPrevState] = useState(state)
  if (state !== prevState) {
    setPrevState(state)
    if (state.success) setEditing(false)
  }

  const toggleInArray = (arr: string[], value: string) =>
    arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value]

  const toggleSkill = (categoryId: string, skillTag: string) => {
    setSelectedSkills((prev) => {
      const exists = prev.some((s) => s.category_id === categoryId && s.skill_tag === skillTag)
      return exists
        ? prev.filter((s) => !(s.category_id === categoryId && s.skill_tag === skillTag))
        : [...prev, { category_id: categoryId, skill_tag: skillTag }]
    })
  }

  const selectedCategoryNames = categories.filter((c) => categoryIds.includes(c.id)).map((c) => c.name)
  const selectedSupplementLabels = SUPPLEMENT_OPTIONS.filter((o) => supplementCodes.includes(o.code)).map((o) => o.label)

  return (
    <ProfileBlockCard
      title="Services et compétences"
      editing={editing}
      onEdit={() => setEditing(true)}
      onCancel={() => setEditing(false)}
      readView={
        <div className="flex flex-col gap-4">
          <div>
            <p className="text-xs font-medium text-gray-500">Types de services</p>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {selectedCategoryNames.length > 0 ? (
                selectedCategoryNames.map((name) => (
                  <span key={name} className="rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-medium text-indigo-700">
                    {name}
                  </span>
                ))
              ) : (
                <span className="text-sm text-gray-500">Aucun</span>
              )}
            </div>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">Suppléments</p>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {selectedSupplementLabels.length > 0 ? (
                selectedSupplementLabels.map((label) => (
                  <span key={label} className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-700">
                    {label}
                  </span>
                ))
              ) : (
                <span className="text-sm text-gray-500">Aucun</span>
              )}
            </div>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">Compétences</p>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {selectedSkills.length > 0 ? (
                selectedSkills.map((skill) => {
                  const label = skillTaxonomy.find(
                    (s) => s.category_id === skill.category_id && s.skill_tag === skill.skill_tag
                  )?.label
                  return (
                    <span key={`${skill.category_id}:${skill.skill_tag}`} className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-700">
                      {label ?? skill.skill_tag}
                    </span>
                  )
                })
              ) : (
                <span className="text-sm text-gray-500">Aucune</span>
              )}
            </div>
          </div>
          {state.success && <p className="text-sm text-emerald-600">Mis à jour avec succès.</p>}
        </div>
      }
      editView={
        <form action={formAction} className="flex flex-col gap-6">
          <div>
            <span className="mb-2 block text-sm font-medium text-gray-700">Types de services</span>
            <div className="grid gap-2 sm:grid-cols-2">
              {categories.map((category) => (
                <label
                  key={category.id}
                  className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-colors ${
                    categoryIds.includes(category.id)
                      ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                      : 'border-gray-300 text-gray-700 hover:border-gray-400'
                  }`}
                >
                  <input
                    type="checkbox"
                    name="service_categories"
                    value={category.id}
                    checked={categoryIds.includes(category.id)}
                    onChange={() => setCategoryIds(toggleInArray(categoryIds, category.id))}
                    className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  {category.name}
                </label>
              ))}
            </div>
          </div>

          <div>
            <span className="mb-2 block text-sm font-medium text-gray-700">Suppléments</span>
            <div className="grid gap-2 sm:grid-cols-2">
              {SUPPLEMENT_OPTIONS.map((option) => (
                <label
                  key={option.code}
                  className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-colors ${
                    supplementCodes.includes(option.code)
                      ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                      : 'border-gray-300 text-gray-700 hover:border-gray-400'
                  }`}
                >
                  <input
                    type="checkbox"
                    name="supplements"
                    value={option.code}
                    checked={supplementCodes.includes(option.code)}
                    onChange={() => setSupplementCodes(toggleInArray(supplementCodes, option.code))}
                    className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  {option.label}
                </label>
              ))}
            </div>
          </div>

          <div>
            <span className="mb-2 block text-sm font-medium text-gray-700">Compétences</span>
            <div className="flex flex-col gap-4">
              {categoryIds.map((categoryId) => {
                const category = categories.find((c) => c.id === categoryId)
                const tags = skillTaxonomy.filter((s) => s.category_id === categoryId)
                if (!category || tags.length === 0) return null
                return (
                  <div key={categoryId}>
                    <h3 className="mb-2 text-sm font-semibold text-gray-800">{category.name}</h3>
                    <div className="flex flex-wrap gap-2">
                      {tags.map((tag) => {
                        const isSelected = selectedSkills.some(
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
            <input type="hidden" name="skills_json" value={JSON.stringify(selectedSkills)} />
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
