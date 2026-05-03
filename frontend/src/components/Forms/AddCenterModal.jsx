import { useState } from 'react'
import Modal from '../UI/Modal'
import Button from '../UI/Button'
import { geocodeAddress } from '../../services/geocoding'
import { useApp } from '../../context/AppContext'

export default function AddCenterModal({ open, onClose }) {
  const { addCenterAction, toast } = useApp()
  const [form, setForm] = useState({
    name: '',
    address: '',
    latitude: '',
    longitude: '',
  })
  const [geocoding, setGeocoding] = useState(false)
  const [saving, setSaving] = useState(false)

  const handleGeocode = async () => {
    if (!form.address) return
    setGeocoding(true)
    try {
      const result = await geocodeAddress(form.address)
      if (result) {
        setForm((f) => ({
          ...f,
          latitude: result.lat.toString(),
          longitude: result.lng.toString(),
        }))
        toast('Location found!')
      } else {
        toast('Address not found. Please try a more specific search.', 'error')
      }
    } catch (err) {
      toast('Geocoding service failed. Please enter coordinates manually.', 'error')
    } finally {
      setGeocoding(false)
    }
  }

  const submit = async (e) => {
    e.preventDefault()
    if (!form.latitude || !form.longitude) {
      toast('Please geocode the address or enter coordinates manually.', 'error')
      return
    }

    setSaving(true)
    try {
      await addCenterAction({
        name: form.name,
        latitude: Number(form.latitude),
        longitude: Number(form.longitude),
      })
      onClose?.()
      setForm({ name: '', address: '', latitude: '', longitude: '' })
    } catch (err) {
      // toast is handled in addCenterAction
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Add Delivery Center"
      footer={
        <>
          <Button variant="ghost" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" form="add-center-form" disabled={saving || geocoding}>
            {saving ? 'Saving…' : 'Add Center & Focus'}
          </Button>
        </>
      }
    >
      <form id="add-center-form" className="space-y-4" onSubmit={submit}>
        <div>
          <label className="mb-1 block text-xs font-semibold text-zinc-600 dark:text-zinc-400">
            Center Name
          </label>
          <input
            required
            placeholder="e.g. Downtown Hub"
            className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-semibold text-zinc-600 dark:text-zinc-400">
            Search Address
          </label>
          <div className="flex gap-2">
            <input
              className="min-w-0 flex-1 rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
              placeholder="Enter city, street, or pincode"
              value={form.address}
              onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleGeocode())}
            />
            <Button
              type="button"
              variant="secondary"
              className="shrink-0 whitespace-nowrap"
              onClick={handleGeocode}
              disabled={geocoding || !form.address}
            >
              {geocoding ? '...' : 'Search'}
            </Button>
          </div>
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
              className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
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
              className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
              value={form.longitude}
              onChange={(e) => setForm((f) => ({ ...f, longitude: e.target.value }))}
            />
          </div>
        </div>
        
        <p className="text-[10px] italic text-zinc-500">
          The map will automatically pan and zoom to this location once saved.
        </p>
      </form>
    </Modal>
  )
}
