// Simple polyline decoder for OSRM routes
export function decodePolyline(str, precision = 5) {
  let index = 0
  let lat = 0
  let lng = 0
  const coordinates = []
  let shift = 0
  let result = 0
  let byte = null
  const factor = Math.pow(10, precision)

  while (index < str.length) {
    shift = 0
    result = 0
    do {
      byte = str.charCodeAt(index++) - 63
      result |= (byte & 0x1f) << shift
      shift += 5
    } while (byte >= 0x20)
    const dlat = result & 1 ? ~(result >> 1) : result >> 1
    lat += dlat

    shift = 0
    result = 0
    do {
      byte = str.charCodeAt(index++) - 63
      result |= (byte & 0x1f) << shift
      shift += 5
    } while (byte >= 0x20)
    const dlng = result & 1 ? ~(result >> 1) : result >> 1
    lng += dlng

    coordinates.push([lat / factor, lng / factor])
  }

  return coordinates
}
