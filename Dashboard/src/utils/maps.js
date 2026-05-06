/**
 * Utility to build a Google Maps navigation link.
 * 
 * @param {Object} route - The route object containing stops.
 * @param {Array} centers - List of delivery centers to find the hub.
 * @returns {string} - Formatted Google Maps URL.
 */
export const buildGoogleMapsLink = (route, centers = []) => {
  if (!route || !route.stops || route.stops.length === 0) return "";

  // Find the hub (delivery center)
  const center =
    route.delivery_center ||
    centers.find((c) => String(c.id) === String(route.delivery_center_id));

  if (!center) return "";

  const origin = `${center.latitude},${center.longitude}`;
  
  // Sort stops by sequence
  const stops = [...route.stops].sort((a, b) => a.sequence - b.sequence);
  
  // Google Maps URL scheme allows up to ~10 waypoints in the free tier/simple URL.
  // We'll slice to ensure reliability, but we could also just send all and let Google handle it.
  // The user requested handling waypoint limits (10-15).
  const maxStops = 10;
  const stopsToInclude = stops.slice(0, maxStops);

  const destination = `${stopsToInclude[stopsToInclude.length - 1].lat},${stopsToInclude[stopsToInclude.length - 1].lng}`;

  // Waypoints are everything between origin and destination
  const waypoints = stopsToInclude
    .slice(0, -1)
    .map((s) => `${s.lat},${s.lng}`)
    .join('|');

  return `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}${
    waypoints ? `&waypoints=${waypoints}` : ""
  }&travelmode=driving`;
};
