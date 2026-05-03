import { useState } from 'react'
import Modal from '../UI/Modal'
import Button from '../UI/Button'
import * as api from '../../services/api'
import { PRIORITIES } from '../../utils/constants'

export default function AddOrderModal({ open, onClose, onCreated, toast }) {
  const [form, setForm] = useState({
    address: '',
    latitude: '',
    longitude: '',
    priority: 'medium',
  })
  const [saving, setSaving] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await api.createOrder({
        address: form.address,
        latitude: Number(form.latitude),
        longitude: Number(form.longitude),
        priority: form.priority,
      })
      toast('Order created')
      onCreated?.()
      onClose?.()
      setForm({ address: '', latitude: '', longitude: '', priority: 'medium' })
    } catch (err) {
      toast(
        err?.response?.data?.message || 'Could not create order',
        'error'
      )
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="New delivery order"
      footer={
        <>
          <Button variant="ghost" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" form="add-order-form" disabled={saving}>
            {saving ? 'Saving…' : 'Create order'}
          </Button>
        </>
      }
    >
      <form id="add-order-form" className="space-y-4" onSubmit={submit}>
        <div>
          <label className="mb-1 block text-xs font-semibold text-zinc-600 dark:text-zinc-400">
            Address
          </label>
          <input
            required
            className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
            value={form.address}
            onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-xs font-semibold text-zinc-600 dark:text-zinc-400">
              Latitude
            </label>
            <input
              required
              type="number"
              step="any"
              className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
              value={form.latitude}
              onChange={(e) => setForm((f) => ({ ...f, latitude: e.target.value }))}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-zinc-600 dark:text-zinc-400">
              Longitude
            </label>
            <input
              required
              type="number"
              step="any"
              className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
              value={form.longitude}
              onChange={(e) => setForm((f) => ({ ...f, longitude: e.target.value }))}
            />
          </div>
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold text-zinc-600 dark:text-zinc-400">
            Priority
          </label>
          <select
            className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
            value={form.priority}
            onChange={(e) => setForm((f) => ({ ...f, priority: e.target.value }))}
          >
            {PRIORITIES.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>
        <p className="text-xs text-zinc-500">
          Nearest delivery center is assigned automatically by the API.
        </p>
      </form>
    </Modal>
  )
}
