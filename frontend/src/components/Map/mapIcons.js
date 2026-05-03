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
    className: 'custom-marker-order',
    html: `<div class="h-3 w-3 rounded-full border-2 border-white shadow-md" style="background:${color}"></div>`,
    iconSize: [14, 14],
    iconAnchor: [7, 7],
  })
}

export function numberedStopIcon(n) {
  return L.divIcon({
    className: 'custom-marker-stop',
    html: `<div class="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-emerald-500 text-xs font-bold text-white shadow-lg">${n}</div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  })
}

export function vehicleIcon() {
  return L.divIcon({
    className: 'custom-marker-vehicle',
    html: `<div class="flex h-9 w-9 items-center justify-center rounded-full border-2 border-white bg-black text-lg shadow-xl dark:bg-white dark:text-black">🚐</div>`,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
  })
}
