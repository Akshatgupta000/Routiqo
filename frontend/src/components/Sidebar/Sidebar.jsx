import { NavLink } from 'react-router-dom'
import Card from '../UI/Card'
import Button from '../UI/Button'
import { useApp } from '../../context/AppContext'
import { formatDuration, formatKm } from '../../utils/format'

const linkClass = ({ isActive }) =>
  `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
    isActive
      ? 'bg-zinc-900 text-white shadow-md dark:bg-white dark:text-zinc-900'
      : 'text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800'
  }`

export default function Sidebar() {
  const {
    toggleTheme,
    theme,
    activeRoute,
    centers,
    selectedCenterId,
    setSelectedCenterId,
  } = useApp()

  const stops = activeRoute?.stops?.length ?? 0

  return (
    <div className="flex h-full min-h-0 w-full flex-col bg-transparent">
      <div className="flex items-center justify-between gap-2 border-b border-zinc-200/80 px-4 py-4 dark:border-zinc-800">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">
            Last-Mile
          </p>
          <h1 className="text-lg font-bold tracking-tight text-zinc-900 dark:text-white">
            RouteOps
          </h1>
        </div>
        <Button variant="secondary" className="!px-3 !py-2 text-xs" onClick={toggleTheme}>
          {theme === 'dark' ? 'Light' : 'Dark'}
        </Button>
      </div>

      <nav className="flex flex-1 flex-row flex-wrap gap-1 p-3 md:flex-col md:flex-nowrap">
        <NavLink to="/" end className={linkClass}>
          <span className="text-lg">⌖</span> Dashboard
        </NavLink>
        <NavLink to="/orders" className={linkClass}>
          <span className="text-lg">◎</span> Orders
        </NavLink>
        <NavLink to="/vehicles" className={linkClass}>
          <span className="text-lg">⎔</span> Vehicles
        </NavLink>
        <NavLink to="/routes" className={linkClass}>
          <span className="text-lg">⎘</span> Routes
        </NavLink>
      </nav>

      <div className="border-t border-zinc-200/80 p-3 dark:border-zinc-800">
        <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-zinc-500">
          Delivery center
        </label>
        <select
          className="mb-3 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 shadow-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
          value={selectedCenterId ?? ''}
          onChange={(e) =>
            setSelectedCenterId(e.target.value ? Number(e.target.value) : null)
          }
        >
          {centers.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>

        <Card className="!p-4">
          <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
            Active route
          </p>
          {activeRoute ? (
            <>
              <p className="mt-1 text-sm font-semibold text-zinc-900 dark:text-white">
                #{activeRoute.route_id} · {activeRoute.optimization_profile?.replace?.('_', ' ') ?? '—'}
              </p>
              <dl className="mt-3 space-y-2 text-xs text-zinc-600 dark:text-zinc-400">
                <div className="flex justify-between">
                  <dt>Stops</dt>
                  <dd className="font-semibold text-zinc-900 dark:text-white">{stops}</dd>
                </div>
                <div className="flex justify-between">
                  <dt>Distance</dt>
                  <dd className="font-semibold text-zinc-900 dark:text-white">
                    {formatKm(activeRoute.total_distance)}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt>Est. time</dt>
                  <dd className="font-semibold text-zinc-900 dark:text-white">
                    {formatDuration(activeRoute.total_time)}
                  </dd>
                </div>
              </dl>
            </>
          ) : (
            <p className="mt-2 text-xs text-zinc-500">Generate a route to see summary.</p>
          )}
        </Card>
      </div>
    </div>
  )
}
