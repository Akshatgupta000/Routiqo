/** Laravel API base — matches axios client & enables direct browser calls (CORS). */
export const API_BASE =
  import.meta.env.VITE_API_URL?.trim() ||
  'http://127.0.0.1:8000/api'

export const PRIORITIES = ['low', 'medium', 'high']

export const ORDER_STATUS = ['pending', 'assigned', 'delivered']
