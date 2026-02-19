import sys
import os
import json

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
    
    questions = [
        # BI Layer Tests
        "What is the failure rate for each bank?",
        "Which network type has the highest fraud flag rate?",
        "What is the average transaction amount for Food merchant category?",
        
        # Multi-step decomposition tests
        "Which age group transacts the most and what is their failure rate?",
        "Which state has the highest volume and is it above average in fraud flags?",
        "Compare failure rates between Android and iOS users"
    ]
    
    print(f"\n{'='*20} STARTING REFINEMENTS TEST {'='*20}\n")
    
    results = {}

    for i, q in enumerate(questions):
        print(f"--- Question {i+1}: {q} ---")
        try:
            response = pipeline.process(q, session_id)
            
            intent = response.get("query_intent", "N/A")
            answer = response.get("answer", "")
            sql_used = response.get("sql_used", "")
            
            print(f"Query Intent: {intent}")
            print(f"Answer (first 200 chars): {answer[:200]}...")
            print(f"SQL Used: {sql_used}")
            
            has_business_implication = "Business Implication:" in answer
            decomposition_triggered = "| THEN |" in str(sql_used)
            
            print(f"Has 'Business Implication:': {has_business_implication}")
            print(f"Decomposition Triggered: {decomposition_triggered}")
            print("\n")

            results[i+1] = {
                "sql": sql_used,
                "has_bi": has_business_implication,
                "decomposition": decomposition_triggered
            }
            
        except Exception as e:
            print(f"Error processing question {i+1}: {e}\n")

    print(f"\n{'='*20} VERIFICATION RESULTS {'='*20}\n")
    
    # Check 1: Context Bleeding prevention
    # Q5 should NOT have 'sender_age_group' (from Q4)
    q5_sql = str(results.get(5, {}).get("sql", ""))
    bleed_fail_q5 = "sender_age_group" in q5_sql
    print(f"Q5 Context Bleed Check (should be False): {bleed_fail_q5}")

    # Q6 should NOT have 'sender_state' (from Q5) or 'sender_age_group' (from Q4)
    q6_sql = str(results.get(6, {}).get("sql", ""))
    bleed_fail_q6_state = "sender_state" in q6_sql
    bleed_fail_q6_age = "sender_age_group" in q6_sql
    print(f"Q6 Context Bleed State Check (should be False): {bleed_fail_q6_state}")
    print(f"Q6 Context Bleed Age Check (should be False): {bleed_fail_q6_age}")

    # Check 2: BI in Synthesis
    # Q4, Q5, Q6 should all have BI
    bi_q4 = results.get(4, {}).get("has_bi", False)
    bi_q5 = results.get(5, {}).get("has_bi", False)
    bi_q6 = results.get(6, {}).get("has_bi", False)
    
    print(f"Q4 Has BI: {bi_q4}")
    print(f"Q5 Has BI: {bi_q5}")
    print(f"Q6 Has BI: {bi_q6}")

    if not bleed_fail_q5 and not bleed_fail_q6_state and not bleed_fail_q6_age and bi_q4 and bi_q5 and bi_q6:
        print("\nSUCCESS: All bug fix checks passed!")
    else:
        print("\nFAILURE: Some checks failed.")

if __name__ == "__main__":
    run_test()
