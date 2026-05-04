import { useMemo, useState } from 'react'
import Card from '../UI/Card'
import { useApp } from '../../context/AppContext'

export default function CenterOrdersPanel({ centerId }) {
  const { orders, vehicles } = useApp()
  const [activeTab, setActiveTab] = useState('orders')

  const centerOrders = useMemo(() => {
    if (!centerId) return []
    return orders.filter(o => String(o.delivery_center_id) === String(centerId))
  }, [orders, centerId])

  const centerVehicles = useMemo(() => {
    if (!centerId) return []
    return vehicles.filter(v => String(v.delivery_center_id) === String(centerId))
  }, [vehicles, centerId])

  if (!centerId) return null

  return (
    <Card className="max-h-[280px] overflow-hidden !p-0 flex flex-col border border-zinc-200 dark:border-zinc-800 shadow-sm">
      <div className="flex flex-col border-b border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 sticky top-0 z-20">
        <div className="px-4 py-2.5">
          <h3 className="text-xs font-bold text-zinc-900 dark:text-white uppercase tracking-tight">Hub Inventory</h3>
        </div>
        <div className="flex px-2 pb-2 gap-1">
          <button 
            onClick={() => setActiveTab('orders')}
            className={`flex-1 py-1 text-[10px] font-bold rounded-md transition-colors ${
              activeTab === 'orders' 
                ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900' 
                : 'text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800'
            }`}
          >
            Orders ({centerOrders.length})
          </button>
          <button 
            onClick={() => setActiveTab('vehicles')}
            className={`flex-1 py-1 text-[10px] font-bold rounded-md transition-colors ${
              activeTab === 'vehicles' 
                ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900' 
                : 'text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800'
            }`}
          >
            Vehicles ({centerVehicles.length})
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {activeTab === 'orders' ? (
          centerOrders.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-xs text-zinc-500 italic">No orders assigned to this hub.</p>
            </div>
          ) : (
            <table className="w-full text-left text-[10px]">
              <thead className="sticky top-0 bg-zinc-50 dark:bg-zinc-900 z-10">
                <tr className="text-zinc-500 border-b border-zinc-100 dark:border-zinc-800">
                  <th className="px-4 py-2 font-semibold">ID</th>
                  <th className="px-4 py-2 font-semibold">Address</th>
                  <th className="px-4 py-2 font-semibold text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {centerOrders.map((o) => (
                  <tr key={o.id} className="text-zinc-800 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-colors">
                    <td className="px-4 py-2 font-mono text-zinc-500">#{o.id}</td>
                    <td className="px-4 py-2 truncate max-w-[120px]" title={o.address}>
                      {o.address}
                    </td>
                    <td className="px-4 py-2 text-right">
                      <span className={`inline-block px-1.5 py-0.5 rounded text-[8px] font-black uppercase ${
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
            <table className="w-full text-left text-[10px]">
              <thead className="sticky top-0 bg-zinc-50 dark:bg-zinc-900 z-10">
                <tr className="text-zinc-500 border-b border-zinc-100 dark:border-zinc-800">
                  <th className="px-4 py-2 font-semibold">Vehicle</th>
                  <th className="px-4 py-2 font-semibold">Number</th>
                  <th className="px-4 py-2 font-semibold text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {centerVehicles.map((v) => (
                  <tr key={v.id} className="text-zinc-800 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-colors">
                    <td className="px-4 py-2 font-bold">{v.name}</td>
                    <td className="px-4 py-2 font-mono text-zinc-500">{v.vehicle_number}</td>
                    <td className="px-4 py-2 text-right">
                      <span className={`inline-block px-1.5 py-0.5 rounded text-[8px] font-black uppercase ${
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
    </Card>
  )
}
