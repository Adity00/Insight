import sys
import os
import json
from typing import List, Dict, Any

# Add parent directory to path to allow imports from core
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
try:
    from core.database import db
except ImportError:
    # Fallback for when running from root
    from backend.core.database import db

class PromptBuilder:
    def __init__(self):
        self.schema = db.get_schema_description() if db else "Schema not available"

    def build_sql_generation_prompt(self, user_query: str, conversation_history: List[Dict], entity_context: Dict) -> List[Dict]:
        """
        Constructs the prompt for GPT-4 to generate DuckDB SQL from natural language.
        """
        system_content = f"""You are an expert data analyst for a UPI digital payments platform in India.
Your job is to convert natural language questions into precise DuckDB SQL queries.

{self.schema}

CRITICAL SQL RULES — follow these exactly:
1. Only write SELECT statements. Never write INSERT, UPDATE, DELETE, DROP, or any mutating SQL.
2. Always use the aliased column names (amount_inr, transaction_type, etc.) — never the raw CSV names.
3. When calculating failure rate: SUM(CASE WHEN transaction_status = 'FAILED' THEN 1.0 ELSE 0 END) / COUNT(*) * 100
4. When querying merchant-specific data, always add: WHERE merchant_category IS NOT NULL
5. When querying P2P receiver age, always add: WHERE receiver_age_group IS NOT NULL
6. For percentage calculations, always multiply by 100.0 (not 100) to avoid integer division.
7. Always include ORDER BY for ranking/top-N queries.
8. Limit results to 20 rows maximum unless the user asks for all data.
9. Round decimal results to 2 decimal places using ROUND(value, 2).
10. fraud_flag = 1 means flagged for review, NOT confirmed fraud.

RESPONSE FORMAT — Critical:
Respond with ONLY a valid JSON object. No explanation, no markdown, no code blocks.
Format:
{{
  "sql": "SELECT ... FROM transactions ...",
  "query_intent": "one sentence describing what this query computes",
  "entities_extracted": {{
    "transaction_types": [],
    "states": [],
    "age_groups": [],
    "time_filters": {{}},
    "metric": ""
  }},
  "requires_chart": true/false,
  "suggested_chart_type": "bar|line|pie|none"
}}
IMPORTANT: In entities_extracted, always populate the relevant lists with the actual values you used in your SQL WHERE clauses. If you filtered by sender_state IN ('Maharashtra'), then states must be ['Maharashtra']. This is mandatory."""

        messages = [{"role": "system", "content": system_content}]

        # Inject conversation history
        # Filter to keep only last 4 turns and ensure format
        recent_history = conversation_history[-4:] if conversation_history else []
        messages.extend(recent_history)

        user_content = ""
        if entity_context:
            # Format context nicely
            context_str = json.dumps(entity_context, indent=2)
            user_content += f"""CONVERSATION CONTEXT (use this to resolve pronouns and references):
{context_str}

STRICT CONTEXT RULES — follow these without exception:
1. If the question contains ANY of these words: "those", "them", "that", "these", "same", "there", "similar" — you MUST filter using the exact entities from the context above. Do not broaden the scope.
2. If context has states: ['Maharashtra'] and user says "those states" — generate SQL with WHERE sender_state IN ('Maharashtra'). Not all states.
3. If context has transaction_types: ['Recharge'] and user says "those transactions" — generate SQL with WHERE transaction_type = 'Recharge'. Not all types.
4. If context has a last_hour: 22 and user says "that time" or "those hours" — generate SQL with WHERE hour_of_day = 22.
5. If context has last_category: 'Food' and user says "that category" — generate SQL with WHERE merchant_category = 'Food'.
6. NEVER broaden a follow-up question to all values when the context has specific values. Specific context = specific SQL filter. Always.
7. If the context is empty (first question in session), ignore rules 1-6 and answer the question broadly.
8. If a pronoun reference is unclear even with context, pick the most recently mentioned entity — do not ignore context entirely.
9. CROSS-COMPARISON Rule: If the user asks to "compare" or "versus" the context entity with a new entity, you MUST include BOTH in the filter.
   Example: Context has transaction_types=['Recharge'], User asks "Compare with Bill Payment" -> SQL must use: WHERE transaction_type IN ('Recharge', 'Bill Payment').
   Do not overwrite the context entity; ADD the new entity to it.
"""

        user_content += "RECENT CONVERSATION:\n"
        for msg in recent_history:
            user_content += f"{msg['role'].upper()}: {msg['content']}\n"
        
        user_content += f"\nQuestion: {user_query}\n"
        user_content += "Generate the SQL query to answer this. Apply the STRICT CONTEXT RULES above before writing any SQL."

        messages.append({"role": "user", "content": user_content})
        
        return messages

    def build_narration_prompt(self, user_query: str, sql_used: str, query_result: Dict, query_intent: str, entity_context: Dict, data_profile: Dict = None) -> List[Dict]:
        """
        Constructs the prompt for GPT-4 to explain the data insights.
        """
        system_content = """You are InsightX, an expert business intelligence analyst for a UPI payments platform.
You explain data insights clearly to non-technical business leaders.
Your tone is professional, direct, and insightful — like a McKinsey analyst presenting findings.
Always lead with the most important number or finding.
Never say "the data shows" or "based on the query" — just state the insight directly.
Never mention SQL, databases, or technical implementation.
Always phrase fraud_flag insights as "flagged for review" not "confirmed fraud".
Keep responses under 150 words unless the data genuinely requires more detail.
End every response with one "💡 Proactive Insight:" — a related finding the user didn't ask for
But would find valuable, starting with "You might also find it interesting that..."
Always refer to monetary amounts in Indian Rupees using the ₹ symbol. Never use $ or USD.

BUSINESS INTELLIGENCE REQUIREMENTS — apply to every response:

1. BENCHMARKING: After stating a metric, always compare it to the overall dataset average.
   Example: "SBI's failure rate is 8.2%, which is 2.1 percentage points above the overall
   average of 6.1% across all banks."
   Never state a number in isolation — always give it context.

2. ANOMALY FLAGGING: If any value in the data is more than 20% above or below the
   dataset average for that metric, flag it explicitly.
   Example: "⚠️ This is notably higher than average and warrants investigation."

3. STANDARD DEVIATION LANGUAGE: If the result shows extreme deviation, use business
   language like "significantly above average", "notable outlier", or "well within
   normal range" — do not use raw statistical jargon like "2.4 sigma" unless asked.

4. TREND DIRECTION: If the data has a time component (hour, day, weekend), always
   comment on the direction — is the metric rising, falling, or stable across the range?

5. BUSINESS IMPLICATION: End every response with one concrete business implication.
   Format: "Business Implication: [one actionable sentence for a decision-maker]"
   Example: "Business Implication: Prioritizing network infrastructure improvements
   in 3G-heavy regions could reduce failure rates by addressing the root cause."

6. MAGNITUDE AWARENESS: Always describe numbers in human terms alongside raw figures.
   Example: "37,427 transactions — roughly 15% of all transactions in the dataset."

CRITICAL: You are narrating ONLY from the data provided to you. Never invent
benchmarks or averages that aren't in the data. If you cannot compute a comparison
from the provided result, state the metric plainly without fabricating context."""

        # Format data table for prompt
        data_rows = query_result.get('data', [])
        formatted_data = json.dumps(data_rows, indent=2)

        user_content = ""
        if data_profile:
             user_content += f"""DATASET BENCHMARKS (use these for comparison):
- Overall success rate: {data_profile.get('success_rate', 'N/A')}%
- Overall fraud flag rate: {data_profile.get('fraud_flag_rate', 'N/A')}%
- Average transaction amount: ₹{data_profile.get('avg_amount_inr', 'N/A')}
- Total transactions: {data_profile.get('total_rows', 'N/A')}
- Peak hour: {data_profile.get('peak_hour', 'N/A')}
"""

        user_content += f"""Question asked: {user_query}
What was computed: {query_intent}
Data returned:
{formatted_data}
Total rows: {query_result.get('row_count', 0)}

Provide a clear business insight answer. Include specific numbers from the data.
Suggest what this means for business decisions where relevant."""

        return [
            {"role": "system", "content": system_content},
            {"role": "user", "content": user_content}
        ]

    def build_clarification_prompt(self, user_query: str, conversation_history: List[Dict]) -> List[Dict]:
        """
        Constructs a prompt to ask a clarifying question for ambiguous queries.
        """
        system_content = "You are InsightX. The user's question is ambiguous. Ask ONE short, specific clarifying question to resolve the ambiguity. Do not ask multiple questions. Be conversational."
        
        messages = [{"role": "system", "content": system_content}]
        if conversation_history:
             messages.extend(conversation_history[-2:]) # Just a bit of context
        
        messages.append({"role": "user", "content": f"User query: {user_query}"})
        return messages

    def extract_entity_context(self, gpt_response_json: Dict, previous_context: Dict) -> Dict:
        """
        Updates the entity context with new entities extracted from the latest turn.
        """
        new_entities = gpt_response_json.get("entities_extracted", {})
        
        # Merge dictionaries, preferring new non-empty values
        updated_context = previous_context.copy() if previous_context else {}
        
        for key, value in new_entities.items():
            if value: # Only update if new value is not empty/null
                updated_context[key] = value
                
        return updated_context

    def detect_ambiguity(self, user_query: str, conversation_history: List[Dict]) -> bool:
        """
        Heuristic to detect if a query is too ambiguous to answer directly.
        """
        # 1. Very short query with no context (likely just a greeting or fragment)
        tokens = user_query.split()
        if len(tokens) < 4 and not conversation_history:
             # Check for known entities might be needed here, but keeping it simple as requested
             # If it's short and we have no history, it's likely ambiguous unless it's very specific
             # But the rule "queries containing only pronouns with no conversation history" is better
             pass

        # 2. Pronouns with no history
        pronouns = {'it', 'that', 'this', 'them', 'those', 'he', 'she', 'they'}
        has_pronoun = any(word.lower() in pronouns for word in tokens)
        if has_pronoun and not conversation_history:
            return True

        # 3. Simple length check for really short/vague stuff "show me", "data", "help"
        if len(tokens) <= 2 and not conversation_history:
             # Unless it's "Show dashboard" or something, but usually ambiguous
             return True

        return False

# Singleton instance
prompt_builder = PromptBuilder()
