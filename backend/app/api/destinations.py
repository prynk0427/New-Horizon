from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from app.db.database import get_db
from app.models.destination import Destination
from app.schemas.destination import DestinationResponse
from app.services.seed_data import get_seed_destinations
import logging

router = APIRouter()
logger = logging.getLogger(__name__)


def _seed_if_empty(db: Session):
    """Seed destinations if the table is empty."""
    count = db.query(Destination).count()
    if count == 0:
        seed_data = get_seed_destinations()
        for dest_data in seed_data:
            dest = Destination(**dest_data)
            db.add(dest)
        db.commit()
        logger.info(f"Seeded {len(seed_data)} destinations.")


@router.get("/", response_model=List[DestinationResponse])
async def list_destinations(
    search: Optional[str] = None,
    category: Optional[str] = None,
    tag: Optional[str] = None,
    db: Session = Depends(get_db),
):
    _seed_if_empty(db)
    query = db.query(Destination)
    if search:
        query = query.filter(
            Destination.name.ilike(f"%{search}%") |
            Destination.country.ilike(f"%{search}%") |
            Destination.region.ilike(f"%{search}%")
        )
    if category:
        query = query.filter(Destination.category.ilike(f"%{category}%"))
    destinations = query.order_by(Destination.name).all()
    if tag:
        tag_lower = tag.lower()
        destinations = [d for d in destinations if d.tags and any(tag_lower in t.lower() for t in d.tags)]
    return destinations


@router.get("/{destination_id}", response_model=DestinationResponse)
async def get_destination(destination_id: int, db: Session = Depends(get_db)):
    _seed_if_empty(db)
    dest = db.query(Destination).filter(Destination.id == destination_id).first()
    if not dest:
        raise HTTPException(status_code=404, detail="Destination not found")
    return dest
