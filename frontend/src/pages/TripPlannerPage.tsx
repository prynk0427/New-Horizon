import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import {
  Compass, Users, Calendar, DollarSign, Zap, Save, RefreshCw,
  MapPin, Utensils, Camera, Mountain, Landmark, ShoppingBag,
  TreePalm, Moon, Telescope, Church, AlertCircle, Info
} from 'lucide-react'
import { tripsApi } from '@/services/api'
import type { TripCreateRequest, ItineraryResponse } from '@/types'

const schema = z.object({
  destination: z.string().min(2, 'Enter a destination'),
  starting_city: z.string().optional(),
  start_date: z.string().min(1, 'Select start date'),
  end_date: z.string().min(1, 'Select end date'),
  num_travellers: z.coerce.number().int().min(1).max(50),
  budget: z.coerce.number().positive('Budget must be positive'),
  currency: z.string().min(1),
  interests: z.array(z.string()).min(1, 'Select at least one interest'),
  travel_style: z.string().optional(),
  pace: z.string().optional(),
  accommodation_pref: z.string().optional(),
  dietary_prefs: z.string().optional(),
}).refine(d => !d.start_date || !d.end_date || d.end_date >= d.start_date, {
  message: 'End date must be after start date',
  path: ['end_date'],
})

type FormData = z.infer<typeof schema>

const INTERESTS = [
  { id: 'Nature', icon: TreePalm, color: 'text-emerald-600' },
  { id: 'Adventure', icon: Mountain, color: 'text-orange-600' },
  { id: 'History', icon: Landmark, color: 'text-amber-600' },
  { id: 'Culture', icon: Church, color: 'text-violet-600' },
  { id: 'Food', icon: Utensils, color: 'text-red-500' },
  { id: 'Shopping', icon: ShoppingBag, color: 'text-pink-600' },
  { id: 'Photography', icon: Camera, color: 'text-sky-600' },
  { id: 'Relaxation', icon: Moon, color: 'text-indigo-600' },
  { id: 'Wildlife', icon: Telescope, color: 'text-teal-600' },
  { id: 'Spiritual', icon: Church, color: 'text-purple-600' },
]

const CURRENCIES = ['USD', 'EUR', 'GBP', 'AUD', 'CAD', 'INR', 'JPY', 'AED', 'SGD', 'THB']
const PACES = ['Relaxed', 'Balanced', 'Packed']
const STYLES = ['Budget Backpacker', 'Mid-range', 'Luxury', 'Family-friendly', 'Solo Adventure', 'Romantic Getaway']
const ACCOMMODATIONS = ['Hostel', 'Budget Hotel', 'Mid-range Hotel', 'Boutique Hotel', 'Luxury Resort', 'Airbnb / Apartment', 'Camping']

