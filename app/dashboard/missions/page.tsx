import { redirect } from 'next/navigation'
import Link from 'next/link'
import EmployerMissionsGrid from '@/components/dashboard/EmployerMissionsGrid'
import {
  getApplicationsForMissions,
  getCategories,
  getCurrentUser,
  getEmployerMissions,
  getProfile,
} from '@/lib/dashboard-data'

export default async function MissionsPage() {
  const user = await getCurrentUser()
  if (!user) {
    redirect('/auth/login')
  }

  const profile = await getProfile(user.id)
  if (!profile?.is_employer) {
    redirect('/dashboard')
  }

  const missions = await getEmployerMissions(user.id)
  const missionIds = missions.map((mission) => mission.id)
  const [categories, applications] = await Promise.all([getCategories(), getApplicationsForMissions(missionIds)])

  const categoryMap = new Map(categories.map((category) => [category.id, category.name]))
  const applicationsCountByMission = new Map<string, number>()
  const hiredMissionIds = new Set<string>()
  applications.forEach((application) => {
    applicationsCountByMission.set(
      application.mission_id,
      (applicationsCountByMission.get(application.mission_id) ?? 0) + 1
    )
    if (application.status === 'hired') {
      hiredMissionIds.add(application.mission_id)
    }
  })

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mes missions</h1>
          <p className="mt-1 text-sm text-gray-600">Toutes vos missions, quel que soit leur statut.</p>
        </div>
        <Link
          href="/dashboard/missions/new"
          className="inline-flex items-center justify-center rounded-lg bg-[#ff5a3d] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#ff5a3d]/90"
        >
          Créer une mission
        </Link>
      </div>

      <EmployerMissionsGrid
        missions={missions}
        categoryMap={categoryMap}
        applicationsCountByMission={applicationsCountByMission}
        hiredMissionIds={hiredMissionIds}
      />
    </div>
  )
}
