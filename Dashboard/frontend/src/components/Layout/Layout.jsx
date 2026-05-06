import { useEffect } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import Sidebar from '../Sidebar/Sidebar'
import ToastContainer from '../UI/ToastContainer'
import { useApp } from '../../context/AppContext'

export default function Layout() {
  const { toasts, dismissToast, bootstrapError } = useApp()
  const navigate = useNavigate()

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const tokenParam = params.get('token')
    const userParam = params.get('user')

    if (tokenParam) {
      localStorage.setItem('auth_token', tokenParam)
      if (userParam) {
        localStorage.setItem('user', decodeURIComponent(userParam))
      }
      // Clear the URL parameters and reload to ensure a fresh AppContext state
      window.history.replaceState({}, document.title, window.location.pathname)
      window.location.reload()
      return
    }

    const token = localStorage.getItem('auth_token')
    if (!token) {
      window.location.href = 'http://localhost:5173'
    }
  }, [])

  return (
    <div className="flex h-screen w-full flex-col overflow-hidden bg-zinc-100 text-zinc-900 sm:flex-row dark:bg-zinc-950 dark:text-zinc-100">
      <aside className="flex max-h-[38vh] w-full shrink-0 flex-col overflow-y-auto border-b border-zinc-200/90 bg-zinc-50/95 backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-950 sm:max-h-none sm:h-full sm:w-72 sm:max-w-[280px] sm:border-b-0 sm:border-r">
        <Sidebar />
      </aside>

      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        {bootstrapError && (
          <div
            className="border-b border-red-200 bg-red-50 px-4 py-2 text-center text-sm text-red-900 dark:border-red-900 dark:bg-red-950/80 dark:text-red-100"
            role="alert"
          >
            {bootstrapError}
          </div>
        )}
        <main className="relative flex min-h-0 flex-1 flex-col overflow-hidden">
          <Outlet />
        </main>
      </div>

      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  )
}
