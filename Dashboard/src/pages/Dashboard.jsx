import { useMemo, useState } from 'react'
import MapView from '../components/Map/MapView'
import Button from '../components/UI/Button'
import Card from '../components/UI/Card'
import Spinner from '../components/UI/Spinner'
import FleetOverview from '../components/Route/FleetOverview'
import ActiveRouteSummary from '../components/Route/ActiveRouteSummary'
import RouteDetailsPanel from '../components/Route/RouteDetailsPanel'
import CenterOrdersPanel from '../components/Route/CenterOrdersPanel'
import Drawer from '../components/UI/Drawer'
import { useApp } from '../context/AppContext'

export default function Dashboard() {
  const [showStopSequence, setShowStopSequence] = useState(false)
  const [showHubInventory, setShowHubInventory] = useState(false)
  const [showCenterOrders, setShowCenterOrders] = useState(false)
  const {
    centers,
    orders,
    vehicles,
    activeRoute,
    vehiclePosition,
    loading,
    generateRoutesAction,
    selectedCenterId,
    showZones,
    setShowZones,
  } = useApp()

  const ordersOnMap = useMemo(
    () =>
      orders.filter((o) => {
        // Show orders belonging to the selected center or orphans that are within range
        const isAssignedToCenter = !selectedCenterId || String(o.delivery_center_id) === String(selectedCenterId)
        if (isAssignedToCenter) return true

        // If orphan, check if near the selected center (approx 10km)
        if (o.delivery_center_id === null && selectedCenterId) {
          const center = centers.find(c => String(c.id) === String(selectedCenterId))
          if (center) {
            const dist = Math.sqrt(
              Math.pow(Number(o.latitude) - Number(center.latitude), 2) + 
              Math.pow(Number(o.longitude) - Number(center.longitude), 2)
            )
            // 0.09 deg is roughly 10km (Strict)
            return dist < 0.09 // ~10km (Strict)
          }
        }

        return false
      }),
    [orders, selectedCenterId]
  )

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
    return `Route #${r.route_id}`;
  };

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
            showOrderPins={true}
          />
        )}
      </section>

      <section className="flex w-full shrink-0 flex-col gap-4 lg:w-96 lg:max-w-md lg:overflow-y-auto custom-scrollbar">
        <Card className="p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-sm font-bold text-zinc-900 dark:text-white">
              Route optimization
            </h2>
            <div className="flex items-center gap-2">
               <span className="text-[10px] uppercase font-bold text-zinc-400">Zones</span>
               <button 
                 onClick={() => setShowZones(!showZones)}
                 className={`w-8 h-4 rounded-full transition-colors relative ${showZones ? 'bg-primary' : 'bg-zinc-300 dark:bg-zinc-700'}`}
               >
                 <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all ${showZones ? 'left-4.5' : 'left-0.5'}`} />
               </button>
            </div>

          </div>
          <Button
            className="mt-3 w-full"
            disabled={loading.generate || !selectedCenterId}
            onClick={() => generateRoutesAction()}
          >
            {loading.generate ? 'Generating…' : 'Generate Route'}
          </Button>

          {selectedCenterId && (
            <div className="mt-4 border-t border-zinc-100 pt-4 dark:border-zinc-800">
              <div className="flex items-center justify-between">
                <div className="flex gap-4">
                  <div>
                    <p className="text-[10px] font-bold uppercase text-zinc-500">Orders</p>
                    <p className="text-sm font-bold text-zinc-900 dark:text-white">
                      {orders.filter(o => {
                        const isForCenter = String(o.delivery_center_id) === String(selectedCenterId)
                        const isOrphan = o.delivery_center_id === null
                        return (isForCenter || isOrphan) && o.status !== 'delivered'
                      }).length}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase text-zinc-500">Vehicles</p>
                    <p className="text-sm font-bold text-zinc-900 dark:text-white">
                      {vehicles.filter(v => String(v.delivery_center_id) === String(selectedCenterId) && v.is_available).length}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowHubInventory(true)}
                  className="rounded-lg bg-zinc-100 px-3 py-1.5 text-[10px] font-bold text-zinc-900 hover:bg-zinc-200 transition-all dark:bg-zinc-800 dark:text-white dark:hover:bg-zinc-700"
                >
                  Manage Hub
                </button>
              </div>
            </div>
          )}
        </Card>

        <FleetOverview 
          onToggleSequence={() => setShowStopSequence(!showStopSequence)}
          showSequence={showStopSequence}
        />
        <ActiveRouteSummary 
          route={activeRoute} 
        />
      </section>

      <Drawer 
        open={showHubInventory} 
        onClose={() => setShowHubInventory(false)}
        title={`Hub Inventory - ${centers.find(c => String(c.id) === String(selectedCenterId))?.name || ''}`}
      >
        <CenterOrdersPanel centerId={selectedCenterId} isDrawerContent={true} />
      </Drawer>

      <Drawer 
        open={showStopSequence} 
        onClose={() => setShowStopSequence(false)}
        title={activeRoute ? `${getRouteName(activeRoute)} Stops` : 'Route Stops'}
      >
        <RouteDetailsPanel route={activeRoute} isDrawerContent={true} />
      </Drawer>
    </div>
  )
}
