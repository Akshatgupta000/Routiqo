import { useEffect, useState } from 'react'
import Modal from '../UI/Modal'
import Button from '../UI/Button'
import { geocodeAddress } from '../../services/geocoding'
import { useApp } from '../../context/AppContext'
import AddressAutocomplete from '../UI/AddressAutocomplete'
import * as api from '../../services/api'

export default function EditCenterModal({ open, onClose, center }) {
  const { refreshCenters, toast } = useApp()
  const [form, setForm] = useState({
    name: '',
    address: '',
    latitude: '',
    longitude: '',
  })

  useEffect(() => {
    if (center) {
      setForm({
        name: center.name || '',
        address: center.address || '',
        latitude: center.latitude?.toString() || '',
        longitude: center.longitude?.toString() || '',
      })
    }
  }, [center])

  const [geocoding, setGeocoding] = useState(false)
  const [saving, setSaving] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await api.updateCenter(center.id, {
        name: form.name,
        latitude: Number(form.latitude),
        longitude: Number(form.longitude),
        address: form.address,
      })
      toast('Delivery center updated successfully')
      await refreshCenters()
      onClose?.()
    } catch (err) {
      toast('Failed to update center', 'error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Edit Delivery Center"
      footer={
        <>
          <Button variant="ghost" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" form="edit-center-form" disabled={saving || geocoding}>
            {saving ? 'Updating…' : 'Save Changes'}
          </Button>
        </>
      }
    >
      <form id="edit-center-form" className="space-y-4" onSubmit={submit}>
        <div>
          <label className="mb-1 block text-xs font-semibold text-zinc-600 dark:text-zinc-400">
            Center Name
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
            Location/Address
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
            }}
          />
        </div>

      </form>
    </Modal>
  )
}
