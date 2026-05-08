import Button from '../components/UI/Button'
import Card from '../components/UI/Card'
import Table from '../components/UI/Table'
import { formatDuration, formatKm } from '../utils/format'
import { useApp } from '../context/AppContext'
import * as api from '../services/api'
import { useNavigate } from 'react-router-dom'
import { formatId } from '../utils/format'
import { Share2 } from 'lucide-react'
import { buildGoogleMapsLink } from '../utils/maps'
import Modal from '../components/UI/Modal'
import { useState } from 'react'

export default function Routes() {
  const {
    routesList,
    refreshRoutes,
    selectRouteFromList,
    toast,
    selectedCenterId,
    centers,
  } = useApp()
  const navigate = useNavigate()
  const [stopsRoute, setStopsRoute] = useState(null)

  const filtered = selectedCenterId
    ? routesList.filter((r) => r.delivery_center?.id === selectedCenterId)
    : routesList

  const getRouteName = (r) => {
    if (!r) return '';
    if (r.route_name) return r.route_name;
    if (r.stops?.length > 0) {
      const sorted = [...r.stops].sort((a, b) => a.sequence - b.sequence);
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
    return `Route #${formatId(r.route_id ?? r.id)}`;
  };

  const columns = [
    { key: 'route_id', label: 'Route Name', render: (r) => <span className="font-bold text-zinc-900 dark:text-zinc-100">{getRouteName(r)}</span> },
    {
      key: 'location',
      label: 'Main Location',
      render: (r) => {
        const stops = r.stops || [];
        const addr = stops[0]?.order?.address || 'No address'
        return (
          <button 
            onClick={(e) => {
              e.stopPropagation()
              setStopsRoute(r)
            }}
            className="flex flex-col text-left hover:opacity-70 transition-opacity group"
          >
            <span className="text-zinc-600 dark:text-zinc-400 line-clamp-1 max-w-[200px] text-xs font-medium border-b border-dashed border-zinc-300 dark:border-zinc-700 pb-0.5">
              {addr}
            </span>
            {stops.length > 1 && (
              <span className="text-[10px] text-zinc-400 mt-0.5">
                + {stops.length - 1} more stops
              </span>
            )}
          </button>
        )
      }
    },
    {
      key: 'driver',
      label: 'Driver',
      render: (r) => (
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center border border-zinc-200 dark:border-zinc-700 shadow-sm">
            <span className="text-[10px] font-black text-zinc-500 uppercase">
              {(r.vehicle?.name || 'U').charAt(0)}
            </span>
          </div>
          <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
            {r.vehicle?.name || 'Unassigned'}
          </span>
        </div>
      )
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
        <div className="flex items-center gap-2">
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
          <button
            onClick={(e) => {
              e.stopPropagation()
              const link = buildGoogleMapsLink(r, centers)
              if (link) {
                navigator.clipboard.writeText(link)
                toast('Route link copied to clipboard!')
              } else {
                toast('No stops to share', 'error')
              }
            }}
            title="Share Route"
            className="p-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-900 hover:text-white transition-all shadow-sm"
          >
            <Share2 className="w-3.5 h-3.5" />
          </button>
        </div>
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
    <div className="flex h-full flex-col overflow-auto p-4 lg:p-8">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl lg:text-3xl font-black tracking-tight text-zinc-900 dark:text-white">
            Routes
          </h1>
          <p className="text-sm font-medium text-zinc-500">History and inspection.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <Button 
            variant="ghost" 
            className="w-full sm:w-auto text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20" 
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
          <Button variant="secondary" onClick={regen} className="w-full sm:w-auto">
            Regenerate center
          </Button>
        </div>
      </div>

      <Card className="mb-6 p-4 text-[11px] font-bold uppercase tracking-widest text-zinc-400 bg-zinc-50/50 dark:bg-zinc-900/50 border-none">
        Showing routes for sidebar center filter when set. Open a route on the dashboard map to
        inspect polylines and simulation.
      </Card>

      <Table columns={columns} rows={filtered} empty="No routes yet. Generate from dashboard." />

      <Modal
        open={!!stopsRoute}
        onClose={() => setStopsRoute(null)}
        title={stopsRoute ? `Route Stops (${stopsRoute.stops?.length})` : 'Route Stops'}
        className="max-w-md"
      >
        <div className="space-y-4 py-2">
          <div className="flex flex-col gap-1 p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800">
            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Primary Location</p>
            <p className="text-sm font-bold text-zinc-900 dark:text-white">{getRouteName(stopsRoute)}</p>
          </div>
          
          <div className="space-y-3 max-h-[60vh] overflow-y-auto custom-scrollbar pr-2">
            {stopsRoute?.stops?.map((s, idx) => (
              <div key={idx} className="flex gap-4 p-3 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors border border-transparent hover:border-zinc-100 dark:hover:border-zinc-800 group">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-zinc-900 dark:bg-white font-black text-white dark:text-zinc-900 text-[10px] shadow-lg">
                  {idx + 1}
                </div>
                <div className="flex flex-col min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-xs font-black text-zinc-900 dark:text-white uppercase tracking-tight">Stop {idx + 1}</span>
                    {idx === 0 && <span className="px-1.5 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 text-[9px] font-black uppercase">Origin</span>}
                    {idx === (stopsRoute.stops.length - 1) && <span className="px-1.5 py-0.5 rounded-md bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-[9px] font-black uppercase">Final</span>}
                  </div>
                  <span className="text-[13px] text-zinc-600 dark:text-zinc-400 leading-relaxed font-medium">
                    {s.order?.address || 'Unknown address'}
                  </span>
                  {s.eta && <p className="mt-1 text-[10px] font-bold text-zinc-400">ETA: {s.eta}</p>}
                </div>
              </div>
            ))}
          </div>
          
          <Button variant="secondary" className="w-full" onClick={() => setStopsRoute(null)}>
            Close Details
          </Button>
        </div>
      </Modal>
    </div>
  )
}
