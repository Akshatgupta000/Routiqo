import Button from '../UI/Button'
import * as api from '../../services/api'
import { useApp } from '../../context/AppContext'

export default function SimulationControls() {
  const {
    activeRoute,
    applyRouteSimulationUpdate,
    refreshOrders,
    refreshRoutes,
    toast,
    loading,
    setLoading,
    activeMultiRoutes,
    simulateLegAction,
    resetFleetSimulation,
  } = useApp()

  const id = activeRoute?.route_id

  const run = async (fn, key) => {
    if (!id) return
    setLoading((l) => ({ ...l, [key]: true }))
    try {
      const data = await fn(id)
      applyRouteSimulationUpdate(data)
      await Promise.all([refreshOrders(), refreshRoutes()])
      
      if (key === 'simStart' || key === 'simNext') {
        simulateLegAction(data)
      } else if (key === 'simDone') {
        resetFleetSimulation({ silent: true })
      }
      
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

  if (!activeRoute && (!activeMultiRoutes || activeMultiRoutes.length === 0)) return null

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-2">
        <Button variant="secondary" disabled={!id || loading.simStart} onClick={() => run(api.startRoute, 'simStart')}>
          Start route
        </Button>
        <Button variant="primary" disabled={!id || loading.simNext} onClick={() => run(api.nextStopRoute, 'simNext')}>
          Next stop
        </Button>
        <Button variant="ghost" disabled={!id || loading.simDone} onClick={() => run(api.completeRoute, 'simDone')}>
          Complete
        </Button>
      </div>
    </div>
  )
}
