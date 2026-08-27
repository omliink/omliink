import PromoCodeCreateForm from '@/components/admin/PromoCodeCreateForm'
import DeactivatePromoCodeButton from '@/components/admin/DeactivatePromoCodeButton'
import { getAllPromoCodes } from '@/lib/dashboard-data'

function statusOf(code: { active: boolean; valid_until: string | null }): 'Actif' | 'Inactif' | 'Expiré' {
  if (!code.active) return 'Inactif'
  if (code.valid_until && new Date(code.valid_until) < new Date()) return 'Expiré'
  return 'Actif'
}

const STATUS_CLASSES: Record<string, string> = {
  Actif: 'bg-emerald-100 text-emerald-700',
  Inactif: 'bg-gray-100 text-gray-600',
  Expiré: 'bg-amber-100 text-amber-700',
}

function formatDiscount(discountType: string, value: number): string {
  return discountType === 'percent' ? `${value}%` : `${value}€`
}

export default async function AdminPromoCodesPage() {
  const promoCodes = await getAllPromoCodes()

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Codes promo</h1>

      <div className="mt-6">
        <PromoCodeCreateForm />
      </div>

      <div className="mt-8 overflow-hidden rounded-xl border border-gray-100 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-gray-100 bg-gray-50 text-xs font-medium uppercase text-gray-500">
            <tr>
              <th className="px-5 py-3">Code</th>
              <th className="px-5 py-3">Réduction</th>
              <th className="px-5 py-3">Validité</th>
              <th className="px-5 py-3">Utilisations</th>
              <th className="px-5 py-3">Statut</th>
              <th className="px-5 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {promoCodes.map((code) => {
              const status = statusOf(code)
              return (
                <tr key={code.id}>
                  <td className="px-5 py-3 font-medium text-gray-900">{code.code}</td>
                  <td className="px-5 py-3 text-gray-600">{formatDiscount(code.discount_type, code.discount_value)}</td>
                  <td className="px-5 py-3 text-gray-600">
                    {code.valid_from ? new Date(code.valid_from).toLocaleDateString('fr-FR') : '—'}
                    {' → '}
                    {code.valid_until ? new Date(code.valid_until).toLocaleDateString('fr-FR') : 'illimitée'}
                  </td>
                  <td className="px-5 py-3 text-gray-600">
                    {code.current_uses}
                    {code.max_uses != null ? ` / ${code.max_uses}` : ''}
                  </td>
                  <td className="px-5 py-3">
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_CLASSES[status]}`}>
                      {status}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-right">
                    {code.active && <DeactivatePromoCodeButton promoCodeId={code.id} />}
                  </td>
                </tr>
              )
            })}
            {promoCodes.length === 0 && (
              <tr>
                <td colSpan={6} className="px-5 py-8 text-center text-sm text-gray-500">
                  Aucun code promo pour le moment.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
