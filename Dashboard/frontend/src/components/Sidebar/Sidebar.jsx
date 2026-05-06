import { NavLink } from 'react-router-dom'
import Card from '../UI/Card'
import Button from '../UI/Button'
import CalendarPicker from '../UI/CalendarPicker'
import { useApp } from '../../context/AppContext'
import { formatDuration, formatKm } from '../../utils/format'
import AddCenterModal from '../Forms/AddCenterModal'
import Modal from '../UI/Modal'
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
    refreshOrders,
    refreshVehicles,
    refreshRoutes,
    setOrders,
    setVehicles,
    setActiveMultiRoutes,
    setActiveRouteBase,
    toast,
    resetSelection,
    generateRoutesAction,
  } = useApp()

  const [showHubs, setShowHubs] = useState(false)
  const [addCenterOpen, setAddCenterOpen] = useState(false)
  const [deleteConfirmCenter, setDeleteConfirmCenter] = useState(null)

  const currentCenter = centers.find(c => c.id === selectedCenterId)

  const [deleting, setDeleting] = useState(false)

  const confirmDeleteCenter = async () => {
    if (!deleteConfirmCenter) return

    setDeleting(true)
    try {
      const response = await api.deleteCenter(deleteConfirmCenter.id)
      toast(response.message || 'Hub deleted and orders reassigned')
      
      // 1. Reset map and selections
      resetSelection()
      
      // 2. Optimistic local state clearing for immediate UI response
      // This ensures vehicles and orders disappear instantly from map/sidebar
      setVehicles(prev => prev.filter(v => String(v.delivery_center_id) !== String(deleteConfirmCenter.id)))
      setOrders(prev => prev.filter(o => String(o.delivery_center_id) !== String(deleteConfirmCenter.id)))
      
      setDeleteConfirmCenter(null)
      setShowHubs(false)
      
      // 3. Refresh all data to sync with the backend reassignments
      await Promise.all([
        refreshCenters(),
        refreshOrders(),
        refreshVehicles(),
        refreshRoutes()
      ])
      
      // 4. Automatically trigger global re-optimization for remaining hubs
      await generateRoutesAction()
      
    } catch (err) {
      const msg = err?.response?.data?.message || err.message || 'Failed to delete hub safely'
      toast(msg, 'error')
    } finally {
      setDeleting(false)
    }
  }


  return (
    <div className="flex h-full min-h-0 w-full flex-col bg-transparent">
      <div className={`flex items-center justify-between gap-2 border-b border-zinc-200/80 px-4 py-4 dark:border-zinc-800 transition-all duration-300 ${showHubs ? 'blur-[2px] opacity-40 grayscale pointer-events-none' : ''}`}>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">
            Last-Mile
          </p>
          <h1 className="text-lg font-bold tracking-tight text-zinc-900 dark:text-white">
            Routiqo
          </h1>
        </div>
        <Button variant="secondary" className="!px-3 !py-2 text-xs" onClick={toggleTheme}>
          {theme === 'dark' ? 'Light' : 'Dark'}
        </Button>
      </div>

      <nav className={`flex flex-row flex-wrap gap-1 p-3 md:flex-col md:flex-nowrap transition-all duration-300 ${showHubs ? 'blur-[2px] opacity-40 grayscale pointer-events-none' : ''}`}>
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
      <div className={`flex-1 overflow-y-auto px-3 pb-2 custom-scrollbar transition-all duration-300 ${showHubs ? 'blur-[2px] opacity-40 grayscale pointer-events-none' : ''}`}>
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
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${currentCenter ? 'bg-zinc-900 dark:bg-white' : ''}`}>
                <span className="text-white dark:text-zinc-900 text-xs font-black">
                  {currentCenter ? currentCenter.name.charAt(0).toUpperCase() : ''}
                </span>
              </div>
              <div className="text-left min-w-0">
                <p className={`text-sm font-black truncate tracking-tight leading-none ${currentCenter ? 'text-zinc-900 dark:text-white' : 'text-primary'}`}>
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
                    className="text-[10px] font-black uppercase text-primary hover:opacity-80 px-2 py-1"
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
                          <div className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-primary' : 'bg-zinc-200 dark:bg-zinc-700'}`} />
                          <div className="text-left min-w-0">
                            <p className="text-xs font-bold truncate">{c.name}</p>
                            <p className={`text-[9px] truncate ${isSelected ? 'text-zinc-400' : 'text-zinc-500'}`}>{c.address}</p>
                          </div>
                        </button>
                        
                        <div className="flex items-center pr-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            title="Delete"
                            className={`p-1.5 rounded-lg ${isSelected ? 'text-white/50 hover:text-red-400' : 'text-red-400 hover:text-red-500'}`}
                            onClick={(e) => { e.stopPropagation(); setDeleteConfirmCenter(c); }}
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

      <Modal
        open={!!deleteConfirmCenter}
        onClose={() => setDeleteConfirmCenter(null)}
        title="Delete Delivery Hub?"
        footer={
          <div className="flex gap-3">
            <Button variant="ghost" onClick={() => setDeleteConfirmCenter(null)} disabled={deleting}>Cancel</Button>
            <Button variant="danger" onClick={confirmDeleteCenter} disabled={deleting}>
              {deleting ? 'Deleting Hub...' : 'Delete Hub'}
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Are you sure you want to delete <span className="font-bold text-zinc-900 dark:text-white">"{deleteConfirmCenter?.name}"</span>?
          </p>
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 dark:border-red-500/20 dark:bg-red-500/10">
            <div className="flex items-start gap-3 text-red-600 dark:text-red-400">
              <svg className="mt-0.5 h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div className="text-sm">
                <p className="font-bold">Important Warning</p>
                <p className="mt-1 opacity-90">Deleting this hub will orphan all existing orders and vehicles associated with it. They will no longer appear on the delivery schedule until manually re-assigned.</p>
              </div>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  )
}
