import { notFound, redirect } from 'next/navigation'
import StatusBadge from '@/components/ui/StatusBadge'
import ApplyForm from '@/components/dashboard/ApplyForm'
import ApplicationsList from '@/components/dashboard/ApplicationsList'
import {
  getApplicationForMissionAndCandidate,
  getApplicationsForMission,
  getCategories,
  getCurrentUser,
  getMissionById,
  getProfile,
  getProfilesByIds,
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
  const candidateProfiles = isOwner ? await getProfilesByIds(applications.map((a) => a.candidate_id)) : []
  const candidateNameById = new Map(candidateProfiles.map((p) => [p.id, p.full_name ?? p.email]))

  const categoryName = categories.find((category) => category.id === mission.category_id)?.name

  return (
    <div className="mx-auto max-w-3xl">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-indigo-500">{categoryName ?? 'Catégorie'}</p>
          <h1 className="mt-1 text-2xl font-bold text-gray-900">{mission.title}</h1>
        </div>
        <StatusBadge status={mission.status} />
      </div>

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

      {isOwner && (
        <div className="mt-10">
          <h2 className="text-lg font-semibold text-gray-900">Candidatures reçues</h2>
          <ApplicationsList applications={applications} missionId={mission.id} candidateNameById={candidateNameById} />
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
    </div>
  )
}
