import { NavLink } from 'react-router-dom'
import Card from '../UI/Card'
import Button from '../UI/Button'
import CalendarPicker from '../UI/CalendarPicker'
import { useApp } from '../../context/AppContext'
import { formatDuration, formatKm } from '../../utils/format'
import AddCenterModal from '../Forms/AddCenterModal'
import EditCenterModal from '../Forms/EditCenterModal'
import { useState } from 'react'
import * as api from '../../services/api'

const linkClass = ({ isActive }) =>
  `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
    isActive
      ? 'bg-zinc-900 text-white shadow-md dark:bg-white dark:text-zinc-900'
      : 'text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800'
  }`

export default function Sidebar() {
  const {
    toggleTheme,
    theme,
    centers,
    orders,
    selectedCenterId,
    setSelectedCenterId,
    selectedDate,
    setSelectedDate,
    refreshCenters,
    setActiveMultiRoutes,
    setActiveRouteBase,
    toast,
  } = useApp()

  const [addCenterOpen, setAddCenterOpen] = useState(false)
  const [editCenterOpen, setEditCenterOpen] = useState(false)

  const currentCenter = centers.find(c => c.id === selectedCenterId)

  const handleDeleteCenter = async () => {
    if (!selectedCenterId) return
    if (!window.confirm(`Are you sure you want to delete "${currentCenter?.name}"? This will unassign all vehicles from this hub.`)) return

    try {
      await api.deleteCenter(selectedCenterId)
      toast('Delivery center removed')
      setSelectedCenterId(null)
      refreshCenters()
    } catch (err) {
      toast('Failed to delete hub', 'error')
    }
  }


  return (
    <div className="flex h-full min-h-0 w-full flex-col bg-transparent">
      <div className="flex items-center justify-between gap-2 border-b border-zinc-200/80 px-4 py-4 dark:border-zinc-800">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">
            Last-Mile
          </p>
          <h1 className="text-lg font-bold tracking-tight text-zinc-900 dark:text-white">
            RouteOps
          </h1>
        </div>
        <Button variant="secondary" className="!px-3 !py-2 text-xs" onClick={toggleTheme}>
          {theme === 'dark' ? 'Light' : 'Dark'}
        </Button>
      </div>

      <nav className="flex flex-row flex-wrap gap-1 p-3 md:flex-col md:flex-nowrap">
        <NavLink to="/" end className={linkClass}>
          <span className="text-lg">⌖</span> Dashboard
        </NavLink>
        <NavLink to="/orders" className={linkClass}>
          <span className="text-lg">◎</span> Orders
        </NavLink>
        <NavLink to="/vehicles" className={linkClass}>
          <span className="text-lg">⎔</span> Vehicles
        </NavLink>
        <NavLink to="/routes" className={linkClass}>
          <span className="text-lg">⎘</span> Routes
        </NavLink>
      </nav>

      {/* Compact iOS Calendar Picker */}
      <div className="flex-1 overflow-y-auto px-3 pb-2">
        <CalendarPicker
          value={selectedDate}
          onChange={setSelectedDate}
          orderCount={orders.length}
          refreshKey={orders.length}
        />
      </div>

      <div className="border-t border-zinc-200/80 p-3 dark:border-zinc-800">
        <div className="mb-1.5 flex items-center justify-between">
          <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500">
            Delivery center
          </label>
          <button
            type="button"
            className="text-xs font-bold uppercase text-indigo-600 hover:text-indigo-500 dark:text-indigo-400"
            onClick={() => setAddCenterOpen(true)}
          >
            + Add New
          </button>
        </div>
        <div className="flex gap-2">
          <select
            className="flex-1 rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-base font-medium text-zinc-900 shadow-md dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
            value={selectedCenterId ?? ''}
            onChange={(e) => {
              const id = e.target.value || null
              setSelectedCenterId(id)
              setActiveMultiRoutes([])
              setActiveRouteBase(null)
            }}
          >
            <option value="">Select a Hub...</option>
            {centers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          
          {selectedCenterId && (
            <div className="flex gap-1.5">
              <button
                title="Edit Hub"
                className="flex items-center justify-center w-[46px] h-[46px] rounded-xl bg-zinc-100 dark:bg-zinc-800 text-lg text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200"
                onClick={() => setEditCenterOpen(true)}
              >
                ✎
              </button>
              <button
                title="Delete Hub"
                className="flex items-center justify-center w-[46px] h-[46px] rounded-xl bg-red-50 dark:bg-red-900/20 text-lg text-red-600 hover:bg-red-100"
                onClick={handleDeleteCenter}
              >
                ✕
              </button>
            </div>
          )}
        </div>
      </div>

      <AddCenterModal open={addCenterOpen} onClose={() => setAddCenterOpen(false)} />
      <EditCenterModal 
        open={editCenterOpen} 
        onClose={() => setEditCenterOpen(false)} 
        center={currentCenter}
      />
    </div>
  )
}
