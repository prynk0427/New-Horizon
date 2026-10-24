"""
Budget estimation service.
All estimates are approximate and clearly labelled as such.
"""
from app.schemas.trip import BudgetEstimateRequest, BudgetEstimateResponse, BudgetCategory
from typing import List


# Rough daily cost multipliers by region (USD, per person)
REGION_COSTS = {
    "default": {"accommodation": 80, "food": 40, "transport": 20, "attractions": 25, "misc": 15},
    "southeast_asia": {"accommodation": 35, "food": 15, "transport": 8, "attractions": 10, "misc": 8},
    "europe": {"accommodation": 110, "food": 55, "transport": 30, "attractions": 35, "misc": 20},
    "north_america": {"accommodation": 130, "food": 60, "transport": 40, "attractions": 30, "misc": 25},
    "south_america": {"accommodation": 60, "food": 25, "transport": 15, "attractions": 15, "misc": 10},
    "middle_east": {"accommodation": 100, "food": 45, "transport": 25, "attractions": 20, "misc": 15},
    "africa": {"accommodation": 70, "food": 30, "transport": 20, "attractions": 20, "misc": 12},
    "oceania": {"accommodation": 120, "food": 60, "transport": 35, "attractions": 30, "misc": 20},
}

ACCOMMODATION_MULTIPLIERS = {
    "budget": 0.5,
    "hostel": 0.4,
    "mid-range": 1.0,
    "boutique": 1.4,
    "luxury": 2.5,
    "premium": 3.0,
}

SE_ASIA_KEYWORDS = ["thailand", "vietnam", "cambodia", "bali", "indonesia", "malaysia",
                    "philippines", "myanmar", "laos", "singapore"]
EUROPE_KEYWORDS = ["paris", "london", "rome", "barcelona", "amsterdam", "berlin",
                   "prague", "vienna", "italy", "france", "spain", "germany", "uk",
                   "switzerland", "greece", "portugal"]
NA_KEYWORDS = ["new york", "los angeles", "chicago", "miami", "toronto", "canada",
               "usa", "united states", "mexico"]
SA_KEYWORDS = ["brazil", "colombia", "peru", "argentina", "chile", "ecuador", "bolivia"]
ME_KEYWORDS = ["dubai", "abu dhabi", "istanbul", "jordan", "egypt", "saudi", "israel"]
AFRICA_KEYWORDS = ["kenya", "south africa", "morocco", "tanzania", "ghana", "nigeria"]
OCEANIA_KEYWORDS = ["australia", "new zealand", "sydney", "melbourne", "auckland", "fiji"]


def _detect_region(destination: str) -> str:
    dest_lower = destination.lower()
    if any(k in dest_lower for k in SE_ASIA_KEYWORDS):
        return "southeast_asia"
    if any(k in dest_lower for k in EUROPE_KEYWORDS):
        return "europe"
    if any(k in dest_lower for k in NA_KEYWORDS):
        return "north_america"
    if any(k in dest_lower for k in SA_KEYWORDS):
        return "south_america"
    if any(k in dest_lower for k in ME_KEYWORDS):
        return "middle_east"
    if any(k in dest_lower for k in AFRICA_KEYWORDS):
        return "africa"
    if any(k in dest_lower for k in OCEANIA_KEYWORDS):
        return "oceania"
    return "default"


def estimate_budget(req: BudgetEstimateRequest) -> BudgetEstimateResponse:
    region = _detect_region(req.destination)
    costs = REGION_COSTS.get(region, REGION_COSTS["default"])

    acc_multiplier = ACCOMMODATION_MULTIPLIERS.get(
        (req.accommodation_pref or "mid-range").lower(), 1.0
    )

    per_person_per_day_accommodation = costs["accommodation"] * acc_multiplier
    accommodation_total = per_person_per_day_accommodation * req.num_days * req.num_travellers
    food_total = costs["food"] * req.num_days * req.num_travellers
    transport_total = costs["transport"] * req.num_days * req.num_travellers
    attractions_total = costs["attractions"] * req.num_days * req.num_travellers
    activities_total = costs["attractions"] * 0.5 * req.num_days * req.num_travellers
    shopping_total = costs["misc"] * req.num_days * req.num_travellers
    misc_total = costs["misc"] * 0.5 * req.num_days * req.num_travellers
    contingency = (accommodation_total + food_total + transport_total + attractions_total) * 0.1

    categories = [
        BudgetCategory(name="Accommodation", estimated_cost=round(accommodation_total, 2)),
        BudgetCategory(name="Food & Dining", estimated_cost=round(food_total, 2)),
        BudgetCategory(name="Local Transport", estimated_cost=round(transport_total, 2)),
        BudgetCategory(name="Attractions & Entry", estimated_cost=round(attractions_total, 2)),
        BudgetCategory(name="Activities", estimated_cost=round(activities_total, 2)),
        BudgetCategory(name="Shopping", estimated_cost=round(shopping_total, 2)),
        BudgetCategory(name="Miscellaneous", estimated_cost=round(misc_total, 2)),
        BudgetCategory(name="Contingency (10%)", estimated_cost=round(contingency, 2)),
    ]

    total = sum(c.estimated_cost for c in categories)
    remaining = req.budget - total

    warnings = []
    if remaining < 0:
        warnings.append(f"Estimated costs exceed your budget by {abs(remaining):.0f} {req.currency}.")
    elif remaining < total * 0.1:
        warnings.append("Your budget is tight. Consider trimming some categories.")

    return BudgetEstimateResponse(
        total_estimated=round(total, 2),
        per_traveller=round(total / max(req.num_travellers, 1), 2),
        per_day=round(total / max(req.num_days, 1), 2),
        remaining=round(remaining, 2),
        categories=categories,
        currency=req.currency,
        warnings=warnings,
    )
