import { useEffect, useState } from 'react'
import Modal from '../UI/Modal'
import Button from '../UI/Button'
import * as api from '../../services/api'

export default function EditVehicleModal({ open, onClose, onUpdated, centers, toast, vehicle }) {
  const [form, setForm] = useState({
    name: '',
    capacity: 6,
    average_speed: 25,
    is_available: true,
    delivery_center_id: '',
  })

  // Populate form when vehicle changes
  useEffect(() => {
    if (vehicle) {
      setForm({
        name: vehicle.name || '',
        capacity: vehicle.capacity ?? 6,
        average_speed: vehicle.average_speed ?? 25,
        is_available: !!vehicle.is_available,
        delivery_center_id: vehicle.delivery_center_id || '',
      })
    }
  }, [vehicle])

  const [saving, setSaving] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    if (!vehicle) return
    setSaving(true)
    try {
      await api.updateVehicle(vehicle.id, {
        name: form.name,
        capacity: Number(form.capacity),
        average_speed: Number(form.average_speed),
        is_available: form.is_available,
        delivery_center_id: form.delivery_center_id,
      })
      toast('Vehicle updated successfully')
      onUpdated?.()
      onClose?.()
    } catch (err) {
      toast(err?.response?.data?.message || 'Could not update vehicle', 'error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Edit Vehicle"
      footer={
        <>
          <Button variant="ghost" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" form="edit-vehicle-form" disabled={saving}>
            {saving ? 'Saving…' : 'Save Changes'}
          </Button>
        </>
      }
    >
      <form id="edit-vehicle-form" className="space-y-4" onSubmit={submit}>
        {/* Vehicle Number (read-only) */}
        {vehicle?.vehicle_number && (
          <div>
            <label className="mb-1 block text-xs font-semibold text-zinc-600 dark:text-zinc-400">
              Registration Number
            </label>
            <div className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm font-mono font-bold tracking-wider text-zinc-700 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300">
              🚚 {vehicle.vehicle_number}
            </div>
          </div>
        )}

        <div>
          <label className="mb-1 block text-xs font-semibold text-zinc-600 dark:text-zinc-400">
            Name
          </label>
          <input
            required
            className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-semibold text-zinc-600 dark:text-zinc-400">
            Delivery Center
          </label>
          <select
            required
            className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
            value={form.delivery_center_id || ''}
            onChange={(e) =>
              setForm((f) => ({ ...f, delivery_center_id: e.target.value }))
            }
          >
            <option value="" disabled>Select a center...</option>
            {centers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-xs font-semibold text-zinc-600 dark:text-zinc-400">
              Capacity (stops)
            </label>
            <input
              required
              type="number"
              min={1}
              max={1000}
              className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
              value={form.capacity}
              onChange={(e) => setForm((f) => ({ ...f, capacity: e.target.value }))}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-zinc-600 dark:text-zinc-400">
              Avg Speed (km/h)
            </label>
            <input
              required
              type="number"
              min={1}
              max={200}
              className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
              value={form.average_speed}
              onChange={(e) => setForm((f) => ({ ...f, average_speed: e.target.value }))}
            />
          </div>
        </div>

        <label className="flex items-center gap-3 text-sm cursor-pointer select-none">
          <div className="relative">
            <input
              type="checkbox"
              checked={form.is_available}
              onChange={(e) => setForm((f) => ({ ...f, is_available: e.target.checked }))}
              className="sr-only peer"
            />
            <div className="w-10 h-5 bg-zinc-300 rounded-full peer-checked:bg-emerald-500 transition-colors dark:bg-zinc-600" />
            <div className="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform peer-checked:translate-x-5" />
          </div>
          <span className={form.is_available ? 'text-emerald-600 font-semibold' : 'text-red-500 font-semibold'}>
            {form.is_available ? 'Available' : 'Unavailable'}
          </span>
        </label>
      </form>
    </Modal>
  )
}
