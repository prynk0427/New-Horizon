import apiClient from './apiClient'
import type {
  Destination,
  Trip,
  TripCreateRequest,
  TripUpdateRequest,
  Favourite,
  FavouriteCreate,
  WeatherData,
  BudgetEstimateRequest,
  BudgetEstimateResponse,
  ItineraryResponse,
} from '@/types'

// ── Destinations ──────────────────────────────────────────────────────────────
export const destinationsApi = {
  list: (params?: { search?: string; category?: string; tag?: string }) =>
    apiClient.get<Destination[]>('/api/destinations', { params }).then(r => r.data),

  get: (id: number) =>
    apiClient.get<Destination>(`/api/destinations/${id}`).then(r => r.data),
}

// ── Trips ─────────────────────────────────────────────────────────────────────
export const tripsApi = {
  generate: (req: TripCreateRequest) =>
    apiClient.post<{ success: boolean; itinerary: ItineraryResponse }>('/api/trips/generate', req).then(r => r.data),

  create: (req: TripCreateRequest) =>
    apiClient.post<Trip>('/api/trips/', req).then(r => r.data),

  list: () =>
    apiClient.get<Trip[]>('/api/trips/').then(r => r.data),

  get: (id: number) =>
    apiClient.get<Trip>(`/api/trips/${id}`).then(r => r.data),

  update: (id: number, req: TripUpdateRequest) =>
    apiClient.put<Trip>(`/api/trips/${id}`, req).then(r => r.data),

  delete: (id: number) =>
    apiClient.delete(`/api/trips/${id}`),
}

// ── Weather ───────────────────────────────────────────────────────────────────
export const weatherApi = {
  get: (params: {
    destination: string
    latitude?: number
    longitude?: number
    start_date?: string
    end_date?: string
  }) =>
    apiClient.get<WeatherData>('/api/weather/', { params }).then(r => r.data),

  geocode: (destination: string) =>
    apiClient.get<{ error: boolean; destination: string; latitude?: number; longitude?: number }>(
      '/api/weather/geocode',
      { params: { destination } }
    ).then(r => r.data),
}

// ── Favourites ────────────────────────────────────────────────────────────────
export const favouritesApi = {
  list: () =>
    apiClient.get<Favourite[]>('/api/favourites/').then(r => r.data),

  add: (req: FavouriteCreate) =>
    apiClient.post<Favourite>('/api/favourites/', req).then(r => r.data),

  remove: (id: number) =>
    apiClient.delete(`/api/favourites/${id}`),

  removeByDestination: (destinationId: number) =>
    apiClient.delete(`/api/favourites/destination/${destinationId}`),
}

// ── Budget ────────────────────────────────────────────────────────────────────
export const budgetApi = {
  estimate: (req: BudgetEstimateRequest) =>
    apiClient.post<BudgetEstimateResponse>('/api/budget/estimate', req).then(r => r.data),
}

// ── Health ────────────────────────────────────────────────────────────────────
export const healthApi = {
  check: () =>
    apiClient.get<{ status: string; app: string; ai_enabled: boolean }>('/api/health').then(r => r.data),
}
