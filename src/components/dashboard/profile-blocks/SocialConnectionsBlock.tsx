import Link from 'next/link'
import PajemploiConnectionCard from './PajemploiConnectionCard'
import CesuConnectionCard from './CesuConnectionCard'
import type { Database } from '@/types/database.types'

type SocialConnection = Database['public']['Tables']['employer_social_connections']['Row']

interface SocialConnectionsBlockProps {
  connections: SocialConnection[]
  defaultPhone: string | null
  isPremium: boolean
}

// Sprint 4d: gated behind Premium. Existing connections (any status) stay
// fully visible and untouched regardless of tier — nothing is hidden from
// the employer or from the team's own Supabase view, only the ability to
// START a new connection is locked for a free-tier employer with no
// existing one. Each card enforces this itself via its own isPremium prop.
export default function SocialConnectionsBlock({ connections, defaultPhone, isPremium }: SocialConnectionsBlockProps) {
  const pajemploi = connections.find((c) => c.provider === 'pajemploi') ?? null
  const cesu = connections.find((c) => c.provider === 'cesu') ?? null

  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <h2 className="text-lg font-semibold text-gray-900">Identifiants</h2>
        {!isPremium && (
          <span className="rounded-full bg-[#ff5a3d]/10 px-2.5 py-0.5 text-xs font-medium text-[#ff5a3d]">
            Premium
          </span>
        )}
      </div>
      <p className="text-sm text-gray-600">
        Connectez vos comptes Pajemploi et/ou CESU pour centraliser la gestion administrative de vos emplois à
        domicile. Le traitement de votre demande reste assuré par notre équipe.
        {!isPremium && (
          <>
            {' '}
            Fonctionnalité réservée aux employeurs{' '}
            <Link href="/dashboard/premium" className="font-semibold text-[#ff5a3d] hover:underline">
              Premium
            </Link>
            .
          </>
        )}
      </p>
      <div className="grid gap-4 sm:grid-cols-2">
        <PajemploiConnectionCard connection={pajemploi} isPremium={isPremium} />
        <CesuConnectionCard connection={cesu} defaultPhone={defaultPhone} isPremium={isPremium} />
      </div>
    </section>
  )
}
