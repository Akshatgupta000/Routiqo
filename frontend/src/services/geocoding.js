/**
 * Geocoding service using OpenStreetMap Nominatim API
 */
export async function geocodeAddress(query) {
  if (!query || query.trim().length < 3) return null

  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
    query
  )}&limit=1`

  try {
    const response = await fetch(url, {
      headers: {
        'Accept-Language': 'en',
        'User-Agent': 'LogiRoute-AI-Optimization-App',
      },
    })

    if (!response.ok) {
      throw new Error('Geocoding service unavailable')
    }

    const data = await response.json()

    if (!data || data.length === 0) {
      return null
    }

    const result = data[0]
    return {
      lat: parseFloat(result.lat),
      lng: parseFloat(result.lon),
      displayName: result.display_name,
    }
  } catch (error) {
    console.error('Geocoding error:', error)
    throw error
  }
}
