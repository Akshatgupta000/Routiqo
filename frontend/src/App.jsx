import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AppProvider } from './context/AppContext'
import Layout from './components/Layout/Layout'
import Dashboard from './pages/Dashboard'
import Orders from './pages/Orders'
import Vehicles from './pages/Vehicles'
import RoutesPage from './pages/Routes'

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/vehicles" element={<Vehicles />} />
            <Route path="/routes" element={<RoutesPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AppProvider>
  )
}
