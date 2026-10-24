import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { MapPin, Calendar, DollarSign, Heart, Compass, Cloud, ArrowLeft, Tag, Star } from 'lucide-react'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
import { destinationsApi, favouritesApi, weatherApi } from '@/services/api'
import type { Destination, Favourite, WeatherData } from '@/types'
import toast from 'react-hot-toast'

// Fix Leaflet default icon
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

function WeatherCard({ weather }: { weather: WeatherData }) {
  if (weather.error) {
    return (
      <div className="card p-5">
        <div className="flex items-center gap-2 mb-3">
          <Cloud size={18} className="text-sky-500" />
          <h3 className="font-bold text-slate-900">Weather</h3>
        </div>
        <p className="text-slate-500 text-sm">{weather.message || 'Weather data unavailable for this destination.'}</p>
      </div>
    )
  }

  const code = weather.current?.weather_code ?? 0
  const emoji = code <= 2 ? '☀️' : code <= 48 ? '⛅' : code <= 67 ? '🌧️' : '⛈️'

  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Cloud size={18} className="text-sky-500" />
          <h3 className="font-bold text-slate-900">Current Weather</h3>
        </div>
        <span className="text-xs text-slate-400">{weather.data_source}</span>
      </div>
      <div className="flex items-center gap-4 mb-4">
        <span className="text-4xl">{emoji}</span>
        <div>
          <div className="text-2xl font-bold text-slate-900">{weather.current?.temperature}°C</div>
          <div className="text-slate-500 text-sm">{weather.current?.description}</div>
        </div>
      </div>
      {weather.forecast && weather.forecast.length > 0 && (
        <div className="grid grid-cols-4 gap-2">
          {weather.forecast.slice(0, 4).map((day) => (
            <div key={day.date} className="text-center bg-sky-50 rounded-xl p-2.5">
              <div className="text-xs text-slate-500 mb-1">{new Date(day.date).toLocaleDateString('en', { weekday: 'short' })}</div>
              <div className="text-sm">{day.weather_code <= 2 ? '☀️' : day.weather_code <= 48 ? '⛅' : '🌧️'}</div>
              <div className="text-xs font-bold text-slate-700">{day.max_temp?.toFixed(0)}°</div>
            </div>
          ))}
        </div>
      )}
      {weather.travel_advice && weather.travel_advice.length > 0 && (
        <div className="mt-4 bg-amber-50 rounded-xl p-3">
          <h4 className="font-semibold text-amber-800 text-xs mb-1.5">Travel Advice</h4>
          <ul className="space-y-1">
            {weather.travel_advice.map((a, i) => <li key={i} className="text-amber-700 text-xs">• {a}</li>)}
          </ul>
        </div>
      )}
    </div>
  )
}

