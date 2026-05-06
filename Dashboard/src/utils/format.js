export function formatKm(km) {
  if (km == null || Number.isNaN(km)) return '—'
  return `${Number(km).toFixed(2)} km`
}

export function formatId(id) {
  if (!id) return '—'
  const str = String(id)
  return str.length > 8 ? str.substring(0, 8) : str
}

export function formatDuration(seconds) {
  if (seconds == null || Number.isNaN(seconds)) return '—'
  const m = Math.floor(seconds / 60)
  const h = Math.floor(m / 60)
  const min = m % 60
  if (h > 0) return `${h}h ${min}m`
  return `${m} min`
}

export function formatEta(iso) {
  if (!iso) return '—'
  try {
    return new Date(iso).toLocaleString(undefined, {
      hour: '2-digit',
      minute: '2-digit',
      month: 'short',
      day: 'numeric',
    })
  } catch {
    return iso
  }
}

/**
 * Returns today's date in YYYY-MM-DD format using local time.
 */
export function getLocalDateString() {
  const date = new Date()
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}
