'use client'

import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { LiveKitRoom, VideoConference } from '@livekit/components-react'
import '@livekit/components-styles'
import { endVisioMeeting, generateVisioToken } from '@/lib/actions/visio'

interface VisioRoomProps {
  meetingId: string
  missionId: string
}

interface TokenState {
  token?: string
  livekitUrl?: string
  error?: string
  loading: boolean
}

export default function VisioRoom({ meetingId, missionId }: VisioRoomProps) {
  const [state, setState] = useState<TokenState>({ loading: true })
  const router = useRouter()

  useEffect(() => {
    let cancelled = false
    generateVisioToken(meetingId).then((result) => {
      if (cancelled) return
      setState({ token: result.token, livekitUrl: result.livekitUrl, error: result.error, loading: false })
    })
    return () => {
      cancelled = true
    }
  }, [meetingId])

  const handleDisconnected = useCallback(() => {
    endVisioMeeting(meetingId, missionId).finally(() => {
      router.push(`/dashboard/missions/${missionId}`)
    })
  }, [meetingId, missionId, router])

  if (state.loading) {
    return <p className="py-16 text-center text-sm text-gray-500">Connexion à la salle…</p>
  }

  if (state.error || !state.token || !state.livekitUrl) {
    return (
      <div role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-6 text-center text-sm text-red-700">
        {state.error ?? 'Impossible de rejoindre la visioconférence.'}
      </div>
    )
  }

  return (
    <div className="h-[70vh] overflow-hidden rounded-xl border border-gray-100">
      <LiveKitRoom
        token={state.token}
        serverUrl={state.livekitUrl}
        connect
        data-lk-theme="default"
        style={{ height: '100%' }}
        onDisconnected={handleDisconnected}
      >
        <VideoConference />
      </LiveKitRoom>
    </div>
  )
}
