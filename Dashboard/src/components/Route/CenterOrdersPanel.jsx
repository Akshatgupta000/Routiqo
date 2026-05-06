import { useMemo, useState, useEffect } from 'react'
import Card from '../UI/Card'
import { formatId } from '../../utils/format'
import { useApp } from '../../context/AppContext'
import * as api from '../../services/api'

export default function CenterOrdersPanel({ centerId, isDrawerContent = false }) {
  const { centers, orders, vehicles, activeMultiRoutes, generateRoutesAction, isSimulating, startFleetSimulation, toast } = useApp()
  const [activeTab, setActiveTab] = useState('orders')

  const centerOrders = useMemo(() => {
    if (!centerId) return []
    const center = centers.find(c => String(c.id) === String(centerId))
    
    return orders.filter(o => {
      const isAssigned = String(o.delivery_center_id) === String(centerId)
      if (isAssigned) return true
      
      // Also show orphans in range
      if (o.delivery_center_id === null && center) {
        const dist = Math.sqrt(
          Math.pow(Number(o.latitude) - Number(center.latitude), 2) + 
          Math.pow(Number(o.longitude) - Number(center.longitude), 2)
        )
        return dist < 0.09 // ~10km (Strict)
      }
      return false
    })
  }, [orders, centerId])

  const centerVehicles = useMemo(() => {
    if (!centerId) return []
    return vehicles.filter(v => String(v.delivery_center_id) === String(centerId))
  }, [vehicles, centerId])

  if (!centerId) return null

  const Container = isDrawerContent ? 'div' : Card;

  return (
    <Container className={isDrawerContent ? "flex flex-col h-full" : "!p-0 flex flex-col border border-zinc-200 dark:border-zinc-800 shadow-sm transition-all duration-300"}>
      <div className="flex flex-col border-b border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 sticky top-0 z-20">
        <div className="flex px-4 py-3 gap-2 animate-in fade-in slide-in-from-top-1 duration-200">
          <button 
            onClick={() => setActiveTab('orders')}
            className={`flex-1 py-1.5 text-[10px] font-bold rounded-md transition-all ${
              activeTab === 'orders' 
                ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 shadow-lg' 
                : 'text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800'
            }`}
          >
            Orders ({centerOrders.length})
          </button>
          <button 
            onClick={() => setActiveTab('vehicles')}
            className={`flex-1 py-1.5 text-[10px] font-bold rounded-md transition-all ${
              activeTab === 'vehicles' 
                ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 shadow-lg' 
                : 'text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800'
            }`}
          >
            Vehicles ({centerVehicles.length})
          </button>
        </div>
      </div>

      <div className={`flex-1 overflow-y-auto custom-scrollbar animate-in fade-in duration-300 ${isDrawerContent ? "" : "max-h-[180px]"}`}>
        {activeTab === 'orders' ? (
          centerOrders.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-xs text-zinc-500 italic">No orders assigned to this hub.</p>
            </div>
          ) : (
            <table className="w-full text-left text-xs">
              <thead className="sticky top-0 bg-zinc-50 dark:bg-zinc-900 z-10">
                <tr className="text-zinc-500 border-b border-zinc-100 dark:border-zinc-800 uppercase text-[9px] tracking-widest">
                  <th className="px-6 py-3 font-bold">ID</th>
                  <th className="px-6 py-3 font-bold">Address</th>
                  <th className="px-6 py-3 font-bold text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {centerOrders.map((o) => (
                  <tr key={o.id} className="text-zinc-800 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-colors">
                    <td className="px-6 py-4 font-mono text-zinc-500">#{formatId(o.id)}</td>
                    <td className="px-6 py-4 truncate max-w-[150px]" title={o.address}>
                      {o.address}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className={`inline-block px-2 py-0.5 rounded text-[9px] font-black uppercase ${
                        o.status === 'delivered' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
                        o.status === 'assigned' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                        'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400'
                      }`}>
                        {o.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )
        ) : (
          centerVehicles.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-xs text-zinc-500 italic">No vehicles registered at this hub.</p>
            </div>
          ) : (
            <table className="w-full text-left text-xs">
              <thead className="sticky top-0 bg-zinc-50 dark:bg-zinc-900 z-10">
                <tr className="text-zinc-500 border-b border-zinc-100 dark:border-zinc-800 uppercase text-[9px] tracking-widest">
                  <th className="px-6 py-3 font-bold">Vehicle</th>
                  <th className="px-6 py-3 font-bold">Number</th>
                  <th className="px-6 py-3 font-bold text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {centerVehicles.map((v) => (
                  <tr key={v.id} className="text-zinc-800 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-colors">
                    <td className="px-6 py-4 font-bold">{v.name}</td>
                    <td className="px-6 py-4 font-mono text-zinc-500">{v.vehicle_number}</td>
                    <td className="px-6 py-4 text-right">
                      <span className={`inline-block px-2 py-0.5 rounded text-[9px] font-black uppercase ${
                        v.is_available ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                      }`}>
                        {v.is_available ? 'Available' : 'Busy'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )
        )}
      </div>
    </Container>
  )
}
