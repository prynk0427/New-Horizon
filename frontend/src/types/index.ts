// ── Destination Types ──────────────────────────────────────────────────────────

export interface Attraction {
  name: string
  description: string
  latitude?: number
  longitude?: number
  category?: string
  image_url?: string
}

export interface Destination {
  id: number
  name: string
  country: string
  region?: string
  description?: string
  short_description?: string
  image_url?: string
  category?: string
  tags: string[]
  attractions: Attraction[]
  best_time_to_visit?: string
  budget_range?: string
  latitude?: number
  longitude?: number
  created_at?: string
}

// ── Trip Types ─────────────────────────────────────────────────────────────────

export interface Activity {
  id: string
  name: string
  description: string
  time: string
  duration: string
  estimated_cost: number
  location: string
  image_url?: string
  category: 'morning' | 'afternoon' | 'evening' | 'general'
}

export interface DayItinerary {
  day_number: number
  date: string
  morning: Activity[]
  afternoon: Activity[]
  evening: Activity[]
  daily_budget: number
  tips: string[]
  weather_alternatives: string[]
}

export interface ItineraryResponse {
  destination: string
  total_days: number
  total_estimated_cost: number
  currency: string
  days: DayItinerary[]
  overview: string
  packing_tips: string[]
  local_tips: string[]
  is_demo: boolean
}

export interface Trip {
  id: number
  title: string
  destination: string
  starting_city?: string
  start_date: string
  end_date: string
  num_travellers: number
  budget: number
  currency: string
  interests: string[]
  travel_style?: string
  pace?: string
  accommodation_pref?: string
  dietary_prefs?: string
  itinerary_data?: ItineraryResponse
  budget_data?: BudgetEstimateResponse
  is_demo: number
  created_at?: string
  updated_at?: string
}

export interface TripCreateRequest {
  destination: string
  starting_city?: string
  start_date: string
  end_date: string
  num_travellers: number
  budget: number
  currency: string
  interests: string[]
  travel_style?: string
  pace?: string
  accommodation_pref?: string
  dietary_prefs?: string
}

export interface TripUpdateRequest {
  title?: string
  itinerary_data?: ItineraryResponse
  budget_data?: BudgetEstimateResponse
  notes?: string
}

// ── Weather Types ──────────────────────────────────────────────────────────────

export interface WeatherCurrent {
  temperature: number
  windspeed?: number
  weather_code: number
  description: string
  is_day: number
}

export interface WeatherForecast {
  date: string
  max_temp: number
  min_temp: number
  precipitation_mm: number
  rain_probability?: number
  weather_code: number
  description: string
}

export interface WeatherData {
  error: boolean
  message?: string
  destination: string
  latitude?: number
  longitude?: number
  current?: WeatherCurrent
  forecast?: WeatherForecast[]
  travel_advice?: string[]
  packing_suggestions?: string[]
  data_source?: string
  fetched_at?: string
}

// ── Favourite Types ────────────────────────────────────────────────────────────

export interface Favourite {
  id: number
  destination_id: number
  destination_name: string
  destination_country?: string
  image_url?: string
  created_at?: string
}

export interface FavouriteCreate {
  destination_id: number
  destination_name: string
  destination_country?: string
  image_url?: string
}

// ── Budget Types ───────────────────────────────────────────────────────────────

export interface BudgetCategory {
  name: string
  estimated_cost: number
  actual_cost?: number
  notes?: string
}

export interface BudgetEstimateRequest {
  destination: string
  num_travellers: number
  num_days: number
  budget: number
  currency: string
  accommodation_pref?: string
  travel_style?: string
}

export interface BudgetEstimateResponse {
  total_estimated: number
  per_traveller: number
  per_day: number
  remaining: number
  categories: BudgetCategory[]
  currency: string
  warnings: string[]
}
