"""
Authentication router for InsightX.
Provides register, login, /me, and logout endpoints.
Uses bcrypt + JWT, stored in the same SQLite persistence DB.
"""

import os
import datetime
import logging
import sqlite3
from typing import Optional

import bcrypt
import jwt
from fastapi import APIRouter, HTTPException, Response, Request
from pydantic import BaseModel, EmailStr, field_validator

logger = logging.getLogger(__name__)

router = APIRouter()

# JWT configuration
JWT_SECRET = os.getenv("JWT_SECRET", "insightx-dev-secret-change-in-production")
JWT_ALGORITHM = "HS256"
JWT_EXPIRY_HOURS = 72  # 3 days

# Reuse the same DB path from persistence
DB_PATH = os.getenv(
    "DB_PATH",
    os.path.join(os.path.dirname(__file__), "..", "data", "insightx.db")
)


# ── Pydantic Models ────────────────────────────────────────

class RegisterRequest(BaseModel):
    name: str
    email: str
    password: str

    @field_validator("name")
    @classmethod
    def name_not_empty(cls, v: str) -> str:
        v = v.strip()
        if len(v) < 2:
            raise ValueError("Name must be at least 2 characters")
        if len(v) > 100:
            raise ValueError("Name must be at most 100 characters")
        return v

    @field_validator("email")
    @classmethod
    def email_valid(cls, v: str) -> str:
        v = v.strip().lower()
        if "@" not in v or "." not in v.split("@")[-1]:
            raise ValueError("Invalid email address")
        return v

    @field_validator("password")
    @classmethod
    def password_strong(cls, v: str) -> str:
        if len(v) < 6:
            raise ValueError("Password must be at least 6 characters")
        if len(v) > 128:
            raise ValueError("Password too long")
        return v


class LoginRequest(BaseModel):
    email: str
    password: str

    @field_validator("email")
    @classmethod
    def email_clean(cls, v: str) -> str:
        return v.strip().lower()


class AuthResponse(BaseModel):
    user: dict
    token: str


class UserResponse(BaseModel):
    id: int
    name: str
    email: str
    created_at: str


# ── Database Helpers ───────────────────────────────────────

