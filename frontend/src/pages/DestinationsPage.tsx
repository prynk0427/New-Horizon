import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, MapPin, Filter, Heart, ArrowRight, Tag, X } from 'lucide-react'
import { destinationsApi, favouritesApi } from '@/services/api'
import type { Destination, Favourite } from '@/types'
import toast from 'react-hot-toast'

const CATEGORY_FILTERS = ['All', 'Nature', 'Heritage', 'Adventure', 'Culture', 'Food', 'Relaxation', 'Beach', 'Wildlife']

function DestinationCard({
  destination,
  isFavourited,
  onToggleFavourite,
}: {
  destination: Destination
  isFavourited: boolean
  onToggleFavourite: (dest: Destination) => void
}) {
  const navigate = useNavigate()
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.97 }}
      className="card-hover group"
    >
      <div className="relative h-52 overflow-hidden">
        <img
          src={destination.image_url || ''}
          alt={destination.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=600&auto=format&fit=crop' }}
        />
        <button
          onClick={(e) => { e.stopPropagation(); onToggleFavourite(destination) }}
          className={`absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center transition-all shadow-md ${
            isFavourited ? 'bg-red-500 text-white' : 'bg-white/90 text-slate-600 hover:bg-white'
          }`}
        >
          <Heart size={16} fill={isFavourited ? 'currentColor' : 'none'} />
        </button>
        {destination.category && (
          <div className="absolute top-3 left-3">
            <span className="badge bg-white/90 text-slate-700 text-xs shadow-sm">{destination.category}</span>
          </div>
        )}
      </div>
      <div className="p-5">
        <div className="flex items-start justify-between mb-2">
          <div>
            <h3 className="font-bold text-slate-900 text-lg leading-tight">{destination.name}</h3>
            <div className="flex items-center gap-1 text-slate-500 text-sm mt-0.5">
              <MapPin size={13} /> {destination.country}
            </div>
          </div>
        </div>
        <p className="text-slate-500 text-sm leading-relaxed mb-3 line-clamp-2">
          {destination.short_description || destination.description?.slice(0, 120)}
        </p>
        <div className="flex flex-wrap gap-1.5 mb-4">
          {destination.tags?.slice(0, 3).map(tag => (
            <span key={tag} className="badge-navy text-xs">{tag}</span>
          ))}
        </div>
        <div className="flex items-center justify-between">
          <div className="text-xs text-slate-500">
            {destination.best_time_to_visit && (
              <span>🗓 {destination.best_time_to_visit.split('(')[0].trim()}</span>
            )}
          </div>
          <button
            onClick={() => navigate(`/destinations/${destination.id}`)}
            className="text-teal-600 font-semibold text-sm flex items-center gap-1 hover:gap-2 transition-all"
          >
            Explore <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </motion.div>
  )
}

export default function DestinationsPage() {
  const [destinations, setDestinations] = useState<Destination[]>([])
  const [favourites, setFavourites] = useState<Favourite[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [activeFilter, setActiveFilter] = useState('All')

  useEffect(() => {
    Promise.all([
      destinationsApi.list(),
      favouritesApi.list().catch(() => []),
    ]).then(([dests, favs]) => {
      setDestinations(dests)
      setFavourites(favs)
    }).catch(() => toast.error('Failed to load destinations')).finally(() => setLoading(false))
  }, [])

  const handleToggleFavourite = async (dest: Destination) => {
    const existing = favourites.find(f => f.destination_id === dest.id)
    if (existing) {
      await favouritesApi.remove(existing.id)
      setFavourites(prev => prev.filter(f => f.id !== existing.id))
      toast.success('Removed from favourites')
    } else {
      const fav = await favouritesApi.add({
        destination_id: dest.id,
        destination_name: dest.name,
        destination_country: dest.country,
        image_url: dest.image_url,
      })
      setFavourites(prev => [...prev, fav])
      toast.success('Added to favourites ❤️')
    }
  }

  const filtered = destinations.filter(d => {
    const matchSearch = !search ||
      d.name.toLowerCase().includes(search.toLowerCase()) ||
      d.country.toLowerCase().includes(search.toLowerCase()) ||
      d.region?.toLowerCase().includes(search.toLowerCase())
    const matchFilter = activeFilter === 'All' ||
      d.tags?.some(t => t.toLowerCase() === activeFilter.toLowerCase()) ||
      d.category?.toLowerCase().includes(activeFilter.toLowerCase())
    return matchSearch && matchFilter
  })

  const favouriteIds = new Set(favourites.map(f => f.destination_id))

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-1">Destination Explorer</h1>
        <p className="text-slate-500">Discover curated destinations around the world.</p>
      </div>

      {/* Search & Filters */}
      <div className="mb-6 space-y-4">
        <div className="relative max-w-md">
          <Search size={18} className="absolute left-4 top-3.5 text-slate-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="input-field pl-11"
            placeholder="Search destinations, countries..."
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-3.5 text-slate-400 hover:text-slate-600">
              <X size={16} />
            </button>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          {CATEGORY_FILTERS.map(filter => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                activeFilter === filter
                  ? 'bg-teal-600 text-white shadow-sm'
                  : 'bg-white text-slate-600 border border-slate-200 hover:border-teal-300'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* Results count */}
      <div className="text-sm text-slate-500 mb-5">
        {loading ? 'Loading…' : `${filtered.length} destination${filtered.length !== 1 ? 's' : ''} found`}
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="card">
              <div className="skeleton h-52 rounded-none" />
              <div className="p-5 space-y-2">
                <div className="skeleton h-5 w-3/4 rounded" />
                <div className="skeleton h-4 w-1/2 rounded" />
                <div className="skeleton h-4 w-full rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <MapPin size={48} className="text-slate-200 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-slate-600 mb-2">No destinations found</h3>
          <p className="text-slate-400">Try a different search term or filter.</p>
          <button onClick={() => { setSearch(''); setActiveFilter('All') }} className="mt-4 btn-secondary text-sm py-2">
            Clear Filters
          </button>
        </div>
      ) : (
        <motion.div layout className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {filtered.map(dest => (
              <DestinationCard
                key={dest.id}
                destination={dest}
                isFavourited={favouriteIds.has(dest.id)}
                onToggleFavourite={handleToggleFavourite}
              />
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  )
}
