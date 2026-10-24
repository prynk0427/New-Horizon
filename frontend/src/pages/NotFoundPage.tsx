import { useNavigate } from 'react-router-dom'
import { Map } from 'lucide-react'

export default function NotFoundPage() {
  const navigate = useNavigate()
  return (
    <div className="min-h-screen bg-amber-50 flex flex-col items-center justify-center px-4 text-center">
      <div className="w-16 h-16 rounded-2xl bg-teal-600 flex items-center justify-center mb-6">
        <Map size={32} className="text-white" />
      </div>
      <h1 className="text-6xl font-black text-slate-900 mb-2">404</h1>
      <h2 className="text-2xl font-bold text-slate-700 mb-3">Page Not Found</h2>
      <p className="text-slate-500 max-w-sm mb-8">This destination doesn't exist on our map. Let's get you back on track.</p>
      <button onClick={() => navigate('/')} className="btn-primary">Back to Home</button>
    </div>
  )
}
