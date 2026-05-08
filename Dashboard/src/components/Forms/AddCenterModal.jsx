import { useEffect, useState } from 'react'
import Modal from '../UI/Modal'
import Button from '../UI/Button'
import { geocodeAddress } from '../../services/geocoding'
import { useApp } from '../../context/AppContext'
import AddressAutocomplete from '../UI/AddressAutocomplete'

export default function AddCenterModal({ open, onClose, initialData }) {
  const { addCenterAction, toast, centers } = useApp()
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
    // Reset form when modal closes and there's no initialData
    if (!open && !initialData) {
      setForm({ name: '', address: '', latitude: '', longitude: '' })
    }
  }, [initialData, open])
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

    const lat = Number(form.latitude)
    const lng = Number(form.longitude)

    // Check for duplicate location
    const exists = centers.find(c => 
      Math.abs(Number(c.latitude) - lat) < 0.0001 && 
      Math.abs(Number(c.longitude) - lng) < 0.0001
    )

    if (exists) {
      toast('Hub already exists at this location', 'error')
      return
    }

    setSaving(true)
    try {
      await addCenterAction({
        name: form.name,
        latitude: lat,
        longitude: lng,
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
      <form id="add-center-form" className="space-y-5 pb-32 pt-2" onSubmit={submit}>
        <div>
          <label className="mb-1 block text-xs font-semibold text-zinc-600 dark:text-zinc-400">
            Center Name
          </label>
          <input
            required
            autoFocus
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

        <p className="text-[10px] italic text-zinc-500">
          The map will automatically pan and zoom to this location once saved.
        </p>
      </form>
    </Modal>
  )
}
