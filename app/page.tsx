'use client'

import { useEffect, useState } from 'react'
import { testSupabaseConnection } from '../src/lib/test-supabase'

export default function Home() {
  const [connected, setConnected] = useState<boolean | null>(null)

  useEffect(() => {
    testSupabaseConnection().then(setConnected)
  }, [])

  return (
    <main style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1>🚀 OMLIINK — Setup Test</h1>
      
      <div style={{ marginTop: '2rem', fontSize: '16px' }}>
        <h2>Infrastructure Status:</h2>
        <p>Next.js 16.3.2 ✅</p>
        <p>Tailwind CSS ✅</p>
        <p>
          Supabase Connection:{' '}
          {connected === null && '⏳ Testing...'}
          {connected === true && '✅ Connected!'}
          {connected === false && '❌ Failed'}
        </p>
      </div>

      {connected === false && (
        <div style={{ marginTop: '2rem', padding: '1rem', backgroundColor: '#fee2e2', borderRadius: '6px' }}>
          <p style={{ color: '#991b1b' }}>
            ❌ Supabase connection failed. Check:
          </p>
          <ul style={{ color: '#991b1b', marginTop: '0.5rem' }}>
            <li>.env.local exists in project root</li>
            <li>NEXT_PUBLIC_SUPABASE_URL is correct</li>
            <li>NEXT_PUBLIC_SUPABASE_ANON_KEY is correct</li>
            <li>Restart pnpm dev after changing .env.local</li>
          </ul>
        </div>
      )}
    </main>
  )
}