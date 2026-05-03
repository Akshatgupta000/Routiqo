import Card from '../UI/Card'
import { formatEta, formatKm } from '../../utils/format'

export default function RouteDetailsPanel({ route }) {
  if (!route?.stops?.length) {
    return (
      <Card>
        <p className="text-sm text-zinc-500">No stop details.</p>
      </Card>
    )
  }

  const stops = [...route.stops].sort((a, b) => a.sequence - b.sequence)

  return (
    <Card className="max-h-[40vh] overflow-hidden !p-0">
      <div className="border-b border-zinc-100 px-5 py-4 dark:border-zinc-800">
        <h3 className="text-sm font-bold text-zinc-900 dark:text-white">Stop sequence</h3>
        <p className="text-xs text-zinc-500">ETA and leg distance from API</p>
      </div>
      <div className="max-h-[calc(40vh-4rem)] overflow-y-auto">
        <table className="w-full text-left text-xs">
          <thead className="sticky top-0 bg-zinc-50 dark:bg-zinc-900">
            <tr className="text-zinc-500">
              <th className="px-4 py-2 font-semibold">#</th>
              <th className="px-4 py-2 font-semibold">Order</th>
              <th className="px-4 py-2 font-semibold">Leg km</th>
              <th className="px-4 py-2 font-semibold">ETA</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {stops.map((s) => (
              <tr key={s.sequence} className="text-zinc-800 dark:text-zinc-200">
                <td className="px-4 py-2 font-bold text-emerald-600 dark:text-emerald-400">
                  {s.sequence}
                </td>
                <td className="px-4 py-2">#{s.order_id}</td>
                <td className="px-4 py-2">{formatKm(s.distance_from_previous)}</td>
                <td className="px-4 py-2 whitespace-nowrap">{formatEta(s.eta)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  )
}
