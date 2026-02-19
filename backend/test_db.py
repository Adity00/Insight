import sys
import os

# Add backend to sys.path
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

try:
    from backend.core.database import db
except ImportError:
    # Attempt absolute import if running from root
    try:
        from insightx.backend.core.database import db
    except ImportError:
         print("Failed to import db. Check paths.")
         sys.exit(1)

if db is None:
    print("DatabaseManager failed to initialize (likely missing CSV).")
    sys.exit(1)

print("--- Data Profile ---")
profile = db.get_data_profile()
import json
print(json.dumps(profile, indent=2))

print("\n--- Schema Description ---")
print(db.get_schema_description())

print("\n--- Test Query 1: Transaction count by type ---")
query1 = "SELECT transaction_type, COUNT(*) as count FROM transactions GROUP BY transaction_type"
result1 = db.execute_query(query1)
print(json.dumps(result1, indent=2))

print("\n--- Test Query 2: Failure rate by transaction type ---")
query2 = """
SELECT 
    transaction_type, 
    COUNT(*) as total, 
    SUM(CASE WHEN transaction_status = 'FAILED' THEN 1 ELSE 0 END) as failed_count,
    (SUM(CASE WHEN transaction_status = 'FAILED' THEN 1 ELSE 0 END) * 100.0 / COUNT(*)) as failure_rate
FROM transactions 
GROUP BY transaction_type
"""
result2 = db.execute_query(query2)
print(json.dumps(result2, indent=2))

print("\n--- Test Query 3: Average amount by sender_age_group ---")
query3 = "SELECT sender_age_group, AVG(amount_inr) as avg_amount FROM transactions GROUP BY sender_age_group"
result3 = db.execute_query(query3)
print(json.dumps(result3, indent=2))
