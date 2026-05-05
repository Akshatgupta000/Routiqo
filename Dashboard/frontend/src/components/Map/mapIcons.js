import L from 'leaflet'

export function centerIcon() {
  return L.divIcon({
    className: 'custom-marker-center',
    html: `<div class="flex h-10 w-10 items-center justify-center rounded-full border-2 border-white bg-blue-600 text-lg shadow-lg text-white">▣</div>`,
    iconSize: [40, 40],
    iconAnchor: [20, 20],
  })
}

export function orderIcon(color = '#ef4444') {
  return L.divIcon({
    className: 'custom-marker-order-container',
    html: `
      <div class="order-pin-wrapper">
        <div class="order-pulse" style="background: ${color}4d"></div>
        <div class="order-pin" style="background: ${color}"></div>
      </div>
    `,
    iconSize: [30, 30],
    iconAnchor: [15, 15],
  })
}

export function numberedStopIcon(n, color = '#10b981') {
  return L.divIcon({
    className: 'custom-marker-stop',
    html: `<div class="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white text-xs font-bold text-white shadow-lg" style="background: ${color}">${n}</div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  })
}

export function vehicleIcon(status = 'available') {
  const bgClass = status === 'available' ? 'bg-emerald-500' : 'bg-red-500'
  return L.divIcon({
    className: 'custom-marker-vehicle',
    // We rotate ONLY the inner element so Leaflet's translate/position transform isn't affected.
    html: `<div class="flex items-center justify-center rounded-full border-2 border-white ${bgClass} shadow-xl text-white" style="width:26px;height:26px;">
      <div class="vehicle-rot" style="will-change: transform; transform: rotate(0deg); line-height: 1; font-size: 14px;">🚐</div>
    </div>`,
    iconSize: [26, 26],
    iconAnchor: [13, 13],
  })
}

export function vehicleIconHighlighted(color = '#2563eb') {
  return L.divIcon({
    className: 'custom-marker-vehicle custom-marker-vehicle--highlighted',
    html: `<div class="vehicle-highlight-wrapper">
      <div class="vehicle-highlight-ring" style="border-color: ${color}; box-shadow: 0 0 16px ${color}88, 0 0 32px ${color}44;"></div>
      <div class="vehicle-highlight-body" style="background: ${color}; box-shadow: 0 2px 12px ${color}88;">
        <div class="vehicle-rot" style="will-change: transform; transform: rotate(0deg); line-height: 1; font-size: 18px;">🚐</div>
      </div>
    </div>`,
    iconSize: [44, 44],
    iconAnchor: [22, 22],
  })
}
