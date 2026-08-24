import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import VisioRoom from '@/components/dashboard/VisioRoom'
import { getCurrentUser, getMissionById, getVisioMeetingById } from '@/lib/dashboard-data'

interface VisioMeetingPageProps {
  params: Promise<{ meetingId: string }>
}

export default async function VisioMeetingPage({ params }: VisioMeetingPageProps) {
  const { meetingId } = await params

  const user = await getCurrentUser()
  if (!user) {
    redirect('/auth/login')
  }

  const meeting = await getVisioMeetingById(meetingId)
  if (!meeting) {
    notFound()
  }

  if (meeting.employer_id !== user.id && meeting.candidate_id !== user.id) {
    redirect('/dashboard')
  }

  const mission = await getMissionById(meeting.mission_id)

  return (
    <div className="mx-auto flex h-full max-w-5xl flex-col">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-gray-900">Visioconférence</h1>
          {mission && <p className="text-sm text-gray-500">{mission.title}</p>}
        </div>
        <Link
          href={`/dashboard/missions/${meeting.mission_id}`}
          className="text-sm font-medium text-indigo-600 underline hover:text-indigo-700"
        >
          Retour à la mission
        </Link>
      </div>

      <VisioRoom meetingId={meeting.id} missionId={meeting.mission_id} />
    </div>
  )
}
