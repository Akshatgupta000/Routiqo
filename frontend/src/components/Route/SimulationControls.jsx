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
    simulationPhase,
    startFleetSimulation,
    pauseFleetSimulation,
    resumeFleetSimulation,
    resetFleetSimulation,
    activeMultiRoutes,
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

  if (!activeRoute && (!activeMultiRoutes || activeMultiRoutes.length === 0)) return null

  const canStartPlayback = simulationPhase === 'idle' || simulationPhase === 'completed'
  const showResetPlayback = simulationPhase !== 'idle'

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

      <div className="rounded-xl border border-zinc-200 bg-zinc-50/70 p-3 dark:border-zinc-800 dark:bg-zinc-900/60">
        <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
          Simple map animation (follows route line, or hub → stops if no line)
        </p>
        <div className="flex flex-wrap gap-2">
          {canStartPlayback && (
            <Button variant="primary" className="min-w-[10rem] flex-1" onClick={() => startFleetSimulation()}>
              Simulate movement
            </Button>
          )}
          {simulationPhase === 'running' && (
            <Button variant="secondary" className="min-w-[6rem] flex-1" onClick={() => pauseFleetSimulation()}>
              Pause
            </Button>
          )}
          {simulationPhase === 'paused' && (
            <Button variant="secondary" className="min-w-[6rem] flex-1" onClick={() => resumeFleetSimulation()}>
              Resume
            </Button>
          )}
          {showResetPlayback && (
            <Button variant="ghost" className="min-w-[7rem] flex-1" onClick={() => resetFleetSimulation()}>
              Reset playback
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
