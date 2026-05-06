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

export default function FleetOverview({ onToggleSequence, showSequence }) {
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

  const [showFleet, setShowFleet] = useState(true)

  // Auto-manage sidebar sections when routes are generated
  useEffect(() => {
    if (activeMultiRoutes && activeMultiRoutes.length > 0) {
      setShowFleet(true) // Ensure dispatch is visible
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
        <div className="max-h-[115px] overflow-y-auto custom-scrollbar-visible pr-2">
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
        </div>
      )}

      {activeRoute && (
        <div className="mt-6 border-t border-zinc-100 dark:border-zinc-800 pt-4">
          <button 
            onClick={onToggleSequence}
            className="w-full flex items-center justify-between group cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-4 bg-primary rounded-full" />
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
        </div>
      )}
    </Card>
  )
}
