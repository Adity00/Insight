import sys
import os
import json

# Add backend to sys.path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'backend'))

try:
    from core.session_manager import session_manager
    from core.query_pipeline import pipeline
except ImportError as e:
    print(f"Import Error: {e}")
    # Try alternate path if running from root
    sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
    from backend.core.session_manager import session_manager
    from backend.core.query_pipeline import pipeline

print("--- Test Pipeline ---")

# 1. Create session
session_id = session_manager.create_session()
print(f"Session Created: {session_id}")

# 2. First Question
q1 = "Which transaction type has the highest failure rate?"
print(f"\n--- Question 1: {q1} ---")
response1 = pipeline.process(q1, session_id)
print(json.dumps(response1, indent=2))

# 3. Follow-up Question
q2 = "What is the average amount for those transactions?"
print(f"\n--- Question 2: {q2} ---")
response2 = pipeline.process(q2, session_id)
print(json.dumps(response2, indent=2))

# 4. Check Context
print("\n--- Session Context ---")
ctx = session_manager.get_context_for_prompt(session_id)
print(json.dumps(ctx, indent=2))
