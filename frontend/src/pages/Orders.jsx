import { useEffect, useState } from 'react'
import Button from '../components/UI/Button'
import Card from '../components/UI/Card'
import Table from '../components/UI/Table'
import Badge from '../components/UI/Badge'
import Skeleton from '../components/UI/Skeleton'
import AddOrderModal from '../components/Forms/AddOrderModal'
import { useApp } from '../context/AppContext'

export default function Orders() {
  const { orders, refreshOrders, toast } = useApp()
  const [filter, setFilter] = useState('')
  const [pageLoading, setPageLoading] = useState(false)
  const [modal, setModal] = useState(false)

  useEffect(() => {
    const run = async () => {
      setPageLoading(true)
      try {
        await refreshOrders(filter ? { status: filter } : {})
      } finally {
        setPageLoading(false)
      }
    }
    run()
  }, [filter, refreshOrders])

  const columns = [
    { key: 'id', label: 'ID' },
    { key: 'address', label: 'Address' },
    {
      key: 'priority',
      label: 'Priority',
      render: (r) => <Badge>{r.priority}</Badge>,
    },
    {
      key: 'status',
      label: 'Status',
      render: (r) => <Badge status={r.status}>{r.status}</Badge>,
    },
    {
      key: 'center',
      label: 'Center',
      render: (r) => r.delivery_center?.name ?? `#${r.delivery_center_id}`,
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (r) => (
        <button
          onClick={() => handleDelete(r.id)}
          className="text-red-500 hover:text-red-700 transition-colors"
          title="Delete order"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      ),
    },
  ]

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this order?')) return
    try {
      await api.deleteOrder(id)
      toast('Order deleted')
      refreshOrders(filter ? { status: filter } : {})
    } catch (err) {
      toast('Failed to delete order', 'error')
    }
  }

  return (
    <div className="flex h-full flex-col overflow-auto p-4">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
            Orders
          </h1>
          <p className="text-sm text-zinc-500">Create and track delivery requests.</p>
        </div>
        <Button onClick={() => setModal(true)}>Add order</Button>
      </div>

      <Card className="mb-4">
        <label className="text-xs font-semibold uppercase text-zinc-500">Filter status</label>
        <select
          className="mt-2 w-full max-w-xs rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="">All</option>
          <option value="pending">Pending</option>
          <option value="assigned">Assigned</option>
          <option value="delivered">Delivered</option>
        </select>
      </Card>

      {pageLoading ? (
        <Skeleton className="h-64 w-full" />
      ) : (
        <Table columns={columns} rows={orders} empty="No orders loaded." />
      )}

      <AddOrderModal
        open={modal}
        onClose={() => setModal(false)}
        toast={toast}
        onCreated={() => refreshOrders(filter ? { status: filter } : {})}
      />
    </div>
  )
}
