import Card from '../UI/Card'
import { formatKm } from '../../utils/format'
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
  const { activeMultiRoutes, activeRoute, setActiveRouteBase } = useApp()

  if (!activeMultiRoutes || activeMultiRoutes.length === 0) return null

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold text-zinc-900 dark:text-white">Fleet Dispatch</h3>
        <span className="text-[10px] bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded-full text-zinc-500 font-bold uppercase">
          {activeMultiRoutes.length} Vehicles
        </span>
      </div>
      
      <div className="space-y-2">
        {activeMultiRoutes.map((route, idx) => {
          const isSelected = activeRoute?.route_id === route.route_id
          const color = ROUTE_COLORS[idx % ROUTE_COLORS.length]
          
          return (
            <button
              key={`fleet-item-${route.route_id || 'unassigned'}-${idx}`}
              onClick={() => setActiveRouteBase(route)}
              className={`w-full flex items-center gap-3 p-2 rounded-xl transition-all border ${
                isSelected 
                  ? 'bg-zinc-50 border-zinc-200 dark:bg-zinc-800/50 dark:border-zinc-700' 
                  : 'border-transparent hover:bg-zinc-50 dark:hover:bg-zinc-800/30'
              }`}
            >
              <div 
                className="w-3 h-3 rounded-full shrink-0 shadow-sm" 
                style={{ backgroundColor: color }}
              />
              <div className="flex-1 text-left min-w-0">
                <div className="flex justify-between items-center">
                  <p className="text-xs font-bold truncate text-zinc-800 dark:text-zinc-200">
                    {route.vehicle?.name || `Vehicle ${idx + 1}`}
                  </p>
                  <p className="text-[10px] text-zinc-500 font-mono">
                    {formatKm(route.total_distance)}
                  </p>
                </div>
                <p className="text-[10px] text-zinc-500">
                  {route.stops?.length || 0} stops assigned
                </p>
              </div>
            </button>
          )
        })}
      </div>
    </Card>
  )
}
