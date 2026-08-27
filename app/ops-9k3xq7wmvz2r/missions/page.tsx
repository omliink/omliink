import Link from 'next/link'
import EmptyState from '@/components/ui/EmptyState'
import { getCategories, getProfilesByIds, getPublishedMissions } from '@/lib/dashboard-data'

// Structure only, per this sprint's spec — a full moderation workflow
// (flagging, suspending, audit log…) is intentionally out of scope, this
// just gives the admin nav a place to grow into without a later rebuild.
export default async function AdminMissionsPage() {
  const [missions, categories] = await Promise.all([getPublishedMissions(), getCategories()])
  const employerProfiles = await getProfilesByIds([...new Set(missions.map((m) => m.employer_id))])
  const employerNameById = new Map(employerProfiles.map((p) => [p.id, p.full_name ?? p.email]))
  const categoryNameById = new Map(categories.map((c) => [c.id, c.name]))

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Missions publiées</h1>
      <p className="mt-1 text-sm text-gray-600">{missions.length} mission(s) publiée(s).</p>

      {missions.length === 0 ? (
        <div className="mt-6">
          <EmptyState title="Aucune mission publiée" description="Rien à modérer pour le moment." />
        </div>
      ) : (
        <ul className="mt-6 divide-y divide-gray-100 overflow-hidden rounded-xl border border-gray-100 bg-white">
          {missions.map((mission) => (
            <li key={mission.id} className="flex items-center justify-between gap-4 px-5 py-4">
              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-900">{mission.title}</p>
                <p className="text-xs text-gray-500">
                  {categoryNameById.get(mission.category_id) ?? 'Catégorie'} ·{' '}
                  {employerNameById.get(mission.employer_id) ?? 'Employeur'}
                </p>
              </div>
              <Link
                href={`/dashboard/missions/${mission.id}`}
                className="flex-shrink-0 text-sm font-medium text-indigo-600 hover:text-indigo-700"
              >
                Voir →
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
