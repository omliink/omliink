'use client'

import { useActionState, useState } from 'react'
import { useFormStatus } from 'react-dom'
import { connectPajemploi, type SocialConnectionFormState } from '@/lib/actions/social-connections'
import type { Database } from '@/types/database.types'

type SocialConnection = Database['public']['Tables']['employer_social_connections']['Row']

const initialState: SocialConnectionFormState = {}

const inputClass =
  'block w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500'

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-lg bg-indigo-500 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-600 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? 'Envoi…' : 'Connecter'}
    </button>
  )
}

interface PajemploiConnectionCardProps {
  connection: SocialConnection | null
  isPremium: boolean
}

export default function PajemploiConnectionCard({ connection, isPremium }: PajemploiConnectionCardProps) {
  const [expanded, setExpanded] = useState(false)
  const [mandateChecked, setMandateChecked] = useState(false)
  const [state, formAction] = useActionState(connectPajemploi, initialState)

  const [prevState, setPrevState] = useState(state)
  if (state !== prevState) {
    setPrevState(state)
    if (state.success) setExpanded(false)
  }

  const status = connection?.connection_status ?? 'not_connected'

  return (
    <div className="rounded-xl border border-gray-100 bg-white p-5">
      <h3 className="text-sm font-semibold text-gray-900">Pajemploi</h3>
      <p className="mt-1 text-sm text-gray-600">
        Vous employez une baby-sitter de moins de 6 ans ou une garde d’enfants à domicile ? Connectez votre compte
        Pajemploi pour centraliser vos démarches.
      </p>

      {status === 'pending_verification' && (
        <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
          <p>Notre équipe traite votre demande et reviendra vers vous sous peu.</p>
          {connection?.provider_account_number && (
            <p className="mt-1 text-xs text-amber-600">
              Numéro Pajemploi : ···{connection.provider_account_number.slice(-4)}
            </p>
          )}
        </div>
      )}

      {status === 'connected' && (
        <div className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">
          Compte Pajemploi connecté.
        </div>
      )}

      {status === 'not_connected' && !isPremium && (
        <div className="mt-4 rounded-lg border border-dashed border-gray-300 bg-gray-50 p-4 text-center">
          <p className="text-sm text-gray-600">Fonctionnalité réservée aux employeurs Premium.</p>
        </div>
      )}

      {status === 'not_connected' && isPremium && !expanded && (
        <button
          type="button"
          onClick={() => setExpanded(true)}
          className="mt-4 rounded-lg bg-indigo-500 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-600"
        >
          Connecter
        </button>
      )}

      {status === 'not_connected' && isPremium && expanded && (
        <form action={formAction} className="mt-4 flex flex-col gap-4">
          <div>
            <label htmlFor="pajemploi_account_number" className="mb-1 block text-sm font-medium text-gray-700">
              Numéro Pajemploi
            </label>
            <input id="pajemploi_account_number" name="provider_account_number" className={inputClass} />
            <p className="mt-1 text-xs text-gray-500">Format : 7 chiffres, visible sur votre espace Pajemploi.</p>
          </div>
          <div>
            <label htmlFor="pajemploi_date_of_birth" className="mb-1 block text-sm font-medium text-gray-700">
              Date de naissance
            </label>
            <input id="pajemploi_date_of_birth" name="date_of_birth" type="date" className={inputClass} />
          </div>
          <label className="flex items-start gap-2 text-xs text-gray-600">
            <input
              type="checkbox"
              checked={mandateChecked}
              onChange={(e) => setMandateChecked(e.target.checked)}
              className="mt-0.5"
            />
            Je reconnais et accepte de donner mandat à OMLIINK pour effectuer mes démarches Pajemploi en mon nom.
          </label>
          <input type="hidden" name="mandate_accepted" value={String(mandateChecked)} />
          {state.error && (
            <p role="alert" className="text-sm text-red-600">
              {state.error}
            </p>
          )}
          <div className="flex items-center gap-3">
            <SubmitButton />
            <button
              type="button"
              onClick={() => setExpanded(false)}
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
