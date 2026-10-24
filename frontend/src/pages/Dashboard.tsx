import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Compass, MapPin, PiggyBank, BookOpen, Cloud, ArrowRight, Zap, TrendingUp } from 'lucide-react'
import { tripsApi, destinationsApi, weatherApi } from '@/services/api'
import type { Trip, Destination, WeatherData } from '@/types'

function WeatherWidget({ destination }: { destination: string }) {
  const [weather, setWeather] = useState<WeatherData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!destination) return
    setLoading(true)
    weatherApi.get({ destination }).then(setWeather).catch(() => setWeather(null)).finally(() => setLoading(false))
  }, [destination])

  if (loading) return <div className="skeleton h-16 w-full rounded-xl" />
  if (!weather || weather.error) return null

  return (
    <div className="bg-sky-50 border border-sky-100 rounded-xl p-4 flex items-center gap-4">
      <div className="text-3xl">
        {(weather.current?.weather_code ?? 0) <= 2 ? '☀️' :
         (weather.current?.weather_code ?? 0) <= 48 ? '⛅' :
         (weather.current?.weather_code ?? 0) <= 67 ? '🌧️' : '⛈️'}
      </div>
      <div>
        <div className="font-bold text-slate-900">{destination}</div>
        <div className="text-sky-700 text-sm">{weather.current?.temperature}°C · {weather.current?.description}</div>
      </div>
    </div>
  )
}

