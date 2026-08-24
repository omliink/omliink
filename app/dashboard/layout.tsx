import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { getCurrentUser, getProfile } from '@/lib/dashboard-data'
import DashboardShell from '@/components/dashboard/DashboardShell'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/auth/login')
  }

  const profile = await getProfile(user.id)

  const pathname = (await headers()).get('x-pathname') ?? ''
  const isOnboardingRoute = pathname.startsWith('/dashboard/onboarding')

  if (!profile) {
    if (!isOnboardingRoute) {
      redirect('/dashboard/onboarding')
    }
    return <div className="min-h-screen bg-gray-50">{children}</div>
  }

  const needsOnboarding = !profile.is_employer && !profile.is_candidate

  if (needsOnboarding && !isOnboardingRoute) {
    redirect('/dashboard/onboarding')
  }

  if (!needsOnboarding && isOnboardingRoute) {
    redirect('/dashboard')
  }

  if (isOnboardingRoute) {
    return <div className="min-h-screen bg-gray-50">{children}</div>
  }

  return <DashboardShell profile={profile}>{children}</DashboardShell>
}
