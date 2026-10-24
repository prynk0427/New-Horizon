import { useNavigate, Link } from 'react-router-dom'
import { HelpCircle, Zap, Cloud, Map, PiggyBank, Heart, BookOpen, Github, ExternalLink, AlertCircle } from 'lucide-react'

const FAQ = [
  {
    q: 'Is the AI really generating my itinerary?',
    a: 'When a valid GEMINI_API_KEY is configured in the backend, Google Gemini generates your personalized itinerary. If no key is configured, the app will clearly show "Demo Mode" and return a sample itinerary labelled as such.',
  },
  {
    q: 'Is the weather data real?',
    a: 'Yes. Weather data is fetched live from Open-Meteo (open-meteo.com), a free and open weather API. Forecasts are only available up to 16 days in advance.',
  },
  {
    q: 'Are the budget estimates accurate?',
    a: 'No. All budget estimates are approximate regional averages. Actual costs vary significantly based on season, availability, and personal choices. Always verify prices independently.',
  },
  {
    q: 'Does New Horizon make bookings?',
    a: 'No. New Horizon is a planning and discovery tool only. We do not make reservations, confirm hotel availability, or provide live pricing.',
  },
  {
    q: 'Where is my data stored?',
    a: 'Saved trips and favourites are stored in the application database. In local development, this is a SQLite file. In production, Supabase PostgreSQL is used.',
  },
  {
    q: 'Do I need to create an account?',
    a: 'No account is required for this demo version. Data is shared in a single session/demo context. Multi-user authentication can be added in a future version.',
  },
]

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-1 flex items-center gap-3">
          <HelpCircle className="text-teal-600" size={32} /> About & Help
        </h1>
        <p className="text-slate-500">Everything you need to know about New Horizon.</p>
      </div>

      {/* About */}
      <div className="card p-6 mb-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-teal-600 flex items-center justify-center">
            <Map size={20} className="text-white" />
          </div>
          <div>
            <h2 className="font-bold text-slate-900 text-xl">New Horizon</h2>
            <p className="text-slate-500 text-sm">Explore Beyond the Expected.</p>
          </div>
        </div>
        <p className="text-slate-600 leading-relaxed mb-4">
          New Horizon is an AI-powered smart tourism web application built for the hackathon. It helps travellers discover destinations, generate personalized itineraries, explore attractions, check weather conditions, estimate trip expenses, and make informed travel decisions — all in one beautiful, responsive platform.
        </p>
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800 flex items-start gap-2">
          <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
          <span>
            <strong>Demo Note:</strong> This application is a hackathon prototype. Budget estimates are approximate, hotel/restaurant data is illustrative, and itineraries are AI-generated suggestions — not verified travel advice. Always verify information independently before travelling.
          </span>
        </div>
      </div>

      {/* Features */}
      <div className="card p-6 mb-6">
        <h2 className="font-bold text-slate-900 text-xl mb-5">Features</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          {[
            { icon: Zap, title: 'AI Trip Planner', desc: 'Gemini AI generates day-by-day itineraries based on your preferences, with demo fallback.', to: '/plan' },
            { icon: Map, title: 'Destination Explorer', desc: 'Discover curated destinations with photos, attractions, maps, and filters.', to: '/destinations' },
            { icon: Cloud, title: 'Live Weather', desc: 'Real-time forecasts from Open-Meteo with travel advice and packing tips.', to: '/destinations' },
            { icon: PiggyBank, title: 'Budget Estimator', desc: 'Regional cost estimates with visual breakdown charts and editable categories.', to: '/budget' },
            { icon: BookOpen, title: 'Itinerary Manager', desc: 'View, edit, and save day-wise itineraries with activity management.', to: '/saved' },
            { icon: Heart, title: 'Favourites', desc: 'Save destinations you love for easy access and future planning.', to: '/favourites' },
          ].map(({ icon: Icon, title, desc, to }) => (
            <Link key={title} to={to} className="flex items-start gap-3 p-4 rounded-xl bg-slate-50 hover:bg-teal-50 transition-colors group">
              <div className="w-9 h-9 rounded-xl bg-teal-100 flex items-center justify-center flex-shrink-0 group-hover:bg-teal-200 transition-colors">
                <Icon size={18} className="text-teal-600" />
              </div>
              <div>
                <div className="font-semibold text-slate-900 text-sm">{title}</div>
                <div className="text-slate-500 text-xs mt-0.5 leading-relaxed">{desc}</div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* FAQ */}
      <div className="card p-6 mb-6">
        <h2 className="font-bold text-slate-900 text-xl mb-5">Frequently Asked Questions</h2>
        <div className="space-y-5">
          {FAQ.map(({ q, a }) => (
            <div key={q} className="border-b border-slate-100 pb-5 last:border-0 last:pb-0">
              <h3 className="font-semibold text-slate-900 mb-1.5 text-sm">{q}</h3>
              <p className="text-slate-500 text-sm leading-relaxed">{a}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Tech Stack */}
      <div className="card p-6 mb-6">
        <h2 className="font-bold text-slate-900 text-xl mb-4">Technology Stack</h2>
        <div className="grid sm:grid-cols-2 gap-4 text-sm">
          <div>
            <h3 className="font-semibold text-slate-700 mb-2">Frontend</h3>
            <ul className="space-y-1 text-slate-500">
              <li>React + TypeScript + Vite</li>
              <li>Tailwind CSS</li>
              <li>Framer Motion (animations)</li>
              <li>React Leaflet + OpenStreetMap (maps)</li>
              <li>Recharts (budget charts)</li>
              <li>React Hook Form + Zod (forms)</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-slate-700 mb-2">Backend</h3>
            <ul className="space-y-1 text-slate-500">
              <li>Python + FastAPI</li>
              <li>SQLAlchemy + SQLite / Supabase PostgreSQL</li>
              <li>Google Gemini AI</li>
              <li>Open-Meteo (weather API)</li>
              <li>Nominatim / OpenStreetMap (geocoding)</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Deployment */}
      <div className="card p-6">
        <h2 className="font-bold text-slate-900 text-xl mb-4">Deployment</h2>
        <div className="grid sm:grid-cols-3 gap-4 text-sm">
          {[
            { platform: 'Vercel', role: 'Frontend', desc: 'Hosts the React application with automatic builds from GitHub.' },
            { platform: 'Render', role: 'Backend', desc: 'Hosts the FastAPI server. Free tier available.' },
            { platform: 'Supabase', role: 'Database', desc: 'PostgreSQL database for production data persistence.' },
          ].map(({ platform, role, desc }) => (
            <div key={platform} className="bg-slate-50 rounded-xl p-4">
              <div className="font-bold text-slate-900">{platform}</div>
              <div className="badge-teal text-xs mt-1 mb-2">{role}</div>
              <p className="text-slate-500 text-xs leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
        <p className="text-slate-400 text-xs mt-4">See README.md in the repository for detailed deployment instructions.</p>
      </div>
    </div>
  )
}
