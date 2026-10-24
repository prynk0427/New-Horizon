from pydantic import BaseModel, Field, validator
from typing import Optional, List, Any, Dict
from datetime import datetime


class ActivitySchema(BaseModel):
    id: Optional[str] = None
    name: str
    description: str
    time: str
    duration: str
    estimated_cost: float = 0.0
    location: str = ""
    image_url: Optional[str] = None
    category: str = "general"  # morning / afternoon / evening


class DayItinerarySchema(BaseModel):
    day_number: int
    date: str
    morning: List[ActivitySchema] = []
    afternoon: List[ActivitySchema] = []
    evening: List[ActivitySchema] = []
    daily_budget: float = 0.0
    tips: List[str] = []
    weather_alternatives: List[str] = []


class ItinerarySchema(BaseModel):
    destination: str
    total_days: int
    total_estimated_cost: float = 0.0
    currency: str = "USD"
    days: List[DayItinerarySchema] = []
    overview: str = ""
    packing_tips: List[str] = []
    local_tips: List[str] = []
    is_demo: bool = False


class TripCreateRequest(BaseModel):
    destination: str = Field(..., min_length=2, max_length=255)
    starting_city: Optional[str] = None
    start_date: str = Field(..., pattern=r"^\d{4}-\d{2}-\d{2}$")
    end_date: str = Field(..., pattern=r"^\d{4}-\d{2}-\d{2}$")
    num_travellers: int = Field(1, ge=1, le=50)
    budget: float = Field(..., gt=0)
    currency: str = Field("USD", max_length=10)
    interests: List[str] = []
    travel_style: Optional[str] = None
    pace: Optional[str] = "balanced"
    accommodation_pref: Optional[str] = None
    dietary_prefs: Optional[str] = None

    @validator("end_date")
    def end_after_start(cls, v, values):
        if "start_date" in values and v < values["start_date"]:
            raise ValueError("end_date must be after start_date")
        return v


class TripResponse(BaseModel):
    id: int
    title: str
    destination: str
    starting_city: Optional[str]
    start_date: str
    end_date: str
    num_travellers: int
    budget: float
    currency: str
    interests: List[str]
    travel_style: Optional[str]
    pace: Optional[str]
    accommodation_pref: Optional[str]
    dietary_prefs: Optional[str]
    itinerary_data: Optional[Dict[str, Any]]
    budget_data: Optional[Dict[str, Any]]
    is_demo: int
    created_at: Optional[datetime]
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True


class TripUpdateRequest(BaseModel):
    title: Optional[str] = None
    itinerary_data: Optional[Dict[str, Any]] = None
    budget_data: Optional[Dict[str, Any]] = None
    notes: Optional[str] = None


class BudgetCategory(BaseModel):
    name: str
    estimated_cost: float
    actual_cost: Optional[float] = None
    notes: Optional[str] = None


class BudgetEstimateRequest(BaseModel):
    destination: str
    num_travellers: int = Field(1, ge=1)
    num_days: int = Field(1, ge=1)
    budget: float = Field(..., gt=0)
    currency: str = "USD"
    accommodation_pref: Optional[str] = "mid-range"
    travel_style: Optional[str] = None


class BudgetEstimateResponse(BaseModel):
    total_estimated: float
    per_traveller: float
    per_day: float
    remaining: float
    categories: List[BudgetCategory]
    currency: str
    warnings: List[str] = []
