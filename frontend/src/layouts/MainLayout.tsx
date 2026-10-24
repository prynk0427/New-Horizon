import { useState } from 'react'
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import { Menu, X, Compass, MapPin, LayoutDashboard, BookOpen, Heart, PiggyBank, HelpCircle, Map } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const navLinks = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/plan', label: 'Plan Trip', icon: Compass },
  { to: '/destinations', label: 'Explore', icon: MapPin },
  { to: '/budget', label: 'Budget', icon: PiggyBank },
  { to: '/saved', label: 'My Trips', icon: BookOpen },
  { to: '/favourites', label: 'Favourites', icon: Heart },
  { to: '/about', label: 'Help', icon: HelpCircle },
]

export default function MainLayout() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-amber-50 flex flex-col">
      {/* Navbar */}
      <header className="sticky top-0 z-50 bg-white border-b border-slate-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-8 h-8 rounded-lg bg-teal-600 flex items-center justify-center shadow-sm group-hover:bg-teal-700 transition-colors">
                <Map size={16} className="text-white" />
              </div>
              <span className="font-bold text-lg text-slate-900 tracking-tight">New Horizon</span>
            </Link>

            {/* Desktop nav */}
            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map(({ to, label, icon: Icon }) => (
                <Link
                  key={to}
                  to={to}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${
                    location.pathname === to || location.pathname.startsWith(to + '/')
                      ? 'bg-teal-50 text-teal-700'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <Icon size={15} />
                  {label}
                </Link>
              ))}
            </nav>

            {/* Desktop CTA */}
            <div className="hidden md:flex items-center gap-3">
              <button
                onClick={() => navigate('/plan')}
                className="btn-primary py-2 px-5 text-sm"
              >
                Plan a Trip
              </button>
            </div>

            {/* Mobile menu button */}
            <button
              className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-t border-slate-100 bg-white"
            >
              <div className="px-4 py-3 space-y-1">
                {navLinks.map(({ to, label, icon: Icon }) => (
                  <Link
                    key={to}
                    to={to}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      location.pathname === to
                        ? 'bg-teal-50 text-teal-700'
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Icon size={17} />
                    {label}
                  </Link>
                ))}
                <div className="pt-2 border-t border-slate-100">
                  <button
                    onClick={() => { navigate('/plan'); setMobileOpen(false) }}
                    className="w-full btn-primary py-2.5 text-sm"
                  >
                    Plan a Trip
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Page content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-300 py-10 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-start gap-8">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-7 h-7 rounded-lg bg-teal-600 flex items-center justify-center">
                  <Map size={14} className="text-white" />
                </div>
                <span className="font-bold text-white text-base">New Horizon</span>
              </div>
              <p className="text-sm text-slate-400 max-w-xs">Explore Beyond the Expected. AI-powered smart tourism for the modern traveller.</p>
            </div>
            <div className="grid grid-cols-2 gap-8 text-sm">
              <div>
                <h4 className="text-white font-semibold mb-3">Features</h4>
                <ul className="space-y-2">
                  <li><Link to="/plan" className="hover:text-teal-400 transition-colors">AI Trip Planner</Link></li>
                  <li><Link to="/destinations" className="hover:text-teal-400 transition-colors">Destinations</Link></li>
                  <li><Link to="/budget" className="hover:text-teal-400 transition-colors">Budget Planner</Link></li>
                </ul>
              </div>
              <div>
                <h4 className="text-white font-semibold mb-3">Account</h4>
                <ul className="space-y-2">
                  <li><Link to="/saved" className="hover:text-teal-400 transition-colors">Saved Trips</Link></li>
                  <li><Link to="/favourites" className="hover:text-teal-400 transition-colors">Favourites</Link></li>
                  <li><Link to="/about" className="hover:text-teal-400 transition-colors">Help & About</Link></li>
                </ul>
              </div>
            </div>
          </div>
          <div className="border-t border-slate-800 mt-8 pt-6 flex flex-col md:flex-row justify-between items-center gap-3 text-xs text-slate-500">
            <p>© 2024 New Horizon. Built for the AI Hackathon. Weather by Open-Meteo. Maps by OpenStreetMap.</p>
            <p>Explore Beyond the Expected.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
