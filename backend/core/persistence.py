import os
import sqlite3
import json
import datetime
import logging
from typing import List, Dict, Any, Optional

logger = logging.getLogger(__name__)

# Environment-aware database path
DB_PATH = os.getenv(
    "DB_PATH",
    os.path.join(
        os.path.dirname(__file__),
        "..",
        "data",
        "insightx.db"
    )
)


class PersistenceManager:
    """
    SQLite-backed persistence for sessions and turns.
    Thread-safe via check_same_thread=False + WAL mode.
    All public methods are fault-tolerant — they never crash the main app.
    """

    def __init__(self):
        self.db_path = DB_PATH
        # Ensure the directory exists
        os.makedirs(os.path.dirname(os.path.abspath(self.db_path)), exist_ok=True)
        self._init_db()

    def _get_conn(self) -> sqlite3.Connection:
        conn = sqlite3.connect(self.db_path, check_same_thread=False)
        conn.row_factory = sqlite3.Row
        conn.execute("PRAGMA journal_mode=WAL")
        conn.execute("PRAGMA busy_timeout=5000")
        return conn

    def _init_db(self):
        try:
            conn = self._get_conn()
            conn.executescript("""
                CREATE TABLE IF NOT EXISTS sessions (
                    session_id TEXT PRIMARY KEY,
                    created_at TEXT NOT NULL,
                    title TEXT NOT NULL DEFAULT 'New Chat',
                    turn_count INTEGER NOT NULL DEFAULT 0,
                    last_active TEXT NOT NULL
                );

                CREATE TABLE IF NOT EXISTS turns (
                    turn_id INTEGER PRIMARY KEY AUTOINCREMENT,
                    session_id TEXT NOT NULL,
                    role TEXT NOT NULL,
                    content TEXT NOT NULL,
                    sql_used TEXT,
                    execution_time_ms REAL,
                    chart TEXT,
                    timestamp TEXT NOT NULL,
                    FOREIGN KEY(session_id) REFERENCES sessions(session_id)
                );

                CREATE INDEX IF NOT EXISTS idx_turns_session ON turns(session_id);
            """)
            conn.commit()
            conn.close()
            logger.info(f"PersistenceManager initialized. DB at: {self.db_path}")
        except Exception as e:
            logger.error(f"Failed to initialize persistence DB: {e}")

    # ─── Session Operations ───────────────────────────────────────────

    def create_session(self, session_id: str) -> bool:
        try:
            now = datetime.datetime.now().isoformat()
            conn = self._get_conn()
            conn.execute(
                "INSERT OR IGNORE INTO sessions (session_id, created_at, title, turn_count, last_active) VALUES (?, ?, ?, ?, ?)",
                (session_id, now, "New Chat", 0, now)
            )
            conn.commit()
            conn.close()
            return True
        except Exception as e:
            logger.error(f"Persistence create_session failed: {e}")
            return False

    def get_session(self, session_id: str) -> Optional[Dict[str, Any]]:
        try:
            conn = self._get_conn()
            row = conn.execute(
                "SELECT * FROM sessions WHERE session_id = ?", (session_id,)
            ).fetchone()
            conn.close()
            if row:
                return dict(row)
            return None
        except Exception as e:
            logger.error(f"Persistence get_session failed: {e}")
            return None

    def get_all_sessions(self) -> List[Dict[str, Any]]:
        try:
            conn = self._get_conn()
            rows = conn.execute(
                "SELECT * FROM sessions ORDER BY last_active DESC"
            ).fetchall()
            conn.close()
            return [dict(r) for r in rows]
        except Exception as e:
            logger.error(f"Persistence get_all_sessions failed: {e}")
            return []

    def delete_session(self, session_id: str) -> bool:
        try:
            conn = self._get_conn()
            conn.execute("DELETE FROM turns WHERE session_id = ?", (session_id,))
            result = conn.execute("DELETE FROM sessions WHERE session_id = ?", (session_id,))
            conn.commit()
            deleted = result.rowcount > 0
            conn.close()
            return deleted
        except Exception as e:
            logger.error(f"Persistence delete_session failed: {e}")
            return False

    def rename_session(self, session_id: str, new_title: str) -> bool:
        try:
            conn = self._get_conn()
            result = conn.execute(
                "UPDATE sessions SET title = ? WHERE session_id = ?",
                (new_title, session_id)
            )
            conn.commit()
            updated = result.rowcount > 0
            conn.close()
            return updated
        except Exception as e:
            logger.error(f"Persistence rename_session failed: {e}")
            return False

    # ─── Turn Operations ──────────────────────────────────────────────

    def save_turn(
        self,
        session_id: str,
        role: str,
        content: str,
        sql_used: Optional[str] = None,
        execution_time_ms: Optional[float] = None,
        chart: Any = None
    ) -> bool:
        """
        Save a turn to the database.
        Also updates session turn_count, last_active, and auto-generates title.
        Never crashes the main app.
        """
        try:
            now = datetime.datetime.now().isoformat()
            chart_json = json.dumps(chart) if chart else None

            conn = self._get_conn()

            # Insert the turn
            conn.execute(
                """INSERT INTO turns (session_id, role, content, sql_used, execution_time_ms, chart, timestamp)
                   VALUES (?, ?, ?, ?, ?, ?, ?)""",
                (session_id, role, content, sql_used, execution_time_ms, chart_json, now)
            )

            # Update session turn_count and last_active
            conn.execute(
                """UPDATE sessions
                   SET turn_count = turn_count + 1,
                       last_active = ?
                   WHERE session_id = ?""",
                (now, session_id)
            )

            # Auto-generate title from first user message
            if role == "user":
                row = conn.execute(
                    "SELECT title FROM sessions WHERE session_id = ?", (session_id,)
                ).fetchone()
                if row and row["title"] == "New Chat":
                    auto_title = content[:40] + ("..." if len(content) > 40 else "")
                    conn.execute(
                        "UPDATE sessions SET title = ? WHERE session_id = ?",
                        (auto_title, session_id)
                    )

            conn.commit()
            conn.close()
            return True
        except Exception as e:
            logger.error(f"Persistence save_turn failed: {e}")
            return False

    def get_turns(self, session_id: str) -> List[Dict[str, Any]]:
        """
        Return all turns for a session, ordered by turn_id ASC.
        Deserializes chart JSON. Returns empty list on failure.
        """
        try:
            conn = self._get_conn()
            rows = conn.execute(
                "SELECT * FROM turns WHERE session_id = ? ORDER BY turn_id ASC",
                (session_id,)
            ).fetchall()
            conn.close()

            result = []
            for row in rows:
                turn = dict(row)
                # Deserialize chart JSON
                if turn.get("chart"):
                    try:
                        turn["chart"] = json.loads(turn["chart"])
                    except (json.JSONDecodeError, TypeError):
                        turn["chart"] = None
                result.append(turn)
            return result
        except Exception as e:
            logger.error(f"Persistence get_turns failed: {e}")
            return []


# Singleton — auto-initializes at import time
persistence = PersistenceManager()
