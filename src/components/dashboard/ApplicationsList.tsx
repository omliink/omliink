import StatusBadge from '@/components/ui/StatusBadge'
import EmptyState from '@/components/ui/EmptyState'
import ApplicationActions from './ApplicationActions'
import CandidateProfileReveal from './CandidateProfileReveal'
import type { Database } from '@/types/database.types'

type Application = Database['public']['Tables']['applications']['Row']
type CandidateProfile = Database['public']['Tables']['candidate_profiles']['Row']
type Review = Database['public']['Tables']['reviews']['Row']

interface ApplicationsListProps {
  applications: Application[]
  missionId: string
  candidateNameById: Map<string, string>
  candidateProfileById: Map<string, CandidateProfile>
  distanceByCandidateId?: Map<string, number>
  skillLabelsByCandidateId: Map<string, string[]>
  reviewsByCandidateId?: Map<string, Review[]>
  reviewerNameById?: Map<string, string>
}

function formatDistance(value: number) {
  return `${value.toLocaleString('fr-FR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} km`
}

export default function ApplicationsList({
  applications,
  missionId,
  candidateNameById,
  candidateProfileById,
  distanceByCandidateId,
  skillLabelsByCandidateId,
  reviewsByCandidateId,
  reviewerNameById,
}: ApplicationsListProps) {
  if (applications.length === 0) {
    return (
      <div className="mt-4">
        <EmptyState
          title="Aucune candidature pour le moment"
          description="Les candidatures apparaîtront ici dès qu'un candidat postulera."
        />
      </div>
    )
  }

  return (
    <ul className="mt-4 divide-y divide-gray-100 overflow-hidden rounded-xl border border-gray-100 bg-white">
      {applications.map((application) => {
        const distanceKm = distanceByCandidateId?.get(application.candidate_id)
        return (
        <li key={application.id} className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <p className="text-sm font-medium text-gray-900">
              {candidateNameById.get(application.candidate_id) ?? 'Candidat'}
              {distanceKm != null && <span className="font-normal text-gray-500"> · {formatDistance(distanceKm)}</span>}
            </p>
            {application.cover_letter && <p className="mt-1 text-sm text-gray-600">{application.cover_letter}</p>}
            <p className="mt-1 text-xs text-gray-500">
              Envoyée le {new Date(application.applied_at).toLocaleDateString('fr-FR')}
            </p>
            <div className="mt-2">
              <CandidateProfileReveal
                profile={candidateProfileById.get(application.candidate_id) ?? null}
                skillLabels={skillLabelsByCandidateId.get(application.candidate_id) ?? []}
                reviews={reviewsByCandidateId?.get(application.candidate_id) ?? []}
                reviewerNameById={reviewerNameById}
              />
            </div>
          </div>
          <div className="flex flex-shrink-0 items-center gap-3">
            <StatusBadge status={application.status} />
            <ApplicationActions applicationId={application.id} missionId={missionId} status={application.status} />
          </div>
        </li>
        )
      })}
    </ul>
  )
}
