"""
Weather service using Open-Meteo (free, no API key required).
Geocoding via Nominatim (OpenStreetMap).
"""
import httpx
import logging
from typing import Optional, Dict, Any, List
from datetime import datetime, timedelta

logger = logging.getLogger(__name__)

GEOCODING_URL = "https://nominatim.openstreetmap.org/search"
WEATHER_URL = "https://api.open-meteo.com/v1/forecast"
TIMEOUT = 10.0

WMO_DESCRIPTIONS = {
    0: "Clear sky", 1: "Mainly clear", 2: "Partly cloudy", 3: "Overcast",
    45: "Fog", 48: "Icy fog",
    51: "Light drizzle", 53: "Moderate drizzle", 55: "Dense drizzle",
    61: "Slight rain", 63: "Moderate rain", 65: "Heavy rain",
    71: "Slight snow", 73: "Moderate snow", 75: "Heavy snow",
    77: "Snow grains",
    80: "Slight showers", 81: "Moderate showers", 82: "Violent showers",
    85: "Slight snow showers", 86: "Heavy snow showers",
    95: "Thunderstorm", 96: "Thunderstorm with hail", 99: "Thunderstorm with heavy hail",
}


async def geocode_destination(destination: str) -> Optional[Dict[str, float]]:
    """Return lat/lon for a destination string."""
    try:
        async with httpx.AsyncClient(timeout=TIMEOUT) as client:
            resp = await client.get(
                GEOCODING_URL,
                params={"q": destination, "format": "json", "limit": 1},
                headers={"User-Agent": "NewHorizonApp/1.0"},
            )
            resp.raise_for_status()
            results = resp.json()
            if results:
                return {"latitude": float(results[0]["lat"]), "longitude": float(results[0]["lon"])}
    except Exception as e:
        logger.error(f"Geocoding failed for '{destination}': {e}")
    return None


def _travel_advice(temp: float, weather_code: int) -> List[str]:
    advice = []
    if temp > 35:
        advice.append("Very hot — stay hydrated and avoid midday sun.")
    elif temp > 28:
        advice.append("Warm weather — light, breathable clothing recommended.")
    elif temp < 5:
        advice.append("Cold weather — pack heavy layers and a warm jacket.")
    elif temp < 15:
        advice.append("Cool weather — bring a jacket or light coat.")

    if weather_code in [61, 63, 65, 80, 81, 82]:
        advice.append("Rain expected — pack a waterproof jacket and umbrella.")
    elif weather_code in [95, 96, 99]:
        advice.append("Thunderstorms possible — avoid outdoor activities during storms.")
    elif weather_code in [71, 73, 75, 77, 85, 86]:
        advice.append("Snow expected — wear waterproof boots and warm layers.")
    elif weather_code in [0, 1]:
        advice.append("Clear skies — great weather for outdoor sightseeing!")

    return advice if advice else ["Comfortable travel conditions expected."]


def _packing_suggestions(temp: float, weather_code: int) -> List[str]:
    items = ["Passport & travel documents", "Phone charger & power bank", "Reusable water bottle"]
    if temp > 28:
        items += ["Sunscreen SPF 50+", "Sunglasses", "Hat or cap", "Light cotton clothing"]
    elif temp < 10:
        items += ["Heavy jacket", "Thermal layers", "Warm socks", "Gloves & scarf"]
    else:
        items += ["Light jacket", "Layers for temperature changes"]

    if weather_code >= 51:
        items += ["Waterproof jacket", "Compact umbrella", "Waterproof bag cover"]
    return items


async def get_weather(
    destination: str,
    latitude: Optional[float] = None,
    longitude: Optional[float] = None,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
) -> Dict[str, Any]:
    """Fetch weather data from Open-Meteo."""

    # Get coordinates if not provided
    if latitude is None or longitude is None:
        coords = await geocode_destination(destination)
        if not coords:
            return {
                "error": True,
                "message": f"Could not find coordinates for '{destination}'. Weather data unavailable.",
                "destination": destination,
            }
        latitude = coords["latitude"]
        longitude = coords["longitude"]

    # Clamp dates to Open-Meteo's 16-day forecast limit
    today = datetime.now()
    if not start_date:
        start_date = today.strftime("%Y-%m-%d")
    if not end_date:
        end_date = (today + timedelta(days=6)).strftime("%Y-%m-%d")

    # Open-Meteo only supports up to 16 days ahead
    max_end = (today + timedelta(days=15)).strftime("%Y-%m-%d")
    if end_date > max_end:
        end_date = max_end
    if start_date > max_end:
        return {
            "error": True,
            "message": "Weather forecast is only available up to 16 days in advance.",
            "destination": destination,
            "latitude": latitude,
            "longitude": longitude,
        }

    try:
        async with httpx.AsyncClient(timeout=TIMEOUT) as client:
            resp = await client.get(
                WEATHER_URL,
                params={
                    "latitude": latitude,
                    "longitude": longitude,
                    "daily": "temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max,weathercode",
                    "current_weather": "true",
                    "timezone": "auto",
                    "start_date": start_date,
                    "end_date": end_date,
                },
            )
            resp.raise_for_status()
            data = resp.json()

        current = data.get("current_weather", {})
        daily = data.get("daily", {})

        forecast = []
        dates = daily.get("time", [])
        for i, date in enumerate(dates):
            wcode = daily["weathercode"][i] if daily.get("weathercode") else 0
            forecast.append({
                "date": date,
                "max_temp": daily["temperature_2m_max"][i] if daily.get("temperature_2m_max") else None,
                "min_temp": daily["temperature_2m_min"][i] if daily.get("temperature_2m_min") else None,
                "precipitation_mm": daily["precipitation_sum"][i] if daily.get("precipitation_sum") else 0,
                "rain_probability": daily["precipitation_probability_max"][i] if daily.get("precipitation_probability_max") else None,
                "weather_code": wcode,
                "description": WMO_DESCRIPTIONS.get(wcode, "Unknown"),
            })

        current_temp = current.get("temperature", 20)
        current_code = current.get("weathercode", 0)

        return {
            "error": False,
            "destination": destination,
            "latitude": latitude,
            "longitude": longitude,
            "current": {
                "temperature": current_temp,
                "windspeed": current.get("windspeed"),
                "weather_code": current_code,
                "description": WMO_DESCRIPTIONS.get(current_code, "Unknown"),
                "is_day": current.get("is_day", 1),
            },
            "forecast": forecast,
            "travel_advice": _travel_advice(current_temp, current_code),
            "packing_suggestions": _packing_suggestions(current_temp, current_code),
            "data_source": "Open-Meteo (open-meteo.com)",
            "fetched_at": datetime.now().isoformat(),
        }

    except httpx.TimeoutException:
        return {"error": True, "message": "Weather service timed out. Please try again.", "destination": destination}
    except Exception as e:
        logger.error(f"Weather fetch error: {e}")
        return {"error": True, "message": f"Weather data unavailable: {str(e)[:100]}", "destination": destination}
