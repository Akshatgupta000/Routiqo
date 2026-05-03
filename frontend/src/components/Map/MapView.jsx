import { useMemo, useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { centerIcon, orderIcon, numberedStopIcon, vehicleIcon } from './mapIcons'
import { stopLatLng } from '../../utils/coords'
import { useApp } from '../../context/AppContext'

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

function FlyToFocus({ focus }) {
  const map = useMap()
  useEffect(() => {
    if (focus?.lat && focus?.lng) {
      map.flyTo([focus.lat, focus.lng], focus.zoom || 14, {
        duration: 1.5,
        easeLinearity: 0.25,
      })
    }
  }, [map, focus])
  return null
}

export default function MapView({
  centers = [],
  orders = [],
  activeRoute,
  vehiclePosition,
  showOrderPins = true,
}) {
  const { mapFocus, draftDeliveries, osrmRoute, setSelectedCenterId, generateRoutesAction, loading, isSimulating, simProgress } = useApp()

  const bounds = useMemo(() => {
    const b = L.latLngBounds([])
    centers.forEach((c) => {
      b.extend([Number(c.latitude), Number(c.longitude)])
    })
    orders.forEach((o) => {
      b.extend([Number(o.latitude), Number(o.longitude)])
    })
    draftDeliveries.forEach((d) => {
      if (Number.isFinite(d.lat) && Number.isFinite(d.lng)) {
        b.extend([d.lat, d.lng])
      }
    })
    if (osrmRoute && osrmRoute.length > 0) {
      osrmRoute.forEach((p) => b.extend(p))
    }
    if (vehiclePosition) {
      b.extend([Number(vehiclePosition.lat), Number(vehiclePosition.lng)])
    }
    return b.isValid() ? b : null
  }, [centers, orders, draftDeliveries, osrmRoute, vehiclePosition])

  const mapKey = activeRoute?.route_id ?? 'map-default'

  return (
    <div className="relative h-full min-h-0 w-full min-w-0 flex-1 overflow-hidden rounded-2xl border border-zinc-200 dark:border-zinc-800">
      <MapContainer
        key={mapKey}
        center={[20.5937, 78.9629]}
        zoom={5}
        className="z-0 h-full w-full min-h-[320px] sm:min-h-0"
        scrollWheelZoom
        style={{ height: '100%', minHeight: '100%' }}
      >
        <MapResize routeId={mapKey} />
        <FlyToFocus focus={mapFocus} />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
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
              eventHandlers={{
                click: () => setSelectedCenterId(o.delivery_center_id),
              }}
            >
              <Popup>
                <div className="flex flex-col gap-1">
                  <strong className="text-sm">Order #{o.id}</strong>
                  <span className="text-xs text-zinc-600 dark:text-zinc-400">{o.address}</span>
                  <div className="mt-2 flex flex-col gap-2 border-t pt-2 border-zinc-100 dark:border-zinc-800">
                    <span className="text-[10px] uppercase font-bold text-zinc-500">{o.status}</span>
                    <button
                      disabled={loading.generate}
                      onClick={() => {
                        setSelectedCenterId(o.delivery_center_id)
                        generateRoutesAction(o.delivery_center_id)
                      }}
                      className="w-full rounded-lg bg-blue-600 px-2 py-1.5 text-[10px] font-bold text-white hover:bg-blue-700 disabled:opacity-50 transition-colors"
                    >
                      {loading.generate ? 'Generating...' : 'Generate Route for this Hub'}
                    </button>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}

        {draftDeliveries.map((d) => (
          <Marker
            key={`draft-${d.id}`}
            position={[d.lat, d.lng]}
            icon={orderIcon()}
          >
            <Popup>
              <strong>Delivery Location</strong>
              <br />
              {d.address}
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

        {isSimulating && osrmRoute[simProgress] && (
          <Marker
            position={osrmRoute[simProgress]}
            icon={vehicleIcon()}
            zIndexOffset={1000}
          >
            <Popup>Delivery Rider (In Transit)</Popup>
          </Marker>
        )}

        {osrmRoute && osrmRoute.length > 0 && (
          <Polyline
            positions={osrmRoute}
            pathOptions={{ color: '#3b82f6', weight: 4, opacity: 0.85 }}
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
