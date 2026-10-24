import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Heart, MapPin, Trash2, Compass, ArrowRight } from 'lucide-react'
import { favouritesApi } from '@/services/api'
import type { Favourite } from '@/types'
import toast from 'react-hot-toast'

export default function FavouritesPage() {
  const navigate = useNavigate()
  const [favourites, setFavourites] = useState<Favourite[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    favouritesApi.list().then(setFavourites).catch(() => toast.error('Failed to load favourites')).finally(() => setLoading(false))
  }, [])

  const handleRemove = async (id: number) => {
    await favouritesApi.remove(id)
    setFavourites(prev => prev.filter(f => f.id !== id))
    toast.success('Removed from favourites')
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-1 flex items-center gap-3">
            <Heart className="text-red-500" size={32} /> Favourites
          </h1>
          <p className="text-slate-500">{loading ? '…' : `${favourites.length} saved destination${favourites.length !== 1 ? 's' : ''}`}</p>
        </div>
        <button onClick={() => navigate('/destinations')} className="btn-secondary text-sm py-2.5">
          Explore More
        </button>
      </div>

      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3].map(i => <div key={i} className="skeleton h-40 rounded-2xl" />)}
        </div>
      ) : favourites.length === 0 ? (
        <div className="card p-16 text-center">
          <Heart size={56} className="text-slate-200 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-slate-700 mb-2">No Favourites Yet</h3>
          <p className="text-slate-400 max-w-sm mx-auto mb-6">Heart any destination while exploring to save it here.</p>
          <button onClick={() => navigate('/destinations')} className="btn-primary">Explore Destinations</button>
        </div>
      ) : (
        <motion.div layout className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <AnimatePresence>
            {favourites.map((fav) => (
              <motion.div
                key={fav.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="card group overflow-hidden"
              >
                <div className="relative h-40">
                  <img
                    src={fav.image_url || ''}
                    alt={fav.destination_name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=600&auto=format&fit=crop' }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  <button
                    onClick={() => handleRemove(fav.id)}
                    className="absolute top-3 right-3 w-8 h-8 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition-colors shadow"
                  >
                    <Trash2 size={13} />
                  </button>
                  <div className="absolute bottom-3 left-3 text-white">
                    <div className="font-bold text-sm">{fav.destination_name}</div>
                    {fav.destination_country && (
                      <div className="flex items-center gap-1 text-xs text-white/80">
                        <MapPin size={11} /> {fav.destination_country}
                      </div>
                    )}
                  </div>
                </div>
                <div className="p-4 flex items-center justify-between">
                  <span className="text-xs text-slate-400">Saved {fav.created_at ? new Date(fav.created_at).toLocaleDateString() : ''}</span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => navigate(`/plan?destination=${encodeURIComponent(fav.destination_name)}`)}
                      className="text-xs text-teal-600 font-medium flex items-center gap-1 hover:text-teal-700 transition-colors"
                    >
                      Plan <Compass size={12} />
                    </button>
                    <button
                      onClick={() => navigate('/destinations')}
                      className="text-xs text-slate-500 font-medium flex items-center gap-1 hover:text-slate-700 transition-colors"
                    >
                      View <ArrowRight size={12} />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  )
}
