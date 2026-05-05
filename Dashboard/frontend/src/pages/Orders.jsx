import { useEffect, useState } from 'react'
import Button from '../components/UI/Button'
import Card from '../components/UI/Card'
import Table from '../components/UI/Table'
import Badge from '../components/UI/Badge'
import Skeleton from '../components/UI/Skeleton'
import AddOrderModal from '../components/Forms/AddOrderModal'
import { useApp } from '../context/AppContext'
import * as api from '../services/api'
import AddCenterModal from '../components/Forms/AddCenterModal'
import AddVehicleModal from '../components/Forms/AddVehicleModal'
import { formatId } from '../utils/format'

export default function Orders() {
  const { centers, orders, vehicles, refreshOrders, refreshRoutes, refreshVehicles, toast, selectedDate } = useApp()
  const [filter, setFilter] = useState('')
  const [pageLoading, setPageLoading] = useState(false)
  const [modal, setModal] = useState(false)
  
  // Suggestion states
  const [centerSuggestion, setCenterSuggestion] = useState(null)
  const [vehicleSuggestion, setVehicleSuggestion] = useState(null)

  useEffect(() => {
    const run = async () => {
      setPageLoading(true)
      try {
        await refreshOrders(filter ? { status: filter } : {})
      } finally {
        setPageLoading(false)
      }
    }
    run()
  }, [filter, refreshOrders])

  const columns = [
    { key: 'id', label: 'ID', render: (r) => `#${formatId(r.id)}` },
    { key: 'address', label: 'Address' },
    { key: 'delivery_date', label: 'Date', render: (r) => r.delivery_date || '—' },
    {
      key: 'priority',
      label: 'Priority',
      render: (r) => <Badge status={r.priority}>{r.priority}</Badge>,
    },
    {
      key: 'status',
      label: 'Status',
      render: (r) => <Badge status={r.status}>{r.status}</Badge>,
    },
    {
      key: 'center',
      label: 'Center',
      render: (r) => r.delivery_center?.name ?? `#${r.delivery_center_id}`,
    },
    {
      key: 'vehicle',
      label: 'Vehicle',
      render: (r) => {
        // Use both the order's delivery_center_id and its nested delivery_center.id
        // to handle MongoDB ObjectId string serialization differences
        const orderCenterId = String(r.delivery_center?.id ?? r.delivery_center_id ?? '')

        const centerVehicles = vehicles.filter(v => {
          const vCenterId = String(v.delivery_center?.id ?? v.delivery_center_id ?? '')
          return vCenterId === orderCenterId && v.is_available
        })
        const firstAvailable = centerVehicles[0]

        const handleChange = async (vid) => {
          if (!vid) return
          try {
            await api.updateOrder(r.id, { vehicle_id: vid, status: 'assigned' })
            toast('Vehicle assigned successfully')
            refreshOrders()
            refreshVehicles()
          } catch (err) {
            toast('Assignment failed', 'error')
          }
        }

        return (
          <div className="group relative min-w-[140px]">
            {!r.vehicle ? (
              <div className="flex flex-col py-1">
                <span className="text-[9px] font-black uppercase tracking-tighter text-emerald-500/70">
                  Auto-Suggest
                </span>
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                  {firstAvailable?.name ?? 'No fleet available'}
                </span>
                {firstAvailable && (
                  <span className="font-mono text-[9px] text-zinc-400">
                    {firstAvailable.vehicle_number}
                  </span>
                )}
                {!firstAvailable && orderCenterId && (
                  <span className="text-[9px] italic text-zinc-400">
                    No available vehicle in {r.delivery_center?.name ?? 'this hub'}
                  </span>
                )}
              </div>
            ) : (
              <div className="flex flex-col py-1">
                <span className="text-[9px] font-black uppercase tracking-tighter text-zinc-400">
                  Assigned
                </span>
                <span className="text-xs font-bold text-zinc-900 dark:text-white">
                  {r.vehicle.name}
                </span>
                {r.vehicle.vehicle_number && (
                  <span className="font-mono text-[9px] text-zinc-400">
                    {r.vehicle.vehicle_number}
                  </span>
                )}
              </div>
            )}

            {/* Hover-activated Select Overlay */}
            {centerVehicles.length > 0 && (
              <select
                className="absolute inset-0 cursor-pointer opacity-0"
                value={r.vehicle?.id || ''}
                onChange={(e) => handleChange(e.target.value)}
              >
                <option value="" disabled>
                  {r.vehicle ? 'Change vehicle...' : 'Assign to...'}
                </option>
                {centerVehicles.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.name} ({v.vehicle_number})
                  </option>
                ))}
              </select>
            )}

            {/* Tooltip hint on hover */}
            {centerVehicles.length > 0 && (
              <div className="pointer-events-none absolute -top-6 left-0 scale-0 rounded bg-zinc-900 px-2 py-1 text-[9px] text-white transition-all group-hover:scale-100 dark:bg-white dark:text-zinc-900">
                Click to change assignment
              </div>
            )}
          </div>
        )
      },
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (r) => (
        <div className="flex items-center gap-3">
          {r.status === 'pending' && (
            <button
              onClick={() => handleAssign(r.id)}
              className="text-emerald-500 hover:text-emerald-700 transition-colors"
              title="Assign order to nearest center/vehicle"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            </button>
          )}
          {r.status === 'assigned' && (
            <button
              onClick={() => handleDeliver(r.id)}
              className="text-blue-500 hover:text-blue-700 transition-colors"
              title="Mark as Delivered"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>
          )}
          <button
            onClick={() => handleDelete(r.id)}
            className="text-red-500 hover:text-red-700 transition-colors"
            title="Delete order"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      ),
    },
  ]

  const handleAssign = async (id) => {
    try {
      await api.assignOrder(id)
      toast('Order assigned successfully')
      refreshOrders(filter ? { status: filter } : {})
      refreshVehicles()
    } catch (err) {
      const errorData = err?.response?.data?.errors || {}
      
      // Check for structured suggestions
      const addressErr = errorData.address?.[0]
      const vehicleErr = errorData.vehicle_id?.[0]

      if (addressErr?.code === 'no_center') {
        if (window.confirm(`${addressErr.message} \n\nWould you like to create a new delivery center at this location?`)) {
          setCenterSuggestion({
            lat: addressErr.lat,
            lng: addressErr.lng,
            address: 'New suggested center'
          })
        }
      } else if (vehicleErr?.code === 'no_vehicle') {
        if (window.confirm(`${vehicleErr.message} \n\nWould you like to add a new vehicle to this center?`)) {
          setVehicleSuggestion({
            center_id: vehicleErr.center_id
          })
        }
      } else {
        const msg = err?.response?.data?.message || 'Failed to assign order'
        toast(msg, 'error')
      }
    }
  }

  const handleDeliver = async (id) => {
    try {
      await api.updateOrder(id, { status: 'delivered' })
      toast('Order marked as delivered')
      refreshOrders(filter ? { status: filter } : {})
      refreshRoutes()
      refreshVehicles()
    } catch (err) {
      toast('Failed to update status', 'error')
    }
  }

  const handleDelete = async (id) => {
    try {
      await api.deleteOrder(id)
      toast('Order deleted')
      refreshOrders(filter ? { status: filter } : {})
    } catch (err) {
      toast('Failed to delete order', 'error')
    }
  }

  const [clearing, setClearing] = useState(false)

  const handleClearDay = async () => {
    const dateLabel = new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })
    if (!window.confirm(`Delete ALL orders for ${dateLabel}? This action cannot be undone.`)) return
    setClearing(true)
    try {
      const res = await api.clearOrdersByDate(selectedDate)
      toast(`Cleared ${res.deleted} order(s) for ${dateLabel}`)
      refreshOrders(filter ? { status: filter } : {})
      refreshRoutes()
    } catch (err) {
      toast('Failed to clear orders', 'error')
    } finally {
      setClearing(false)
    }
  }

  return (
    <div className="flex h-full flex-col overflow-auto p-4">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
            Orders
          </h1>
          <p className="text-sm text-zinc-500">Create and track delivery requests.</p>
        </div>
        <Button onClick={() => setModal(true)}>Add order</Button>
      </div>

      <Card className="mb-4">
        <div className="flex flex-wrap items-end gap-4">
          <div>
            <label className="text-xs font-semibold uppercase text-zinc-500">Filter status</label>
            <select
              className="mt-2 w-full max-w-xs rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="">All</option>
              <option value="pending">Pending</option>
              <option value="assigned">Assigned</option>
              <option value="delivered">Delivered</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold uppercase text-zinc-500">Delivery date</label>
            <div className="mt-2 flex items-center gap-2 rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-700 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300">
              <svg className="h-4 w-4 shrink-0 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="font-medium">
                {new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}
              </span>
            </div>
          </div>
          <div className="ml-auto">
            <button
              onClick={handleClearDay}
              disabled={clearing || orders.length === 0}
              className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-600 transition-all hover:bg-red-100 hover:border-red-300 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-400 dark:hover:bg-red-500/20"
            >
              {clearing ? (
                <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              ) : (
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              )}
              {clearing ? 'Clearing…' : "Clear Day's Orders"}
            </button>
          </div>
        </div>
      </Card>

      {pageLoading ? (
        <Skeleton className="h-64 w-full" />
      ) : (
        <Table columns={columns} rows={orders} empty="No orders loaded." />
      )}

      <AddOrderModal
        open={modal}
        onClose={() => setModal(false)}
        toast={toast}
        onCreated={() => refreshOrders(filter ? { status: filter } : {})}
      />

      <AddCenterModal
        open={!!centerSuggestion}
        onClose={() => setCenterSuggestion(null)}
        initialData={centerSuggestion}
      />

      <AddVehicleModal
        open={!!vehicleSuggestion}
        onClose={() => setVehicleSuggestion(null)}
        centers={centers}
        toast={toast}
        initialCenterId={vehicleSuggestion?.center_id}
        onCreated={() => refreshOrders(filter ? { status: filter } : {})}
      />
    </div>
  )
}
