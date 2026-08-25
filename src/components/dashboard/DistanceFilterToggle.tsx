'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'

interface DistanceFilterToggleProps {
  radiusKm: number
  showAll: boolean
}

export default function DistanceFilterToggle({ radiusKm, showAll }: DistanceFilterToggleProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const handleChange = (checked: boolean) => {
    const params = new URLSearchParams(searchParams.toString())
    if (checked) {
      params.set('showAll', '1')
    } else {
      params.delete('showAll')
    }
    const query = params.toString()
    router.push(query ? `${pathname}?${query}` : pathname)
  }

  return (
    <label className="flex items-center gap-2 text-sm text-gray-600">
      <input
        type="checkbox"
        checked={showAll}
        onChange={(e) => handleChange(e.target.checked)}
        className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-2 focus:ring-indigo-500"
      />
      Voir toutes les missions (au-delà de {radiusKm} km)
    </label>
  )
}
