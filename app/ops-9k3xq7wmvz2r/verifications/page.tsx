import EmptyState from '@/components/ui/EmptyState'
import VerificationRow from '@/components/admin/VerificationRow'
import { getPendingVerificationCandidates, getProfilesByIds } from '@/lib/dashboard-data'

export default async function AdminVerificationsPage() {
  const candidates = await getPendingVerificationCandidates()
  const profiles = await getProfilesByIds(candidates.map((c) => c.user_id))
  const nameById = new Map(profiles.map((p) => [p.id, p.full_name ?? p.email]))

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Vérifications candidats</h1>
      <p className="mt-1 text-sm text-gray-600">
        {candidates.length} candidat{candidates.length !== 1 ? 's' : ''} en attente.
      </p>

      {candidates.length === 0 ? (
        <div className="mt-6">
          <EmptyState title="Aucune vérification en attente" description="Tout est à jour." />
        </div>
      ) : (
        <ul className="mt-6 divide-y divide-gray-100 overflow-hidden rounded-xl border border-gray-100 bg-white">
          {candidates.map((candidate) => (
            <VerificationRow
              key={candidate.user_id}
              candidateId={candidate.user_id}
              name={nameById.get(candidate.user_id) ?? 'Candidat'}
              submittedAt={candidate.updated_at}
            />
          ))}
        </ul>
      )}
    </div>
  )
}
