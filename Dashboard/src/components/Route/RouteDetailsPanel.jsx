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
      <div className={isDrawerContent ? "h-full" : "max-h-[calc(40vh-4rem)] overflow-y-auto custom-scrollbar"}>
        <div className="p-3 space-y-3">
          {stops.map((s, idx) => (
            <div key={s.order_id} className="flex gap-3 p-3 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors border border-transparent hover:border-zinc-100 dark:hover:border-zinc-800 group">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-zinc-900 dark:bg-white font-black text-white dark:text-zinc-900 text-[10px] shadow-lg">
                {idx + 1}
              </div>
              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-black text-zinc-900 dark:text-white uppercase tracking-tight">Stop {idx + 1}</span>
                  {idx === 0 && <span className="px-1.5 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 text-[8px] font-black uppercase">Origin</span>}
                  {idx === (stops.length - 1) && <span className="px-1.5 py-0.5 rounded-md bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-[8px] font-black uppercase">Final</span>}
                </div>
                <span className="text-[12px] text-zinc-600 dark:text-zinc-400 leading-snug font-medium mb-1.5">
                  {s.order?.address || `Order #${formatId(s.order_id)}`}
                </span>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5">
                    <div className="w-1 h-1 rounded-full bg-zinc-300 dark:bg-zinc-600" />
                    <span className="text-[10px] font-bold text-zinc-400">ETA: {formatEta(s.eta)}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-1 h-1 rounded-full bg-zinc-300 dark:bg-zinc-600" />
                    <span className="text-[10px] font-bold text-zinc-400">Leg: {formatKm(s.distance_from_previous)}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Container>
  )
}
