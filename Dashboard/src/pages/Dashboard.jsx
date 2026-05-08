import { useMemo, useState } from 'react'
import { ChevronUp, ChevronDown, Activity, Map as MapIcon, Settings } from 'lucide-react'
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
  const [panelExpanded, setPanelExpanded] = useState(false)
  
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
        const isAssignedToCenter = !selectedCenterId || String(o.delivery_center_id) === String(selectedCenterId)
        if (isAssignedToCenter) return true

        if (o.delivery_center_id === null && selectedCenterId) {
          const center = centers.find(c => String(c.id) === String(selectedCenterId))
          if (center) {
            const dist = Math.sqrt(
              Math.pow(Number(o.latitude) - Number(center.latitude), 2) + 
              Math.pow(Number(o.longitude) - Number(center.longitude), 2)
            )
            return dist < 0.09
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
    <div className="relative flex h-full flex-col lg:flex-row overflow-hidden">
      {/* Map Section */}
      <section className="relative flex flex-1 flex-col overflow-hidden bg-zinc-50 dark:bg-zinc-900">
        <div className="absolute inset-0 z-0">
          {loading.global ? (
            <div className="flex h-full w-full flex-col items-center justify-center gap-3 bg-white/80 dark:bg-zinc-950/80">
              <Spinner className="h-10 w-10" />
              <p className="text-sm font-bold text-zinc-500">Loading map data…</p>
            </div>
          ) : (
            <MapView showOrderPins={true} />
          )}
        </div>
      </section>

      {/* Right Panel / Bottom Sheet */}
      <section 
        className={`
          fixed inset-x-0 bottom-0 z-20 flex flex-col bg-white/95 backdrop-blur-xl transition-all duration-500 ease-in-out dark:bg-zinc-900/95 lg:static lg:w-[400px] lg:translate-y-0 lg:border-l border-zinc-200 dark:border-zinc-800 lg:bg-transparent lg:backdrop-blur-none
          ${panelExpanded ? 'h-[85vh]' : 'h-16 lg:h-full'}
        `}
      >
        {/* Mobile Handle */}
        <div 
          className="flex shrink-0 items-center justify-between px-6 py-4 lg:hidden border-b border-zinc-100 dark:border-zinc-800"
          onClick={() => setPanelExpanded(!panelExpanded)}
        >
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-primary" />
            <span className="text-xs font-black uppercase tracking-widest text-zinc-900 dark:text-white">
              Route Controls
            </span>
          </div>
          <button className="rounded-full bg-zinc-100 p-1 dark:bg-zinc-800">
            {panelExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
          </button>
        </div>

        {/* Panel Content */}
        <div className={`flex flex-1 flex-col gap-4 p-4 lg:p-6 overflow-y-auto custom-scrollbar ${!panelExpanded ? 'hidden lg:flex' : 'flex'}`}>
          <Card className="p-5 border-none bg-zinc-50/50 dark:bg-zinc-800/30">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Settings className="h-4 w-4 text-zinc-400" />
                <h2 className="text-sm font-black uppercase tracking-wider text-zinc-900 dark:text-white">
                  Optimization
                </h2>
              </div>
              <div className="flex items-center gap-3">
                 <span className="text-[10px] uppercase font-black text-zinc-400">Zones</span>
                 <button 
                   onClick={() => setShowZones(!showZones)}
                   className={`w-9 h-5 rounded-full transition-all relative ${showZones ? 'bg-primary shadow-neon' : 'bg-zinc-300 dark:bg-zinc-700'}`}
                 >
                   <div className={`absolute top-1 w-3 h-3 bg-white rounded-full shadow-sm transition-all ${showZones ? 'left-5' : 'left-1'}`} />
                 </button>
              </div>
            </div>
            
            <Button
              className="w-full shadow-lg"
              disabled={loading.generate || !selectedCenterId}
              onClick={() => generateRoutesAction()}
            >
              {loading.generate ? 'Generating…' : 'Generate Optimal Route'}
            </Button>

            {selectedCenterId && (
              <div className="mt-5 border-t border-zinc-100 pt-5 dark:border-zinc-800/50">
                <div className="flex items-center justify-between">
                  <div className="flex gap-6">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Orders</p>
                      <p className="text-lg font-black text-zinc-900 dark:text-white">
                        {orders.filter(o => {
                          const isForCenter = String(o.delivery_center_id) === String(selectedCenterId)
                          const isOrphan = o.delivery_center_id === null
                          return (isForCenter || isOrphan) && o.status !== 'delivered'
                        }).length}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Vehicles</p>
                      <p className="text-lg font-black text-zinc-900 dark:text-white">
                        {vehicles.filter(v => String(v.delivery_center_id) === String(selectedCenterId) && v.is_available).length}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowHubInventory(true)}
                    className="rounded-xl bg-white px-4 py-2 text-[10px] font-black uppercase tracking-wider text-zinc-900 shadow-sm ring-1 ring-zinc-200 hover:bg-zinc-50 transition-all dark:bg-zinc-800 dark:text-white dark:ring-zinc-700 dark:hover:bg-zinc-700"
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
        </div>
      </section>

      {/* Drawers */}
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
