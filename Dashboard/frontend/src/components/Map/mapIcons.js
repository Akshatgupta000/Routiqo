import L from 'leaflet'

export function centerIcon() {
  return L.divIcon({
    className: 'custom-marker-center',
    html: `<div class="flex h-10 w-10 items-center justify-center rounded-full border-2 border-white bg-blue-600 text-lg shadow-lg text-white">▣</div>`,
    iconSize: [40, 40],
    iconAnchor: [20, 20],
  })
}

export function orderIcon(color = '#ef4444', isPriority = false) {
  const size = isPriority ? 40 : 30
  const pinSize = isPriority ? 18 : 14
  const pulseSize = isPriority ? 36 : 28

  return L.divIcon({
    className: 'custom-marker-order-container',
    html: `
      <div class="order-pin-wrapper" style="width: ${size}px; height: ${size}px;">
        <div class="order-pulse ${isPriority ? 'order-pulse--priority' : ''}" style="background: ${color}4d; width: ${pulseSize}px; height: ${pulseSize}px;"></div>
        <div class="order-pin ${isPriority ? 'order-pin--priority' : ''}" style="background: ${color}; width: ${pinSize}px; height: ${pinSize}px;"></div>
      </div>
    `,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  })
}

export function numberedStopIcon(n, color = '#10b981', isPriority = false) {
  const borderClass = isPriority ? 'border-amber-400 border-[3px]' : 'border-white border-2'
  const shadowClass = isPriority ? 'shadow-[0_0_15px_rgba(251,191,36,0.5)]' : 'shadow-lg'
  const badge = isPriority ? '<div class="absolute -top-2 -right-2 bg-amber-400 text-white rounded-full w-4 h-4 flex items-center justify-center text-[8px] font-black border-2 border-white">★</div>' : ''
  
  return L.divIcon({
    className: 'custom-marker-stop',
    html: `
      <div class="relative flex h-9 w-9 items-center justify-center rounded-full ${borderClass} ${shadowClass} text-xs font-bold text-white transition-all scale-100 hover:scale-110" style="background: ${color}">
        ${n}
        ${badge}
      </div>
    `,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
  })
}

export function vehicleIcon(status = 'available') {
  const color = status === 'available' ? '#10b981' : '#ff0000'
  return L.divIcon({
    className: 'custom-marker-vehicle',
    html: `<div class="vehicle-rot" style="will-change: transform; transform: rotate(0deg); line-height: 1; font-size: 20px; filter: drop-shadow(0 1px 2px rgba(0,0,0,0.3)); color: ${color};">🚐</div>`,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  })
}

export function vehicleIconHighlighted(color = '#2563eb') {
  return L.divIcon({
    className: 'custom-marker-vehicle custom-marker-vehicle--highlighted',
    html: `
      <div class="relative">
        <div class="absolute inset-0 animate-ping rounded-full bg-blue-500/20" style="background-color: ${color}20;"></div>
        <div class="vehicle-rot" style="will-change: transform; transform: rotate(0deg); line-height: 1; font-size: 28px; filter: drop-shadow(0 2px 4px ${color}88); color: ${color}; position: relative; z-index: 10;">🚐</div>
      </div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  })
}
