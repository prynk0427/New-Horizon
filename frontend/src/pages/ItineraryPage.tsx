import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  MapPin, Calendar, Users, DollarSign, Edit2, Trash2, Plus, Save,
  RefreshCw, ArrowLeft, AlertCircle, Clock, Map, ChevronRight
} from 'lucide-react'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
import { tripsApi } from '@/services/api'
import type { Trip, Activity, DayItinerary } from '@/types'
import toast from 'react-hot-toast'

delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

function ActivityCard({
  activity,
  currency,
  onEdit,
  onDelete,
}: {
  activity: Activity
  currency: string
  onEdit: (activity: Activity) => void
  onDelete: (id: string) => void
}) {
  return (
    <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 group hover:border-teal-200 transition-colors">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-semibold text-slate-900">{activity.name}</span>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 mb-2">
            <span className="flex items-center gap-1"><Clock size={11} />{activity.time}</span>
            <span className="flex items-center gap-1">⏱ {activity.duration}</span>
            {activity.location && <span className="flex items-center gap-1"><MapPin size={11} />{activity.location}</span>}
          </div>
          <p className="text-slate-600 text-sm">{activity.description}</p>
        </div>
        <div className="flex flex-col items-end gap-2 flex-shrink-0">
          <span className="badge-teal text-xs">~{currency} {activity.estimated_cost}</span>
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button onClick={() => onEdit(activity)} className="p-1.5 rounded-lg hover:bg-teal-50 text-slate-400 hover:text-teal-600 transition-colors">
              <Edit2 size={13} />
            </button>
            <button onClick={() => onDelete(activity.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors">
              <Trash2 size={13} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function EditActivityModal({
  activity,
  currency,
  onSave,
  onClose,
}: {
  activity: Activity | null
  currency: string
  onSave: (activity: Activity) => void
  onClose: () => void
}) {
  const [form, setForm] = useState<Activity>(activity || {
    id: crypto.randomUUID(),
    name: '',
    description: '',
    time: '09:00',
    duration: '1 hour',
    estimated_cost: 0,
    location: '',
    category: 'morning',
  })

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="card p-6 w-full max-w-md">
        <h3 className="font-bold text-slate-900 text-lg mb-4">{activity ? 'Edit Activity' : 'Add Activity'}</h3>
        <div className="space-y-3">
          <input
            className="input-field"
            placeholder="Activity name"
            value={form.name}
            onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
          />
          <textarea
            className="input-field resize-none"
            rows={3}
            placeholder="Description"
            value={form.description}
            onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
          />
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label text-xs">Time</label>
              <input type="time" className="input-field" value={form.time} onChange={e => setForm(f => ({ ...f, time: e.target.value }))} />
            </div>
            <div>
              <label className="label text-xs">Duration</label>
              <input className="input-field" placeholder="e.g. 2 hours" value={form.duration} onChange={e => setForm(f => ({ ...f, duration: e.target.value }))} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label text-xs">Est. Cost ({currency})</label>
              <input type="number" className="input-field" value={form.estimated_cost} onChange={e => setForm(f => ({ ...f, estimated_cost: Number(e.target.value) }))} />
            </div>
            <div>
              <label className="label text-xs">Slot</label>
              <select className="input-field" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value as any }))}>
                <option value="morning">Morning</option>
                <option value="afternoon">Afternoon</option>
                <option value="evening">Evening</option>
              </select>
            </div>
          </div>
          <input className="input-field" placeholder="Location" value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} />
        </div>
        <div className="flex gap-3 mt-5">
          <button onClick={() => onSave(form)} className="btn-primary flex-1 py-2.5 text-sm">Save Activity</button>
          <button onClick={onClose} className="btn-secondary flex-1 py-2.5 text-sm">Cancel</button>
        </div>
      </motion.div>
    </div>
  )
}

