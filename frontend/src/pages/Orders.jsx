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

export default function Orders() {
  const { centers, orders, refreshOrders, refreshRoutes, refreshVehicles, toast } = useApp()
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
    { key: 'id', label: 'ID' },
    { key: 'address', label: 'Address' },
    {
      key: 'priority',
      label: 'Priority',
      render: (r) => <Badge>{r.priority}</Badge>,
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
        if (!r.vehicle) return <span className="text-zinc-400 text-xs italic">Unassigned</span>
        return (
          <div className="flex flex-col">
            <span className="font-semibold text-zinc-900 dark:text-white">
              {r.vehicle.name}
            </span>
            {r.vehicle.vehicle_number && (
              <span className="font-mono text-[10px] tracking-tight text-zinc-500">
                {r.vehicle.vehicle_number}
              </span>
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
    if (!window.confirm('Are you sure you want to delete this order?')) return
    try {
      await api.deleteOrder(id)
      toast('Order deleted')
      refreshOrders(filter ? { status: filter } : {})
    } catch (err) {
      toast('Failed to delete order', 'error')
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
