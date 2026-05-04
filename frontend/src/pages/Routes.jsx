import Button from '../components/UI/Button'
import Card from '../components/UI/Card'
import Table from '../components/UI/Table'
import Badge from '../components/UI/Badge'
import { formatDuration, formatKm } from '../utils/format'
import { useApp } from '../context/AppContext'
import * as api from '../services/api'
import { useNavigate } from 'react-router-dom'

export default function Routes() {
  const {
    routesList,
    refreshRoutes,
    selectRouteFromList,
    toast,
    selectedCenterId,
  } = useApp()
  const navigate = useNavigate()

  const filtered = selectedCenterId
    ? routesList.filter((r) => r.delivery_center?.id === selectedCenterId)
    : routesList

  const columns = [
    { key: 'route_id', label: 'ID', render: (r) => r.route_id ?? r.id },
    {
      key: 'profile',
      label: 'Profile',
      render: (r) => <Badge>{r.optimization_profile ?? '—'}</Badge>,
    },
    {
      key: 'status',
      label: 'Status',
      render: (r) => <Badge status={r.status}>{r.status}</Badge>,
    },
    {
      key: 'dist',
      label: 'Distance',
      render: (r) => formatKm(r.total_distance),
    },
    {
      key: 'time',
      label: 'Time',
      render: (r) => formatDuration(r.total_time),
    },
    {
      key: 'stops',
      label: 'Stops',
      render: (r) => r.stops?.length ?? 0,
    },
    {
      key: 'actions',
      label: '',
      render: (r) => (
        <Button
          variant="secondary"
          className="!py-1 !text-xs"
          onClick={() => {
            selectRouteFromList(r)
            navigate('/')
            toast('Route loaded on dashboard map.')
          }}
        >
          View on map
        </Button>
      ),
    },
  ]

  const regen = async () => {
    if (!selectedCenterId) {
      toast('Select a delivery center in the sidebar first.', 'error')
      return
    }
    try {
      await api.regenerateRoutes(selectedCenterId)
      await refreshRoutes()
      toast('Routes regenerated for center.')
    } catch (e) {
      toast(e?.response?.data?.message || 'Regenerate failed', 'error')
    }
  }

  return (
    <div className="flex h-full flex-col overflow-auto p-4">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
            Routes
          </h1>
          <p className="text-sm text-zinc-500">History and inspection.</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="ghost" 
            className="text-red-600 hover:bg-red-50" 
            onClick={async () => {
              if (window.confirm('Clear all routes and reset orders to pending?')) {
                try {
                  await api.clearRoutes()
                  await refreshRoutes()
                  toast('All routes cleared.')
                } catch (e) {
                  toast('Clear failed', 'error')
                }
              }
            }}
          >
            Clear all
          </Button>
          <Button variant="secondary" onClick={regen}>
            Regenerate center
          </Button>
        </div>
      </div>

      <Card className="mb-4 text-xs text-zinc-500">
        Showing routes for sidebar center filter when set. Open a route on the dashboard map to
        inspect polylines and simulation.
      </Card>

      <Table columns={columns} rows={filtered} empty="No routes yet. Generate from dashboard." />
    </div>
  )
}
