from sqlalchemy import Column, Integer, String, Float, Text, JSON, DateTime
from sqlalchemy.sql import func
from app.db.database import Base


class Destination(Base):
    __tablename__ = "destinations"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False, index=True)
    country = Column(String(255), nullable=False)
    region = Column(String(255), nullable=True)
    description = Column(Text, nullable=True)
    short_description = Column(String(500), nullable=True)
    image_url = Column(String(500), nullable=True)
    category = Column(String(100), nullable=True)
    tags = Column(JSON, default=list)
    attractions = Column(JSON, default=list)
    best_time_to_visit = Column(String(255), nullable=True)
    budget_range = Column(String(100), nullable=True)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
