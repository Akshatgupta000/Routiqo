import { useMemo, useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { centerIcon, orderIcon, numberedStopIcon, vehicleIcon } from './mapIcons'
import { stopLatLng } from '../../utils/coords'

function FitBounds({ bounds }) {
  const map = useMap()
  useEffect(() => {
    if (bounds && bounds.isValid()) {
      map.fitBounds(bounds, { padding: [48, 48], maxZoom: 14 })
    }
  }, [map, bounds])
  return null
}

function MapResize({ routeId }) {
  const map = useMap()
  useEffect(() => {
    const t = requestAnimationFrame(() => {
      map.invalidateSize()
    })
    return () => cancelAnimationFrame(t)
  }, [map, routeId])
  return null
}

function buildRouteLatLngs(route) {
  if (!route?.delivery_center) return []
  const c = route.delivery_center
  const centerLat = Number(c.latitude)
  const centerLng = Number(c.longitude)
  if (!Number.isFinite(centerLat) || !Number.isFinite(centerLng)) return []

  const pts = [[centerLat, centerLng]]
  const sorted = [...(route.stops || [])].sort((a, b) => a.sequence - b.sequence)
  sorted.forEach((s) => {
    const [lat, lng] = stopLatLng(s)
    if (Number.isFinite(lat) && Number.isFinite(lng)) {
      pts.push([lat, lng])
    }
  })
  pts.push([centerLat, centerLng])
  return pts
}

export default function LogisticsMap({
  centers = [],
  orders = [],
  activeRoute,
  vehiclePosition,
  showOrderPins = true,
}) {
  const defaultCenter = useMemo(() => {
    if (centers[0]) {
      return [Number(centers[0].latitude), Number(centers[0].longitude)]
    }
    return [40.7128, -74.006]
  }, [centers])

  const routeLine = useMemo(() => {
    if (!activeRoute) return []
    return buildRouteLatLngs(activeRoute)
  }, [activeRoute])

  const secondaryLine = useMemo(() => {
    if (!activeRoute?._comparisonRoute) return []
    return buildRouteLatLngs(activeRoute._comparisonRoute)
  }, [activeRoute])

  const bounds = useMemo(() => {
    const b = L.latLngBounds([])
    centers.forEach((c) => {
      b.extend([Number(c.latitude), Number(c.longitude)])
    })
    orders.forEach((o) => {
      b.extend([Number(o.latitude), Number(o.longitude)])
    })
    routeLine.forEach((p) => b.extend(p))
    secondaryLine.forEach((p) => b.extend(p))
    if (vehiclePosition) {
      b.extend([Number(vehiclePosition.lat), Number(vehiclePosition.lng)])
    }
    return b.isValid() ? b : null
  }, [centers, orders, routeLine, secondaryLine, vehiclePosition])

  const mapKey = activeRoute?.route_id ?? 'map-default'

  return (
    <div className="relative h-full min-h-0 w-full min-w-0 flex-1 overflow-hidden rounded-2xl border border-zinc-200 dark:border-zinc-800">
      <MapContainer
        key={mapKey}
        center={defaultCenter}
        zoom={12}
        className="z-0 h-full w-full min-h-[320px] sm:min-h-0"
        scrollWheelZoom
        style={{ height: '100%', minHeight: '100%' }}
      >
        <MapResize routeId={mapKey} />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; CARTO'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        />
        {bounds && <FitBounds bounds={bounds} />}

        {centers.map((c) => (
          <Marker
            key={`c-${c.id}`}
            position={[Number(c.latitude), Number(c.longitude)]}
            icon={centerIcon()}
          >
            <Popup>
              <strong>{c.name}</strong>
              <br />
              Center #{c.id}
            </Popup>
          </Marker>
        ))}

        {showOrderPins &&
          orders.map((o) => (
            <Marker
              key={`o-${o.id}`}
              position={[Number(o.latitude), Number(o.longitude)]}
              icon={orderIcon()}
            >
              <Popup>
                <strong>Order #{o.id}</strong>
                <br />
                {o.address}
                <br />
                <span className="text-xs uppercase">{o.status}</span>
              </Popup>
            </Marker>
          ))}

        {activeRoute?.stops
          ?.slice()
          .sort((a, b) => a.sequence - b.sequence)
          .map((s) => {
            const [lat, lng] = stopLatLng(s)
            return (
              <Marker
                key={`s-${s.sequence}-${s.order_id}`}
                position={[lat, lng]}
                icon={numberedStopIcon(s.sequence)}
              >
                <Popup>
                  Stop {s.sequence} · Order #{s.order_id}
                  <br />
                  ETA: {s.eta || '—'}
                </Popup>
              </Marker>
            )
          })}

        {secondaryLine.length > 1 && (
          <Polyline
            positions={secondaryLine}
            pathOptions={{ color: '#94a3b8', weight: 3, dashArray: '8 6', opacity: 0.85 }}
          />
        )}

        {routeLine.length > 1 && (
          <Polyline
            positions={routeLine}
            pathOptions={{ color: '#10b981', weight: 4, opacity: 0.95 }}
          />
        )}

        {vehiclePosition && (
          <Marker
            position={[Number(vehiclePosition.lat), Number(vehiclePosition.lng)]}
            icon={vehicleIcon()}
          >
            <Popup>Simulated vehicle</Popup>
          </Marker>
        )}
      </MapContainer>
    </div>
  )
}
