from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.db.database import get_db
from app.models.trip import Trip
from app.schemas.trip import TripCreateRequest, TripResponse, TripUpdateRequest, BudgetEstimateRequest, BudgetEstimateResponse
from app.services.ai_service import generate_itinerary
from app.services.budget_service import estimate_budget
import logging


router = APIRouter()
logger = logging.getLogger(__name__)


@router.post("/generate")
async def generate_trip(req: TripCreateRequest):
    """Generate an AI itinerary without saving."""
    try:
        itinerary = await generate_itinerary(req)
        return {"success": True, "itinerary": itinerary.dict()}
    except Exception as e:
        logger.error(f"Trip generation error: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to generate itinerary: {str(e)}")


@router.post("/", response_model=TripResponse, status_code=201)
async def create_trip(req: TripCreateRequest, db: Session = Depends(get_db)):
    """Generate and save a trip."""
    try:
        itinerary = await generate_itinerary(req)
        budget_req = BudgetEstimateRequest(
            destination=req.destination,
            num_travellers=req.num_travellers,
            num_days=(len(itinerary.days)),
            budget=req.budget,
            currency=req.currency,
            accommodation_pref=req.accommodation_pref,
        )
        budget = estimate_budget(budget_req)

        title = f"{req.destination} — {req.start_date}"
        trip = Trip(
            title=title,
            destination=req.destination,
            starting_city=req.starting_city,
            start_date=req.start_date,
            end_date=req.end_date,
            num_travellers=req.num_travellers,
            budget=req.budget,
            currency=req.currency,
            interests=req.interests,
            travel_style=req.travel_style,
            pace=req.pace,
            accommodation_pref=req.accommodation_pref,
            dietary_prefs=req.dietary_prefs,
            itinerary_data=itinerary.dict(),
            budget_data=budget.dict(),
            is_demo=1 if itinerary.is_demo else 0,
        )
        db.add(trip)
        db.commit()
        db.refresh(trip)
        return trip
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Create trip error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/", response_model=List[TripResponse])
async def list_trips(db: Session = Depends(get_db)):
    return db.query(Trip).order_by(Trip.created_at.desc()).all()


@router.get("/{trip_id}", response_model=TripResponse)
async def get_trip(trip_id: int, db: Session = Depends(get_db)):
    trip = db.query(Trip).filter(Trip.id == trip_id).first()
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")
    return trip


@router.put("/{trip_id}", response_model=TripResponse)
async def update_trip(trip_id: int, req: TripUpdateRequest, db: Session = Depends(get_db)):
    trip = db.query(Trip).filter(Trip.id == trip_id).first()
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")
    if req.title is not None:
        trip.title = req.title
    if req.itinerary_data is not None:
        trip.itinerary_data = req.itinerary_data
    if req.budget_data is not None:
        trip.budget_data = req.budget_data
    db.commit()
    db.refresh(trip)
    return trip


@router.delete("/{trip_id}", status_code=204)
async def delete_trip(trip_id: int, db: Session = Depends(get_db)):
    trip = db.query(Trip).filter(Trip.id == trip_id).first()
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")
    db.delete(trip)
    db.commit()


