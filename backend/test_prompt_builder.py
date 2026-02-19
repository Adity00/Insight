import sys
import os
import json

# Add backend to sys.path
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

try:
    from backend.core.prompt_builder import prompt_builder
except ImportError:
    from insightx.backend.core.prompt_builder import prompt_builder

print("--- Test 1: SQL Generation Prompt (No Context) ---")
prompt1 = prompt_builder.build_sql_generation_prompt(
    user_query="Which transaction type has the highest failure rate?",
    conversation_history=[],
    entity_context={}
)
print(json.dumps(prompt1, indent=2))

print("\n--- Test 2: SQL Generation Prompt (With Context) ---")
prompt2 = prompt_builder.build_sql_generation_prompt(
    user_query="What about those states?",
    conversation_history=[],
    entity_context={"states": ["Maharashtra", "Delhi"], "metric": "fraud_rate"}
)
print(json.dumps(prompt2, indent=2))

print("\n--- Test 3: Ambiguity Detection (True Case) ---")
is_ambiguous_1 = prompt_builder.detect_ambiguity("show me them", [])
print(f"Query: 'show me them', History: [], Result: {is_ambiguous_1}")

print("\n--- Test 4: Ambiguity Detection (False Case) ---")
query_clear = "Which age group has the highest transaction volume on weekends?"
is_ambiguous_2 = prompt_builder.detect_ambiguity(query_clear, [])
print(f"Query: '{query_clear}', History: [], Result: {is_ambiguous_2}")
