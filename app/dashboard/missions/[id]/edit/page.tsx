import { notFound, redirect } from 'next/navigation'
import MissionForm from '@/components/dashboard/MissionForm'
import {
  getApplicationsForMission,
  getCategories,
  getCurrentUser,
  getMissionById,
  getMissionNeedTaxonomy,
  getMissionNeeds,
} from '@/lib/dashboard-data'

interface EditMissionPageProps {
  params: Promise<{ id: string }>
}

export default async function EditMissionPage({ params }: EditMissionPageProps) {
  const { id } = await params
  const user = await getCurrentUser()
  if (!user) {
    redirect('/auth/login')
  }

  const mission = await getMissionById(id)
  if (!mission) {
    notFound()
  }
  if (mission.employer_id !== user.id) {
    redirect('/dashboard')
  }
  if (mission.moderation_status !== 'normal') {
    redirect(`/dashboard/missions/${mission.id}`)
  }

  const applications = await getApplicationsForMission(mission.id)
  if (applications.some((application) => application.status === 'hired')) {
    redirect(`/dashboard/missions/${mission.id}`)
  }

  const [categories, missionNeedTaxonomy, missionNeeds] = await Promise.all([
    getCategories(),
    getMissionNeedTaxonomy(),
    getMissionNeeds(mission.id),
  ])

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900">Modifier la mission</h1>
      <p className="mt-1 text-sm text-gray-600">Ajustez les informations de la mission.</p>

      <div className="mt-8">
        <MissionForm
          categories={categories}
          missionNeedTaxonomy={missionNeedTaxonomy}
          mode="edit"
          mission={mission}
          initialNeedTags={missionNeeds.map((n) => n.need_tag)}
        />
      </div>
    </div>
  )
}
