'use client'

import { useState } from 'react'
import VerificationBadge from '@/components/ui/VerificationBadge'
import type { Database } from '@/types/database.types'

type CandidateProfile = Database['public']['Tables']['candidate_profiles']['Row']

const EMPLOYMENT_STATUS_LABELS: Record<string, string> = {
  particulier_employeur: 'Particulier employeur (emploi déclaré)',
  auto_entrepreneur: 'Auto-entrepreneur',
}

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
              <div className="flex flex-wrap items-center gap-2">
                {profile.photo_url && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={profile.photo_url} alt="" className="h-10 w-10 rounded-full object-cover" />
                )}
                <span className="w-fit rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-700">
                  {EMPLOYMENT_STATUS_LABELS[profile.employment_status] ?? profile.employment_status}
                </span>
                <VerificationBadge status={profile.verification_status} />
              </div>
              {profile.bio_title && <p className="font-semibold text-gray-900">{profile.bio_title}</p>}
              {(profile.bio_text ?? profile.bio) && <p>{profile.bio_text ?? profile.bio}</p>}
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
