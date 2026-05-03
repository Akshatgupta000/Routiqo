import Card from '../UI/Card'
import Badge from '../UI/Badge'
import { formatDuration, formatKm } from '../../utils/format'

export default function ActiveRouteSummary({ route }) {
  if (!route) {
    return (
      <Card>
        <p className="text-sm text-zinc-500">No route selected. Generate or pick a route.</p>
      </Card>
    )
  }

  return (
    <Card>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
            Selected route
          </p>
          <p className="text-lg font-bold text-zinc-900 dark:text-white">
            Route #{route.route_id}
          </p>
        </div>
        <Badge status={route.status}>
          {typeof route.status === 'string'
            ? route.status.replaceAll('_', ' ')
            : route.status}
        </Badge>
      </div>
      <div className="mt-4 grid grid-cols-3 gap-3 text-center">
        <div className="rounded-xl bg-zinc-50 py-3 dark:bg-zinc-800/80">
          <p className="text-[10px] font-bold uppercase text-zinc-500">Stops</p>
          <p className="text-xl font-bold">{route.stops?.length ?? 0}</p>
        </div>
        <div className="rounded-xl bg-zinc-50 py-3 dark:bg-zinc-800/80">
          <p className="text-[10px] font-bold uppercase text-zinc-500">Distance</p>
          <p className="text-xl font-bold">{formatKm(route.total_distance)}</p>
        </div>
        <div className="rounded-xl bg-zinc-50 py-3 dark:bg-zinc-800/80">
          <p className="text-[10px] font-bold uppercase text-zinc-500">Time</p>
          <p className="text-xl font-bold">{formatDuration(route.total_time)}</p>
        </div>
      </div>
    </Card>
  )
}
