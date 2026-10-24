from sqlalchemy import Column, Integer, String, Float, Text, DateTime, JSON
from sqlalchemy.sql import func
from app.db.database import Base


class Trip(Base):
    __tablename__ = "trips"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    destination = Column(String(255), nullable=False)
    starting_city = Column(String(255), nullable=True)
    start_date = Column(String(20), nullable=False)
    end_date = Column(String(20), nullable=False)
    num_travellers = Column(Integer, default=1)
    budget = Column(Float, nullable=False)
    currency = Column(String(10), default="USD")
    interests = Column(JSON, default=list)
    travel_style = Column(String(50), nullable=True)
    pace = Column(String(50), nullable=True)
    accommodation_pref = Column(String(100), nullable=True)
    dietary_prefs = Column(String(255), nullable=True)
    itinerary_data = Column(JSON, nullable=True)
    budget_data = Column(JSON, nullable=True)
    is_demo = Column(Integer, default=0)  # 0 = real AI, 1 = demo
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
