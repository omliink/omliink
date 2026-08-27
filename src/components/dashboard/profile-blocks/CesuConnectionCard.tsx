'use client'

import { useActionState, useState } from 'react'
import { useFormStatus } from 'react-dom'
import AddressAutocomplete from '@/components/ui/AddressAutocomplete'
import { connectCesuExisting, connectCesuNew, type SocialConnectionFormState } from '@/lib/actions/social-connections'
import type { Database } from '@/types/database.types'

type SocialConnection = Database['public']['Tables']['employer_social_connections']['Row']

const initialState: SocialConnectionFormState = {}

const inputClass =
  'block w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500'

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-lg bg-indigo-500 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-600 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? 'Envoi…' : label}
    </button>
  )
}

const MANDATE_LABEL =
  'Je reconnais et accepte de donner mandat à OMLIINK pour effectuer mes démarches CESU en mon nom.'

export default function CesuConnectionCard({
  connection,
  defaultPhone,
}: {
  connection: SocialConnection | null
  defaultPhone: string | null
}) {
  const [path, setPath] = useState<'existing' | 'new' | null>(null)

  const [existingMandate, setExistingMandate] = useState(false)
  const [existingState, existingAction] = useActionState(connectCesuExisting, initialState)
  const [prevExistingState, setPrevExistingState] = useState(existingState)
  if (existingState !== prevExistingState) {
    setPrevExistingState(existingState)
    if (existingState.success) setPath(null)
  }

  const [newMandate, setNewMandate] = useState(false)
  const [civility, setCivility] = useState('')
  const [newState, newAction] = useActionState(connectCesuNew, initialState)
  const [prevNewState, setPrevNewState] = useState(newState)
  if (newState !== prevNewState) {
    setPrevNewState(newState)
    if (newState.success) setPath(null)
  }

  const status = connection?.connection_status ?? 'not_connected'

  return (
    <div className="rounded-xl border border-gray-100 bg-white p-5">
      <h3 className="text-sm font-semibold text-gray-900">CESU</h3>
      <p className="mt-1 text-sm text-gray-600">
        Vous faites appel à un intervenant pour du ménage, de l’aide à domicile, du jardinage… Connectez votre compte
        CESU pour centraliser vos démarches.
      </p>

      {status === 'pending_verification' && (
        <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
          <p>Notre équipe traite votre demande et reviendra vers vous sous peu.</p>
          {connection?.provider_account_number && (
            <p className="mt-1 text-xs text-amber-600">
              Numéro CESU : ···{connection.provider_account_number.slice(-4)}
            </p>
          )}
        </div>
      )}

      {status === 'connected' && (
        <div className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">
          Compte CESU connecté.
        </div>
      )}

      {status === 'not_connected' && path === null && (
        <div className="mt-4 flex flex-col gap-2 sm:flex-row">
          <button
            type="button"
            onClick={() => setPath('existing')}
            className="flex-1 rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:border-gray-400"
          >
            J’ai déjà un compte CESU
          </button>
          <button
            type="button"
            onClick={() => setPath('new')}
            className="flex-1 rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:border-gray-400"
          >
            Je n’ai pas de compte CESU
          </button>
        </div>
      )}

      {status === 'not_connected' && path === 'existing' && (
        <form action={existingAction} className="mt-4 flex flex-col gap-4">
          <div>
            <label htmlFor="cesu_account_number" className="mb-1 block text-sm font-medium text-gray-700">
              Numéro CESU
            </label>
            <input id="cesu_account_number" name="provider_account_number" className={inputClass} />
          </div>
          <div>
            <label htmlFor="cesu_date_of_birth" className="mb-1 block text-sm font-medium text-gray-700">
              Date de naissance
            </label>
            <input id="cesu_date_of_birth" name="date_of_birth" type="date" className={inputClass} />
          </div>
          <label className="flex items-start gap-2 text-xs text-gray-600">
            <input
              type="checkbox"
              checked={existingMandate}
              onChange={(e) => setExistingMandate(e.target.checked)}
              className="mt-0.5"
            />
            {MANDATE_LABEL}
          </label>
          <input type="hidden" name="mandate_accepted" value={String(existingMandate)} />
          {existingState.error && (
            <p role="alert" className="text-sm text-red-600">
              {existingState.error}
            </p>
          )}
          <div className="flex items-center gap-3">
            <SubmitButton label="Connecter" />
            <button
              type="button"
              onClick={() => setPath(null)}
              className="text-sm font-medium text-gray-500 hover:text-gray-700"
            >
              Annuler
            </button>
          </div>
        </form>
      )}

      {status === 'not_connected' && path === 'new' && (
        <form action={newAction} className="mt-4 flex flex-col gap-4">
          <div>
            <span className="mb-1 block text-sm font-medium text-gray-700">Civilité</span>
            <div role="radiogroup" className="flex gap-3">
              {[
                { value: 'Mme', label: 'Mme' },
                { value: 'M', label: 'M' },
              ].map((option) => (
                <button
                  key={option.value}
                  type="button"
                  role="radio"
                  aria-checked={civility === option.value}
                  onClick={() => setCivility(option.value)}
                  className={`rounded-lg border px-4 py-2 text-sm transition-colors ${
                    civility === option.value
                      ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                      : 'border-gray-300 text-gray-700 hover:border-gray-400'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
            <input type="hidden" name="civility" value={civility} />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="cesu_new_first_name" className="mb-1 block text-sm font-medium text-gray-700">
                Prénom
              </label>
              <input id="cesu_new_first_name" name="first_name" className={inputClass} />
            </div>
            <div>
              <label htmlFor="cesu_new_last_name" className="mb-1 block text-sm font-medium text-gray-700">
                Nom
              </label>
              <input id="cesu_new_last_name" name="last_name" className={inputClass} />
            </div>
          </div>

          <div>
            <label htmlFor="cesu_new_phone" className="mb-1 block text-sm font-medium text-gray-700">
              Téléphone
            </label>
            <input
              id="cesu_new_phone"
              name="phone"
              defaultValue={defaultPhone ?? ''}
              className={inputClass}
            />
          </div>

          <AddressAutocomplete
            id="cesu_new_address"
            name="address"
            latName="cesu_new_address_lat"
            lngName="cesu_new_address_lng"
            label="Adresse"
          />

          <label className="flex items-start gap-2 text-xs text-gray-600">
            <input
              type="checkbox"
              checked={newMandate}
              onChange={(e) => setNewMandate(e.target.checked)}
              className="mt-0.5"
            />
            {MANDATE_LABEL}
          </label>
          <input type="hidden" name="mandate_accepted" value={String(newMandate)} />
          {newState.error && (
            <p role="alert" className="text-sm text-red-600">
              {newState.error}
            </p>
          )}
          <div className="flex items-center gap-3">
            <SubmitButton label="Créer mon compte CESU" />
            <button
              type="button"
              onClick={() => setPath(null)}
              className="text-sm font-medium text-gray-500 hover:text-gray-700"
            >
              Annuler
            </button>
          </div>
        </form>
      )}
    </div>
  )
}
