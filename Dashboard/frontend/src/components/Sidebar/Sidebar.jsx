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

  const [showHubs, setShowHubs] = useState(false)
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
      setShowHubs(false)
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
      <div className="flex-1 overflow-y-auto px-3 pb-2 custom-scrollbar">
        <CalendarPicker
          value={selectedDate}
          onChange={setSelectedDate}
          orderCount={orders.length}
          refreshKey={orders.length}
        />
      </div>

      <div className="border-t border-zinc-200/80 p-4 dark:border-zinc-800 relative">
        <div className="mb-2 flex items-center justify-between">
          <label className="block text-[10px] font-black uppercase tracking-[0.15em] text-zinc-400">
            Operations Hub
          </label>
        </div>

        {/* Custom Premium Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowHubs(!showHubs)}
            className={`w-full flex items-center justify-between gap-3 p-3 rounded-xl transition-all border ${
              showHubs 
                ? 'bg-zinc-50 border-zinc-300 ring-2 ring-zinc-900/5 dark:bg-zinc-800 dark:border-zinc-600' 
                : 'bg-white border-zinc-200 hover:border-zinc-300 dark:bg-zinc-900 dark:border-zinc-800 dark:hover:border-zinc-700 shadow-sm'
            }`}
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-zinc-900 dark:bg-white flex items-center justify-center shrink-0">
                <span className="text-white dark:text-zinc-900 text-xs font-black">
                  {currentCenter ? currentCenter.name.charAt(0).toUpperCase() : '?'}
                </span>
              </div>
              <div className="text-left min-w-0">
                <p className="text-xs font-bold text-zinc-900 dark:text-white truncate">
                  {currentCenter ? currentCenter.name : 'Select a Hub'}
                </p>
                <p className="text-[10px] text-zinc-500 truncate">
                  {currentCenter ? currentCenter.address : 'Click to choose'}
                </p>
              </div>
            </div>
            <svg 
              className={`w-4 h-4 text-zinc-400 transition-transform duration-300 ${showHubs ? 'rotate-180' : ''}`} 
              fill="none" stroke="currentColor" viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {/* Floating Hub List */}
          {showHubs && (
            <>
              <div 
                className="fixed inset-0 z-[60]" 
                onClick={() => setShowHubs(false)} 
              />
              <div className="absolute bottom-full mb-2 left-0 right-0 z-[70] bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-2xl shadow-zinc-900/20 overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-200">
                <div className="p-2 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400 pl-2">Available Hubs</span>
                  <button 
                    onClick={() => setAddCenterOpen(true)}
                    className="text-[10px] font-black uppercase text-indigo-600 hover:text-indigo-500 px-2 py-1"
                  >
                    + New Hub
                  </button>
                </div>
                <div className="max-h-[300px] overflow-y-auto custom-scrollbar p-1.5 space-y-1">
                  {centers.map((c) => {
                    const isSelected = selectedCenterId === c.id
                    return (
                      <div key={c.id} className="group relative flex gap-1">
                        <button
                          onClick={() => {
                            setSelectedCenterId(c.id)
                            setActiveMultiRoutes([])
                            setActiveRouteBase(null)
                            setShowHubs(false)
                          }}
                          className={`flex-1 flex items-center gap-3 p-2.5 rounded-xl transition-all ${
                            isSelected 
                              ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 shadow-lg' 
                              : 'hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
                          }`}
                        >
                          <div className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-indigo-400' : 'bg-zinc-200 dark:bg-zinc-700'}`} />
                          <div className="text-left min-w-0">
                            <p className="text-xs font-bold truncate">{c.name}</p>
                            <p className={`text-[9px] truncate ${isSelected ? 'text-zinc-400' : 'text-zinc-500'}`}>{c.address}</p>
                          </div>
                        </button>
                        
                        <div className="flex flex-col gap-1 pr-1 py-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            title="Edit"
                            className={`p-1.5 rounded-lg ${isSelected ? 'text-white/50 hover:text-white' : 'text-zinc-400 hover:text-zinc-600'}`}
                            onClick={(e) => { e.stopPropagation(); setEditCenterOpen(true); }}
                          >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                          </button>
                          <button
                            title="Delete"
                            className="p-1.5 rounded-lg text-red-400 hover:text-red-500"
                            onClick={(e) => { e.stopPropagation(); handleDeleteCenter(); }}
                          >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </>
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
