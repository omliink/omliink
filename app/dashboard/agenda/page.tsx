import { redirect } from 'next/navigation'
import AgendaView from '@/components/dashboard/AgendaView'
import {
  getCandidateApplications,
  getCurrentUser,
  getMissionsByIds,
  getProfile,
  getProfilesByIds,
  getVisioMeetingsByMissionIds,
} from '@/lib/dashboard-data'

export default async function AgendaPage() {
  const user = await getCurrentUser()
  if (!user) {
    redirect('/auth/login')
  }

  const profile = await getProfile(user.id)
  if (!profile?.is_candidate) {
    redirect('/dashboard')
  }

  const applications = await getCandidateApplications(user.id)
  const missions = await getMissionsByIds(applications.map((a) => a.mission_id))
  const missionById = new Map(missions.map((m) => [m.id, m]))

  const relevantMissionIds = applications
    .filter((a) => a.status === 'interviewing' || a.status === 'hired')
    .map((a) => a.mission_id)
  // RLS scopes visio_meetings to its two participants, so this — run as the
  // candidate — only ever returns their own meetings even on missions with
  // parallel interviews.
  const visioMeetings = await getVisioMeetingsByMissionIds(relevantMissionIds)

  const employerIds = [...new Set(visioMeetings.map((m) => m.employer_id))]
  const employerProfiles = await getProfilesByIds(employerIds)
  const employerNameById = new Map(employerProfiles.map((p) => [p.id, p.full_name ?? p.email]))

  const hiredMissionIds = new Set(
    applications.filter((a) => a.status === 'hired').map((a) => a.mission_id)
  )
  const activeMissions = [...hiredMissionIds]
    .map((id) => missionById.get(id))
    .filter((mission): mission is NonNullable<typeof mission> => mission != null && mission.status !== 'completed')

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Mon agenda</h1>
      <p className="mt-1 text-sm text-gray-600">Vos visioconférences et missions en cours.</p>

      <div className="mt-6">
        <AgendaView
          visioMeetings={visioMeetings}
          missionById={missionById}
          employerNameById={employerNameById}
          activeMissions={activeMissions}
        />
      </div>
    </div>
  )
}
