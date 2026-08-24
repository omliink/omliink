import { redirect } from 'next/navigation'
import { getCategories, getCurrentUser, getProfile } from '@/lib/dashboard-data'
import MissionForm from '@/components/dashboard/MissionForm'

export default async function NewMissionPage() {
  const user = await getCurrentUser()
  if (!user) {
    redirect('/auth/login')
  }

  const profile = await getProfile(user.id)
  if (!profile?.is_employer) {
    redirect('/dashboard')
  }

  const categories = await getCategories()

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900">Créer une mission</h1>
      <p className="mt-1 text-sm text-gray-600">Décrivez la mission pour trouver le bon candidat.</p>

      <div className="mt-8">
        <MissionForm categories={categories} />
      </div>
    </div>
  )
}
