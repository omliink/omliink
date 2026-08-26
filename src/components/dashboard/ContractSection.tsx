import Link from 'next/link'
import StatusBadge from '@/components/ui/StatusBadge'
import SignContractButton from './SignContractButton'
import PayMissionButton from './PayMissionButton'
import type { Database } from '@/types/database.types'

type Contract = Database['public']['Tables']['contracts']['Row']
type Mission = Database['public']['Tables']['missions']['Row']
type CandidateProfile = Database['public']['Tables']['candidate_profiles']['Row']

const PLATFORM_FEE_RATE = 0.1

interface ContractSectionProps {
  contract: Contract
  mission: Mission
  isEmployerViewer: boolean
  candidateProfile: CandidateProfile | null
}

function formatAmount(value: number | null) {
  if (value === null) return 'Non renseigné'
  return `${value.toLocaleString('fr-FR')} €`
}

function PaymentStatus({
  contract,
  mission,
  isEmployerViewer,
  candidateProfile,
}: {
  contract: Contract
  mission: Mission
  isEmployerViewer: boolean
  candidateProfile: CandidateProfile | null
}) {
  if (candidateProfile?.employment_status !== 'auto_entrepreneur') {
    return (
      <p className="text-sm text-gray-600">
        Le règlement de cette mission se fait directement entre vous et le candidat, via le dispositif CESU.
      </p>
    )
  }

  const netAmount = contract.total_amount != null ? contract.total_amount * (1 - PLATFORM_FEE_RATE) : null

  if (contract.payment_status === 'paid') {
    return (
      <div className="flex flex-col gap-1">
        <StatusBadge status="paid" />
        {netAmount != null && (
          <p className="text-sm text-gray-600">Montant net reçu par le candidat : {formatAmount(netAmount)}</p>
        )}
      </div>
    )
  }

  if (!candidateProfile.stripe_connect_onboarded) {
    return isEmployerViewer ? (
      <p className="text-sm text-gray-500">En attente que le candidat configure son compte de paiement.</p>
    ) : (
      <p className="text-sm text-gray-500">
        <Link href="/dashboard/profile" className="text-indigo-600 underline hover:text-indigo-700">
          Configurez votre compte de paiement
        </Link>{' '}
        sur votre profil pour recevoir le règlement de cette mission.
      </p>
    )
  }

  return (
    <div className="flex flex-col gap-2">
      {netAmount != null && (
        <p className="text-xs text-gray-500">Montant net que recevra le candidat : {formatAmount(netAmount)}</p>
      )}
      {isEmployerViewer ? (
        <PayMissionButton contractId={contract.id} missionId={mission.id} amount={contract.total_amount ?? 0} />
      ) : (
        <p className="text-sm text-gray-500">En attente du paiement de l&apos;employeur.</p>
      )}
    </div>
  )
}

export default function ContractSection({ contract, mission, isEmployerViewer, candidateProfile }: ContractSectionProps) {
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

        {contract.status === 'signed' && (
          <div className="mt-5 border-t border-gray-100 pt-5">
            <PaymentStatus
              contract={contract}
              mission={mission}
              isEmployerViewer={isEmployerViewer}
              candidateProfile={candidateProfile}
            />
          </div>
        )}
      </div>
    </section>
  )
}
