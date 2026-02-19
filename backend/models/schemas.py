from pydantic import BaseModel
from typing import Dict, List, Optional, Union

class ChatRequest(BaseModel):
    question: str           # user's natural language question
    session_id: str         # which session this belongs to

class ChatResponse(BaseModel):
    answer: str
    sql_used: Optional[str] = None
    chart: Optional[Dict] = None
    proactive_insight: Optional[str] = None
    query_intent: Optional[str] = None
    execution_time_ms: Optional[float] = None
    is_clarification: bool
    session_id: str

class SessionCreateResponse(BaseModel):
    session_id: str
    created_at: str

class SessionListItem(BaseModel):
    session_id: str
    title: str
    created_at: str
    last_active: str
    turn_count: int

class DashboardResponse(BaseModel):
    total_transactions: int
    success_rate: float
    fraud_flag_rate: float
    avg_amount_inr: float
    peak_hour: int
    top_transaction_type: str
    top_state: str
    device_distribution: Dict[str, int]
    network_distribution: Dict[str, int]
    transaction_type_distribution: Dict[str, int]
    date_range: Dict[str, str]
