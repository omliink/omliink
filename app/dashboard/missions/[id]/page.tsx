import { notFound, redirect } from 'next/navigation'
import StatusBadge from '@/components/ui/StatusBadge'
import ApplyForm from '@/components/dashboard/ApplyForm'
import ApplicationsList from '@/components/dashboard/ApplicationsList'
import InterviewsList from '@/components/dashboard/InterviewsList'
import VisioSection from '@/components/dashboard/VisioSection'
import ContractSection from '@/components/dashboard/ContractSection'
import SuggestedCandidatesList from '@/components/dashboard/SuggestedCandidatesList'
import { haversineDistanceKm } from '@/lib/geo'
import {
  getApplicationForMissionAndCandidate,
  getApplicationsForMission,
  getCandidateProfile,
  getCandidateProfilesByUserIds,
  getCandidateSkillRowsForCandidates,
  getCategories,
  getContractByMissionId,
  getCurrentUser,
  getEmployerProfile,
  getInvitationsForMission,
  getMissionById,
  getMissionNeedTaxonomy,
  getMissionNeeds,
  getProfile,
  getProfilesByIds,
  getSkillTaxonomy,
  getSuggestedCandidatesForMission,
  getVisioMeetingForCandidate,
  getVisioMeetingsByMissionIds,
} from '@/lib/dashboard-data'

interface MissionDetailPageProps {
  params: Promise<{ id: string }>
}

function formatDate(value: string | null) {
  if (!value) return 'Non renseignée'
  return new Date(value).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
}

function formatBudget(value: number | null) {
  if (value === null) return 'Non renseigné'
  return `${value.toLocaleString('fr-FR')} €`
}

