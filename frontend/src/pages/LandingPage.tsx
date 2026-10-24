import { useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Compass, MapPin, Zap, BarChart2, Map, Heart, ArrowRight, Star, CheckCircle, Leaf } from 'lucide-react'

const FEATURED_DESTINATIONS = [
  {
    name: 'Bali, Indonesia',
    image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=600&auto=format&fit=crop',
    tag: 'Nature & Culture',
    tagColor: 'bg-emerald-100 text-emerald-700',
  },
  {
    name: 'Kyoto, Japan',
    image: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=600&auto=format&fit=crop',
    tag: 'Heritage',
    tagColor: 'bg-amber-100 text-amber-700',
  },
  {
    name: 'Santorini, Greece',
    image: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=600&auto=format&fit=crop',
    tag: 'Relaxation',
    tagColor: 'bg-sky-100 text-sky-700',
  },
]

const FEATURES = [
  {
    icon: Zap,
    title: 'AI-Powered Planning',
    description: 'Gemini AI crafts a personalised day-by-day itinerary based on your interests, budget, and travel style.',
    color: 'bg-teal-50 text-teal-600',
  },
  {
    icon: MapPin,
    title: 'Destination Explorer',
    description: 'Discover 100+ curated destinations with detailed information, photos, and local tips.',
    color: 'bg-amber-50 text-amber-600',
  },
  {
    icon: BarChart2,
    title: 'Smart Budget Estimator',
    description: 'Get realistic cost breakdowns by category with visual charts and budget warnings.',
    color: 'bg-violet-50 text-violet-600',
  },
  {
    icon: Map,
    title: 'Interactive Maps',
    description: 'Visualise your itinerary on live OpenStreetMap with attraction markers and popups.',
    color: 'bg-rose-50 text-rose-600',
  },
  {
    icon: Compass,
    title: 'Live Weather',
    description: 'Real-time forecasts from Open-Meteo with packing suggestions and travel advice.',
    color: 'bg-sky-50 text-sky-600',
  },
  {
    icon: Heart,
    title: 'Save & Revisit',
    description: 'Save your itineraries and favourite destinations for future reference.',
    color: 'bg-emerald-50 text-emerald-600',
  },
]

const HOW_IT_WORKS = [
  { step: '01', title: 'Tell us your dream', desc: 'Enter your destination, dates, budget, and travel interests.' },
  { step: '02', title: 'AI builds your plan', desc: 'Gemini AI generates a detailed day-by-day itinerary in seconds.' },
  { step: '03', title: 'Explore & customise', desc: 'Edit activities, check weather, and see everything on the map.' },
  { step: '04', title: 'Travel with confidence', desc: 'Save your trip, track your budget, and go!' },
]

