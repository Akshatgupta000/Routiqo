import { useState } from 'react'
import Modal from '../UI/Modal'
import Button from '../UI/Button'
import CalendarPicker from '../UI/CalendarPicker'
import * as api from '../../services/api'
import { PRIORITIES } from '../../utils/constants'
import AddressAutocomplete from '../UI/AddressAutocomplete'

function formatDateDisplay(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })
}

export default function AddOrderModal({ open, onClose, onCreated, toast }) {
  const today = new Date().toISOString().split('T')[0]
  const [form, setForm] = useState({
    address: '',
    delivery_date: today,
    priority: 'normal',
  })
  const [saving, setSaving] = useState(false)
  const [showCalendar, setShowCalendar] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    
    if (!form.address.trim()) {
      toast('Please enter a delivery address', 'error')
      return
    }

    setSaving(true)
    try {
      await api.createOrder({
        address: form.address,
        delivery_date: form.delivery_date,
        priority: form.priority,
      })
      toast('Order created (address geocoded automatically)')
      onCreated?.()
      onClose?.()
      setForm({ address: '', delivery_date: today, priority: 'normal' })
      setShowCalendar(false)
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
          <Button type="submit" form="add-order-form" disabled={saving}>
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
              }))
              toast('Address selected')
            }}
            autoFocus
          />
        </div>

        {/* Delivery Date — tap to reveal calendar */}
        <div>
          <label className="mb-1 block text-xs font-semibold text-zinc-600 dark:text-zinc-400">
            Delivery Date
          </label>

          {!showCalendar ? (
            <button
              type="button"
              onClick={() => setShowCalendar(true)}
              className="flex w-full items-center gap-2.5 rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-left text-sm transition-all hover:border-blue-300 hover:bg-blue-50/50 active:scale-[0.99] dark:border-zinc-700 dark:bg-zinc-900 dark:hover:border-blue-600 dark:hover:bg-blue-950/20"
            >
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-blue-500 text-white shadow-sm">
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="flex-1">
                <span className="font-semibold text-zinc-900 dark:text-white">
                  {formatDateDisplay(form.delivery_date)}
                </span>
              </div>
              <svg className="h-4 w-4 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          ) : (
            <div className="animate-in">
              <CalendarPicker
                compact
                value={form.delivery_date}
                onChange={(dateStr) => {
                  setForm((f) => ({ ...f, delivery_date: dateStr }))
                  // Auto-collapse after selection
                  setTimeout(() => setShowCalendar(false), 180)
                }}
              />
            </div>
          )}
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
