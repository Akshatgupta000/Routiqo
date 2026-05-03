import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import * as api from '../services/api'
import { computeVehiclePosition } from '../utils/routeMap'

export const AppContext = createContext(null)

let toastId = 0

function readInitialTheme() {
  try {
    const saved = localStorage.getItem('theme')
    if (saved === 'dark' || saved === 'light') return saved
  } catch {
    /* ignore */
  }
  if (typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark'
  }
  return 'light'
}

function stripMeta(route) {
  if (!route) return null
  // eslint-disable-next-line no-unused-vars -- strip comparison attachment
  const { _comparisonRoute, ...rest } = route
  return rest
}

export function AppProvider({ children }) {
  const [theme, setTheme] = useState(readInitialTheme)
  const [centers, setCenters] = useState([])
  const [orders, setOrders] = useState([])
  const [vehicles, setVehicles] = useState([])
  const [routesList, setRoutesList] = useState([])
  const [comparisons, setComparisons] = useState([])
  const [activeRouteBase, setActiveRouteBase] = useState(null)
  const [activeProfile, setActiveProfile] = useState('shortest')
  const [selectedCenterId, setSelectedCenterId] = useState(null)
  const [loading, setLoading] = useState({ global: false })
  const [mapFocus, setMapFocus] = useState(null)
  const [toasts, setToasts] = useState([])
  const [bootstrapError, setBootstrapError] = useState(null)
  const [draftDeliveries, setDraftDeliveries] = useState([])
  const [osrmRoute, setOsrmRoute] = useState([])
  const [isSimulating, setIsSimulating] = useState(false)
  const [simProgress, setSimProgress] = useState(0)

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
    try {
      localStorage.setItem('theme', theme)
    } catch {
      /* ignore */
    }
  }, [theme])

  const toast = useCallback((message, type = 'success') => {
    const id = ++toastId
    setToasts((t) => [...t, { id, message, type }])
    setTimeout(() => {
      setToasts((t) => t.filter((x) => x.id !== id))
    }, 4500)
  }, [])

  const dismissToast = useCallback((id) => {
    setToasts((t) => t.filter((x) => x.id !== id))
  }, [])

  const toggleTheme = useCallback(() => {
    setTheme((t) => (t === 'dark' ? 'light' : 'dark'))
  }, [])

  const refreshCenters = useCallback(async () => {
    const data = await api.getCenters()
    const list = Array.isArray(data) ? data : data?.data ?? []
    setCenters(list)
    return list
  }, [])

  const addCenterAction = useCallback(async (payload) => {
    setLoading((l) => ({ ...l, addCenter: true }))
    try {
      const newCenter = await api.createCenter(payload)
      const list = await refreshCenters()
      
      // Auto-select and focus the new center
      setSelectedCenterId(newCenter.id)
      setMapFocus({
        lat: Number(newCenter.latitude),
        lng: Number(newCenter.longitude),
        zoom: 14
      })
      
      toast(`Delivery center "${newCenter.name}" added and centered.`)
      return newCenter
    } catch (e) {
      const msg = e?.response?.data?.message || e.message || 'Failed to add center'
      toast(msg, 'error')
      throw e
    } finally {
      setLoading((l) => ({ ...l, addCenter: false }))
    }
  }, [refreshCenters, toast])

  const fetchOSRMPath = useCallback(async (route) => {
    if (!route?.delivery_center || !route?.stops?.length) {
      setOsrmRoute([])
      return
    }

    const points = [
      [route.delivery_center.longitude, route.delivery_center.latitude],
      ...route.stops.map(s => [s.longitude, s.latitude]),
      [route.delivery_center.longitude, route.delivery_center.latitude] // Close loop
    ]

    const coordsStr = points.map(p => p.join(',')).join(';')
    const url = `https://router.project-osrm.org/route/v1/driving/${coordsStr}?overview=full&geometries=geojson`

    try {
      const response = await fetch(url)
      const data = await response.json()
      if (data.code === 'Ok' && data.routes?.[0]) {
        // Convert OSRM [lng, lat] to Leaflet [lat, lng]
        const points = data.routes[0].geometry.coordinates.map((p) => [p[1], p[0]])
        setOsrmRoute(points)
      }
    } catch (err) {
      console.error('OSRM Error:', err)
      setOsrmRoute([])
    }
  }, [])

  const refreshOrders = useCallback(async (filters = {}) => {
    const data = await api.getOrders({ per_page: 100, ...filters })
    const list = data?.data ?? data ?? []
    setOrders(Array.isArray(list) ? list : [])
    return list
  }, [])

  const refreshVehicles = useCallback(async () => {
    const data = await api.getVehicles()
    const list = Array.isArray(data) ? data : data?.data ?? []
    setVehicles(list)
    return list
  }, [])

  const refreshRoutes = useCallback(async () => {
    const data = await api.getRoutes()
    const list = data?.routes ?? data?.data ?? []
    setRoutesList(Array.isArray(list) ? list : [])
    return list
  }, [])

  const bootstrap = useCallback(async () => {
    setLoading((l) => ({ ...l, global: true }))
    setBootstrapError(null)
    try {
      await Promise.all([refreshCenters(), refreshOrders(), refreshVehicles(), refreshRoutes()])
    } catch (e) {
      const msg = e?.response?.data?.message || e.message || 'Failed to load data'
      setBootstrapError(
        typeof msg === 'string' ? msg : 'Failed to load data. Is the API running at the configured base URL?'
      )
      toast(msg, 'error')
    } finally {
      setLoading((l) => ({ ...l, global: false }))
    }
  }, [refreshCenters, refreshOrders, refreshVehicles, refreshRoutes, toast])

  useEffect(() => {
    const id = window.setTimeout(() => {
      void bootstrap()
    }, 0)
    return () => window.clearTimeout(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps -- load once on mount
  }, [])

  const attachComparison = useCallback((route, profile, comparisonsList) => {
    if (!route || !comparisonsList?.length) return route
    const batch = route.comparison_batch_id
    if (!batch) return route
    const row = comparisonsList.find((c) => c.comparison_batch_id === batch)
    if (!row) return route
    const other =
      profile === 'shortest' ? row.fastest_time_route : row.shortest_distance_route
    return { ...route, _comparisonRoute: other }
  }, [])

  const activeRoute = useMemo(
    () => attachComparison(activeRouteBase, activeProfile, comparisons),
    [activeRouteBase, activeProfile, comparisons, attachComparison]
  )

  const vehiclePosition = useMemo(
    () => computeVehiclePosition(activeRoute),
    [activeRoute]
  )

  const setActiveRoute = useCallback((route) => {
    setActiveRouteBase(stripMeta(route))
  }, [])

  const generateRoutesAction = useCallback(async (overrideCenterId = null) => {
    const centerToUse = overrideCenterId || selectedCenterId
    const payload =
      centerToUse != null ? { delivery_center_id: centerToUse } : {}
    setLoading((l) => ({ ...l, generate: true }))
    try {
      const data = await api.generateRoute(payload)
      const comps = data?.comparisons ?? []
      setComparisons(comps)
      if (!comps.length) {
        toast('No routes were generated.', 'error')
        return
      }
      const primary =
        activeProfile === 'shortest'
          ? comps[0].shortest_distance_route
          : comps[0].fastest_time_route
      
      const stripped = stripMeta(primary)
      setActiveRouteBase(stripped)
      
      // Fetch real road geometry for the new route
      void fetchOSRMPath(stripped)
      
      await Promise.all([refreshOrders(), refreshRoutes()])
      toast('Routes generated and optimized.')
    } catch (e) {
      const msg =
        e?.response?.data?.errors?.delivery_center_id?.[0] ||
        e?.response?.data?.message ||
        e.message ||
        'Generation failed'
      toast(msg, 'error')
    } finally {
      setLoading((l) => ({ ...l, generate: false }))
    }
  }, [selectedCenterId, activeProfile, refreshOrders, refreshRoutes, toast])

  const selectRouteFromList = useCallback((route) => {
    const stripped = stripMeta(route)
    setActiveRouteBase(stripped)
    fetchOSRMPath(stripped)
  }, [fetchOSRMPath])

  const addDraftDelivery = useCallback((delivery) => {
    setDraftDeliveries((prev) => [...prev, { ...delivery, id: Date.now() }])
  }, [])

  const removeDraftDelivery = useCallback((id) => {
    setDraftDeliveries((prev) => prev.filter((d) => d.id !== id))
  }, [])

  const startSimulation = useCallback(() => {
    if (!osrmRoute.length) return
    setIsSimulating(true)
    setSimProgress(0)
    
    let current = 0
    const interval = setInterval(() => {
      current += 1
      if (current >= osrmRoute.length) {
        clearInterval(interval)
        setIsSimulating(false)
        toast('Delivery simulation completed!')
      } else {
        setSimProgress(current)
      }
    }, 100) // Speed of simulation
  }, [osrmRoute, toast])

  const clearDraftDeliveries = useCallback(() => {
    setDraftDeliveries([])
  }, [])

  const value = useMemo(
    () => ({
      theme,
      setTheme,
      toggleTheme,
      centers,
      orders,
      vehicles,
      routesList,
      comparisons,
      setComparisons,
      activeRoute,
      setActiveRoute,
      activeProfile,
      setActiveProfile,
      selectedCenterId,
      setSelectedCenterId,
      loading,
      toasts,
      dismissToast,
      toast,
      refreshCenters,
      refreshOrders,
      refreshVehicles,
      refreshRoutes,
      bootstrap,
      generateRoutesAction,
      selectRouteFromList,
      vehiclePosition,
      bootstrapError,
      setMapFocus,
      addCenterAction,
      draftDeliveries,
      addDraftDelivery,
      removeDraftDelivery,
      clearDraftDeliveries,
      osrmRoute,
      isSimulating,
      simProgress,
      startSimulation,
    }),
    [
      theme,
      toggleTheme,
      centers,
      orders,
      vehicles,
      routesList,
      comparisons,
      activeRoute,
      setActiveRoute,
      activeProfile,
      selectedCenterId,
      loading,
      toasts,
      dismissToast,
      toast,
      refreshCenters,
      refreshOrders,
      refreshVehicles,
      refreshRoutes,
      bootstrap,
      generateRoutesAction,
      selectRouteFromList,
      vehiclePosition,
      bootstrapError,
      mapFocus,
      addCenterAction,
      draftDeliveries,
      addDraftDelivery,
      removeDraftDelivery,
      clearDraftDeliveries,
      osrmRoute,
      isSimulating,
      simProgress,
      startSimulation,
    ]
  )

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