export default function LandingPage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-slate-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-teal-600 flex items-center justify-center">
              <Map size={16} className="text-white" />
            </div>
            <span className="font-bold text-lg text-slate-900">New Horizon</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
            <Link to="/destinations" className="hover:text-teal-600 transition-colors">Explore</Link>
            <Link to="/about" className="hover:text-teal-600 transition-colors">About</Link>
          </nav>
          <div className="flex items-center gap-3">
            <Link to="/dashboard" className="hidden md:block text-sm font-medium text-slate-600 hover:text-teal-600 transition-colors">Dashboard</Link>
            <button onClick={() => navigate('/plan')} className="btn-primary py-2 px-5 text-sm">
              Plan My Trip
            </button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative min-h-[92vh] flex items-center overflow-hidden">
        {/* Background image */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=1920&auto=format&fit=crop"
            alt="Travel hero"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900/80 via-slate-900/50 to-transparent" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="max-w-2xl"
          >
            <span className="inline-block badge bg-teal-500/20 text-teal-300 border border-teal-400/30 mb-4 text-sm px-3 py-1">
              ✦ AI-Powered Travel Planning
            </span>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold text-white leading-tight mb-6">
              Travel Smarter.<br />
              <span className="text-teal-400">Discover More.</span>
            </h1>
            <p className="text-xl text-slate-200 mb-10 leading-relaxed max-w-xl">
              New Horizon uses AI to build your perfect trip — personalized itineraries, real weather, interactive maps, and smart budget planning. All in one place.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => navigate('/plan')}
                className="bg-teal-500 hover:bg-teal-400 text-white font-bold px-8 py-4 rounded-xl text-lg transition-all duration-200 shadow-lg hover:shadow-xl flex items-center gap-2 justify-center"
              >
                Plan My Trip <ArrowRight size={20} />
              </button>
              <button
                onClick={() => navigate('/destinations')}
                className="bg-white/10 hover:bg-white/20 backdrop-blur text-white font-semibold px-8 py-4 rounded-xl text-lg transition-all duration-200 border border-white/20 flex items-center gap-2 justify-center"
              >
                Explore Destinations
              </button>
            </div>

            {/* Quick stats */}
            <div className="flex flex-wrap gap-6 mt-12">
              {[
                { value: '12+', label: 'Destinations' },
                { value: 'AI', label: 'Powered' },
                { value: 'Free', label: 'To Use' },
              ].map(({ value, label }) => (
                <div key={label} className="text-center">
                  <div className="text-2xl font-bold text-white">{value}</div>
                  <div className="text-sm text-slate-300">{label}</div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Featured Destinations */}
      <section className="py-20 bg-amber-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="section-title mb-3">Featured Destinations</h2>
            <p className="text-slate-500 text-lg">From iconic cities to hidden gems — where will you go next?</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {FEATURED_DESTINATIONS.map((dest, i) => (
              <motion.div
                key={dest.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="card-hover group"
                onClick={() => navigate('/destinations')}
              >
                <div className="relative h-56 overflow-hidden">
                  <img
                    src={dest.image}
                    alt={dest.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=600&auto=format&fit=crop' }}
                  />
                  <div className="absolute top-3 left-3">
                    <span className={`badge ${dest.tagColor} text-xs font-semibold px-2.5 py-1`}>{dest.tag}</span>
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="font-bold text-slate-900 text-lg mb-2">{dest.name}</h3>
                  <button className="text-teal-600 font-semibold text-sm flex items-center gap-1 hover:gap-2 transition-all">
                    Explore <ArrowRight size={14} />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link to="/destinations" className="btn-secondary inline-flex items-center gap-2">
              View All Destinations <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="section-title mb-3">Everything You Need to Travel Better</h2>
            <p className="text-slate-500 text-lg max-w-2xl mx-auto">
              New Horizon combines AI planning, real-world data, and beautiful design into one seamless experience.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.07 }}
                className="card p-6 hover:shadow-md transition-shadow"
              >
                <div className={`w-11 h-11 rounded-xl ${feature.color} flex items-center justify-center mb-4`}>
                  <feature.icon size={22} />
                </div>
                <h3 className="font-bold text-slate-900 text-base mb-2">{feature.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-white mb-3">How It Works</h2>
            <p className="text-slate-400 text-lg">Your perfect trip in four simple steps.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {HOW_IT_WORKS.map((step, i) => (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center"
              >
                <div className="text-5xl font-black text-teal-500/30 mb-3">{step.step}</div>
                <h3 className="text-white font-bold text-lg mb-2">{step.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Sample itinerary preview */}
      <section className="py-20 bg-amber-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="badge-teal text-xs mb-4 inline-block">Sample AI Itinerary</span>
              <h2 className="section-title mb-5">See What AI Planning Looks Like</h2>
              <p className="text-slate-500 mb-8 leading-relaxed">
                Our AI doesn't just give you a list of places — it crafts a complete day-by-day experience with timing, costs, local tips, and weather alternatives.
              </p>
              <ul className="space-y-3 mb-8">
                {[
                  'Morning, afternoon & evening activities',
                  'Estimated costs per activity',
                  'Local tips & cultural notes',
                  'Weather backup plans',
                  'Packing suggestions',
                ].map((item) => (
                  <li key={item} className="flex items-center gap-3 text-slate-700">
                    <CheckCircle size={18} className="text-teal-500 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
              <button onClick={() => navigate('/plan')} className="btn-primary inline-flex items-center gap-2">
                Generate My Itinerary <ArrowRight size={16} />
              </button>
            </div>
            <div className="card p-6">
              <div className="bg-teal-600 text-white px-4 py-3 rounded-xl mb-4 font-semibold">
                🗓 Day 1 — Bali, Indonesia
              </div>
              {[
                { time: '9:00 AM', activity: 'Ubud Monkey Forest', cost: '$5', emoji: '🐒' },
                { time: '1:00 PM', activity: 'Tegallalang Rice Terraces', cost: '$3', emoji: '🌾' },
                { time: '6:30 PM', activity: 'Tanah Lot Temple Sunset', cost: '$8', emoji: '🌅' },
              ].map((item) => (
                <div key={item.activity} className="flex items-center gap-4 py-3 border-b border-slate-100 last:border-0">
                  <span className="text-2xl">{item.emoji}</span>
                  <div className="flex-1">
                    <div className="font-semibold text-slate-900 text-sm">{item.activity}</div>
                    <div className="text-xs text-slate-400">{item.time}</div>
                  </div>
                  <span className="badge-teal">{item.cost}</span>
                </div>
              ))}
              <div className="mt-4 bg-amber-50 rounded-xl p-3 text-xs text-amber-700">
                ⚡ This is a sample preview. Your AI plan will be personalised to your preferences.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Responsible Tourism */}
      <section className="py-16 bg-emerald-50 border-y border-emerald-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="w-12 h-12 rounded-2xl bg-emerald-600 flex items-center justify-center mx-auto mb-4">
            <Leaf size={24} className="text-white" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-3">Responsible Tourism</h2>
          <p className="text-slate-600 leading-relaxed mb-6">
            New Horizon is committed to promoting sustainable and responsible travel. We encourage travellers to respect local cultures, support local businesses, minimise environmental impact, and travel with awareness and empathy.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {['Respect Local Culture', 'Support Local Businesses', 'Reduce Plastic Waste', 'Travel Sustainably'].map((tag) => (
              <span key={tag} className="badge bg-emerald-100 text-emerald-700 px-3 py-1.5 text-sm">{tag}</span>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-teal-600">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-extrabold text-white mb-4">Ready to Explore Beyond the Expected?</h2>
          <p className="text-teal-100 text-lg mb-8">Start planning your next adventure with AI — it only takes a few minutes.</p>
          <button
            onClick={() => navigate('/plan')}
            className="bg-white text-teal-700 hover:bg-teal-50 font-bold px-10 py-4 rounded-xl text-lg transition-all shadow-lg hover:shadow-xl flex items-center gap-2 mx-auto"
          >
            Plan My Trip Now <ArrowRight size={20} />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-teal-600 flex items-center justify-center">
              <Map size={12} className="text-white" />
            </div>
            <span className="text-white font-semibold">New Horizon</span>
            <span>— Explore Beyond the Expected.</span>
          </div>
          <div className="flex gap-6">
            <Link to="/destinations" className="hover:text-teal-400 transition-colors">Destinations</Link>
            <Link to="/about" className="hover:text-teal-400 transition-colors">About</Link>
            <Link to="/dashboard" className="hover:text-teal-400 transition-colors">Dashboard</Link>
          </div>
          <p className="text-xs text-slate-500">Weather by Open-Meteo · Maps by OpenStreetMap · AI by Google Gemini</p>
        </div>
      </footer>
    </div>
  )
}
