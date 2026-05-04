import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  useRef,
} from 'react'
import * as api from '../services/api'
import { computeVehiclePosition } from '../utils/routeMap'
import { buildPlaybackPathForRoute } from '../utils/simplePlaybackPath'
import { Delaunay } from 'd3-delaunay'

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
  const [activeMultiRoutes, setActiveMultiRoutes] = useState([])
  const [activeProfile, setActiveProfile] = useState('shortest')
  const [selectedCenterId, setSelectedCenterId] = useState(null)
  const [activeOrderId, setActiveOrderId] = useState(null)
  const [loading, setLoading] = useState({ global: false })
  const [mapFocus, setMapFocus] = useState(null)
  const [toasts, setToasts] = useState([])
  const [bootstrapError, setBootstrapError] = useState(null)
  const [draftDeliveries, setDraftDeliveries] = useState([])
  /** Map animation: idle | running | paused | completed */
  const [simulationPhase, setSimulationPhase] = useState('idle')
  /** Per-vehicle polyline used for simple step animation (see buildPlaybackPathForRoute). */
  const [routePlaybackCoords, setRoutePlaybackCoords] = useState(null)
  /** Per-vehicle index along routePlaybackCoords[vehicleId]. */
  const [routePlaybackStep, setRoutePlaybackStep] = useState({})
  const playbackPathsRef = useRef({})
  const playbackIntervalRef = useRef(null)
  const [serviceZones, setServiceZones] = useState([])
  const [showZones, setShowZones] = useState(true)

  const refreshZones = useCallback(async () => {
    try {
      const data = await api.getZones()
      setServiceZones(Array.isArray(data) ? data : [])
      return data
    } catch (e) {
      console.error('Failed to fetch zones', e)
      return []
    }
  }, [])

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
    let safeMessage = String(message)
    if (typeof message === 'object' && message !== null) {
      try {
        if (message.message) {
          safeMessage = message.message
        } else {
          safeMessage = JSON.stringify(message)
        }
      } catch (err) {
        safeMessage = '[Non-serializable Object]'
        console.error('Toast serialization failed', err)
      }
    }
      
    setToasts((t) => [...t, { id, message: safeMessage, type }])
    setTimeout(() => {
      setToasts((t) => t.filter((x) => x.id !== id))
    }, 4500)
  }, [])

  const clearPlaybackTimer = useCallback(() => {
    if (playbackIntervalRef.current != null) {
      window.clearInterval(playbackIntervalRef.current)
      playbackIntervalRef.current = null
    }
  }, [])

  const runPlaybackTimer = useCallback(() => {
    clearPlaybackTimer()
    playbackIntervalRef.current = window.setInterval(() => {
      setRoutePlaybackStep((prev) => {
        const paths = playbackPathsRef.current
        if (!paths || !Object.keys(paths).length) return prev

        const next = { ...prev }
        let allDone = true

        for (const vid of Object.keys(paths)) {
          const pts = paths[vid]
          if (!pts || pts.length < 2) continue
          const max = pts.length - 1
          const cur = next[vid] ?? 0
          if (cur < max) {
            next[vid] = cur + 1
            allDone = false
          }
        }

        if (allDone) {
          clearPlaybackTimer()
          window.setTimeout(() => {
            setSimulationPhase('completed')
            toast('Vehicles reached the end of the route.')
          }, 0)
        }

        return next
      })
    }, 100)
  }, [clearPlaybackTimer, toast])

  useEffect(() => () => clearPlaybackTimer(), [clearPlaybackTimer])

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
      await refreshCenters()
      
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
    
    // Deduplicate by route_id
    const uniqueList = Array.isArray(list) 
      ? Array.from(new Map(list.map(item => [item.route_id, item])).values())
      : []

    setRoutesList(uniqueList)
    return uniqueList
  }, [])

  const generateVoronoiZonesAction = useCallback(async () => {
    if (centers.length < 2) return

    setLoading((l) => ({ ...l, zones: true }))
    try {
      const points = centers.map((c) => [Number(c.latitude), Number(c.longitude)])
      const delaunay = Delaunay.from(points)
      
      // Large clipping bounds for city-scale coverage
      const minLat = Math.min(...points.map(p => p[0])) - 1
      const maxLat = Math.max(...points.map(p => p[0])) + 1
      const minLng = Math.min(...points.map(p => p[1])) - 1
      const maxLng = Math.max(...points.map(p => p[1])) + 1
      
      const voronoi = delaunay.voronoi([minLat, minLng, maxLat, maxLng])
      
      const zones = []
      for (let i = 0; i < centers.length; i++) {
        const polygon = voronoi.cellPolygon(i)
        if (polygon) {
          zones.push({
            hub_id: centers[i].id,
            polygon: polygon.map((p) => [p[0], p[1]])
          })
        }
      }
      
      if (zones.length > 0) {
        await api.saveZones(zones)
        await refreshZones()
      }
    } catch (e) {
      console.error('Voronoi generation failed', e)
    } finally {
      setLoading((l) => ({ ...l, zones: false }))
    }
  }, [centers, refreshZones])

  // Automatically sync zones when hubs change
  useEffect(() => {
    if (centers.length >= 2) {
      void generateVoronoiZonesAction()
    }
  }, [centers.length, generateVoronoiZonesAction])

  const bootstrap = useCallback(async () => {
    setLoading((l) => ({ ...l, global: true }))
    setBootstrapError(null)
    try {
      await Promise.all([
        refreshCenters(), 
        refreshOrders(), 
        refreshVehicles(), 
        refreshRoutes(),
        refreshZones()
      ])
    } catch (e) {
      const msg = e?.response?.data?.message || e.message || 'Failed to load data'
      setBootstrapError(
        typeof msg === 'string' ? msg : 'Failed to load data. Is the API running at the configured base URL?'
      )
      toast(msg, 'error')
    } finally {
      setLoading((l) => ({ ...l, global: false }))
    }
  }, [refreshCenters, refreshOrders, refreshVehicles, refreshRoutes, refreshZones, toast])

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

  const resetFleetSimulation = useCallback(
    ({ silent = false } = {}) => {
      clearPlaybackTimer()
      playbackPathsRef.current = {}
      setRoutePlaybackCoords(null)
      setRoutePlaybackStep({})
      setSimulationPhase('idle')
      if (!silent) toast('Fleet simulation reset.')
    },
    [toast, clearPlaybackTimer]
  )

  const resetSelection = useCallback(() => {
    resetFleetSimulation({ silent: true })
    setSelectedCenterId(null)
    setActiveRouteBase(null)
    setActiveMultiRoutes([])
    setActiveOrderId(null)
    setMapFocus(null)
  }, [resetFleetSimulation])

  const generateRoutesAction = useCallback(async (overrideCenterId = null) => {
    const centerToUse = overrideCenterId || selectedCenterId
    const payload =
      centerToUse != null ? { delivery_center_id: centerToUse } : {}
    setLoading((l) => ({ ...l, generate: true }))
    try {
      let data
      if (activeMultiRoutes.length > 0 && centerToUse) {
        data = await api.regenerateRoutes(centerToUse)
      } else {
        data = await api.generateRoute(payload)
      }
      
      const comps = data?.comparisons ?? []
      setComparisons(comps)
      
      if (!comps.length) {
        setActiveMultiRoutes([])
        setActiveRouteBase(null)
        toast('No pending orders in this hub\'s zone.', 'info')
        return
      }
      const allPrimaryRoutes = comps.map(c => 
        activeProfile === 'shortest' ? c.shortest_distance_route : c.fastest_time_route
      )
      
      setActiveMultiRoutes(allPrimaryRoutes.map(stripMeta))
      if (allPrimaryRoutes.length > 0) {
        setActiveRouteBase(stripMeta(allPrimaryRoutes[0]))
      }
      
      // Keep first one as the main active route for backwards compatibility / simulation
      if (allPrimaryRoutes.length > 0) {
        setActiveRouteBase(stripMeta(allPrimaryRoutes[0]))
      }
      
      await Promise.all([refreshOrders(), refreshRoutes()])
      resetFleetSimulation({ silent: true })
      toast(`Routes generated for ${allPrimaryRoutes.length} vehicles.`)
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
  }, [
    selectedCenterId,
    activeProfile,
    refreshOrders,
    refreshRoutes,
    toast,
    activeMultiRoutes.length,
    resetFleetSimulation,
  ])

  const selectRouteFromList = useCallback((route) => {
    const stripped = stripMeta(route)
    setActiveRouteBase(stripped)
  }, [])


  const addDraftDelivery = useCallback((delivery) => {
    setDraftDeliveries((prev) => [...prev, { ...delivery, id: Date.now() }])
  }, [])

  const removeDraftDelivery = useCallback((id) => {
    setDraftDeliveries((prev) => prev.filter((d) => d.id !== id))
  }, [])

  const startFleetSimulation = useCallback(() => {
    const routesToSimulate =
      activeMultiRoutes.length > 0 ? activeMultiRoutes : activeRoute ? [activeRoute] : []

    if (!routesToSimulate.length) return

    /** @type {Record<string, Array<[number, number]>>} */
    const paths = {}

    for (const r of routesToSimulate) {
      const vid = String(r?.vehicle_id ?? r.vehicle?.id ?? '')
      if (!vid || vid === 'undefined') continue
      const pts = buildPlaybackPathForRoute(r, centers)
      if (pts.length >= 2) {
        paths[vid] = pts
      }
    }

    const keys = Object.keys(paths)

    if (keys.length === 0) {
      toast(
        'No path to animate. Optimize routes again, or check that stops have latitude/longitude.',
        'error'
      )
      return
    }

    clearPlaybackTimer()
    playbackPathsRef.current = paths
    setRoutePlaybackCoords(paths)

    const initialSteps = {}
    keys.forEach((k) => {
      initialSteps[k] = 0
    })
    setRoutePlaybackStep(initialSteps)

    setSimulationPhase('running')
    runPlaybackTimer()
    toast(`Moving ${keys.length} vehicle(s) along the route.`)
  }, [activeMultiRoutes, activeRoute, centers, toast, clearPlaybackTimer, runPlaybackTimer])

  const pauseFleetSimulation = useCallback(() => {
    clearPlaybackTimer()
    setSimulationPhase((p) => (p === 'running' ? 'paused' : p))
  }, [clearPlaybackTimer])

  const resumeFleetSimulation = useCallback(() => {
    setSimulationPhase((p) => {
      if (p !== 'paused') return p
      window.setTimeout(() => runPlaybackTimer(), 0)
      return 'running'
    })
  }, [runPlaybackTimer])

  const resetFleetAction = useCallback(async (centerId = null) => {
    setLoading((l) => ({ ...l, resetFleet: true }))
    try {
      const payload = centerId ? { delivery_center_id: centerId } : {}
      await api.resetFleet(payload)
      await refreshVehicles()
      toast('Fleet status reset to available.')
    } catch {
      toast('Failed to reset fleet.', 'error')
    } finally {
      setLoading((l) => ({ ...l, resetFleet: false }))
    }
  }, [refreshVehicles, toast])

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
      activeMultiRoutes,
      setActiveRouteBase,
      activeProfile,
      setActiveProfile,
      selectedCenterId,
      setSelectedCenterId,
      activeOrderId,
      setActiveOrderId,
      loading,
      setLoading,
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
      setMapFocus,
      addCenterAction,
      draftDeliveries,
      addDraftDelivery,
      removeDraftDelivery,
      clearDraftDeliveries,
      simulationPhase,
      isSimulating: simulationPhase === 'running',
      routePlaybackCoords,
      routePlaybackStep,
      startFleetSimulation,
      pauseFleetSimulation,
      resumeFleetSimulation,
      resetFleetSimulation,
      resetSelection,
      resetFleetAction,
      serviceZones,
      showZones,
      setShowZones,
      refreshZones,
      generateVoronoiZonesAction,
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
      activeMultiRoutes,
      setActiveRouteBase,
      activeProfile,
      selectedCenterId,
      activeOrderId,
      loading,
      setLoading,
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
      setMapFocus,
      addCenterAction,
      draftDeliveries,
      addDraftDelivery,
      removeDraftDelivery,
      clearDraftDeliveries,
      simulationPhase,
      routePlaybackCoords,
      routePlaybackStep,
      startFleetSimulation,
      pauseFleetSimulation,
      resumeFleetSimulation,
      resetFleetSimulation,
      resetSelection,
      resetFleetAction,
      serviceZones,
      showZones,
      refreshZones,
      generateVoronoiZonesAction,
    ]
  )

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
