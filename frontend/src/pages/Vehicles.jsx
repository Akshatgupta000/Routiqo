import { useState } from 'react'
import Button from '../components/UI/Button'
import Table from '../components/UI/Table'
import Badge from '../components/UI/Badge'
import AddVehicleModal from '../components/Forms/AddVehicleModal'
import * as api from '../services/api'
import { useApp } from '../context/AppContext'

export default function Vehicles() {
  const { vehicles, refreshVehicles, toast, centers } = useApp()
  const [modal, setModal] = useState(false)

  const toggleAvail = async (v) => {
    try {
      await api.updateVehicle(v.id, { is_available: !v.is_available })
      toast('Vehicle updated')
      await refreshVehicles()
    } catch (e) {
      toast(e?.response?.data?.message || 'Update failed', 'error')
    }
  }

  const columns = [
    { key: 'id', label: 'ID' },
    { key: 'name', label: 'Name' },
    { key: 'capacity', label: 'Capacity' },
    {
      key: 'speed',
      label: 'Avg km/h',
      render: (r) => r.average_speed ?? '—',
    },
    {
      key: 'avail',
      label: 'Available',
      render: (r) => (
        <Badge status={r.is_available ? 'delivered' : 'pending'}>
          {r.is_available ? 'Yes' : 'No'}
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
      label: '',
      render: (r) => (
        <Button variant="ghost" className="!py-1 !text-xs" onClick={() => toggleAvail(r)}>
          Toggle avail.
        </Button>
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
        <Button onClick={() => setModal(true)}>Add vehicle</Button>
      </div>

      <Table columns={columns} rows={vehicles} empty="No vehicles." />

      <AddVehicleModal
        open={modal}
        onClose={() => setModal(false)}
        centers={centers}
        toast={toast}
        onCreated={refreshVehicles}
      />
    </div>
  )
}
