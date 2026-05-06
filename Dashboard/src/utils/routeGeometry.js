/**
 * Normalize backend route geometry: supports geometry | coordinates as [[lat,lng], ...].
 */

function pairFromArray(p) {
  if (!Array.isArray(p) || p.length < 2) return null
  const lat = Number(p[0])
  const lng = Number(p[1])
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null
  return [lat, lng]
}

/** @returns {Array<[number, number]>} */
export function extractRouteCoordinates(route) {
  if (!route || typeof route !== 'object') return []
  const raw = route.geometry ?? route.coordinates
  if (!Array.isArray(raw) || raw.length < 2) return []
  const out = []
  for (let i = 0; i < raw.length; i++) {
    const pair = pairFromArray(raw[i])
    if (pair) out.push(pair)
  }
  return out.length >= 2 ? out : []
}
