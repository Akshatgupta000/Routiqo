export function formatKm(km) {
  if (km == null || Number.isNaN(km)) return '—'
  return `${Number(km).toFixed(2)} km`
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
