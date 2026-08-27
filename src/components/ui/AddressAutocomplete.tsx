'use client'

import { useEffect, useRef, useState } from 'react'

interface AddressSuggestion {
  label: string
  lat: number
  lng: number
}

interface AddressAutocompleteProps {
  id: string
  name: string
  latName: string
  lngName: string
  label: string
  defaultValue?: string
  defaultLat?: number | null
  defaultLng?: number | null
  required?: boolean
  onSelect?: (suggestion: AddressSuggestion) => void
}

interface AddressApiFeature {
  properties: { label: string }
  geometry: { coordinates: [number, number] }
}

export default function AddressAutocomplete({
  id,
  name,
  latName,
  lngName,
  label,
  defaultValue,
  defaultLat,
  defaultLng,
  required,
  onSelect,
}: AddressAutocompleteProps) {
  const [query, setQuery] = useState(defaultValue ?? '')
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([])
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [selected, setSelected] = useState<AddressSuggestion | null>(
    defaultValue && defaultLat != null && defaultLng != null ? { label: defaultValue, lat: defaultLat, lng: defaultLng } : null
  )
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const listboxId = `${id}-listbox`

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)

    debounceRef.current = setTimeout(async () => {
      if (query.trim().length < 3 || (selected && selected.label === query)) {
        setSuggestions([])
        return
      }

      setLoading(true)
      try {
        const res = await fetch(`https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(query)}&limit=5`)
        const data = await res.json()
        const features: AddressApiFeature[] = Array.isArray(data.features) ? data.features : []
        setSuggestions(
          features.map((feature) => ({
            label: feature.properties.label,
            lat: feature.geometry.coordinates[1],
            lng: feature.geometry.coordinates[0],
          }))
        )
        setOpen(true)
      } catch {
        setSuggestions([])
      } finally {
        setLoading(false)
      }
    }, 300)

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [query, selected])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSelect = (suggestion: AddressSuggestion) => {
    setSelected(suggestion)
    setQuery(suggestion.label)
    setSuggestions([])
    setOpen(false)
    onSelect?.(suggestion)
  }

  return (
    <div ref={containerRef} className="relative">
      <label htmlFor={id} className="mb-1 block text-sm font-medium text-gray-700">
        {label}
      </label>
      <input
        id={id}
        type="text"
        role="combobox"
        aria-expanded={open && suggestions.length > 0}
        aria-autocomplete="list"
        aria-controls={listboxId}
        autoComplete="off"
        required={required}
        value={query}
        onChange={(e) => {
          setQuery(e.target.value)
          setSelected(null)
        }}
        onFocus={() => {
          if (suggestions.length > 0) setOpen(true)
        }}
        placeholder="Commencez à taper une adresse…"
        aria-describedby={`${id}-hint`}
        className="block w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
      />
      <p id={`${id}-hint`} className="mt-1 text-xs text-gray-500">
        Suggestions fournies par la Base Adresse Nationale (adresse.data.gouv.fr).
      </p>

      <input type="hidden" name={name} value={selected ? selected.label : query} />
      <input type="hidden" name={latName} value={selected ? selected.lat : ''} />
      <input type="hidden" name={lngName} value={selected ? selected.lng : ''} />

      {open && suggestions.length > 0 && (
        <ul
          id={listboxId}
          role="listbox"
          className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-lg border border-gray-200 bg-white py-1 shadow-lg"
        >
          {suggestions.map((suggestion) => (
            <li key={suggestion.label} role="option" aria-selected={selected?.label === suggestion.label}>
              <button
                type="button"
                onClick={() => handleSelect(suggestion)}
                className="block w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-700"
              >
                {suggestion.label}
              </button>
            </li>
          ))}
        </ul>
      )}

      {loading && (
        <p role="status" className="mt-1 text-xs text-gray-400">
          Recherche…
        </p>
      )}
    </div>
  )
}
