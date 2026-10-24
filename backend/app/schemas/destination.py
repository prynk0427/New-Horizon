from pydantic import BaseModel
from typing import Optional, List, Any
from datetime import datetime


class AttractionSchema(BaseModel):
    name: str
    description: str = ""
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    category: str = "attraction"
    image_url: Optional[str] = None


class DestinationBase(BaseModel):
    name: str
    country: str
    region: Optional[str] = None
    description: Optional[str] = None
    short_description: Optional[str] = None
    image_url: Optional[str] = None
    category: Optional[str] = None
    tags: List[str] = []
    attractions: List[Any] = []
    best_time_to_visit: Optional[str] = None
    budget_range: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None


class DestinationResponse(DestinationBase):
    id: int
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class FavouriteCreate(BaseModel):
    destination_id: int
    destination_name: str
    destination_country: Optional[str] = None
    image_url: Optional[str] = None


class FavouriteResponse(BaseModel):
    id: int
    destination_id: int
    destination_name: str
    destination_country: Optional[str] = None
    image_url: Optional[str] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class WeatherRequest(BaseModel):
    destination: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None
