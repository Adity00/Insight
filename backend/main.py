from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.routers import chat, sessions, dashboard

app = FastAPI(
    title="InsightX API",
    description="Conversational AI analytics for UPI transaction data",
    version="1.0.0"
)

# CORS — allow all origins for hackathon demo
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"]
)

app.include_router(chat.router, prefix="/api", tags=["Chat"])
app.include_router(sessions.router, prefix="/api", tags=["Sessions"])
app.include_router(dashboard.router, prefix="/api", tags=["Dashboard"])

@app.get("/health")
def health():
    return {"status": "ok", "service": "InsightX API"}
