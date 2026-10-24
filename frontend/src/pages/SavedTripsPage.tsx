import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { BookOpen, MapPin, Calendar, Users, Trash2, Eye, DollarSign, Compass, Edit2, Check, X } from 'lucide-react'
import { tripsApi } from '@/services/api'
import type { Trip } from '@/types'
import toast from 'react-hot-toast'

export default function SavedTripsPage() {
  const navigate = useNavigate()
  const [trips, setTrips] = useState<Trip[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editTitle, setEditTitle] = useState('')

  useEffect(() => {
    tripsApi.list().then(setTrips).catch(() => toast.error('Failed to load trips')).finally(() => setLoading(false))
  }, [])

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this trip?')) return
    await tripsApi.delete(id)
    setTrips(prev => prev.filter(t => t.id !== id))
    toast.success('Trip deleted')
  }

  const handleRename = async (trip: Trip) => {
    if (!editTitle.trim()) { setEditingId(null); return }
    try {
      const updated = await tripsApi.update(trip.id, { title: editTitle.trim() })
      setTrips(prev => prev.map(t => t.id === trip.id ? updated : t))
      toast.success('Trip renamed')
    } catch {
      toast.error('Failed to rename')
    }
    setEditingId(null)
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-1 flex items-center gap-3">
            <BookOpen className="text-teal-600" size={32} /> Saved Trips
          </h1>
          <p className="text-slate-500">{loading ? '…' : `${trips.length} trip${trips.length !== 1 ? 's' : ''} saved`}</p>
        </div>
        <button onClick={() => navigate('/plan')} className="btn-primary text-sm py-2.5">
          + New Trip
        </button>
      </div>

      {loading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3].map(i => <div key={i} className="skeleton h-52 rounded-2xl" />)}
        </div>
      ) : trips.length === 0 ? (
        <div className="card p-16 text-center">
          <Compass size={56} className="text-slate-200 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-slate-700 mb-2">No Saved Trips Yet</h3>
          <p className="text-slate-400 max-w-sm mx-auto mb-6">Start planning your first trip and save it to access it here anytime.</p>
          <button onClick={() => navigate('/plan')} className="btn-primary">Plan My First Trip</button>
        </div>
      ) : (
        <motion.div layout className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          <AnimatePresence>
            {trips.map((trip) => (
              <motion.div
                key={trip.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="card group"
              >
                <div className="p-5">
                  {/* Title with inline edit */}
                  <div className="flex items-start justify-between gap-2 mb-3">
                    {editingId === trip.id ? (
                      <div className="flex items-center gap-2 flex-1">
                        <input
                          autoFocus
                          value={editTitle}
                          onChange={e => setEditTitle(e.target.value)}
                          className="input-field py-1.5 text-sm flex-1"
                          onKeyDown={e => {
                            if (e.key === 'Enter') handleRename(trip)
                            if (e.key === 'Escape') setEditingId(null)
                          }}
                        />
                        <button onClick={() => handleRename(trip)} className="text-teal-600 hover:text-teal-700"><Check size={16} /></button>
                        <button onClick={() => setEditingId(null)} className="text-slate-400 hover:text-slate-600"><X size={16} /></button>
                      </div>
                    ) : (
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-slate-900 truncate">{trip.title}</h3>
                        {trip.is_demo === 1 && <span className="badge bg-amber-100 text-amber-700 text-xs mt-1">Demo</span>}
                      </div>
                    )}
                    {editingId !== trip.id && (
                      <button
                        onClick={() => { setEditingId(trip.id); setEditTitle(trip.title) }}
                        className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-teal-600 transition-all p-1"
                      >
                        <Edit2 size={14} />
                      </button>
                    )}
                  </div>

                  {/* Details */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                      <MapPin size={13} className="text-teal-500" />
                      {trip.destination}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                      <Calendar size={13} className="text-teal-500" />
                      {trip.start_date} → {trip.end_date}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-slate-500">
                      <span className="flex items-center gap-1.5"><Users size={13} className="text-teal-500" />{trip.num_travellers} traveller{trip.num_travellers !== 1 ? 's' : ''}</span>
                      <span className="flex items-center gap-1.5"><DollarSign size={13} className="text-teal-500" />{trip.currency} {trip.budget.toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Interests */}
                  {trip.interests?.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {trip.interests.slice(0, 3).map(int => <span key={int} className="badge-navy text-xs">{int}</span>)}
                      {trip.interests.length > 3 && <span className="badge-navy text-xs">+{trip.interests.length - 3}</span>}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2 pt-3 border-t border-slate-100">
                    <button
                      onClick={() => navigate(`/itinerary/${trip.id}`)}
                      className="flex-1 flex items-center justify-center gap-1.5 bg-teal-50 hover:bg-teal-100 text-teal-700 font-semibold py-2 rounded-xl text-sm transition-colors"
                    >
                      <Eye size={14} /> View
                    </button>
                    <button
                      onClick={() => handleDelete(trip.id)}
                      className="flex items-center justify-center gap-1.5 bg-red-50 hover:bg-red-100 text-red-600 font-semibold px-3 py-2 rounded-xl text-sm transition-colors"
                    >
                      <Trash2 size={14} />
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
