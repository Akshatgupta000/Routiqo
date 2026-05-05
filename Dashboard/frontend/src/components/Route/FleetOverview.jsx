import React, { useState, useEffect } from 'react'
import Card from '../UI/Card'
import { formatKm, formatId } from '../../utils/format'
import { useApp } from '../../context/AppContext'

const ROUTE_COLORS = [
  '#2563eb', // Blue
  '#10b981', // Emerald
  '#8b5cf6', // Violet
  '#f59e0b', // Amber
  '#ef4444', // Red
  '#06b6d4', // Cyan
]

export default function FleetOverview() {
  const { 
    activeMultiRoutes, 
    activeRoute, 
    setActiveRouteBase, 
    vehicles, 
    toggleVehicleAvailability,
    selectedCenterId 
  } = useApp()

  const selectedCenterVehicles = vehicles.filter(v => 
    selectedCenterId && String(v.delivery_center_id) === String(selectedCenterId)
  )

  const [showSequence, setShowSequence] = useState(true)
  const [showFleet, setShowFleet] = useState(true)

  // Auto-manage sidebar sections when routes are generated
  useEffect(() => {
    if (activeMultiRoutes && activeMultiRoutes.length > 0) {
      setShowFleet(true) // Ensure dispatch is visible
      setShowSequence(false) // Hide detailed sequence by default
    }
  }, [activeMultiRoutes])

  if (selectedCenterVehicles.length === 0 && activeMultiRoutes.length === 0) return null

  // Combine vehicles with their active routes if they exist
  const fleetStatus = selectedCenterVehicles.map(vehicle => {
    const route = activeMultiRoutes.find(r => 
      String(r.vehicle_id || r.vehicle?.id) === String(vehicle.id)
    )
    return { vehicle, route }
  })

  return (
    <Card className="p-4">
      <button 
        onClick={() => setShowFleet(!showFleet)}
        className="w-full flex items-center justify-between mb-3 group cursor-pointer"
      >
        <h3 className="text-sm font-bold text-zinc-900 dark:text-white">Vehicle Dispatch</h3>
        <div className="flex items-center gap-2">
          <span className="text-[10px] bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded-full text-zinc-500 font-bold uppercase">
            {fleetStatus.length} Vehicles
          </span>
          <div className={`p-1 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-500 transition-transform ${showFleet ? 'rotate-180' : ''}`}>
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </button>
      
      {showFleet && (
        <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
        {fleetStatus.map(({ vehicle, route }, idx) => {
          const isSelected = route && activeRoute?.route_id === route.route_id
          const color = ROUTE_COLORS[idx % ROUTE_COLORS.length]
          const isAvailable = vehicle.is_available
          
          return (
            <div key={`fleet-item-${vehicle.id}`} className="group relative">
              <button
                onClick={() => route && setActiveRouteBase(route)}
                disabled={!route}
                className={`w-full flex items-center gap-3 p-2 rounded-xl transition-all border ${
                  isSelected 
                    ? 'bg-zinc-50 border-zinc-200 dark:bg-zinc-800/50 dark:border-zinc-700' 
                    : 'border-transparent hover:bg-zinc-50 dark:hover:bg-zinc-800/30'
                } ${!route ? 'opacity-60 grayscale-[0.5]' : ''}`}
              >
                <div 
                  className={`w-3 h-3 rounded-full shrink-0 shadow-sm ${!route ? 'bg-zinc-300' : ''}`} 
                  style={route ? { backgroundColor: color } : {}}
                />
                <div className="flex-1 text-left min-w-0">
                  <div className="flex justify-between items-center">
                    <p className="text-xs font-bold truncate text-zinc-800 dark:text-zinc-200">
                      {vehicle.name}
                    </p>
                    <p className="text-[10px] text-zinc-500 font-mono">
                      {route ? formatKm(route.total_distance) : 'No active route'}
                    </p>
                  </div>
                  <p className="text-[10px] text-zinc-500">
                    {route ? `${route.stops?.length || 0} stops assigned` : (isAvailable ? 'Idle - Waiting for orders' : 'Busy - Maintenance/Other')}
                  </p>
                </div>
              </button>
            </div>
          )
        })}
      </div>
      )}

      {activeRoute && (
        <div className="mt-6 border-t border-zinc-100 dark:border-zinc-800 pt-4">
          <button 
            onClick={() => setShowSequence(!showSequence)}
            className="w-full flex items-center justify-between mb-4 group cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-4 bg-blue-600 rounded-full" />
              <h4 className="text-xs font-bold text-zinc-900 dark:text-white uppercase tracking-wider">
                Stop Sequence
              </h4>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-zinc-400">
                {activeRoute.stops?.length || 0} STOPS
              </span>
              <div className={`p-1 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-500 transition-transform ${showSequence ? 'rotate-180' : ''}`}>
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </button>

          {showSequence && (
            <div className="relative space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
              {/* Vertical Line */}
              <div className="absolute left-3 top-2 bottom-2 w-0.5 bg-zinc-100 dark:bg-zinc-800" />

              {activeRoute.stops?.map((stop, sIdx) => (
                <div key={`stop-${stop.order_id}-${sIdx}`} className="relative flex items-start gap-3 pl-7 group">
                  {/* Sequence Indicator */}
                  <div className={`absolute left-0 w-5 h-5 rounded-full border flex items-center justify-center text-[9px] font-black z-10 transition-colors ${
                    stop.priority === 'priority' 
                      ? 'bg-amber-500 border-amber-200 text-white shadow-[0_0_8px_rgba(245,158,11,0.4)]' 
                      : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-700 text-zinc-500'
                  }`}>
                    {stop.sequence}
                  </div>

                  <div className="flex-1 bg-zinc-50/40 dark:bg-zinc-800/20 p-1.5 rounded-lg border border-transparent hover:border-zinc-200 dark:hover:border-zinc-700 transition-all">
                    <div className="flex items-center justify-between gap-1.5">
                      <span className="text-[10px] font-bold text-zinc-700 dark:text-zinc-300">
                        Order #{formatId(stop.order_id).toUpperCase()}
                      </span>
                      {stop.priority === 'priority' && (
                        <span className="text-[7px] font-black uppercase bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400 px-1 py-0.5 rounded shadow-sm">
                          Urgent
                        </span>
                      )}
                    </div>
                    <div className="mt-0.5 flex items-center justify-between">
                      <div className="flex items-center gap-1 text-zinc-400">
                        <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="text-[9px] font-medium">{stop.eta ? new Date(stop.eta).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}</span>
                      </div>
                      <span className="text-[8px] text-zinc-400 font-mono">
                        {stop.distance_from_previous > 0 ? `+${stop.distance_from_previous.toFixed(1)} km` : 'Start'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </Card>
  )
}
