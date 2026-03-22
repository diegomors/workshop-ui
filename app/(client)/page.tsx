import { getAllActiveRestaurants } from '@/lib/actions/restaurant'
import { HomeMapClient } from '@/components/map/home-map-client'

export default async function ClientHomePage() {
  // Fetch initial restaurants server-side
  const restaurants = await getAllActiveRestaurants()

  return (
    <div className="absolute inset-x-0 bottom-0 top-0 overflow-hidden bg-slate-50">
      {/* 
        The layout already has a sticky header. 
        This div will fill the rest of the flex container's space.
      */}
      <HomeMapClient initialRestaurants={restaurants} />
    </div>
  )
}
