import { Routes, Route } from 'react-router-dom'
import MainLayout from '@/layouts/MainLayout'
import LandingPage from '@/pages/LandingPage'
import Dashboard from '@/pages/Dashboard'
import TripPlannerPage from '@/pages/TripPlannerPage'
import DestinationsPage from '@/pages/DestinationsPage'
import DestinationDetailPage from '@/pages/DestinationDetailPage'
import ItineraryPage from '@/pages/ItineraryPage'
import BudgetPage from '@/pages/BudgetPage'
import SavedTripsPage from '@/pages/SavedTripsPage'
import FavouritesPage from '@/pages/FavouritesPage'
import AboutPage from '@/pages/AboutPage'
import NotFoundPage from '@/pages/NotFoundPage'

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route element={<MainLayout />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/plan" element={<TripPlannerPage />} />
        <Route path="/destinations" element={<DestinationsPage />} />
        <Route path="/destinations/:id" element={<DestinationDetailPage />} />
        <Route path="/itinerary/:id" element={<ItineraryPage />} />
        <Route path="/budget" element={<BudgetPage />} />
        <Route path="/saved" element={<SavedTripsPage />} />
        <Route path="/favourites" element={<FavouritesPage />} />
        <Route path="/about" element={<AboutPage />} />
      </Route>
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}

export default App
