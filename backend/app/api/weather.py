from fastapi import APIRouter, Query
from typing import Optional
from app.services.weather_service import get_weather, geocode_destination

router = APIRouter()


@router.get("/")
async def fetch_weather(
    destination: str = Query(..., min_length=2),
    latitude: Optional[float] = None,
    longitude: Optional[float] = None,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
):
    return await get_weather(destination, latitude, longitude, start_date, end_date)


@router.get("/geocode")
async def geocode(destination: str = Query(..., min_length=2)):
    result = await geocode_destination(destination)
    if not result:
        return {"error": True, "message": f"Could not geocode '{destination}'"}
    return {"error": False, "destination": destination, **result}
