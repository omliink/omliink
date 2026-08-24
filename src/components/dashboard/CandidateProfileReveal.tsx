'use client'

import { useState } from 'react'
import type { Database } from '@/types/database.types'

type CandidateProfile = Database['public']['Tables']['candidate_profiles']['Row']

export default function CandidateProfileReveal({ profile }: { profile: CandidateProfile | null }) {
  const [open, setOpen] = useState(false)

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-expanded={open}
        className="text-xs font-medium text-indigo-600 underline hover:text-indigo-700"
      >
        {open ? 'Masquer le profil' : 'Voir le profil'}
      </button>

      {open && (
        <div className="mt-2 rounded-lg border border-gray-100 bg-gray-50 p-3 text-sm text-gray-700">
          {!profile ? (
            <p className="text-gray-500">Profil non disponible.</p>
          ) : (
            <div className="flex flex-col gap-2">
              {profile.bio && <p>{profile.bio}</p>}
              {profile.skills && profile.skills.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {profile.skills.map((skill) => (
                    <span key={skill} className="rounded-full bg-indigo-100 px-2.5 py-0.5 text-xs font-medium text-indigo-700">
                      {skill}
                    </span>
                  ))}
                </div>
              )}
              <div className="flex gap-4 text-xs text-gray-500">
                {profile.years_experience != null && <span>{profile.years_experience} an(s) d&apos;expérience</span>}
                {profile.hourly_rate != null && <span>{profile.hourly_rate} €/h</span>}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
