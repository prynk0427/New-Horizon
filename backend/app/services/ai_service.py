"""
Gemini AI service for itinerary generation.
Falls back to demo mode when GEMINI_API_KEY is not configured.
"""
import json
import logging
from typing import Optional
from app.core.config import settings
from app.schemas.trip import TripCreateRequest, ItinerarySchema, DayItinerarySchema, ActivitySchema
from datetime import datetime, timedelta
import uuid

logger = logging.getLogger(__name__)


def _date_range(start: str, end: str):
    start_dt = datetime.strptime(start, "%Y-%m-%d")
    end_dt = datetime.strptime(end, "%Y-%m-%d")
    days = []
    current = start_dt
    while current <= end_dt:
        days.append(current.strftime("%Y-%m-%d"))
        current += timedelta(days=1)
    return days


def _demo_itinerary(req: TripCreateRequest) -> ItinerarySchema:
    """Generate a clearly-labelled demo itinerary."""
    dates = _date_range(req.start_date, req.end_date)
    num_days = len(dates)
    daily_budget = req.budget / max(num_days, 1)

    days = []
    for i, date in enumerate(dates):
        day_num = i + 1
        morning = [ActivitySchema(
            id=str(uuid.uuid4()),
            name=f"Explore {req.destination} Old Town" if i == 0 else f"Day {day_num} Morning Walk",
            description=f"Begin your day exploring the historic streets and local landmarks of {req.destination}.",
            time="09:00",
            duration="2 hours",
            estimated_cost=round(daily_budget * 0.1, 2),
            location=req.destination,
            category="morning",
        )]
        afternoon = [ActivitySchema(
            id=str(uuid.uuid4()),
            name=f"Local Market & Cuisine",
            description=f"Visit the vibrant local market and sample traditional dishes of {req.destination}.",
            time="13:00",
            duration="3 hours",
            estimated_cost=round(daily_budget * 0.25, 2),
            location=req.destination,
            category="afternoon",
        )]
        evening = [ActivitySchema(
            id=str(uuid.uuid4()),
            name="Sunset Viewpoint & Dinner",
            description=f"Watch the sunset from a scenic viewpoint and enjoy a delicious dinner.",
            time="18:30",
            duration="2.5 hours",
            estimated_cost=round(daily_budget * 0.3, 2),
            location=req.destination,
            category="evening",
        )]
        daily_total = sum(a.estimated_cost for a in morning + afternoon + evening)
        days.append(DayItinerarySchema(
            day_number=day_num,
            date=date,
            morning=morning,
            afternoon=afternoon,
            evening=evening,
            daily_budget=round(daily_total, 2),
            tips=[
                "Carry local currency for small purchases.",
                "Book popular restaurants in advance.",
            ],
            weather_alternatives=[
                f"Visit an indoor museum if it rains.",
                "Enjoy a local cooking class as an alternative.",
            ],
        ))

    total = sum(d.daily_budget for d in days)
    return ItinerarySchema(
        destination=req.destination,
        total_days=num_days,
        total_estimated_cost=round(total, 2),
        currency=req.currency,
        days=days,
        overview=f"[DEMO MODE] A {num_days}-day sample itinerary for {req.destination}. "
                 f"This is a demo response — connect your Gemini API key for a real AI-generated plan.",
        packing_tips=["Comfortable walking shoes", "Sunscreen", "Portable charger", "Travel adapter"],
        local_tips=[
            f"The best way to experience {req.destination} is to explore on foot.",
            "Learn a few phrases in the local language — locals appreciate the effort.",
        ],
        is_demo=True,
    )


async def generate_itinerary(req: TripCreateRequest) -> ItinerarySchema:
    """Generate an AI itinerary using Gemini, or fall back to demo mode."""
    if not settings.gemini_api_key:
        logger.info("No GEMINI_API_KEY set — returning demo itinerary.")
        return _demo_itinerary(req)

    try:
        import google.generativeai as genai
        genai.configure(api_key=settings.gemini_api_key)
        model = genai.GenerativeModel("gemini-3.5-flash-lite")

        dates = _date_range(req.start_date, req.end_date)
        num_days = len(dates)
        interests_str = ", ".join(req.interests) if req.interests else "general sightseeing"

        prompt = f"""You are a professional travel planner. Create a detailed {num_days}-day itinerary for the following trip.

Destination: {req.destination}
Starting City: {req.starting_city or "Not specified"}
Travel Dates: {req.start_date} to {req.end_date} ({num_days} days)
Number of Travellers: {req.num_travellers}
Total Budget: {req.budget} {req.currency}
Daily Budget: {round(req.budget / num_days, 2)} {req.currency}
Interests: {interests_str}
Travel Style: {req.travel_style or "flexible"}
Pace: {req.pace or "balanced"}
Accommodation: {req.accommodation_pref or "mid-range"}
Dietary Preferences: {req.dietary_prefs or "none specified"}

Return a JSON object with this exact structure:
{{
  "destination": "{req.destination}",
  "total_days": {num_days},
  "total_estimated_cost": <number>,
  "currency": "{req.currency}",
  "overview": "<2-3 sentence overview of the trip>",
  "packing_tips": ["<tip1>", "<tip2>", "<tip3>"],
  "local_tips": ["<tip1>", "<tip2>", "<tip3>"],
  "days": [
    {{
      "day_number": 1,
      "date": "{dates[0]}",
      "daily_budget": <number>,
      "tips": ["<local tip>"],
      "weather_alternatives": ["<alternative activity if weather is bad>"],
      "morning": [
        {{
          "id": "<unique_id>",
          "name": "<activity name>",
          "description": "<2-3 sentence description>",
          "time": "09:00",
          "duration": "<e.g. 2 hours>",
          "estimated_cost": <number per person>,
          "location": "<specific place name>",
          "category": "morning"
        }}
      ],
      "afternoon": [...],
      "evening": [...]
    }}
  ]
}}

Important:
- All costs are per person in {req.currency}.
- Include 1-2 activities per time slot.
- Be specific about place names.
- Return ONLY valid JSON, no markdown, no extra text.
"""

        response = model.generate_content(prompt)
        raw = response.text.strip()

        # Strip markdown code fences if present
        if raw.startswith("```"):
            raw = raw.split("```")[1]
            if raw.startswith("json"):
                raw = raw[4:]
            raw = raw.strip()

        data = json.loads(raw)

        # Ensure UUIDs for activity IDs
        for day in data.get("days", []):
            for slot in ["morning", "afternoon", "evening"]:
                for act in day.get(slot, []):
                    if not act.get("id"):
                        act["id"] = str(uuid.uuid4())

        data["is_demo"] = False
        return ItinerarySchema(**data)

    except Exception as e:
        logger.error(f"Gemini generation failed: {e}")
        fallback = _demo_itinerary(req)
        fallback.overview = f"[DEMO MODE — AI error: {str(e)[:100]}] " + fallback.overview
        return fallback
