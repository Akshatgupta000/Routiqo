/** Laravel API base — matches axios client & enables direct browser calls (CORS). */
export const API_BASE =
  import.meta.env.VITE_API_URL?.trim() ||
  'http://localhost:8000/api'

export const PRIORITIES = ['priority', 'normal']

export const ORDER_STATUS = ['pending', 'assigned', 'delivered']
