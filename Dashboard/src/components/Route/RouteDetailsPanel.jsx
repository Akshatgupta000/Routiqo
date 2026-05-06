import Card from '../UI/Card'
import { formatEta, formatKm, formatId } from '../../utils/format'

export default function RouteDetailsPanel({ route, isDrawerContent = false }) {
  if (!route?.stops?.length) {
    return (
      <div className="p-6 text-center">
        <p className="text-sm text-zinc-500">No stop details.</p>
      </div>
    )
  }

  const stops = [...route.stops].sort((a, b) => a.sequence - b.sequence)

  const Container = isDrawerContent ? 'div' : Card;

  return (
    <Container className={isDrawerContent ? "" : "max-h-[40vh] overflow-hidden !p-0"}>
      {!isDrawerContent && (
        <div className="border-b border-zinc-100 px-4 py-2.5 dark:border-zinc-800">
          <h3 className="text-xs font-bold text-zinc-900 dark:text-white uppercase tracking-tight">Stop sequence</h3>
          <p className="text-[10px] text-zinc-500">Live ETA and leg metrics</p>
        </div>
      )}
      <div className={isDrawerContent ? "h-full" : "max-h-[calc(40vh-4rem)] overflow-y-auto"}>
        <table className="w-full text-left text-xs">
          <thead className="sticky top-0 bg-zinc-50 dark:bg-zinc-900">
            <tr className="text-zinc-500 uppercase text-[9px] tracking-widest">
              <th className="px-6 py-3 font-bold">#</th>
              <th className="px-6 py-3 font-bold">Order</th>
              <th className="px-6 py-3 font-bold">Leg km</th>
              <th className="px-6 py-3 font-bold">ETA</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {stops.map((s, idx) => (
              <tr key={s.order_id} className="text-zinc-800 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                <td className="px-6 py-4 font-bold text-emerald-600 dark:text-emerald-400">
                  {idx + 1}
                </td>
                <td className="px-6 py-4 font-medium">#{formatId(s.order_id)}</td>
                <td className="px-6 py-4">{formatKm(s.distance_from_previous)}</td>
                <td className="px-6 py-4 whitespace-nowrap font-mono">{formatEta(s.eta)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Container>
  )
}
