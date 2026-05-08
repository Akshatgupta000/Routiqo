import { useEffect, useState } from 'react'
import Modal from '../UI/Modal'
import Button from '../UI/Button'
import { useApp } from '../../context/AppContext'
import * as api from '../../services/api'

export default function EditCenterModal({ open, onClose, center }) {
  const { refreshCenters, toast } = useApp()
  const [form, setForm] = useState({
    name: '',
  })

  useEffect(() => {
    if (center) {
      setForm({
        name: center.name || '',
      })
    }
  }, [center])

  const [saving, setSaving] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await api.updateCenter(center.id, {
        name: form.name,
        // Send existing coordinates to satisfy API if needed, 
        // though typically a PATCH/PUT should handle partial updates.
        latitude: center.latitude,
        longitude: center.longitude,
        address: center.address,
      })
      toast('Hub name updated successfully')
      await refreshCenters()
      onClose?.()
    } catch (err) {
      toast('Failed to update hub name', 'error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Edit Hub Name"
      footer={
        <>
          <Button variant="ghost" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" form="edit-center-form" disabled={saving}>
            {saving ? 'Updating…' : 'Save Changes'}
          </Button>
        </>
      }
    >
      <form id="edit-center-form" className="space-y-4" onSubmit={submit}>
        <div>
          <label className="mb-1 block text-xs font-semibold text-zinc-600 dark:text-zinc-400">
            Hub Name
          </label>
          <input
            required
            autoFocus
            className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950 focus:ring-2 focus:ring-primary/20 outline-none"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          />
        </div>
      </form>
    </Modal>
  )
}
