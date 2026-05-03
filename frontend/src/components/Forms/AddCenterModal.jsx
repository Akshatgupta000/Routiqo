import { useEffect, useState } from 'react'
import Modal from '../UI/Modal'
import Button from '../UI/Button'
import { geocodeAddress } from '../../services/geocoding'
import { useApp } from '../../context/AppContext'
import AddressAutocomplete from '../UI/AddressAutocomplete'

export default function AddCenterModal({ open, onClose, initialData }) {
  const { addCenterAction, toast } = useApp()
  const [form, setForm] = useState({
    name: '',
    address: '',
    latitude: '',
    longitude: '',
  })

  useEffect(() => {
    if (initialData) {
      setForm((f) => ({
        ...f,
        latitude: initialData.lat?.toString() || '',
        longitude: initialData.lng?.toString() || '',
        address: initialData.address || '',
      }))
    }
  }, [initialData])
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
          <AddressAutocomplete
            placeholder="Search hub location..."
            value={form.address}
            onChange={(val) => setForm((f) => ({ ...f, address: val }))}
            onSelect={(place) => {
              setForm((f) => ({
                ...f,
                address: place.address,
                latitude: place.lat,
                longitude: place.lng,
              }))
              toast('Hub location verified')
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
        
        <p className="text-[10px] italic text-zinc-500">
          The map will automatically pan and zoom to this location once saved.
        </p>
      </form>
    </Modal>
  )
}
