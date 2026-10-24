from app.schemas.trip import (
    TripCreateRequest, TripResponse, TripUpdateRequest,
    BudgetEstimateRequest, BudgetEstimateResponse, BudgetCategory,
    ItinerarySchema, DayItinerarySchema, ActivitySchema
)
from app.schemas.destination import (
    DestinationBase, DestinationResponse,
    FavouriteCreate, FavouriteResponse, WeatherRequest
)

__all__ = [
    "TripCreateRequest", "TripResponse", "TripUpdateRequest",
    "BudgetEstimateRequest", "BudgetEstimateResponse", "BudgetCategory",
    "ItinerarySchema", "DayItinerarySchema", "ActivitySchema",
    "DestinationBase", "DestinationResponse",
    "FavouriteCreate", "FavouriteResponse", "WeatherRequest",
]
