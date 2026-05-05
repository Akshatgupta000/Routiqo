import { useState, useEffect, useRef } from 'react'
import { ChevronDown, Trash2, CheckCircle2, Clock, AlertTriangle } from 'lucide-react'
import * as api from '../../services/api'
import Modal from '../UI/Modal'
import Button from '../UI/Button'

export default function CleanupOrders({ onActionComplete, toast }) {
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [counts, setCounts] = useState({ completed: 0, pending: 0, total: 0 })
  const [confirmModal, setConfirmModal] = useState(null) // 'completed', 'pending', 'all'
  const [deleteInput, setDeleteInput] = useState('')
  const dropdownRef = useRef(null)

  const fetchCounts = async () => {
    try {
      const data = await api.getOrderBulkCounts()
      setCounts(data)
    } catch (err) {
      console.error('Failed to fetch order counts', err)
    }
  }

  useEffect(() => {
    fetchCounts()
    
    // Close dropdown on click outside
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleAction = async (type) => {
    setLoading(true)
    try {
      let res
      if (type === 'completed') {
        res = await api.deleteCompletedOrders()
        toast(`${res.deleted_count} completed orders deleted`)
      } else if (type === 'pending') {
        res = await api.deletePendingOrders()
        toast(`${res.deleted_count} pending orders deleted`)
      } else if (type === 'all') {
        res = await api.deleteAllOrders()
        toast(`All ${res.deleted_count} orders deleted`)
      }
      
      setConfirmModal(null)
      setDeleteInput('')
      setIsOpen(false)
      fetchCounts()
      if (onActionComplete) onActionComplete()
    } catch (err) {
      toast('Action failed', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        onClick={() => {
          setIsOpen(!isOpen)
          if (!isOpen) fetchCounts()
        }}
        className="flex items-center gap-2 rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-2 text-sm font-semibold text-zinc-800 shadow-sm transition-all hover:bg-zinc-100 active:scale-95 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100 dark:hover:bg-zinc-900"
      >
        <span>Cleanup Orders</span>
        <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div
          className="absolute right-0 z-[60] mt-2 w-64 origin-top-right rounded-xl border-2 border-zinc-300 bg-white p-1 shadow-2xl dark:border-zinc-600 dark:bg-zinc-900"
        >
          <div className="px-3 py-2 text-[10px] font-black uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
            Bulk Cleanup Operations
          </div>
          
          <button
            onClick={() => setConfirmModal('completed')}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-bold text-emerald-700 transition-colors hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-500/20"
          >
            <CheckCircle2 className="h-4 w-4" />
            <div className="flex flex-col items-start">
              <span>Delete Completed Orders</span>
              <span className="text-[10px] font-medium opacity-80">Count: {counts.completed}</span>
            </div>
          </button>

          <button
            onClick={() => setConfirmModal('pending')}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-bold text-amber-700 transition-colors hover:bg-amber-50 dark:text-amber-400 dark:hover:bg-amber-500/20"
          >
            <Clock className="h-4 w-4" />
            <div className="flex flex-col items-start">
              <span>Delete Pending Orders</span>
              <span className="text-[10px] font-medium opacity-80">Count: {counts.pending}</span>
            </div>
          </button>

          <div className="my-1 border-t-2 border-zinc-100 dark:border-zinc-800" />

          <button
            onClick={() => setConfirmModal('all')}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-bold text-red-700 transition-colors hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/20"
          >
            <Trash2 className="h-4 w-4" />
            <div className="flex flex-col items-start">
              <span>Delete All Orders</span>
              <span className="text-[10px] font-medium opacity-80">Total: {counts.total}</span>
            </div>
          </button>
        </div>
      )}

      {/* Confirmation Modals */}
      <Modal
        open={confirmModal === 'completed'}
        onClose={() => setConfirmModal(null)}
        title="Delete Completed Orders?"
        footer={
          <>
            <Button variant="ghost" onClick={() => setConfirmModal(null)}>Cancel</Button>
            <Button 
              variant="danger" 
              onClick={() => handleAction('completed')}
              disabled={loading || counts.completed === 0}
            >
              {loading ? 'Deleting...' : `Delete Completed (${counts.completed})`}
            </Button>
          </>
        }
      >
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          This will permanently remove all orders that have been marked as <span className="font-semibold text-zinc-900 dark:text-white">delivered</span>. This action cannot be undone.
        </p>
      </Modal>

      <Modal
        open={confirmModal === 'pending'}
        onClose={() => setConfirmModal(null)}
        title="Delete Pending Orders?"
        footer={
          <>
            <Button variant="ghost" onClick={() => setConfirmModal(null)}>Cancel</Button>
            <Button 
              variant="danger" 
              onClick={() => handleAction('pending')}
              disabled={loading || counts.pending === 0}
            >
              {loading ? 'Deleting...' : `Delete Pending (${counts.pending})`}
            </Button>
          </>
        }
      >
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          This will permanently remove all <span className="font-semibold text-zinc-900 dark:text-white">pending</span> orders that have not been assigned yet.
        </p>
      </Modal>

      <Modal
        open={confirmModal === 'all'}
        onClose={() => {
          setConfirmModal(null)
          setDeleteInput('')
        }}
        title="Delete ALL Orders?"
        footer={
          <>
            <Button variant="ghost" onClick={() => setConfirmModal(null)}>Cancel</Button>
            <Button 
              variant="danger" 
              onClick={() => handleAction('all')}
              disabled={loading || deleteInput !== 'DELETE' || counts.total === 0}
            >
              {loading ? 'Deleting All...' : `Delete Everything (${counts.total})`}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4 dark:border-red-500/20 dark:bg-red-500/10">
            <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
            <p className="text-sm font-medium text-red-600 dark:text-red-400">
              Warning: This will delete ALL orders across all dates and centers permanently.
            </p>
          </div>
          
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase text-zinc-500">
              Type <span className="text-zinc-900 dark:text-white">DELETE</span> to confirm
            </label>
            <input
              type="text"
              value={deleteInput}
              onChange={(e) => setDeleteInput(e.target.value)}
              placeholder="Type DELETE"
              className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm focus:border-red-500 focus:ring-red-500 dark:border-zinc-700 dark:bg-zinc-950 dark:text-white"
            />
          </div>
        </div>
      </Modal>
    </div>
  )
}
