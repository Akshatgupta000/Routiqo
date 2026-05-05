import { useState, useEffect, useRef } from 'react'
import axios from 'axios'

export default function AddressAutocomplete({ 
  value, 
  onChange, 
  onSelect, 
  placeholder = "Search for an address...",
  className = "",
  autoFocus = false
}) {
  const [suggestions, setSuggestions] = useState([])
  const [loading, setLoading] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const containerRef = useRef(null)
  const debounceRef = useRef(null)

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const fetchSuggestions = async (query) => {
    if (!query || query.length < 3) {
      setSuggestions([])
      return
    }

    setLoading(true)
    try {
      const response = await axios.get(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&addressdetails=1&limit=5`,
        {
          headers: {
            Accept: 'application/json',
          },
        }
      )
      setSuggestions(response.data || [])
      setShowDropdown(true)
    } catch (error) {
      console.error('Autocomplete error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    const val = e.target.value
    onChange(val)

    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      fetchSuggestions(val)
    }, 400)
  }

  const handleSelect = (place) => {
    onSelect({
      address: place.display_name,
      lat: place.lat,
      lng: place.lon,
    })
    setSuggestions([])
    setShowDropdown(false)
  }

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      <div className="relative">
        <input
          type="text"
          className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-700 dark:bg-zinc-950 dark:text-white"
          placeholder={placeholder}
          value={value}
          onChange={handleInputChange}
          onFocus={() => suggestions.length > 0 && setShowDropdown(true)}
          autoFocus={autoFocus}
        />
        {loading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-500 border-t-transparent"></div>
          </div>
        )}
      </div>

      {showDropdown && suggestions.length > 0 && (
        <ul className="absolute z-[1000] mt-2 w-full overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-xl dark:border-zinc-800 dark:bg-zinc-900">
          {suggestions.map((place, idx) => (
            <li
              key={`${place.place_id}-${idx}`}
              className="cursor-pointer border-b border-zinc-50 px-4 py-3 last:border-0 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-800/50"
              onClick={() => handleSelect(place)}
            >
              <div className="flex items-start gap-3">
                <svg className="mt-1 h-4 w-4 shrink-0 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="text-xs leading-relaxed text-zinc-700 dark:text-zinc-300">
                  {place.display_name}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}

      {showDropdown && !loading && suggestions.length === 0 && value.length >= 3 && (
        <div className="absolute z-[1000] mt-2 w-full rounded-xl border border-zinc-200 bg-white p-4 text-center text-xs text-zinc-500 shadow-xl dark:border-zinc-800 dark:bg-zinc-900">
          No results found
        </div>
      )}
    </div>
  )
}
