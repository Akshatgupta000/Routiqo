/**
 * Normalize stop coordinates from API (latitude/longitude) or legacy (lat/lng).
 */
export function stopLatLng(stop) {
  if (!stop) return [0, 0]
  const lat = Number(stop.latitude ?? stop.lat ?? 0)
  const lng = Number(stop.longitude ?? stop.lng ?? 0)
  return [Number.isFinite(lat) ? lat : 0, Number.isFinite(lng) ? lng : 0]
}

export function stopPoint(stop) {
  const [lat, lng] = stopLatLng(stop)
  return { lat, lng }
}