function ItineraryPreview({ itinerary, onSave, saving }: {
  itinerary: ItineraryResponse
  onSave: () => void
  saving: boolean
}) {
  const [activeDay, setActiveDay] = useState(0)

  const day = itinerary.days[activeDay]

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
      {/* Demo banner */}
      {itinerary.is_demo && (
        <div className="demo-banner">
          <AlertCircle size={16} />
          <span><strong>Demo Mode:</strong> This is a sample itinerary. Add your <code>GEMINI_API_KEY</code> for a real AI-generated plan.</span>
        </div>
      )}

      {/* Overview card */}
      <div className="card p-6">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">{itinerary.destination}</h2>
            <p className="text-slate-500">{itinerary.total_days} days · {itinerary.currency} {itinerary.total_estimated_cost.toLocaleString()} est.</p>
          </div>
          <button
            onClick={onSave}
            disabled={saving}
            className="btn-primary py-2.5 px-5 flex items-center gap-2 text-sm disabled:opacity-60"
          >
            {saving ? <RefreshCw size={16} className="animate-spin" /> : <Save size={16} />}
            {saving ? 'Saving…' : 'Save Trip'}
          </button>
        </div>
        {itinerary.overview && (
          <p className="text-slate-600 text-sm leading-relaxed bg-slate-50 rounded-xl p-4">{itinerary.overview}</p>
        )}
      </div>

      {/* Day tabs */}
      <div className="card overflow-hidden">
        <div className="flex overflow-x-auto border-b border-slate-100 scrollbar-hide">
          {itinerary.days.map((d, i) => (
            <button
              key={i}
              onClick={() => setActiveDay(i)}
              className={`flex-shrink-0 px-5 py-3.5 text-sm font-medium border-b-2 transition-all ${
                activeDay === i
                  ? 'border-teal-500 text-teal-700 bg-teal-50'
                  : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50'
              }`}
            >
              Day {d.day_number}<br />
              <span className="text-xs opacity-60">{d.date}</span>
            </button>
          ))}
        </div>
        <div className="p-6">
          {day && (
            <div className="space-y-5">
              {[
                { label: '☀️ Morning', activities: day.morning },
                { label: '🌤️ Afternoon', activities: day.afternoon },
                { label: '🌙 Evening', activities: day.evening },
              ].map(({ label, activities }) => activities.length > 0 && (
                <div key={label}>
                  <h3 className="font-bold text-slate-700 mb-3">{label}</h3>
                  <div className="space-y-3">
                    {activities.map((act) => (
                      <div key={act.id} className="bg-slate-50 rounded-xl p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1">
                            <div className="font-semibold text-slate-900">{act.name}</div>
                            <div className="text-xs text-slate-500 mb-1.5">{act.time} · {act.duration} · {act.location}</div>
                            <p className="text-slate-600 text-sm">{act.description}</p>
                          </div>
                          <div className="badge-teal text-xs flex-shrink-0">
                            ~{itinerary.currency} {act.estimated_cost}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              {day.tips?.length > 0 && (
                <div className="bg-amber-50 rounded-xl p-4">
                  <h4 className="font-semibold text-amber-800 text-sm mb-2">💡 Local Tips</h4>
                  <ul className="space-y-1">
                    {day.tips.map((tip, i) => <li key={i} className="text-amber-700 text-sm">• {tip}</li>)}
                  </ul>
                </div>
              )}
              <div className="flex justify-between items-center text-sm bg-teal-50 rounded-xl px-4 py-3">
                <span className="text-teal-700 font-medium">Daily Budget Estimate</span>
                <span className="font-bold text-teal-800">{itinerary.currency} {day.daily_budget.toFixed(2)}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Tips */}
      {(itinerary.packing_tips?.length > 0 || itinerary.local_tips?.length > 0) && (
        <div className="grid md:grid-cols-2 gap-4">
          {itinerary.packing_tips?.length > 0 && (
            <div className="card p-5">
              <h3 className="font-bold text-slate-900 mb-3">🧳 Packing Tips</h3>
              <ul className="space-y-1.5">
                {itinerary.packing_tips.map((tip, i) => (
                  <li key={i} className="text-slate-600 text-sm flex items-start gap-2">
                    <span className="text-teal-500 mt-0.5">✓</span>{tip}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {itinerary.local_tips?.length > 0 && (
            <div className="card p-5">
              <h3 className="font-bold text-slate-900 mb-3">🗺️ Local Tips</h3>
              <ul className="space-y-1.5">
                {itinerary.local_tips.map((tip, i) => (
                  <li key={i} className="text-slate-600 text-sm flex items-start gap-2">
                    <span className="text-teal-500 mt-0.5">✓</span>{tip}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </motion.div>
  )
}

export default function TripPlannerPage() {
  const navigate = useNavigate()
  const [generating, setGenerating] = useState(false)
  const [saving, setSaving] = useState(false)
  const [itinerary, setItinerary] = useState<ItineraryResponse | null>(null)
  const [lastRequest, setLastRequest] = useState<TripCreateRequest | null>(null)

  const today = new Date().toISOString().split('T')[0]
  const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

  const { register, control, handleSubmit, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      destination: '',
      starting_city: '',
      start_date: today,
      end_date: nextWeek,
      num_travellers: 2,
      budget: 2000,
      currency: 'USD',
      interests: [],
      travel_style: 'Mid-range',
      pace: 'Balanced',
      accommodation_pref: 'Mid-range Hotel',
      dietary_prefs: '',
    },
  })

  const onSubmit = async (data: FormData) => {
    setGenerating(true)
    setItinerary(null)
    try {
      const req: TripCreateRequest = {
        ...data,
        num_travellers: Number(data.num_travellers),
        budget: Number(data.budget),
      }
      setLastRequest(req)
      const result = await tripsApi.generate(req)
      setItinerary(result.itinerary)
      toast.success('Itinerary generated!')
      // Scroll to result
      setTimeout(() => window.scrollTo({ top: document.getElementById('result')?.offsetTop || 0, behavior: 'smooth' }), 100)
    } catch (err: any) {
      toast.error(err.message || 'Failed to generate itinerary')
    } finally {
      setGenerating(false)
    }
  }

  const handleSave = async () => {
    if (!lastRequest || !itinerary) return
    setSaving(true)
    try {
      const trip = await tripsApi.create(lastRequest)
      toast.success('Trip saved!')
      navigate(`/itinerary/${trip.id}`)
    } catch (err: any) {
      toast.error(err.message || 'Failed to save trip')
    } finally {
      setSaving(false)
    }
  }

  const handleRegenerate = () => {
    if (lastRequest) {
      handleSubmit(onSubmit)()
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-1 flex items-center gap-3">
          <Compass className="text-teal-600" size={32} /> AI Trip Planner
        </h1>
        <p className="text-slate-500">Tell us your dream — our AI will craft the perfect itinerary.</p>
      </div>

      <div className="grid lg:grid-cols-5 gap-8">
        {/* Form */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit(onSubmit)} className="card p-6 space-y-5 sticky top-20">
            {/* Destination */}
            <div>
              <label className="label">Destination *</label>
              <div className="relative">
                <MapPin size={16} className="absolute left-3 top-3.5 text-slate-400" />
                <input {...register('destination')} className="input-field pl-9" placeholder="e.g. Bali, Paris, Tokyo" />
              </div>
              {errors.destination && <p className="text-red-500 text-xs mt-1">{errors.destination.message}</p>}
            </div>

            <div>
              <label className="label">Starting City (optional)</label>
              <input {...register('starting_city')} className="input-field" placeholder="e.g. London, New York" />
            </div>

            {/* Dates */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Start Date *</label>
                <input {...register('start_date')} type="date" className="input-field" min={today} />
                {errors.start_date && <p className="text-red-500 text-xs mt-1">{errors.start_date.message}</p>}
              </div>
              <div>
                <label className="label">End Date *</label>
                <input {...register('end_date')} type="date" className="input-field" min={watch('start_date') || today} />
                {errors.end_date && <p className="text-red-500 text-xs mt-1">{errors.end_date.message}</p>}
              </div>
            </div>

            {/* Travellers & Budget */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Travellers</label>
                <div className="relative">
                  <Users size={15} className="absolute left-3 top-3.5 text-slate-400" />
                  <input {...register('num_travellers')} type="number" min={1} max={50} className="input-field pl-9" />
                </div>
              </div>
              <div>
                <label className="label">Budget *</label>
                <input {...register('budget')} type="number" min={1} step={100} className="input-field" placeholder="2000" />
                {errors.budget && <p className="text-red-500 text-xs mt-1">{errors.budget.message}</p>}
              </div>
            </div>

            {/* Currency */}
            <div>
              <label className="label">Currency</label>
              <select {...register('currency')} className="input-field">
                {CURRENCIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>

            {/* Interests */}
            <div>
              <label className="label">Travel Interests * <span className="text-slate-400 font-normal">(select all that apply)</span></label>
              <Controller
                name="interests"
                control={control}
                render={({ field }) => (
                  <div className="grid grid-cols-2 gap-2">
                    {INTERESTS.map(({ id, icon: Icon, color }) => {
                      const selected = field.value.includes(id)
                      return (
                        <button
                          key={id}
                          type="button"
                          onClick={() => {
                            const newVal = selected ? field.value.filter(v => v !== id) : [...field.value, id]
                            field.onChange(newVal)
                          }}
                          className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium border transition-all ${
                            selected
                              ? 'bg-teal-50 border-teal-400 text-teal-700'
                              : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                          }`}
                        >
                          <Icon size={15} className={selected ? 'text-teal-600' : color} />
                          {id}
                        </button>
                      )
                    })}
                  </div>
                )}
              />
              {errors.interests && <p className="text-red-500 text-xs mt-1">{errors.interests.message}</p>}
            </div>

            {/* Style & Pace */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Travel Style</label>
                <select {...register('travel_style')} className="input-field">
                  {STYLES.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Pace</label>
                <select {...register('pace')} className="input-field">
                  {PACES.map(p => <option key={p}>{p}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="label">Accommodation</label>
              <select {...register('accommodation_pref')} className="input-field">
                {ACCOMMODATIONS.map(a => <option key={a}>{a}</option>)}
              </select>
            </div>

            <div>
              <label className="label">Dietary Preferences (optional)</label>
              <input {...register('dietary_prefs')} className="input-field" placeholder="e.g. vegetarian, halal, no shellfish" />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={generating}
                className="flex-1 btn-primary flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {generating ? (
                  <><RefreshCw size={17} className="animate-spin" /> Generating…</>
                ) : (
                  <><Zap size={17} /> Generate Itinerary</>
                )}
              </button>
              {itinerary && (
                <button
                  type="button"
                  onClick={handleRegenerate}
                  disabled={generating}
                  className="btn-secondary px-4"
                  title="Regenerate"
                >
                  <RefreshCw size={17} />
                </button>
              )}
            </div>

            {generating && (
              <div className="bg-teal-50 border border-teal-200 rounded-xl p-3 text-sm text-teal-700 flex items-center gap-2">
                <Zap size={15} className="animate-pulse" />
                AI is crafting your personalized itinerary… This may take up to 30 seconds.
              </div>
            )}
          </form>
        </div>

        {/* Result */}
        <div className="lg:col-span-3" id="result">
          {!itinerary && !generating && (
            <div className="card p-12 text-center">
              <Compass size={56} className="text-slate-200 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-slate-700 mb-2">Your Itinerary Will Appear Here</h3>
              <p className="text-slate-400 max-w-sm mx-auto">
                Fill in your trip details and click <strong>Generate Itinerary</strong> to get an AI-powered personalized travel plan.
              </p>
            </div>
          )}
          {generating && (
            <div className="card p-12 text-center">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                className="w-16 h-16 border-4 border-teal-500 border-t-transparent rounded-full mx-auto mb-4"
              />
              <h3 className="text-xl font-bold text-slate-700 mb-2">Generating Your Itinerary…</h3>
              <p className="text-slate-400">Our AI is crafting the perfect plan for you.</p>
            </div>
          )}
          {itinerary && !generating && (
            <ItineraryPreview itinerary={itinerary} onSave={handleSave} saving={saving} />
          )}
        </div>
      </div>
    </div>
  )
}
