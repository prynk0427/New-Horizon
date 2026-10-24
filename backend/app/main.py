from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import logging

from app.core.config import settings
from app.db.database import init_db
from app.api import health, destinations, trips, favourites, weather, budget

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="New Horizon API",
    description="AI-powered Smart Tourism Platform — Explore Beyond the Expected.",
    version="1.0.0",
)

# CORS
origins = [
    settings.frontend_url,
    "http://localhost:5173",
    "http://localhost:3000",
    "https://new-horizon.vercel.app",
]
# Allow any vercel.app subdomain for deployment flexibility
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def startup():
    logger.info("Starting New Horizon API...")
    init_db()
    logger.info("Database initialized.")


# Routers
app.include_router(health.router, prefix="/api")
app.include_router(destinations.router, prefix="/api/destinations", tags=["Destinations"])
app.include_router(trips.router, prefix="/api/trips", tags=["Trips"])
app.include_router(favourites.router, prefix="/api/favourites", tags=["Favourites"])
app.include_router(weather.router, prefix="/api/weather", tags=["Weather"])
app.include_router(budget.router, prefix="/api/budget", tags=["Budget"])


@app.get("/")
async def root():
    return {"message": "New Horizon API is running. Visit /docs for the API documentation."}
