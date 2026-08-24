'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import type { Database } from '@/types/database.types'

type ServiceCategory = Database['public']['Tables']['service_categories']['Row']

interface CategoryFilterProps {
  categories: ServiceCategory[]
  selected?: string
}

export default function CategoryFilter({ categories, selected }: CategoryFilterProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const handleChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value) {
      params.set('category', value)
    } else {
      params.delete('category')
    }
    const query = params.toString()
    router.push(query ? `${pathname}?${query}` : pathname)
  }

  return (
    <label className="flex items-center gap-2 text-sm text-gray-600">
      Catégorie
      <select
        value={selected ?? ''}
        onChange={(e) => handleChange(e.target.value)}
        className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
      >
        <option value="">Toutes</option>
        {categories.map((category) => (
          <option key={category.id} value={category.id}>
            {category.name}
          </option>
        ))}
      </select>
    </label>
  )
}
