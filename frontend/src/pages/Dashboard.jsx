import { useMemo } from 'react'
import MapView from '../components/Map/MapView'
import Button from '../components/UI/Button'
import Card from '../components/UI/Card'
import Spinner from '../components/UI/Spinner'
import ActiveRouteSummary from '../components/Route/ActiveRouteSummary'
import RouteDetailsPanel from '../components/Route/RouteDetailsPanel'
import SimulationControls from '../components/Route/SimulationControls'
import DeliveryInput from '../components/Forms/DeliveryInput'
import { useApp } from '../context/AppContext'

export default function Dashboard() {
  const {
    centers,
    orders,
    activeRoute,
    vehiclePosition,
    loading,
    generateRoutesAction,
    selectedCenterId,
    activeProfile,
    setActiveProfile,
  } = useApp()

  const ordersOnMap = useMemo(
    () =>
      orders.filter((o) => {
        // Always show pending orders (red dots)
        if (o.status === 'pending') return true
        
        // Don't show completed orders if user wants them gone
        if (o.status === 'delivered') return false

        // Show orders belonging to the selected center
        return !selectedCenterId || o.delivery_center_id === selectedCenterId
      }),
    [orders, selectedCenterId]
  )

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4 p-4 lg:flex-row lg:gap-6 lg:p-6">
      <section className="relative flex min-h-[45vh] flex-1 flex-col lg:min-h-0">
        {loading.global ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 rounded-2xl border border-zinc-200 bg-white/80 dark:border-zinc-800 dark:bg-zinc-900/80">
            <Spinner className="h-10 w-10" />
            <p className="text-sm text-zinc-500">Loading map data…</p>
          </div>
        ) : (
          <MapView
            centers={centers}
            orders={ordersOnMap}
            activeRoute={activeRoute}
            vehiclePosition={vehiclePosition}
            showOrderPins={true}
          />
        )}
      </section>

      <section className="flex w-full shrink-0 flex-col gap-4 lg:w-96 lg:max-w-md lg:overflow-y-auto">
        <Card className="p-4 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-sm font-bold text-zinc-900 dark:text-white">
              Route optimization
            </h2>
            <div className="flex rounded-xl bg-zinc-100 p-1 dark:bg-zinc-800">
              <button
                type="button"
                className={`rounded-lg px-3 py-1 text-xs font-semibold transition-colors ${
                  activeProfile === 'shortest'
                    ? 'bg-white text-zinc-900 shadow dark:bg-zinc-950 dark:text-white'
                    : 'text-zinc-500'
                }`}
                onClick={() => setActiveProfile('shortest')}
              >
                Shortest
              </button>
              <button
                type="button"
                className={`rounded-lg px-3 py-1 text-xs font-semibold transition-colors ${
                  activeProfile === 'fastest'
                    ? 'bg-white text-zinc-900 shadow dark:bg-zinc-950 dark:text-white'
                    : 'text-zinc-500'
                }`}
                onClick={() => setActiveProfile('fastest')}
              >
                Fastest
              </button>
            </div>
          </div>
          <p className="mt-2 text-xs leading-relaxed text-zinc-500">
            Generates paired routes for the selected center. Green line = active profile; gray dashed =
            alternate comparison.
          </p>
          <Button
            className="mt-4 w-full"
            disabled={loading.generate || !selectedCenterId}
            onClick={generateRoutesAction}
          >
            {loading.generate ? 'Generating…' : 'Generate route'}
          </Button>
        </Card>

        <DeliveryInput />

        <ActiveRouteSummary route={activeRoute} />
        <SimulationControls />
        <RouteDetailsPanel route={activeRoute} />
      </section>
    </div>
  )
}
