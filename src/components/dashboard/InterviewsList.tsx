import EmptyState from '@/components/ui/EmptyState'
import CandidateProfileReveal from './CandidateProfileReveal'
import VisioSection from './VisioSection'
import InterviewActions from './InterviewActions'
import type { Database } from '@/types/database.types'

type Application = Database['public']['Tables']['applications']['Row']
type CandidateProfile = Database['public']['Tables']['candidate_profiles']['Row']
type VisioMeeting = Database['public']['Tables']['visio_meetings']['Row']

interface InterviewsListProps {
  applications: Application[]
  missionId: string
  candidateNameById: Map<string, string>
  candidateProfileById: Map<string, CandidateProfile>
  meetingByApplicationId: Map<string, VisioMeeting>
  now: number
}

export default function InterviewsList({
  applications,
  missionId,
  candidateNameById,
  candidateProfileById,
  meetingByApplicationId,
  now,
}: InterviewsListProps) {
  if (applications.length === 0) {
    return (
      <div className="mt-4">
        <EmptyState
          title="Aucun entretien en cours"
          description="Passez une candidature en entretien pour la voir apparaître ici."
        />
      </div>
    )
  }

  return (
    <div className="mt-4 flex flex-col gap-6">
      {applications.map((application) => {
        const meeting = meetingByApplicationId.get(application.id)
        return (
          <div key={application.id} className="rounded-xl border border-gray-100 bg-white p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm font-medium text-gray-900">
                {candidateNameById.get(application.candidate_id) ?? 'Candidat'}
              </p>
              <InterviewActions applicationId={application.id} missionId={missionId} />
            </div>
            <div className="mt-2">
              <CandidateProfileReveal profile={candidateProfileById.get(application.candidate_id) ?? null} />
            </div>
            {meeting ? (
              <VisioSection meeting={meeting} missionId={missionId} isEmployerViewer now={now} />
            ) : (
              <p className="mt-4 text-sm text-gray-500">Visioconférence en cours de création…</p>
            )}
          </div>
        )
      })}
    </div>
  )
}
