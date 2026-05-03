import { useState } from 'react'
import Modal from '../UI/Modal'
import Button from '../UI/Button'
import * as api from '../../services/api'
import { PRIORITIES } from '../../utils/constants'
import { geocodeAddress } from '../../services/geocoding'
import AddressAutocomplete from './AddressAutocomplete'

export default function AddOrderModal({ open, onClose, onCreated, toast }) {
  const [form, setForm] = useState({
    address: '',
    latitude: '',
    longitude: '',
    priority: 'medium',
  })
  const [saving, setSaving] = useState(false)
  const [geocoding, setGeocoding] = useState(false)

  const handleGeocode = async () => {
    if (!form.address) return
    setGeocoding(true)
    try {
      const result = await geocodeAddress(form.address)
      if (result) {
        setForm((f) => ({
          ...f,
          address: result.displayName,
          latitude: result.lat.toString(),
          longitude: result.lng.toString(),
        }))
        toast('Location verified!')
      } else {
        toast('Address not found', 'error')
      }
    } catch (err) {
      toast('Geocoding failed', 'error')
    } finally {
      setGeocoding(false)
    }
  }

  const submit = async (e) => {
    e.preventDefault()
    
    setSaving(true)
    try {
      await api.createOrder({
        address: form.address,
        latitude: form.latitude ? Number(form.latitude) : null,
        longitude: form.longitude ? Number(form.longitude) : null,
        priority: form.priority,
      })
      toast('Order created (location optimized)')
      onCreated?.()
      onClose?.()
      setForm({ address: '', latitude: '', longitude: '', priority: 'medium' })
    } catch (err) {
      toast(
        err?.response?.data?.errors?.address?.[0] || 
        err?.response?.data?.message || 
        'Could not create order',
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
          <Button type="submit" form="add-order-form" disabled={saving || geocoding}>
            {saving ? 'Saving…' : 'Create order'}
          </Button>
        </>
      }
    >
      <form id="add-order-form" className="space-y-4" onSubmit={submit}>
        <div>
          <label className="mb-1 block text-xs font-semibold text-zinc-600 dark:text-zinc-400">
            Delivery Address
          </label>
          <AddressAutocomplete
            value={form.address}
            onChange={(val) => setForm((f) => ({ ...f, address: val }))}
            onSelect={(place) => {
              setForm((f) => ({
                ...f,
                address: place.address,
                latitude: place.lat,
                longitude: place.lng,
              }))
              toast('Location selected')
            }}
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-xs font-semibold text-zinc-600 dark:text-zinc-400">
              Latitude
            </label>
            <input
              readOnly
              className="w-full rounded-xl border border-zinc-100 bg-zinc-50 px-3 py-2 text-sm text-zinc-500 outline-none dark:border-zinc-800 dark:bg-zinc-900/50"
              value={form.latitude}
              placeholder="Auto-filled"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-zinc-600 dark:text-zinc-400">
              Longitude
            </label>
            <input
              readOnly
              className="w-full rounded-xl border border-zinc-100 bg-zinc-50 px-3 py-2 text-sm text-zinc-500 outline-none dark:border-zinc-800 dark:bg-zinc-900/50"
              value={form.longitude}
              placeholder="Auto-filled"
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
      </form>
    </Modal>
  )
}
