import { useMemo, useCallback, useState, useEffect } from 'react'
import { GoogleMap, useJsApiLoader, Marker, InfoWindow, DirectionsRenderer } from '@react-google-maps/api'
import { useApp } from '../../context/AppContext'

const containerStyle = {
  width: '100%',
  height: '100%',
}

const center = {
  lat: 20.5937,
  lng: 78.9629,
}

const libraries = ['places']

export default function LogisticsMap({
  centers = [],
  orders = [],
  activeRoute,
  vehiclePosition,
  showOrderPins = true,
}) {
  const { mapFocus, draftDeliveries, directionsResponse, setDirectionsResponse } = useApp()
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries,
  })

  const [map, setMap] = useState(null)
  const [selectedMarker, setSelectedMarker] = useState(null)

  const onLoad = useCallback((map) => {
    setMap(map)
  }, [])

  const onUnmount = useCallback((map) => {
    setMap(null)
  }, [])

  // Auto-fit bounds
  useEffect(() => {
    if (!map || (!centers.length && !orders.length && !draftDeliveries.length)) return

    const bounds = new window.google.maps.LatLngBounds()
    centers.forEach((c) => bounds.extend({ lat: Number(c.latitude), lng: Number(c.longitude) }))
    orders.forEach((o) => bounds.extend({ lat: Number(o.latitude), lng: Number(o.longitude) }))
    draftDeliveries.forEach((d) => bounds.extend({ lat: Number(d.lat), lng: Number(d.lng) }))
    
    map.fitBounds(bounds)
  }, [map, centers, orders, draftDeliveries])

  // Fly to focus
  useEffect(() => {
    if (map && mapFocus?.lat && mapFocus?.lng) {
      map.panTo({ lat: mapFocus.lat, lng: mapFocus.lng })
      map.setZoom(mapFocus.zoom || 14)
    }
  }, [map, mapFocus])

  // Calculate Directions
  useEffect(() => {
    if (!isLoaded || !activeRoute || !activeRoute.delivery_center || !activeRoute.stops?.length) {
      setDirectionsResponse(null)
      return
    }

    const directionsService = new window.google.maps.DirectionsService()
    const origin = {
      lat: Number(activeRoute.delivery_center.latitude),
      lng: Number(activeRoute.delivery_center.longitude),
    }
    
    const sortedStops = [...activeRoute.stops].sort((a, b) => a.sequence - b.sequence)
    const destination = {
      lat: Number(sortedStops[sortedStops.length - 1].latitude),
      lng: Number(sortedStops[sortedStops.length - 1].longitude),
    }

    const waypoints = sortedStops.slice(0, -1).map((s) => ({
      location: { lat: Number(s.latitude), lng: Number(s.longitude) },
      stopover: true,
    }))

    directionsService.route(
      {
        origin,
        destination,
        waypoints,
        travelMode: window.google.maps.TravelMode.DRIVING,
      },
      (result, status) => {
        if (status === window.google.maps.DirectionsStatus.OK) {
          setDirectionsResponse(result)
        } else {
          console.error(`error fetching directions ${result}`)
        }
      }
    )
  }, [isLoaded, activeRoute, setDirectionsResponse])

  if (!isLoaded) return <div className="flex h-full items-center justify-center bg-zinc-100 dark:bg-zinc-900">Loading Map...</div>

  return (
    <div className="relative h-full min-h-0 w-full min-w-0 flex-1 overflow-hidden rounded-2xl border border-zinc-200 dark:border-zinc-800">
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={center}
        zoom={5}
        onLoad={onLoad}
        onUnmount={onUnmount}
        options={{
          disableDefaultUI: false,
          zoomControl: true,
          styles: [
            {
              featureType: 'all',
              elementType: 'labels.text.fill',
              stylers: [{ saturation: 36 }, { color: '#333333' }, { lightness: 40 }],
            },
          ],
        }}
      >
        {directionsResponse && (
          <DirectionsRenderer
            directions={directionsResponse}
            options={{
              polylineOptions: {
                strokeColor: '#10b981',
                strokeWeight: 5,
              },
              suppressMarkers: true,
            }}
          />
        )}

        {/* Centers */}
        {centers.map((c) => (
          <Marker
            key={`c-${c.id}`}
            position={{ lat: Number(c.latitude), lng: Number(c.longitude) }}
            icon="https://maps.google.com/mapfiles/ms/icons/blue-dot.png"
            onClick={() => setSelectedMarker({ type: 'center', data: c })}
          />
        ))}

        {/* Orders */}
        {showOrderPins &&
          orders.map((o) => (
            <Marker
              key={`o-${o.id}`}
              position={{ lat: Number(o.latitude), lng: Number(o.longitude) }}
              icon="https://maps.google.com/mapfiles/ms/icons/red-dot.png"
              onClick={() => setSelectedMarker({ type: 'order', data: o })}
            />
          ))}

        {/* Draft Deliveries */}
        {draftDeliveries.map((d) => (
          <Marker
            key={`draft-${d.id}`}
            position={{ lat: Number(d.lat), lng: Number(d.lng) }}
            icon="https://maps.google.com/mapfiles/ms/icons/red-dot.png"
            onClick={() => setSelectedMarker({ type: 'draft', data: d })}
          />
        ))}

        {/* Vehicle */}
        {vehiclePosition && (
          <Marker
            position={{ lat: Number(vehiclePosition.lat), lng: Number(vehiclePosition.lng) }}
            icon="https://maps.google.com/mapfiles/kml/pal4/icon62.png"
          />
        )}

        {selectedMarker && (
          <InfoWindow
            position={{
              lat: Number(selectedMarker.data.latitude || selectedMarker.data.lat),
              lng: Number(selectedMarker.data.longitude || selectedMarker.data.lng),
            }}
            onCloseClick={() => setSelectedMarker(null)}
          >
            <div className="p-1">
              <h4 className="font-bold">{selectedMarker.data.name || 'Order Point'}</h4>
              <p className="text-xs">{selectedMarker.data.address}</p>
            </div>
          </InfoWindow>
        )}
      </GoogleMap>
    </div>
  )
}
