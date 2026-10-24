from fastapi import APIRouter
from app.core.config import settings

router = APIRouter()


@router.get("/health")
async def health_check():
    return {
        "status": "ok",
        "app": "New Horizon API",
        "version": "1.0.0",
        "ai_enabled": bool(settings.gemini_api_key),
    }
