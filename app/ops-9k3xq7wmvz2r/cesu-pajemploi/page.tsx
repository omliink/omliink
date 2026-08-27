import EmptyState from '@/components/ui/EmptyState'
import MarkConnectedButton from '@/components/admin/MarkConnectedButton'
import { getPendingSocialConnections, getProfilesByIds } from '@/lib/dashboard-data'

const PROVIDER_LABELS: Record<string, string> = {
  pajemploi: 'Pajemploi',
  cesu: 'CESU',
}

export default async function AdminCesuPajemploiPage() {
  const connections = await getPendingSocialConnections()
  const employerProfiles = await getProfilesByIds(connections.map((c) => c.employer_id))
  const employerNameById = new Map(employerProfiles.map((p) => [p.id, p.full_name ?? p.email]))

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Demandes CESU / Pajemploi</h1>
      <p className="mt-1 text-sm text-gray-600">
        {connections.length} demande{connections.length !== 1 ? 's' : ''} en attente. Le traitement (inscription ou
        vérification réelle) reste manuel, en dehors de l’app — cette action enregistre seulement que c’est fait.
      </p>

      {connections.length === 0 ? (
        <div className="mt-6">
          <EmptyState title="Aucune demande en attente" description="Tout est à jour." />
        </div>
      ) : (
        <ul className="mt-6 flex flex-col gap-4">
          {connections.map((connection) => (
            <li key={connection.id} className="rounded-xl border border-gray-100 bg-white p-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-gray-900">
                    {employerNameById.get(connection.employer_id) ?? 'Employeur'} —{' '}
                    {PROVIDER_LABELS[connection.provider] ?? connection.provider}
                    {connection.cesu_path === 'new' && ' (nouvelle inscription)'}
                    {connection.cesu_path === 'existing' && ' (compte existant)'}
                  </p>
                  <p className="mt-1 text-xs text-gray-500">
                    Soumis le {new Date(connection.updated_at).toLocaleDateString('fr-FR')}
                  </p>
                  <dl className="mt-3 grid gap-x-6 gap-y-1 text-sm text-gray-700 sm:grid-cols-2">
                    {connection.provider_account_number && (
                      <div>
                        <dt className="inline text-gray-500">Numéro : </dt>
                        <dd className="inline">{connection.provider_account_number}</dd>
                      </div>
                    )}
                    {connection.date_of_birth && (
                      <div>
                        <dt className="inline text-gray-500">Date de naissance : </dt>
                        <dd className="inline">{new Date(connection.date_of_birth).toLocaleDateString('fr-FR')}</dd>
                      </div>
                    )}
                    {connection.civility && (
                      <div>
                        <dt className="inline text-gray-500">Civilité : </dt>
                        <dd className="inline">{connection.civility}</dd>
                      </div>
                    )}
                    {(connection.first_name || connection.last_name) && (
                      <div>
                        <dt className="inline text-gray-500">Nom : </dt>
                        <dd className="inline">
                          {connection.first_name} {connection.last_name}
                        </dd>
                      </div>
                    )}
                    {connection.phone && (
                      <div>
                        <dt className="inline text-gray-500">Téléphone : </dt>
                        <dd className="inline">{connection.phone}</dd>
                      </div>
                    )}
                    {connection.address && (
                      <div className="sm:col-span-2">
                        <dt className="inline text-gray-500">Adresse : </dt>
                        <dd className="inline">{connection.address}</dd>
                      </div>
                    )}
                  </dl>
                </div>
                <MarkConnectedButton connectionId={connection.id} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
