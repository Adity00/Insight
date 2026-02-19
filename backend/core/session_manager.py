import uuid
import datetime
from typing import Dict, List, Any, Optional

class SessionManager:
    def __init__(self):
        # In-memory storage: {session_id: session_dict}
        self.sessions: Dict[str, Dict[str, Any]] = {}

    def create_session(self) -> str:
        """
        Generate a unique session_id and initialize the session structure.
        """
        session_id = str(uuid.uuid4())
        now = datetime.datetime.now().isoformat()
        
        self.sessions[session_id] = {
            "session_id": session_id,
            "title": "New Chat", # Will be updated after first turn
            "created_at": now,
            "last_active": now,
            "turns": [],
            "entity_tracker": {
                "states": [],
                "transaction_types": [],
                "age_groups": [],
                "time_filters": {},
                "metric": "",
                "last_hour": None,
                "last_category": None
            },
            "summary": ""
        }
        return session_id

    def get_session(self, session_id: str) -> Optional[Dict[str, Any]]:
        return self.sessions.get(session_id)

    def get_all_sessions(self) -> List[Dict[str, Any]]:
        """
        Return list of lightweight session objects for UI sidebar.
        """
        result = []
        # Sort by last_active descending
        sorted_sessions = sorted(
            self.sessions.values(), 
            key=lambda x: x["last_active"], 
            reverse=True
        )
        
        for sess in sorted_sessions:
            result.append({
                "session_id": sess["session_id"],
                "title": sess["title"],
                "created_at": sess["created_at"],
                "last_active": sess["last_active"],
                "turn_count": len(sess["turns"])
            })
        return result

    def add_turn(self, session_id: str, turn_data: Dict[str, Any]) -> None:
        if session_id not in self.sessions:
            return # Should probably raise error, but failing silently/gracefully for now
            
        session = self.sessions[session_id]
        
        # 1. Append turn
        session["turns"].append(turn_data)
        
        # 2. Update last_active
        session["last_active"] = datetime.datetime.now().isoformat()
        
        # 3. Set title if first turn
        if len(session["turns"]) == 1:
            user_q = turn_data.get("user_question", "")
            session["title"] = user_q[:50] + ("..." if len(user_q) > 50 else "")

        # 4. Update entity tracker
        # Merge new entities: replace lists/values if they exist in the new turn
        new_entities = turn_data.get("entities", {})
        tracker = session["entity_tracker"]
        
        if new_entities:
            for key, val in new_entities.items():
                # Only update if val is truthy (not empty list/dict/None/string)
                if val: 
                    tracker[key] = val
        
        # 5. Update summary every 5 turns
        if len(session["turns"]) % 5 == 0:
            self._update_summary(session_id)

    def get_context_for_prompt(self, session_id: str) -> Dict[str, Any]:
        """
        Prepare context for the query pipeline prompt.
        """
        session = self.sessions.get(session_id)
        if not session:
            return {
                "recent_turns": [],
                "entity_tracker": {},
                "summary": "",
                "turn_count": 0
            }
            
        # Get last 4 turns, extracted fields only
        raw_turns = session["turns"][-4:]
        recent_turns = []
        for t in raw_turns:
            recent_turns.append({
                "role": "user", "content": t.get("user_question", "")
            })
            recent_turns.append({
                "role": "assistant", "content": t.get("answer", "")
            })

        return {
            "recent_turns": recent_turns, # This matches the conversation_history structure PromptBuilder expects? 
                                          # PromptBuilder expects [{"role":..., "content":...}]. 
                                          # Yes, I constructed it that way above.
            "entity_tracker": session["entity_tracker"],
            "summary": session["summary"],
            "turn_count": len(session["turns"])
        }

    def _update_summary(self, session_id: str) -> None:
        """
        Build a simple programmatic summary.
        """
        session = self.sessions.get(session_id)
        if not session:
            return
            
        intents = [t.get("query_intent", "") for t in session["turns"] if t.get("query_intent")]
        tracker = session["entity_tracker"]
        
        # Simple extraction
        states = ", ".join(tracker.get("states", []))
        types = ", ".join(tracker.get("transaction_types", []))
        metric = tracker.get("metric", "None")
        
        summary = f"User explored: {'; '.join(intents[-5:])}. Key entities discussed: States=[{states}], Types=[{types}]. Last metric: {metric}."
        session["summary"] = summary

    def delete_session(self, session_id: str) -> bool:
        if session_id in self.sessions:
            del self.sessions[session_id]
            return True
        return False

# Export singleton
session_manager = SessionManager()
