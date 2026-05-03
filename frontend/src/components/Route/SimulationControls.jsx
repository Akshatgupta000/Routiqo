import Button from '../UI/Button'
import * as api from '../../services/api'
import { useApp } from '../../context/AppContext'

export default function SimulationControls() {
  const {
    activeRoute,
    setActiveRoute,
    refreshOrders,
    refreshRoutes,
    toast,
    loading,
    setLoading,
  } = useApp()

  const id = activeRoute?.route_id

  const run = async (fn, key) => {
    if (!id) return
    setLoading((l) => ({ ...l, [key]: true }))
    try {
      const data = await fn(id)
      setActiveRoute(data)
      await Promise.all([refreshOrders(), refreshRoutes()])
      toast('Route updated.')
    } catch (e) {
      toast(
        e?.response?.data?.message ||
          e?.response?.data?.errors?.route_id?.[0] ||
          e.message ||
          'Action failed',
        'error'
      )
    } finally {
      setLoading((l) => ({ ...l, [key]: false }))
    }
  }

  if (!activeRoute) return null

  return (
    <div className="flex flex-wrap gap-2">
      <Button
        variant="secondary"
        disabled={!id || loading.simStart}
        onClick={() => run(api.startRoute, 'simStart')}
      >
        Start route
      </Button>
      <Button
        variant="primary"
        disabled={!id || loading.simNext}
        onClick={() => run(api.nextStopRoute, 'simNext')}
      >
        Next stop
      </Button>
      <Button
        variant="ghost"
        disabled={!id || loading.simDone}
        onClick={() => run(api.completeRoute, 'simDone')}
      >
        Complete
      </Button>
    </div>
  )
}
