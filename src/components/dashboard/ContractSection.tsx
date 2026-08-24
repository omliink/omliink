import StatusBadge from '@/components/ui/StatusBadge'
import SignContractButton from './SignContractButton'
import type { Database } from '@/types/database.types'

type Contract = Database['public']['Tables']['contracts']['Row']
type Mission = Database['public']['Tables']['missions']['Row']

interface ContractSectionProps {
  contract: Contract
  mission: Mission
  isEmployerViewer: boolean
}

function formatAmount(value: number | null) {
  if (value === null) return 'Non renseigné'
  return `${value.toLocaleString('fr-FR')} €`
}

export default function ContractSection({ contract, mission, isEmployerViewer }: ContractSectionProps) {
  const hasSignedAsViewer =
    contract.status === 'signed' ||
    (isEmployerViewer && contract.status === 'signed_by_employer') ||
    (!isEmployerViewer && contract.status === 'signed_by_candidate')

  return (
    <section className="mt-10">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-gray-900">Contrat</h2>
        <StatusBadge status={contract.status} />
      </div>

      <div className="mt-4 rounded-xl border border-gray-100 bg-white p-5">
        <dl className="grid gap-4 sm:grid-cols-2">
          <div>
            <dt className="text-xs font-medium text-gray-500">Mission</dt>
            <dd className="mt-0.5 text-sm text-gray-900">{mission.title}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-gray-500">Montant</dt>
            <dd className="mt-0.5 text-sm text-gray-900">{formatAmount(contract.total_amount)}</dd>
          </div>
          {contract.signed_date && (
            <div>
              <dt className="text-xs font-medium text-gray-500">Signé le</dt>
              <dd className="mt-0.5 text-sm text-gray-900">
                {new Date(contract.signed_date).toLocaleDateString('fr-FR', { timeZone: 'Europe/Paris' })}
              </dd>
            </div>
          )}
        </dl>

        <div className="mt-5">
          {contract.status === 'signed' ? (
            <p className="text-sm text-emerald-700">Contrat signé par les deux parties.</p>
          ) : hasSignedAsViewer ? (
            <p className="text-sm text-gray-500">Vous avez signé. En attente de la signature de l&apos;autre partie.</p>
          ) : (
            <SignContractButton contractId={contract.id} missionId={mission.id} />
          )}
        </div>
      </div>
    </section>
  )
}
