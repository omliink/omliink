import PajemploiConnectionCard from './PajemploiConnectionCard'
import CesuConnectionCard from './CesuConnectionCard'
import type { Database } from '@/types/database.types'

type SocialConnection = Database['public']['Tables']['employer_social_connections']['Row']

interface SocialConnectionsBlockProps {
  connections: SocialConnection[]
  defaultPhone: string | null
}

export default function SocialConnectionsBlock({ connections, defaultPhone }: SocialConnectionsBlockProps) {
  const pajemploi = connections.find((c) => c.provider === 'pajemploi') ?? null
  const cesu = connections.find((c) => c.provider === 'cesu') ?? null

  return (
    <section className="flex flex-col gap-4">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">Identifiants</h2>
        <p className="mt-1 text-sm text-gray-600">
          Connectez vos comptes Pajemploi et/ou CESU pour centraliser la gestion administrative de vos emplois à
          domicile. Le traitement de votre demande reste assuré par notre équipe.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <PajemploiConnectionCard connection={pajemploi} />
        <CesuConnectionCard connection={cesu} defaultPhone={defaultPhone} />
      </div>
    </section>
  )
}
