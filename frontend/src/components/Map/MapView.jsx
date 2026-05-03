import React, { useMemo, useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap, Circle, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { centerIcon, orderIcon, numberedStopIcon, vehicleIcon } from './mapIcons'
import { stopLatLng, getDistance } from '../../utils/coords'
import { useApp } from '../../context/AppContext'
import * as api from '../../services/api'

function FitBounds({ bounds }) {
  const map = useMap()
  useEffect(() => {
    if (bounds && bounds.isValid()) {
      map.fitBounds(bounds, { padding: [48, 48], maxZoom: 14 })
    }
  }, [map, bounds])
  return null
}

function MapClickHandler({ onMapClick }) {
  useMapEvents({
    click: () => {
      onMapClick()
    },
  })
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
  const { 
    mapFocus, 
    draftDeliveries, 
    routesList, 
    setSelectedCenterId, 
    generateRoutesAction, 
    loading, 
    isSimulating, 
    simProgress,
    toast,
    setMapFocus,
    refreshOrders,
    activeOrderId,
    setActiveOrderId,
    resetSelection
  } = useApp()

  const handleOrderClick = async (order) => {
    setActiveOrderId(order.id)
    if (!centers.length) return

    // Find nearest center
    const nearby = centers.map((c) => {
      const dist = getDistance(
        Number(order.latitude),
        Number(order.longitude),
        Number(c.latitude),
        Number(c.longitude)
      )
      return { ...c, dist }
    })

    const nearest = nearby.sort((a, b) => a.dist - b.dist)[0]

    if (nearest) {
      if (nearest.dist > 10) {
        toast(`Nearest center is ${nearest.dist.toFixed(1)}km away (out of service range).`, 'error')
        return
      }

      setSelectedCenterId(nearest.id)
      
      // Auto-zoom to center
      setMapFocus({
        lat: Number(nearest.latitude),
        lng: Number(nearest.longitude),
        zoom: 13
      })

      try {
        // If order has no hub assigned, assign it to the nearest one first
        if (!order.delivery_center_id) {
          await api.assignOrder(order.id)
          await refreshOrders() // Sync local state
        }
        
        toast(`Hub: ${nearest.name} (${nearest.dist.toFixed(1)} km)`)
        generateRoutesAction(nearest.id)
      } catch (err) {
        console.error('Dispatch error:', err)
        toast('Failed to link order to hub.', 'error')
      }
    }
  }

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
    routesList.forEach((r) => {
      if (r.status !== 'completed' && r.geometry) {
        r.geometry.forEach((p) => b.extend(p))
      }
    })
    if (vehiclePosition) {
      b.extend([Number(vehiclePosition.lat), Number(vehiclePosition.lng)])
    }
    return b.isValid() ? b : null
  }, [centers, orders, draftDeliveries, routesList, vehiclePosition])

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
        <MapClickHandler onMapClick={() => setActiveOrderId(null)} />
        {bounds && <FitBounds bounds={bounds} />}

        <div className="absolute top-4 right-4 z-[1000] flex flex-col gap-2">
          <button
            onClick={() => {
              resetSelection()
              toast('Map reset to initial state.')
            }}
            className="flex items-center gap-2 rounded-lg bg-white px-3 py-2 text-sm font-bold text-zinc-900 shadow-xl ring-1 ring-zinc-900/5 hover:bg-zinc-50 transition-all dark:bg-zinc-900 dark:text-white dark:hover:bg-zinc-800"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Reset Map
          </button>
        </div>

        {centers.map((c) => {
          const position = stopLatLng(c)
          if (position[0] === 0 && position[1] === 0) return null

          return (
            <Marker
              key={`c-${c.id}`}
              position={position}
              icon={centerIcon()}
            >
              <Popup>
                <strong>{c.name}</strong>
                <br />
                Center #{c.id}
              </Popup>
            </Marker>
          )
        })}

        {centers.map((c) => {
          const position = stopLatLng(c)
          if (position[0] === 0 && position[1] === 0) return null

          return (
            <Circle
              key={`radius-${c.id}`}
              center={position}
              radius={10000}
              pathOptions={{
                color: '#3b82f6',
                fillColor: '#3b82f6',
                fillOpacity: 0.1,
                weight: 1,
              }}
            />
          )
        })}

        {showOrderPins &&
          orders.map((o) => {
            const position = stopLatLng(o)
            if (position[0] === 0 && position[1] === 0) return null // Skip invalid coords
            
            const color = o.status === 'assigned' ? '#10b981' : o.status === 'pending' ? '#ef4444' : '#71717a'
            return (
              <Marker
                key={`o-${o.id}`}
                position={position}
                icon={orderIcon(color)}
                eventHandlers={{
                  click: () => handleOrderClick(o),
                }}
              >
                {activeOrderId === o.id && (
                  <Popup autoClose={false} closeOnClick={false}>
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
                        <button
                          onClick={() => setActiveOrderId(null)}
                          className="w-full rounded-lg bg-zinc-100 px-2 py-1 text-[10px] font-medium text-zinc-600 hover:bg-zinc-200 transition-colors dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
                        >
                          Close Popup
                        </button>
                      </div>
                    </div>
                  </Popup>
                )}
              </Marker>
          )
        })}

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

        {/* Active Route Rendering (Guaranteed Bold Blue) */}
        {activeRoute?.geometry?.length > 0 && (
          <React.Fragment key="active-route-group">
            <Polyline
              positions={activeRoute.geometry}
              pathOptions={{
                color: '#60a5fa',
                weight: 12,
                opacity: 0.2,
                lineCap: 'round',
                lineJoin: 'round',
              }}
            />
            <Polyline
              positions={activeRoute.geometry}
              pathOptions={{
                color: '#2563eb',
                weight: 7,
                opacity: 1,
                lineCap: 'round',
                lineJoin: 'round',
              }}
            />
          </React.Fragment>
        )}

        {/* Background Routes (All others in the fleet) */}
        {routesList
          .filter((r) => r.status !== 'completed' && r.geometry?.length)
          .filter((r) => r.route_id !== activeRoute?.route_id) // Don't double render active
          .map((r) => (
            <Polyline
              key={`route-polyline-${r.route_id}`}
              positions={r.geometry}
              pathOptions={{
                color: '#94a3b8',
                weight: 3,
                opacity: 0.5,
                dashArray: '5, 10',
                lineCap: 'round',
                lineJoin: 'round',
              }}
            />
          ))}

        {isSimulating && activeRoute?.geometry?.[simProgress] && (
          <Marker
            position={activeRoute.geometry[simProgress]}
            icon={vehicleIcon()}
            zIndexOffset={1000}
          >
            <Popup>Delivery Rider (In Transit)</Popup>
          </Marker>
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
