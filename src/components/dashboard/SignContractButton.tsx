'use client'

import { useTransition } from 'react'
import { signContract } from '@/lib/actions/contracts'

export default function SignContractButton({ contractId, missionId }: { contractId: string; missionId: string }) {
  const [isPending, startTransition] = useTransition()

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={() => startTransition(() => signContract(contractId, missionId))}
      className="rounded-lg bg-[#ff5a3d] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#ff5a3d]/90 focus:outline-none focus:ring-2 focus:ring-[#ff5a3d] focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {isPending ? 'Signature…' : 'Signer le contrat'}
    </button>
  )
}
