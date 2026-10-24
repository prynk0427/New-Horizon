from fastapi import APIRouter
from app.schemas.trip import BudgetEstimateRequest, BudgetEstimateResponse
from app.services.budget_service import estimate_budget

router = APIRouter()


@router.post("/estimate", response_model=BudgetEstimateResponse)
async def estimate_trip_budget(req: BudgetEstimateRequest):
    """Estimate trip budget by category."""
    return estimate_budget(req)
