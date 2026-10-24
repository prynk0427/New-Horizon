from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.db.database import get_db
from app.models.favourite import Favourite
from app.schemas.destination import FavouriteCreate, FavouriteResponse

router = APIRouter()


@router.get("/", response_model=List[FavouriteResponse])
async def list_favourites(db: Session = Depends(get_db)):
    return db.query(Favourite).order_by(Favourite.created_at.desc()).all()


@router.post("/", response_model=FavouriteResponse, status_code=201)
async def add_favourite(req: FavouriteCreate, db: Session = Depends(get_db)):
    # Check if already favourited
    existing = db.query(Favourite).filter(
        Favourite.destination_id == req.destination_id
    ).first()
    if existing:
        return existing

    fav = Favourite(
        destination_id=req.destination_id,
        destination_name=req.destination_name,
        destination_country=req.destination_country,
        image_url=req.image_url,
    )
    db.add(fav)
    db.commit()
    db.refresh(fav)
    return fav


@router.delete("/{favourite_id}", status_code=204)
async def remove_favourite(favourite_id: int, db: Session = Depends(get_db)):
    fav = db.query(Favourite).filter(Favourite.id == favourite_id).first()
    if not fav:
        raise HTTPException(status_code=404, detail="Favourite not found")
    db.delete(fav)
    db.commit()


@router.delete("/destination/{destination_id}", status_code=204)
async def remove_favourite_by_destination(destination_id: int, db: Session = Depends(get_db)):
    fav = db.query(Favourite).filter(Favourite.destination_id == destination_id).first()
    if not fav:
        raise HTTPException(status_code=404, detail="Favourite not found")
    db.delete(fav)
    db.commit()