export default function Dashboard() {
  const navigate = useNavigate()
  const [trips, setTrips] = useState<Trip[]>([])
  const [destinations, setDestinations] = useState<Destination[]>([])
  const [loading, setLoading] = useState(true)
  const [weatherDest, setWeatherDest] = useState('Paris')

  useEffect(() => {
    Promise.all([
      tripsApi.list().catch(() => []),
      destinationsApi.list().catch(() => []),
    ]).then(([tripsData, destsData]) => {
      setTrips(tripsData)
      setDestinations(destsData.slice(0, 6))
      if (tripsData.length > 0) {
        setWeatherDest(tripsData[0].destination)
      }
    }).finally(() => setLoading(false))
  }, [])

  const recentTrips = trips.slice(0, 3)
  const totalBudget = trips.reduce((sum, t) => sum + t.budget, 0)

  const quickActions = [
    { icon: Compass, label: 'Plan New Trip', desc: 'AI-powered itinerary', color: 'bg-teal-50 border-teal-200 text-teal-700', to: '/plan' },
    { icon: MapPin, label: 'Explore Destinations', desc: '12+ destinations', color: 'bg-amber-50 border-amber-200 text-amber-700', to: '/destinations' },
    { icon: PiggyBank, label: 'Budget Planner', desc: 'Estimate your costs', color: 'bg-violet-50 border-violet-200 text-violet-700', to: '/budget' },
    { icon: BookOpen, label: 'Saved Trips', desc: `${trips.length} saved`, color: 'bg-rose-50 border-rose-200 text-rose-700', to: '/saved' },
  ]

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-1">Welcome back! 🌍</h1>
        <p className="text-slate-500">Where are you exploring next?</p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {quickActions.map(({ icon: Icon, label, desc, color, to }) => (
          <motion.button
            key={to}
            whileHover={{ y: -2 }}
            onClick={() => navigate(to)}
            className={`p-5 rounded-2xl border text-left transition-all hover:shadow-md ${color}`}
          >
            <Icon size={24} className="mb-3" />
            <div className="font-bold text-sm">{label}</div>
            <div className="text-xs opacity-70 mt-0.5">{desc}</div>
          </motion.button>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Recent Trips */}
          <div className="card p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-bold text-slate-900 text-xl">Recent Trips</h2>
              <button onClick={() => navigate('/saved')} className="text-teal-600 text-sm font-medium hover:text-teal-700">
                View all →
              </button>
            </div>
            {loading ? (
              <div className="space-y-3">
                {[1, 2].map(i => <div key={i} className="skeleton h-16 rounded-xl" />)}
              </div>
            ) : recentTrips.length === 0 ? (
              <div className="text-center py-8">
                <Compass size={40} className="text-slate-300 mx-auto mb-3" />
                <p className="text-slate-400 mb-4">No trips yet. Start planning your first adventure!</p>
                <button onClick={() => navigate('/plan')} className="btn-primary text-sm py-2.5 px-5">
                  Plan My First Trip
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {recentTrips.map((trip) => (
                  <div
                    key={trip.id}
                    onClick={() => navigate(`/itinerary/${trip.id}`)}
                    className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 hover:bg-slate-100 cursor-pointer transition-colors"
                  >
                    <div className="w-10 h-10 rounded-xl bg-teal-100 flex items-center justify-center flex-shrink-0">
                      <MapPin size={18} className="text-teal-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-slate-900 truncate">{trip.title}</div>
                      <div className="text-xs text-slate-500">{trip.start_date} → {trip.end_date} · {trip.num_travellers} traveller{trip.num_travellers !== 1 ? 's' : ''}</div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="text-sm font-bold text-slate-900">{trip.currency} {trip.budget.toLocaleString()}</div>
                      {trip.is_demo === 1 && <span className="text-xs text-amber-600">Demo</span>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Featured Destinations */}
          <div className="card p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-bold text-slate-900 text-xl">Popular Destinations</h2>
              <button onClick={() => navigate('/destinations')} className="text-teal-600 text-sm font-medium hover:text-teal-700">
                Explore all →
              </button>
            </div>
            {loading ? (
              <div className="grid grid-cols-3 gap-3">
                {[1, 2, 3].map(i => <div key={i} className="skeleton h-28 rounded-xl" />)}
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {destinations.map((dest) => (
                  <div
                    key={dest.id}
                    onClick={() => navigate(`/destinations/${dest.id}`)}
                    className="group relative h-28 rounded-xl overflow-hidden cursor-pointer"
                  >
                    <img
                      src={dest.image_url || ''}
                      alt={dest.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=400&auto=format&fit=crop' }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                    <div className="absolute bottom-2 left-2 text-white">
                      <div className="text-xs font-bold leading-tight">{dest.name}</div>
                      <div className="text-xs opacity-70">{dest.country}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-5">
          {/* Weather */}
          <div className="card p-5">
            <div className="flex items-center gap-2 mb-4">
              <Cloud size={18} className="text-sky-500" />
              <h3 className="font-bold text-slate-900">Weather Preview</h3>
            </div>
            <WeatherWidget destination={weatherDest} />
            <div className="mt-3">
              <input
                type="text"
                placeholder="Check another city..."
                className="input-field text-sm py-2"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    setWeatherDest((e.target as HTMLInputElement).value)
                  }
                }}
              />
              <p className="text-xs text-slate-400 mt-1">Press Enter to check weather</p>
            </div>
          </div>

          {/* Stats */}
          <div className="card p-5">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp size={18} className="text-teal-500" />
              <h3 className="font-bold text-slate-900">Your Stats</h3>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Trips Planned</span>
                <span className="font-bold text-slate-900">{trips.length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Total Budget</span>
                <span className="font-bold text-slate-900">
                  {totalBudget > 0 ? `~$${totalBudget.toLocaleString()}` : '—'}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Destinations</span>
                <span className="font-bold text-slate-900">{new Set(trips.map(t => t.destination)).size || '—'}</span>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="bg-teal-600 rounded-2xl p-5 text-white">
            <Zap size={24} className="mb-3 text-teal-200" />
            <h3 className="font-bold text-lg mb-1">Plan with AI</h3>
            <p className="text-teal-100 text-sm mb-4">Get a complete personalized itinerary in seconds.</p>
            <button
              onClick={() => navigate('/plan')}
              className="w-full bg-white text-teal-700 font-bold py-2.5 rounded-xl hover:bg-teal-50 transition-colors flex items-center justify-center gap-2 text-sm"
            >
              Start Planning <ArrowRight size={15} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
