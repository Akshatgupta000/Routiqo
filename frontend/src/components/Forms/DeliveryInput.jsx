import { useState } from 'react'
import Button from '../UI/Button'
import Card from '../UI/Card'
import { geocodeAddress } from '../../services/geocoding'
import { useApp } from '../../context/AppContext'

export default function DeliveryInput() {
  const { addDraftDelivery, draftDeliveries, clearDraftDeliveries, removeDraftDelivery, toast, setMapFocus } = useApp()
  const [address, setAddress] = useState('')
  const [loading, setLoading] = useState(false)

  const handleAdd = async (e) => {
    e?.preventDefault()
    if (!address.trim()) return

    setLoading(true)
    try {
      const result = await geocodeAddress(address)
      if (result) {
        addDraftDelivery({
          address: result.displayName,
          lat: result.lat,
          lng: result.lng,
        })
        setAddress('')
        setMapFocus({ lat: result.lat, lng: result.lng, zoom: 14 })
        toast('Delivery point added')
      } else {
        toast('Address not found', 'error')
      }
    } catch (err) {
      toast('Failed to geocode address', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="flex flex-col gap-4 p-4">
      <div>
        <h3 className="text-sm font-bold text-zinc-900 dark:text-white">Add Deliveries</h3>
        <p className="text-xs text-zinc-500">Enter locations to pin on the map</p>
      </div>

      <form className="flex gap-2" onSubmit={handleAdd}>
        <input
          className="min-w-0 flex-1 rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
          placeholder="Enter delivery address..."
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          disabled={loading}
        />
        <Button type="submit" disabled={loading || !address.trim()} className="shrink-0">
          {loading ? '...' : 'Add'}
        </Button>
      </form>

      {draftDeliveries.length > 0 && (
        <div className="mt-2 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase text-zinc-500">
              Recent Pins ({draftDeliveries.length})
            </span>
            <button
              onClick={clearDraftDeliveries}
              className="text-[10px] font-bold uppercase text-red-500 hover:text-red-600"
            >
              Clear All
            </button>
          </div>
          <ul className="max-h-40 overflow-y-auto rounded-lg border border-zinc-100 bg-zinc-50/50 p-1 dark:border-zinc-800 dark:bg-zinc-900/50">
            {draftDeliveries.slice().reverse().map((d) => (
              <li
                key={d.id}
                className="flex items-center justify-between gap-2 border-b border-zinc-100 px-2 py-1.5 last:border-0 dark:border-zinc-800"
              >
                <span className="truncate text-xs text-zinc-700 dark:text-zinc-300">
                  {d.address}
                </span>
                <button
                  onClick={() => removeDraftDelivery(d.id)}
                  className="text-zinc-400 hover:text-red-500"
                  title="Remove"
                >
                  ✕
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </Card>
  )
}