def _get_conn() -> sqlite3.Connection:
    conn = sqlite3.connect(DB_PATH, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA journal_mode=WAL")
    conn.execute("PRAGMA busy_timeout=5000")
    return conn


def _init_users_table():
    """Create users table if it doesn't exist."""
    try:
        conn = _get_conn()
        conn.execute("""
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                email TEXT NOT NULL UNIQUE,
                password_hash TEXT NOT NULL,
                created_at TEXT NOT NULL
            )
        """)
        conn.execute("CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)")
        conn.commit()
        conn.close()
        logger.info("Auth: users table initialized")
    except Exception as e:
        logger.error(f"Auth: failed to init users table: {e}")


# Initialize on module load
_init_users_table()


# ── JWT Helpers ────────────────────────────────────────────

def _create_token(user_id: int, email: str, name: str) -> str:
    payload = {
        "sub": str(user_id),
        "email": email,
        "name": name,
        "exp": datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(hours=JWT_EXPIRY_HOURS),
        "iat": datetime.datetime.now(datetime.timezone.utc),
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)


def _decode_token(token: str) -> Optional[dict]:
    try:
        return jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
    except jwt.ExpiredSignatureError:
        logger.warning("Token expired")
        return None
    except jwt.InvalidTokenError as e:
        logger.warning(f"Invalid token: {e}")
        return None


def _get_token_from_request(request: Request) -> Optional[str]:
    """Extract token from Authorization header or cookie."""
    # 1. Try Authorization header first (explicitly set by client)
    auth_header = request.headers.get("Authorization", "")
    if auth_header.startswith("Bearer "):
        return auth_header[7:]
    
    # 2. Fallback to cookie
    token = request.cookies.get("insightx_token")
    if token:
        return token
    return None


# ── Auth Dependency (reusable across routers) ─────────────

async def require_auth(request: Request) -> dict:
    """FastAPI dependency: extract + validate JWT. Returns user payload dict."""
    token = _get_token_from_request(request)
    if not token:
        logger.warning(f"Auth failed [{request.url.path}]: No token found")
        raise HTTPException(status_code=401, detail="Authentication required")
    payload = _decode_token(token)
    if not payload:
        logger.warning(f"Auth failed [{request.url.path}]: Token payload invalid or expired")
        raise HTTPException(status_code=401, detail="Session expired. Please login again.")
    
    # Clean fallback for missing email/name
    return {
        "id": int(payload["sub"]), 
        "email": payload.get("email", ""), 
        "name": payload.get("name", "")
    }


# ── Routes ────────────────────────────────────────────────

@router.post("/auth/register", response_model=AuthResponse)
async def register(body: RegisterRequest, response: Response):
    """Create a new user account."""
    conn = _get_conn()
    try:
        # Check for existing user
        existing = conn.execute(
            "SELECT id FROM users WHERE email = ?", (body.email,)
        ).fetchone()
        if existing:
            raise HTTPException(status_code=409, detail="An account with this email already exists")

        # Hash password
        password_hash = bcrypt.hashpw(body.password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")
        now = datetime.datetime.now(datetime.timezone.utc).isoformat()

        # Insert user
        cursor = conn.execute(
            "INSERT INTO users (name, email, password_hash, created_at) VALUES (?, ?, ?, ?)",
            (body.name, body.email, password_hash, now)
        )
        conn.commit()
        user_id = cursor.lastrowid

        # Generate token
        token = _create_token(user_id, body.email, body.name)

        # Set httpOnly cookie
        response.set_cookie(
            key="insightx_token",
            value=token,
            httponly=True,
            secure=False,  # Set to True in production with HTTPS
            samesite="lax",
            max_age=JWT_EXPIRY_HOURS * 3600,
            path="/",
        )

        return AuthResponse(
            user={"id": user_id, "name": body.name, "email": body.email, "created_at": now},
            token=token,
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Register failed: {e}")
        raise HTTPException(status_code=500, detail="Registration failed. Please try again.")
    finally:
        conn.close()


@router.post("/auth/login", response_model=AuthResponse)
async def login(body: LoginRequest, response: Response):
    """Authenticate and return a JWT token."""
    conn = _get_conn()
    try:
        row = conn.execute(
            "SELECT id, name, email, password_hash, created_at FROM users WHERE email = ?",
            (body.email,)
        ).fetchone()

        if not row:
            raise HTTPException(status_code=401, detail="Invalid email or password")

        user = dict(row)

        # Verify password
        if not bcrypt.checkpw(body.password.encode("utf-8"), user["password_hash"].encode("utf-8")):
            raise HTTPException(status_code=401, detail="Invalid email or password")

        # Generate token
        token = _create_token(user["id"], user["email"], user["name"])

        # Set httpOnly cookie
        response.set_cookie(
            key="insightx_token",
            value=token,
            httponly=True,
            secure=False,
            samesite="lax",
            max_age=JWT_EXPIRY_HOURS * 3600,
            path="/",
        )

        return AuthResponse(
            user={
                "id": user["id"],
                "name": user["name"],
                "email": user["email"],
                "created_at": user["created_at"],
            },
            token=token,
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Login failed: {e}")
        raise HTTPException(status_code=500, detail="Login failed. Please try again.")
    finally:
        conn.close()


@router.get("/auth/me")
async def get_current_user(request: Request):
    """Return the current authenticated user from token."""
    token = _get_token_from_request(request)
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")

    payload = _decode_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Session expired. Please login again.")

    # Fetch fresh user data
    conn = _get_conn()
    try:
        row = conn.execute(
            "SELECT id, name, email, created_at FROM users WHERE id = ?",
            (int(payload["sub"]),)
        ).fetchone()
        if not row:
            raise HTTPException(status_code=401, detail="User not found")

        return dict(row)
    finally:
        conn.close()


@router.post("/auth/logout")
async def logout(response: Response):
    """Clear authentication cookie."""
    response.delete_cookie(
        key="insightx_token",
        path="/",
        httponly=True,
        samesite="lax",
    )
    return {"message": "Logged out successfully"}
