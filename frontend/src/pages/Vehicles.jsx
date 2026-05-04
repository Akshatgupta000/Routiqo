import { useState } from 'react'
import Button from '../components/UI/Button'
import Table from '../components/UI/Table'
import Badge from '../components/UI/Badge'
import AddVehicleModal from '../components/Forms/AddVehicleModal'
import EditVehicleModal from '../components/Forms/EditVehicleModal'
import * as api from '../services/api'
import { useApp } from '../context/AppContext'

export default function Vehicles() {
  const { vehicles, refreshVehicles, toast, centers, resetFleetAction, loading } = useApp()
  const [modal, setModal] = useState(false)
  const [editVehicle, setEditVehicle] = useState(null)

  const columns = [
    {
      key: 'vehicle_number',
      label: 'Reg. No.',
      render: (r) => (
        <span className="font-mono text-xs font-bold tracking-wider text-zinc-800 dark:text-zinc-200">
          {r.vehicle_number || '—'}
        </span>
      ),
    },
    { key: 'name', label: 'Name' },
    { key: 'capacity', label: 'Capacity' },
    {
      key: 'speed',
      label: 'Avg km/h',
      render: (r) => r.average_speed ?? '—',
    },
    {
      key: 'avail',
      label: 'Status',
      render: (r) => (
        <Badge status={r.is_available ? 'delivered' : 'pending'}>
          {r.is_available ? '🟢 Available' : '🔴 Busy'}
        </Badge>
      ),
    },
    {
      key: 'center',
      label: 'Center',
      render: (r) => r.delivery_center?.name ?? `#${r.delivery_center_id}`,
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (r) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => setEditVehicle(r)}
            className="flex items-center gap-1 rounded-lg bg-blue-50 px-2.5 py-1.5 text-xs font-semibold text-blue-600 hover:bg-blue-100 transition-colors dark:bg-blue-950/40 dark:text-blue-400 dark:hover:bg-blue-950/60"
            title="Edit vehicle"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Edit
          </button>
        </div>
      ),
    },
  ]

  return (
    <div className="flex h-full flex-col overflow-auto p-4">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
            Vehicles
          </h1>
          <p className="text-sm text-zinc-500">Fleet capacity and availability.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => resetFleetAction()} disabled={loading.resetFleet}>
            {loading.resetFleet ? 'Resetting...' : 'Reset Fleet Status'}
          </Button>
          <Button onClick={() => setModal(true)}>Add vehicle</Button>
        </div>
      </div>

      <Table columns={columns} rows={vehicles} empty="No vehicles." />

      <AddVehicleModal
        open={modal}
        onClose={() => setModal(false)}
        centers={centers}
        toast={toast}
        onCreated={refreshVehicles}
      />

      <EditVehicleModal
        open={!!editVehicle}
        onClose={() => setEditVehicle(null)}
        vehicle={editVehicle}
        centers={centers}
        toast={toast}
        onUpdated={refreshVehicles}
      />
    </div>
  )
}