export default function ItineraryPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [trip, setTrip] = useState<Trip | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeDay, setActiveDay] = useState(0)
  const [editingActivity, setEditingActivity] = useState<Activity | null | undefined>(undefined)
  const [showMap, setShowMap] = useState(false)

  useEffect(() => {
    if (!id) return
    tripsApi.get(Number(id)).then(setTrip).catch(() => toast.error('Trip not found')).finally(() => setLoading(false))
  }, [id])

  const itinerary = trip?.itinerary_data
  const day = itinerary?.days[activeDay]
  const currency = trip?.currency || 'USD'

  const updateItinerary = (days: DayItinerary[]) => {
    if (!trip || !itinerary) return
    const updated = { ...itinerary, days, total_estimated_cost: days.reduce((s, d) => s + d.daily_budget, 0) }
    setTrip(t => t ? { ...t, itinerary_data: updated } : t)
  }

  const handleDeleteActivity = (dayIdx: number, slot: 'morning' | 'afternoon' | 'evening', actId: string) => {
    if (!itinerary) return
    const days = itinerary.days.map((d, i) => {
      if (i !== dayIdx) return d
      const updated = { ...d, [slot]: d[slot].filter((a: Activity) => a.id !== actId) }
      updated.daily_budget = [...updated.morning, ...updated.afternoon, ...updated.evening].reduce((s, a) => s + a.estimated_cost, 0)
      return updated
    })
    updateItinerary(days)
    toast.success('Activity removed')
  }

  const handleSaveActivity = (dayIdx: number, slot: 'morning' | 'afternoon' | 'evening', activity: Activity) => {
    if (!itinerary) return
    const days = itinerary.days.map((d, i) => {
      if (i !== dayIdx) return d
      const existing = d[slot].find((a: Activity) => a.id === activity.id)
      const newSlot = existing ? d[slot].map((a: Activity) => a.id === activity.id ? activity : a) : [...d[slot], { ...activity, id: activity.id || crypto.randomUUID() }]
      const updated = { ...d, [slot]: newSlot }
      updated.daily_budget = [...updated.morning, ...updated.afternoon, ...updated.evening].reduce((s, a) => s + a.estimated_cost, 0)
      return updated
    })
    updateItinerary(days)
    setEditingActivity(undefined)
  }

  const handleSaveTrip = async () => {
    if (!trip) return
    setSaving(true)
    try {
      await tripsApi.update(trip.id, { itinerary_data: trip.itinerary_data })
      toast.success('Trip saved!')
    } catch {
      toast.error('Failed to save')
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteTrip = async () => {
    if (!trip || !confirm('Delete this trip?')) return
    await tripsApi.delete(trip.id)
    toast.success('Trip deleted')
    navigate('/saved')
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="skeleton h-16 rounded-2xl mb-6" />
        <div className="skeleton h-96 rounded-2xl" />
      </div>
    )
  }

  if (!trip || !itinerary) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <h2 className="text-xl font-bold text-slate-700 mb-2">Trip not found</h2>
        <button onClick={() => navigate('/saved')} className="btn-secondary mt-4">View Saved Trips</button>
      </div>
    )
  }

  // Get all attraction coordinates from trip destination
  const totalCost = itinerary.days.reduce((s, d) => s + d.daily_budget, 0)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {editingActivity !== undefined && (
        <EditActivityModal
          activity={editingActivity}
          currency={currency}
          onSave={(act) => {
            if (day) {
              const slot = (editingActivity?.category || act.category || 'morning') as 'morning' | 'afternoon' | 'evening'
              handleSaveActivity(activeDay, slot, act)
            }
          }}
          onClose={() => setEditingActivity(undefined)}
        />
      )}

      {/* Header */}
      <div className="mb-6">
        <button onClick={() => navigate('/saved')} className="flex items-center gap-2 text-slate-500 hover:text-slate-800 mb-4 text-sm font-medium transition-colors">
          <ArrowLeft size={16} /> Back to Saved Trips
        </button>
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">{trip.title}</h1>
            <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-slate-500">
              <span className="flex items-center gap-1.5"><MapPin size={14} className="text-teal-500" />{trip.destination}</span>
              <span className="flex items-center gap-1.5"><Calendar size={14} className="text-teal-500" />{trip.start_date} → {trip.end_date}</span>
              <span className="flex items-center gap-1.5"><Users size={14} className="text-teal-500" />{trip.num_travellers} traveller{trip.num_travellers !== 1 ? 's' : ''}</span>
              <span className="flex items-center gap-1.5"><DollarSign size={14} className="text-teal-500" />{currency} {trip.budget.toLocaleString()} budget</span>
            </div>
          </div>
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setShowMap(!showMap)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border transition-all ${showMap ? 'bg-teal-50 border-teal-400 text-teal-700' : 'bg-white border-slate-200 text-slate-600'}`}
            >
              <Map size={15} /> {showMap ? 'Hide Map' : 'Show Map'}
            </button>
            <button onClick={handleSaveTrip} disabled={saving} className="btn-primary py-2 px-4 text-sm flex items-center gap-2 disabled:opacity-60">
              {saving ? <RefreshCw size={15} className="animate-spin" /> : <Save size={15} />}
              Save Changes
            </button>
            <button onClick={handleDeleteTrip} className="btn-danger py-2 px-4 text-sm flex items-center gap-2">
              <Trash2 size={15} /> Delete
            </button>
          </div>
        </div>
      </div>

      {trip.is_demo === 1 && (
        <div className="demo-banner mb-5">
          <AlertCircle size={16} />
          <span><strong>Demo Itinerary</strong> — Generated without a live AI key. Add GEMINI_API_KEY for real AI-generated plans.</span>
        </div>
      )}

      {/* Summary bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Total Days', value: itinerary.total_days },
          { label: 'Total Activities', value: itinerary.days.reduce((s, d) => s + d.morning.length + d.afternoon.length + d.evening.length, 0) },
          { label: 'Est. Total Cost', value: `${currency} ${totalCost.toFixed(0)}` },
          { label: 'Per Day', value: `${currency} ${(totalCost / itinerary.total_days).toFixed(0)}` },
        ].map(({ label, value }) => (
          <div key={label} className="card p-4 text-center">
            <div className="text-xl font-bold text-slate-900">{value}</div>
            <div className="text-xs text-slate-500 mt-0.5">{label}</div>
          </div>
        ))}
      </div>

      {/* Map */}
      {showMap && (
        <div className="card overflow-hidden mb-6">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="font-bold text-slate-900">Itinerary Map — {trip.destination}</h2>
          </div>
          <div className="h-72">
            <MapContainer
              center={[20, 0]}
              zoom={2}
              style={{ height: '100%', width: '100%' }}
              scrollWheelZoom={false}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
            </MapContainer>
          </div>
          <div className="p-3 bg-slate-50 text-xs text-slate-400 text-center">Map data © OpenStreetMap contributors</div>
        </div>
      )}

      {/* Day tabs */}
      <div className="card overflow-hidden">
        <div className="flex overflow-x-auto border-b border-slate-100">
          {itinerary.days.map((d, i) => (
            <button
              key={i}
              onClick={() => setActiveDay(i)}
              className={`flex-shrink-0 px-5 py-3.5 text-sm font-medium border-b-2 transition-all ${
                activeDay === i ? 'border-teal-500 text-teal-700 bg-teal-50' : 'border-transparent text-slate-500 hover:bg-slate-50'
              }`}
            >
              Day {d.day_number}<br />
              <span className="text-xs opacity-60">{d.date}</span>
            </button>
          ))}
        </div>
        <div className="p-6">
          {day && (
            <div className="space-y-6">
              {(['morning', 'afternoon', 'evening'] as const).map((slot) => {
                const labels = { morning: '☀️ Morning', afternoon: '🌤️ Afternoon', evening: '🌙 Evening' }
                return (
                  <div key={slot}>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-bold text-slate-700">{labels[slot]}</h3>
                      <button
                        onClick={() => setEditingActivity({ id: crypto.randomUUID(), name: '', description: '', time: slot === 'morning' ? '09:00' : slot === 'afternoon' ? '13:00' : '18:00', duration: '1 hour', estimated_cost: 0, location: '', category: slot })}
                        className="flex items-center gap-1 text-teal-600 text-xs font-medium hover:text-teal-700 transition-colors"
                      >
                        <Plus size={13} /> Add Activity
                      </button>
                    </div>
                    {day[slot].length === 0 ? (
                      <div className="text-slate-400 text-sm text-center py-4 border-2 border-dashed border-slate-200 rounded-xl">
                        No activities yet. <button onClick={() => setEditingActivity({ id: crypto.randomUUID(), name: '', description: '', time: '09:00', duration: '1 hour', estimated_cost: 0, location: '', category: slot })} className="text-teal-600 underline">Add one</button>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {day[slot].map((act: Activity) => (
                          <ActivityCard
                            key={act.id}
                            activity={act}
                            currency={currency}
                            onEdit={setEditingActivity}
                            onDelete={(actId) => handleDeleteActivity(activeDay, slot, actId)}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}

              {day.tips?.length > 0 && (
                <div className="bg-amber-50 rounded-xl p-4">
                  <h4 className="font-semibold text-amber-800 text-sm mb-2">💡 Local Tips for Day {day.day_number}</h4>
                  <ul className="space-y-1">
                    {day.tips.map((tip, i) => <li key={i} className="text-amber-700 text-sm">• {tip}</li>)}
                  </ul>
                </div>
              )}

              <div className="flex justify-between items-center bg-teal-50 rounded-xl px-4 py-3 text-sm">
                <span className="text-teal-700 font-medium">Day {day.day_number} Total</span>
                <span className="font-bold text-teal-800">{currency} {day.daily_budget.toFixed(2)} est.</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Trip tips */}
      {(itinerary.packing_tips?.length > 0 || itinerary.local_tips?.length > 0) && (
        <div className="grid md:grid-cols-2 gap-4 mt-6">
          {itinerary.packing_tips?.length > 0 && (
            <div className="card p-5">
              <h3 className="font-bold text-slate-900 mb-3">🧳 Packing Tips</h3>
              <ul className="space-y-1.5">
                {itinerary.packing_tips.map((tip, i) => <li key={i} className="text-slate-600 text-sm flex items-start gap-2"><span className="text-teal-500">✓</span>{tip}</li>)}
              </ul>
            </div>
          )}
          {itinerary.local_tips?.length > 0 && (
            <div className="card p-5">
              <h3 className="font-bold text-slate-900 mb-3">🗺️ Local Tips</h3>
              <ul className="space-y-1.5">
                {itinerary.local_tips.map((tip, i) => <li key={i} className="text-slate-600 text-sm flex items-start gap-2"><span className="text-teal-500">✓</span>{tip}</li>)}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
