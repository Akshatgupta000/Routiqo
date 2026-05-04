import { stopLatLng } from './coords'
import { extractRouteCoordinates } from './routeGeometry'

/**
 * Path for map playback: prefer OSRM polyline; otherwise hub → stops (dense straight segments).
 * @returns {Array<[number, number]>}
 */
export function buildPlaybackPathForRoute(route, centers = []) {
  if (!route) return []

  const poly = extractRouteCoordinates(route)
  if (poly.length >= 2) return poly

  const center =
    route.delivery_center ||
    centers.find((c) => String(c.id) === String(route.delivery_center_id))
  const hub = stopLatLng(center)

  const stops = [...(route.stops ?? [])].sort((a, b) => a.sequence - b.sequence)
  /** @type {Array<[number, number]>} */
  const anchors = []

  if (Number.isFinite(hub[0]) && Number.isFinite(hub[1]) && !(hub[0] === 0 && hub[1] === 0)) {
    anchors.push(hub)
  }
  for (const s of stops) {
    const p = stopLatLng(s)
    if (!Number.isFinite(p[0]) || !Number.isFinite(p[1])) continue
    if (p[0] === 0 && p[1] === 0) continue
    anchors.push(p)
  }

  if (anchors.length < 2) return []

  /** Densify segment so “Simulate movement” visibly steps along the route. */
  /** @type {Array<[number, number]>} */
  const dense = []
  const perSegment = 20
  for (let i = 0; i < anchors.length - 1; i++) {
    const a = anchors[i]
    const b = anchors[i + 1]
    for (let s = 0; s < perSegment; s++) {
      const t = s / perSegment
      dense.push([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t])
    }
  }
  dense.push(anchors[anchors.length - 1])

  return dense.length >= 2 ? dense : []
}