export default function DestinationDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [destination, setDestination] = useState<Destination | null>(null)
  const [favourites, setFavourites] = useState<Favourite[]>([])
  const [weather, setWeather] = useState<WeatherData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    Promise.all([
      destinationsApi.get(Number(id)),
      favouritesApi.list().catch(() => []),
    ]).then(([dest, favs]) => {
      setDestination(dest)
      setFavourites(favs)
      // Fetch weather
      if (dest.latitude && dest.longitude) {
        weatherApi.get({ destination: dest.name, latitude: dest.latitude, longitude: dest.longitude })
          .then(setWeather).catch(() => null)
      } else {
        weatherApi.get({ destination: dest.name }).then(setWeather).catch(() => null)
      }
    }).catch(() => toast.error('Destination not found')).finally(() => setLoading(false))
  }, [id])

  const isFavourited = favourites.some(f => f.destination_id === Number(id))

  const handleToggleFavourite = async () => {
    if (!destination) return
    const existing = favourites.find(f => f.destination_id === destination.id)
    if (existing) {
      await favouritesApi.remove(existing.id)
      setFavourites(prev => prev.filter(f => f.id !== existing.id))
      toast.success('Removed from favourites')
    } else {
      const fav = await favouritesApi.add({
        destination_id: destination.id,
        destination_name: destination.name,
        destination_country: destination.country,
        image_url: destination.image_url,
      })
      setFavourites(prev => [...prev, fav])
      toast.success('Added to favourites ❤️')
    }
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="skeleton h-80 rounded-2xl mb-6" />
        <div className="skeleton h-8 w-1/2 rounded mb-4" />
        <div className="skeleton h-4 w-full rounded mb-2" />
        <div className="skeleton h-4 w-3/4 rounded" />
      </div>
    )
  }

  if (!destination) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <MapPin size={48} className="text-slate-200 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-slate-700 mb-2">Destination not found</h2>
        <button onClick={() => navigate('/destinations')} className="btn-secondary mt-4">Back to Explorer</button>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back button */}
      <button onClick={() => navigate('/destinations')} className="flex items-center gap-2 text-slate-500 hover:text-slate-800 mb-6 transition-colors text-sm font-medium">
        <ArrowLeft size={16} /> Back to Destinations
      </button>

      {/* Hero image */}
      <div className="relative h-72 md:h-96 rounded-2xl overflow-hidden mb-8 shadow-md">
        <img
          src={destination.image_url || ''}
          alt={destination.name}
          className="w-full h-full object-cover"
          onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=1200&auto=format&fit=crop' }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        <div className="absolute bottom-6 left-6 text-white">
          <h1 className="text-4xl font-extrabold">{destination.name}</h1>
          <div className="flex items-center gap-2 text-white/80 mt-1">
            <MapPin size={15} /> {destination.country}{destination.region ? ` · ${destination.region}` : ''}
          </div>
        </div>
        <button
          onClick={handleToggleFavourite}
          className={`absolute top-4 right-4 w-11 h-11 rounded-full flex items-center justify-center shadow-lg transition-all ${
            isFavourited ? 'bg-red-500 text-white' : 'bg-white/90 text-slate-600 hover:bg-white'
          }`}
        >
          <Heart size={20} fill={isFavourited ? 'currentColor' : 'none'} />
        </button>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          <div className="card p-6">
            <h2 className="font-bold text-slate-900 text-xl mb-4">About {destination.name}</h2>
            <p className="text-slate-600 leading-relaxed">{destination.description}</p>
            <div className="flex flex-wrap gap-2 mt-4">
              {destination.tags?.map(tag => (
                <span key={tag} className="badge-teal">{tag}</span>
              ))}
            </div>
          </div>

          {/* Attractions */}
          {destination.attractions?.length > 0 && (
            <div className="card p-6">
              <h2 className="font-bold text-slate-900 text-xl mb-4">Top Attractions</h2>
              <div className="space-y-3">
                {destination.attractions.map((attr, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl">
                    <div className="w-8 h-8 rounded-lg bg-teal-100 flex items-center justify-center flex-shrink-0 text-teal-600 font-bold text-sm">
                      {i + 1}
                    </div>
                    <div>
                      <div className="font-semibold text-slate-900">{attr.name}</div>
                      <div className="text-slate-500 text-sm">{attr.description}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Map */}
          {destination.latitude && destination.longitude && (
            <div className="card overflow-hidden">
              <div className="p-5 border-b border-slate-100">
                <h2 className="font-bold text-slate-900 text-xl">Map</h2>
              </div>
              <div className="h-72">
                <MapContainer
                  center={[destination.latitude, destination.longitude]}
                  zoom={10}
                  style={{ height: '100%', width: '100%' }}
                  scrollWheelZoom={false}
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  <Marker position={[destination.latitude, destination.longitude]}>
                    <Popup>
                      <strong>{destination.name}</strong><br />
                      {destination.country}
                    </Popup>
                  </Marker>
                  {destination.attractions?.filter(a => a.latitude && a.longitude).map((attr, i) => (
                    <Marker key={i} position={[attr.latitude!, attr.longitude!]}>
                      <Popup>
                        <strong>{attr.name}</strong><br />
                        <span style={{ fontSize: '12px' }}>{attr.description}</span>
                      </Popup>
                    </Marker>
                  ))}
                </MapContainer>
              </div>
              <div className="p-3 bg-slate-50 text-xs text-slate-400 text-center">
                Map data © OpenStreetMap contributors
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-5">
          {/* Quick info */}
          <div className="card p-5">
            <h3 className="font-bold text-slate-900 mb-4">Quick Facts</h3>
            <div className="space-y-3">
              {destination.best_time_to_visit && (
                <div className="flex items-start gap-3 text-sm">
                  <Calendar size={16} className="text-teal-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="font-medium text-slate-700">Best Time to Visit</div>
                    <div className="text-slate-500">{destination.best_time_to_visit}</div>
                  </div>
                </div>
              )}
              {destination.budget_range && (
                <div className="flex items-start gap-3 text-sm">
                  <DollarSign size={16} className="text-teal-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="font-medium text-slate-700">Estimated Budget</div>
                    <div className="text-slate-500">{destination.budget_range}</div>
                    <div className="text-xs text-slate-400 mt-0.5">Approximate estimate only</div>
                  </div>
                </div>
              )}
              {destination.category && (
                <div className="flex items-start gap-3 text-sm">
                  <Tag size={16} className="text-teal-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="font-medium text-slate-700">Category</div>
                    <div className="text-slate-500">{destination.category}</div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Weather */}
          {weather && <WeatherCard weather={weather} />}

          {/* Plan Trip CTA */}
          <div className="bg-teal-600 rounded-2xl p-5 text-white">
            <Compass size={24} className="mb-3 text-teal-200" />
            <h3 className="font-bold text-lg mb-1">Plan a Trip Here</h3>
            <p className="text-teal-100 text-sm mb-4">Let AI build you a personalized {destination.name} itinerary.</p>
            <button
              onClick={() => navigate(`/plan?destination=${encodeURIComponent(destination.name)}`)}
              className="w-full bg-white text-teal-700 font-bold py-2.5 rounded-xl hover:bg-teal-50 transition-colors text-sm"
            >
              Plan with AI →
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
