import sys
import os
import time

# Add parent directory to path to allow imports from core
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
try:
    from backend.core.query_pipeline import pipeline
    from backend.core.session_manager import session_manager
except ImportError:
    from core.query_pipeline import pipeline
    from core.session_manager import session_manager

def run_test():
    session_id = session_manager.create_session()
    print(f"Created session: {session_id}")
    
    pairs = [
        {
            "q1": "Which state has the highest transaction volume?",
            "q2": "What is the fraud rate in those states?",
            "check": lambda sql: "sender_state" in sql and "IN" in sql,
            "desc": "Context: Specific State"
        },
        {
            "q3": "Which hour of the day has the most transactions?",
            "q4": "What transaction types dominate at that hour?",
            "check": lambda sql: "hour_of_day" in sql,
            "desc": "Context: Specific Hour"
        },
        {
            "q5": "What is the failure rate for Bill Payment transactions?",
            "q6": "Compare that with Recharge",
            "check": lambda sql: "Bill Payment" in sql and "Recharge" in sql,
            "desc": "Context: Multiple Transaction Types"
        }
    ]
    
    questions = [
        ("q1", pairs[0]["q1"]),
        ("q2", pairs[0]["q2"]),
        ("q3", pairs[1]["q3"]),
        ("q4", pairs[1]["q4"]),
        ("q5", pairs[2]["q5"]),
        ("q6", pairs[2]["q6"])
    ]
    
    results = {}
    
    for q_id, q_text in questions:
        print(f"\n--- Asking: {q_text} ---")
        try:
            response = pipeline.process(q_text, session_id)
            sql = response.get("sql_used", "")
            print(f"SQL Generated: {sql}")
            results[q_id] = sql
            
            # Print Entity Tracker State
            session = session_manager.get_session(session_id)
            tracker = session.get("entity_tracker", {})
            print(f"Entity Tracker: {tracker}")
            
        except Exception as e:
            print(f"Error processing {q_id}: {e}")
            results[q_id] = ""

    # Verify Logic
    print("\n--- VERIFICATION RESULTS ---")
    all_passed = True
    
    # Check Q2
    q2_sql = results.get("q2", "")
    passed_q2 = pairs[0]["check"](q2_sql)
    print(f"Pair 1 (States) - Filter match: {passed_q2}")
    if not passed_q2: all_passed = False
    
    # Check Q4
    q4_sql = results.get("q4", "")
    passed_q4 = pairs[1]["check"](q4_sql)
    print(f"Pair 2 (Time) - Filter match: {passed_q4}")
    if not passed_q4: all_passed = False

    # Check Q6
    q6_sql = results.get("q6", "")
    passed_q6 = pairs[2]["check"](q6_sql)
    print(f"Pair 3 (Multi-Entity) - Filter match: {passed_q6}")
    if not passed_q6: all_passed = False
    
    if all_passed:
        print("\nSUCCESS: All context rules verified!")
    else:
        print("\nFAILURE: Some context rules failed.")

if __name__ == "__main__":
    run_test()
