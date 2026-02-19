from fastapi import APIRouter
from backend.models.schemas import DashboardResponse
from backend.core.database import db

router = APIRouter()

@router.get("/dashboard", response_model=DashboardResponse)
def get_dashboard():
    profile = db.get_data_profile()
    
    # Calculate top items from distributions
    type_dist = profile.get("transaction_type_distribution", {})
    top_type = max(type_dist, key=type_dist.get) if type_dist else "None"
    
    top_5_states = profile.get("top_5_states", [])
    top_state = top_5_states[0]["state"] if top_5_states else "None"
    
    return DashboardResponse(
        total_transactions=profile.get("total_rows", 0),
        success_rate=profile.get("success_rate", 0.0),
        fraud_flag_rate=profile.get("fraud_flag_rate", 0.0),
        avg_amount_inr=profile.get("avg_amount_inr", 0.0),
        peak_hour=profile.get("peak_hour", 0),
        top_transaction_type=top_type,
        top_state=top_state,
        device_distribution=profile.get("device_distribution", {}),
        network_distribution=profile.get("network_distribution", {}),
        transaction_type_distribution=type_dist,
        date_range=profile.get("date_range", {})
    )
