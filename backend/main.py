import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

try:
    from backend.routers import chat, sessions, dashboard
except ImportError:
    from routers import chat, sessions, dashboard

import logging

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

logger.info(f"InsightX API starting up... PORT: {os.getenv('PORT', '8000')}")

app = FastAPI(
    title="InsightX API",
    description="Conversational AI analytics for UPI transaction data",
    version="1.0.0"
)

# CORS — production-safe configuration
allowed_origins = [
    "http://localhost:3000",
    "https://localhost:3000",
    "http://localhost:3001",
    "https://localhost:3001",
]

frontend_url = os.getenv("FRONTEND_URL", "")
if frontend_url:
    allowed_origins.append(frontend_url)



app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

app.include_router(chat.router, prefix="/api", tags=["Chat"])
app.include_router(sessions.router, prefix="/api", tags=["Sessions"])
app.include_router(dashboard.router, prefix="/api", tags=["Dashboard"])

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "InsightX API"
    }