export default async function MissionDetailPage({ params }: MissionDetailPageProps) {
  const { id } = await params

  const user = await getCurrentUser()
  if (!user) {
    redirect('/auth/login')
  }

  const [profile, mission, categories] = await Promise.all([getProfile(user.id), getMissionById(id), getCategories()])

  if (!mission) {
    notFound()
  }

  const isOwner = mission.employer_id === user.id
  const isCandidateViewer = Boolean(profile?.is_candidate) && !isOwner

  const myApplication = isCandidateViewer ? await getApplicationForMissionAndCandidate(mission.id, user.id) : null

  if (!isOwner && mission.status !== 'published' && !myApplication) {
    redirect('/dashboard')
  }

  const applications = isOwner ? await getApplicationsForMission(mission.id) : []
  const interviewingApplications = applications.filter((a) => a.status === 'interviewing')
  const candidateIds = applications.map((a) => a.candidate_id)
  const [candidateProfiles, candidateExtendedProfiles, candidateSkillRows, skillTaxonomy] = isOwner
    ? await Promise.all([
        getProfilesByIds(candidateIds),
        getCandidateProfilesByUserIds(candidateIds),
        getCandidateSkillRowsForCandidates(candidateIds),
        getSkillTaxonomy(),
      ])
    : [[], [], [], []]
  const candidateNameById = new Map(candidateProfiles.map((p) => [p.id, p.full_name ?? p.email]))
  const candidateProfileById = new Map(candidateExtendedProfiles.map((p) => [p.user_id, p]))

  // Resolved once here (rather than threading raw skill rows + taxonomy
  // through ApplicationsList/InterviewsList/CandidateProfileReveal) — same
  // "find the label, fall back to the raw tag" pattern as
  // CandidateServicesBlock's own read view.
  const skillLabelsByCandidateId = new Map<string, string[]>()
  for (const row of candidateSkillRows) {
    const label =
      skillTaxonomy.find((s) => s.category_id === row.category_id && s.skill_tag === row.skill_tag)?.label ??
      row.skill_tag
    const existing = skillLabelsByCandidateId.get(row.candidate_id) ?? []
    existing.push(label)
    skillLabelsByCandidateId.set(row.candidate_id, existing)
  }

  const missionLat = mission.location_lat
  const missionLng = mission.location_lng
  const distanceByCandidateId = new Map<string, number>()
  if (missionLat != null && missionLng != null) {
    for (const candidateProfile of candidateExtendedProfiles) {
      if (candidateProfile.location_lat != null && candidateProfile.location_lng != null) {
        distanceByCandidateId.set(
          candidateProfile.user_id,
          haversineDistanceKm(missionLat, missionLng, candidateProfile.location_lat, candidateProfile.location_lng)
        )
      }
    }
  }

  const categoryName = categories.find((category) => category.id === mission.category_id)?.name

  const [employerProfileBasic, employerProfileExtended] = isCandidateViewer
    ? await Promise.all([getProfile(mission.employer_id), getEmployerProfile(mission.employer_id)])
    : [null, null]

  const [missionNeeds, missionNeedTaxonomy] = await Promise.all([getMissionNeeds(mission.id), getMissionNeedTaxonomy()])
  const needLabelByTag = new Map(missionNeedTaxonomy.map((n) => [`${n.category_id}:${n.need_tag}`, n.label]))

  const [suggestedCandidates, invitations] = isOwner && mission.status === 'published'
    ? await Promise.all([getSuggestedCandidatesForMission(mission), getInvitationsForMission(mission.id)])
    : [[], []]
  const suggestedCandidateNames = isOwner
    ? await getProfilesByIds(suggestedCandidates.map((c) => c.candidateId))
    : []
  const suggestedNameById = new Map(suggestedCandidateNames.map((p) => [p.id, p.full_name ?? p.email]))
  const invitedCandidateIds = invitations.filter((i) => i.status !== 'declined').map((i) => i.candidate_id)

  // Owner side: several candidates can each have their own meeting on this
  // mission (parallel interviews), so this must stay array-returning — a
  // .maybeSingle() keyed only by mission_id would break as soon as a second
  // interviewing candidate exists. Candidate side: scoped to their own
  // meeting only, always at most one row.
  const [interviewMeetings, myMeeting, contract] = await Promise.all([
    isOwner ? getVisioMeetingsByMissionIds([mission.id]) : Promise.resolve([]),
    isCandidateViewer && myApplication ? getVisioMeetingForCandidate(mission.id, user.id) : Promise.resolve(null),
    getContractByMissionId(mission.id),
  ])
  const meetingByApplicationId = new Map(
    interviewMeetings.filter((m) => m.application_id).map((m) => [m.application_id as string, m])
  )
  const isContractParticipant = isOwner || Boolean(contract && contract.candidate_id === user.id)
  const contractCandidateProfile = contract
    ? (candidateProfileById.get(contract.candidate_id) ?? (await getCandidateProfile(contract.candidate_id)))
    : null
  // This Server Component renders once per request — there's no re-render to
  // go stale, so the purity rule (aimed at memoized client components) does
  // not apply here.
  // eslint-disable-next-line react-hooks/purity
  const now = Date.now()

  return (
    <div className="mx-auto max-w-3xl">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-indigo-500">{categoryName ?? 'Catégorie'}</p>
          <h1 className="mt-1 text-2xl font-bold text-gray-900">{mission.title}</h1>
        </div>
        <StatusBadge status={mission.status} />
      </div>

      {isCandidateViewer && employerProfileBasic && (
        <div className="mt-3 flex items-center gap-2 text-sm text-gray-600">
          {employerProfileExtended?.photo_url && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={employerProfileExtended.photo_url} alt="" className="h-8 w-8 rounded-full object-cover" />
          )}
          <span>Publié par {employerProfileBasic.full_name ?? employerProfileBasic.email}</span>
        </div>
      )}

      <dl className="mt-6 grid gap-4 rounded-xl border border-gray-100 bg-white p-5 sm:grid-cols-2">
        <div>
          <dt className="text-xs font-medium text-gray-500">Date</dt>
          <dd className="mt-0.5 text-sm text-gray-900">{formatDate(mission.mission_date)}</dd>
        </div>
        <div>
          <dt className="text-xs font-medium text-gray-500">Budget</dt>
          <dd className="mt-0.5 text-sm text-gray-900">{formatBudget(mission.budget)}</dd>
        </div>
        <div>
          <dt className="text-xs font-medium text-gray-500">Adresse</dt>
          <dd className="mt-0.5 text-sm text-gray-900">{mission.location_address ?? 'Non renseignée'}</dd>
        </div>
        <div>
          <dt className="text-xs font-medium text-gray-500">Durée estimée</dt>
          <dd className="mt-0.5 text-sm text-gray-900">
            {mission.estimated_duration_hours ? `${mission.estimated_duration_hours} h` : 'Non renseignée'}
          </dd>
        </div>
      </dl>

      {mission.description && (
        <div className="mt-6">
          <h2 className="text-sm font-semibold text-gray-900">Description</h2>
          <p className="mt-2 whitespace-pre-wrap text-sm text-gray-600">{mission.description}</p>
        </div>
      )}

      {missionNeeds.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {missionNeeds.map((need) => (
            <span key={need.id} className="rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-medium text-indigo-700">
              {needLabelByTag.get(`${need.category_id}:${need.need_tag}`) ?? need.need_tag}
            </span>
          ))}
        </div>
      )}

      {isOwner && mission.status === 'published' && (
        <div className="mt-10">
          <h2 className="text-lg font-semibold text-gray-900">Candidats suggérés</h2>
          <p className="mt-1 text-sm text-gray-600">
            Candidats compatibles avec cette mission que vous pouvez inviter à candidater.
          </p>
          <SuggestedCandidatesList
            missionId={mission.id}
            candidates={suggestedCandidates}
            nameByCandidateId={suggestedNameById}
            initiallyInvitedIds={invitedCandidateIds}
          />
        </div>
      )}

      {isOwner && (
        <div className="mt-10">
          <h2 className="text-lg font-semibold text-gray-900">Candidatures reçues</h2>
          <ApplicationsList
            applications={applications}
            missionId={mission.id}
            candidateNameById={candidateNameById}
            candidateProfileById={candidateProfileById}
            distanceByCandidateId={distanceByCandidateId}
            skillLabelsByCandidateId={skillLabelsByCandidateId}
          />
        </div>
      )}

      {isOwner && (
        <div className="mt-10">
          <h2 className="text-lg font-semibold text-gray-900">Entretiens</h2>
          <InterviewsList
            applications={interviewingApplications}
            missionId={mission.id}
            candidateNameById={candidateNameById}
            candidateProfileById={candidateProfileById}
            meetingByApplicationId={meetingByApplicationId}
            skillLabelsByCandidateId={skillLabelsByCandidateId}
            now={now}
          />
        </div>
      )}

      {isCandidateViewer && (
        <div className="mt-10">
          <h2 className="text-lg font-semibold text-gray-900">Votre candidature</h2>
          <div className="mt-4">
            {myApplication ? (
              <div className="rounded-lg border border-gray-100 bg-white p-5">
                <StatusBadge status={myApplication.status} />
                {myApplication.cover_letter && <p className="mt-3 text-sm text-gray-600">{myApplication.cover_letter}</p>}
              </div>
            ) : (
              <ApplyForm missionId={mission.id} />
            )}
          </div>
        </div>
      )}

      {myMeeting && (
        <VisioSection meeting={myMeeting} missionId={mission.id} isEmployerViewer={false} now={now} />
      )}

      {contract && isContractParticipant && (
        <ContractSection
          contract={contract}
          mission={mission}
          isEmployerViewer={isOwner}
          candidateProfile={contractCandidateProfile}
        />
      )}
    </div>
  )
}
