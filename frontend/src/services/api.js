import axios from 'axios'
import { API_BASE } from '../utils/constants'

const client = axios.create({
  baseURL: API_BASE,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
  timeout: 60000,
})

client.interceptors.response.use(
  (response) => {
    if (import.meta.env.DEV) {
      console.debug('[API OK]', response.config.method?.toUpperCase(), response.config.url, response.data)
    }
    return response
  },
  (error) => {
    const msg =
      error?.response?.data?.message ||
      error?.response?.data?.errors ||
      error.message ||
      'Request failed'
    if (import.meta.env.DEV) {
      console.error('[API ERR]', error?.response?.status, error?.config?.url, msg)
    }
    return Promise.reject(error)
  }
)

export async function getCenters() {
  const { data } = await client.get('/centers')
  return data
}

export async function createCenter(payload) {
  const { data } = await client.post('/centers', payload)
  return data
}

export async function updateCenter(id, payload) {
  const { data } = await client.patch(`/centers/${id}`, payload)
  return data
}

export async function deleteCenter(id) {
  const { data } = await client.delete(`/centers/${id}`)
  return data
}

export async function getOrders(params = {}) {
  const { data } = await client.get('/orders', { params })
  return data
}

export async function createOrder(payload) {
  const { data } = await client.post('/orders', payload)
  return data
}

export async function updateOrder(id, payload) {
  const { data } = await client.patch(`/orders/${id}`, payload)
  return data
}

export async function deleteOrder(id) {
  const { data } = await client.delete(`/orders/${id}`)
  return data
}

export async function assignOrder(id) {
  const { data } = await client.post(`/orders/${id}/assign`)
  return data
}

export async function getVehicles(params = {}) {
  const { data } = await client.get('/vehicles', { params })
  return data
}

export async function createVehicle(payload) {
  const { data } = await client.post('/vehicles', payload)
  return data
}

export async function updateVehicle(id, payload) {
  const { data } = await client.patch(`/vehicles/${id}`, payload)
  return data
}

export async function resetFleet(payload = {}) {
  const { data } = await client.post('/vehicles/reset-fleet', payload)
  return data
}

export async function deleteVehicle(id) {
  const { data } = await client.delete(`/vehicles/${id}`)
  return data
}

export async function getZones() {
  const { data } = await client.get('/zones')
  return data
}

export async function saveZones(zones) {
  const { data } = await client.post('/zones/generate', { zones })
  return data
}

export async function generateRoute(payload = {}) {
  const { data } = await client.post('/routes/generate', payload)
  return data
}

export async function getRoutes() {
  const { data } = await client.get('/routes')
  return data
}

export async function getRoute(id) {
  const { data } = await client.get(`/routes/${id}`)
  return data
}

export async function regenerateRoutes(centerId) {
  const { data } = await client.post(`/routes/regenerate/${centerId}`)
  return data
}

export async function clearRoutes(payload = {}) {
  const { data } = await client.delete('/routes/clear', { data: payload })
  return data
}


export { client }
