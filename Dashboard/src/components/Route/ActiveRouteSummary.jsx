import Card from '../UI/Card'
import { formatId } from '../../utils/format'
import Badge from '../UI/Badge'
import { formatDuration, formatKm } from '../../utils/format'

export default function ActiveRouteSummary({ route, onToggleSequence, showSequence }) {
  if (!route) {
    return (
      <Card>
        <p className="text-sm text-zinc-500">No route selected. Generate or pick a route.</p>
      </Card>
    )
  }

  const getRouteName = (route) => {
    if (route.route_name) return route.route_name;
    
    if (route?.stops?.length > 0) {
      const sorted = [...route.stops].sort((a, b) => a.sequence - b.sequence);
      const address = sorted[0]?.order?.address;
      if (address) {
        const parts = address.split(',').map(p => p.trim());
        let street = parts.find(p => /\b(Road|Rd|Street|St|Avenue|Ave|Marg|Highway|Hwy|Lane|Ln|Boulevard|Blvd|Drive|Dr|Way|Square|Sq|Plaza|Parkway|Pkwy|Alley|Court|Ct|Circle|Cir)\b/i.test(p));
        
        if (!street) {
          street = parts.length > 1 && /^[\d\-\#\s]+$/.test(parts[0]) ? parts[1] : parts[0];
        }
        
        if (street) {
          street = street.replace(/^[0-9\-\#]+\s+/, '');
          return `Route via ${street}`;
        }
      }
    }
    return `Route #${formatId(route.route_id)}`;
  };

  return (
    <Card>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
            Selected route
          </p>
          <p className="text-lg font-bold text-zinc-900 dark:text-white">
            {getRouteName(route)}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge status={route.status}>
            {typeof route.status === 'string'
              ? route.status.replaceAll('_', ' ')
              : route.status}
          </Badge>
        </div>
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
