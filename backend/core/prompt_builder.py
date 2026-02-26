import sys
import os
import json
from typing import List, Dict, Any

# Add parent directory to path to allow imports from core
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
try:
    from core.database import db
except ImportError:
    from backend.core.database import db

VALID_ENUM_REFERENCE = """VALID ENUM VALUES (use these EXACTLY — do not paraphrase):
- transaction_type: 'P2P', 'P2M', 'Bill Payment', 'Recharge'
- transaction_status: 'SUCCESS', 'FAILED'
- sender_age_group: '18-25', '26-35', '36-45', '46-55', '56+'
- device_type: 'Android', 'iOS', 'Web'
- network_type: '4G', '5G', 'WiFi', '3G'
- sender_bank: 'SBI', 'HDFC', 'ICICI', 'Axis', 'PNB', 'Kotak', 'IndusInd', 'Yes Bank'
- day_of_week: 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'
- fraud_flag: 0, 1
- is_weekend: 0, 1"""


class PromptBuilder:
    def __init__(self):
        self.schema = db.get_schema_description() if db else "Schema not available"

    def build_sql_generation_prompt(self, user_query: str, conversation_history: List[Dict], entity_context: Dict) -> List[Dict]:
        """
        Constructs the prompt for GPT-4 to generate DuckDB SQL from natural language.
        """
        enum_block = ""
        if "VALID ENUM VALUES" not in (self.schema or ""):
            enum_block = f"\n\n{VALID_ENUM_REFERENCE}\n"

        system_content = f"""You are an expert data analyst for a UPI digital payments platform in India.
Your job is to convert natural language questions into precise DuckDB SQL queries.

{self.schema}
{enum_block}

CRITICAL SQL RULES — follow these exactly:
1. RULE 1 — MUTUAL EXCLUSION (P2P): If the query involves transaction_type = 'P2P' or a filter set that includes only P2P, then merchant_category MUST NOT appear anywhere in the SQL — not in SELECT, WHERE, GROUP BY, or HAVING. P2P transactions have NULL merchant_category by schema definition. Querying merchant_category for P2P is semantically meaningless and will always return NULL. If the user explicitly asks for a merchant breakdown of P2P transactions, return "query_intent": "invalid_combination" and "sql": null in your JSON response.
2. RULE 2 — MUTUAL EXCLUSION (Non-P2P): If the query involves any transaction_type that is NOT P2P (P2M, Bill Payment, Recharge), then receiver_age_group MUST NOT appear in the SQL. receiver_age_group is NULL for all non-P2P transactions by schema definition.
3. Only write SELECT statements. Never write INSERT, UPDATE, DELETE, DROP, or any mutating SQL.
4. Always use the aliased column names (amount_inr, transaction_type, etc.) — never the raw CSV names.
5. When calculating failure rate: SUM(CASE WHEN transaction_status = 'FAILED' THEN 1.0 ELSE 0 END) / COUNT(*) * 100
6. When querying merchant-specific data, always add: WHERE merchant_category IS NOT NULL
7. When querying P2P receiver age, always add: WHERE receiver_age_group IS NOT NULL
8. For percentage calculations, always multiply by 100.0 (not 100) to avoid integer division.
9. Always include ORDER BY for ranking/top-N queries.
10. Limit results to 20 rows maximum unless the user asks for all data.
11. Round decimal results to 2 decimal places using ROUND(value, 2).
12. fraud_flag = 1 means flagged for review, NOT confirmed fraud.
13. NEVER refuse a query or claim data is unavailable if the relevant column exists in the schema above. Columns device_type, network_type, sender_bank, sender_state, sender_age_group, transaction_type, merchant_category all exist and are always queryable.
14. If a query asks to "compare" any two or more groups — always use GROUP BY on the grouping column and compute the metric for each group. A comparison query ALWAYS produces multiple rows, one per group.
15. When computing fraud flag rate for a FILTERED subset (e.g., high-value transactions), always use: SUM(fraud_flag) * 100.0 / COUNT(*) where COUNT(*) is the count of rows IN THAT FILTERED SUBSET, not the total table. Never divide by a hardcoded number or a subquery count of the full table.
16. When asked for top N states/banks/categories by volume or count, use ORDER BY count DESC LIMIT N. Never use HAVING or WHERE to filter by count unless the user explicitly asks for a threshold. The LIMIT clause alone is sufficient.
17. In compound or follow-up queries about a specific entity (state, bank, category), ALL metrics including fraud_flag rate must be computed within a WHERE clause filtering to that entity. Never compute a rate using the full table denominator when the question is about a specific subset.

FEW-SHOT EXAMPLES (follow this style exactly):
Example 1 — Percentage calculation (failure rate per bank)
Question: "Which bank has the highest failure rate?"
Expected JSON:
{{
  "sql": "SELECT sender_bank, ROUND(SUM(CASE WHEN transaction_status = 'FAILED' THEN 1.0 ELSE 0 END) * 100.0 / COUNT(*), 2) AS failure_rate FROM transactions GROUP BY sender_bank ORDER BY failure_rate DESC LIMIT 20",
  "query_intent": "Compute failure rate (%) by sender bank and rank descending",
  "entities_extracted": {{
    "transaction_types": [],
    "states": [],
    "age_groups": [],
    "time_filters": {{}},
    "metric": "failure_rate"
  }},
  "requires_chart": true,
  "suggested_chart_type": "bar"
}}

Example 2 — Follow-up with context (use context entities; do not broaden)
Context: {{ "states": ["Maharashtra"] }}
Question: "What is the fraud flag rate there?"
Expected JSON:
{{
  "sql": "SELECT ROUND(SUM(fraud_flag) * 100.0 / COUNT(*), 2) AS fraud_flag_rate FROM transactions WHERE sender_state IN ('Maharashtra')",
  "query_intent": "Compute fraud flag rate (%) for Maharashtra",
  "entities_extracted": {{
    "transaction_types": [],
    "states": ["Maharashtra"],
    "age_groups": [],
    "time_filters": {{}},
    "metric": "fraud_flag_rate"
  }},
  "requires_chart": false,
  "suggested_chart_type": "none"
}}

Example 3 — NULL-aware query (merchant category)
Question: "What is the average amount per merchant category?"
Expected JSON:
{{
  "sql": "SELECT merchant_category, ROUND(AVG(amount_inr), 2) AS avg_amount_inr FROM transactions WHERE merchant_category IS NOT NULL GROUP BY merchant_category ORDER BY avg_amount_inr DESC LIMIT 20",
  "query_intent": "Compute average transaction amount by merchant category (excluding NULL categories)",
  "entities_extracted": {{
    "transaction_types": [],
    "states": [],
    "age_groups": [],
    "time_filters": {{}},
    "metric": "avg_amount_inr"
  }},
  "requires_chart": true,
  "suggested_chart_type": "bar"
}}

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

        # DOWNSTREAM HANDLER REQUIRED:
        # If sql_response["sql"] is None and query_intent == "invalid_combination",
        # query_pipeline.py must short-circuit and return a user-friendly message
        # like: "P2P transactions don't have merchant categories in our schema.
        # Try asking about P2P volume, amounts, or age groups instead."
        # See query_pipeline.py process() method — add null-SQL check after JSON parse.

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

    def build_narration_prompt(self, user_query: str, sql_used: str, query_result: Dict, query_intent: str, entity_context: Dict, data_profile: Dict = None, statistical_enrichment: Dict = None) -> List[Dict]:
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

1. BENCHMARKING: First identify the metric type from the column names and values, then apply the correct benchmark:
   - If the result contains AVERAGES or MEANS (column names contain avg, mean, average, per_transaction): compare against the dataset-wide average amount injected as avg_amount_inr from the data profile.
   - If the result contains RATES or PERCENTAGES (column names contain rate, pct, percent, ratio, or numeric values are between 0 and 100): compare against the relevant dataset-wide rate — success_rate or fraud_flag_rate from the data profile.
   - If the result contains SUMS, TOTALS, or COUNTS (column names contain total, sum, volume, count, transactions): do NOT compare to the mean amount. Express the result as a percentage of the total dataset or as a share of total transaction value.
   - If the result is a RANKING or TOP-N list: no benchmark comparison is needed. Describe the order, the gap between top and bottom, and what the ranking implies for business decisions.

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

NEVER compare a SUM or COUNT to the dataset mean transaction amount. This is mathematically invalid. Volume metrics must be expressed as proportions of total, not compared to averages.

CRITICAL: You are narrating ONLY from the data provided to you. Never invent
benchmarks or averages that aren't in the data. If you cannot compute a comparison
from the provided result, state the metric plainly without fabricating context.

When the statistical analysis section contains a "STATISTICAL VERDICT", you must
open your response by restating that verdict using its exact factual claims.
If the verdict says "NO STATISTICAL ANOMALY", you must not use the words anomalous,
significant outlier, warrants investigation, or concerning in relation to that data.
If the verdict says "VERIFIED STATISTICAL ANOMALY", you must use the z-score value
provided and label it explicitly as statistically significant."""

        # Format data table for prompt
        data_rows = query_result.get('data', [])
        formatted_data = json.dumps(data_rows, indent=2)

        # Assemble user_content in order: question → stats → benchmarks → data
        user_content = f"""Question asked: {user_query}
What was computed: {query_intent}
"""

        # Statistical enrichment block — injected BEFORE benchmarks so GPT-4
        # internalises the statistical constraints before reading any numbers
        if statistical_enrichment:
            stats_block = "\n--- STATISTICAL ANALYSIS (computed from actual data, must be used) ---\n"

            if 'zscore' in statistical_enrichment:
                z = statistical_enrichment['zscore']
                stats_block += f"Distribution: mean={z['mean']}, std_dev={z['std_dev']}\n"
                stats_block += f"Highest: {z['highest']['label']} = {z['highest']['value']} (z-score: {z['highest']['z_score']})\n"
                stats_block += f"Lowest: {z['lowest']['label']} = {z['lowest']['value']} (z-score: {z['lowest']['z_score']})\n"

            if 'trend' in statistical_enrichment:
                t = statistical_enrichment['trend']
                stats_block += f"Trend: {t['direction']} {t['magnitude']} "
                stats_block += f"({t['pct_change_per_unit']}% change per unit, "
                stats_block += f"total change {t['total_change_pct']}% from {t['first_value']} to {t['last_value']})\n"

            if 'correlation_note' in statistical_enrichment:
                stats_block += f"Correlation context: {statistical_enrichment['correlation_note']}\n"

            stats_block += (
                "INSTRUCTION: Incorporate ALL statistical findings above. "
                "Use z-score values when describing outliers. "
                "State trend direction and magnitude explicitly for time-series data. "
                "Never describe a value as anomalous unless z-score > 2.0 is confirmed above.\n"
                "--- END STATISTICAL ANALYSIS ---\n"
            )
            user_content += stats_block

        # Benchmarks appear AFTER stats block so constraints are read first
        if data_profile:
            user_content += f"""\nDATASET BENCHMARKS (use these for comparison):
- Overall success rate: {data_profile.get('success_rate', 'N/A')}%
- Overall fraud flag rate: {data_profile.get('fraud_flag_rate', 'N/A')}%
- Average transaction amount: \u20b9{data_profile.get('avg_amount_inr', 'N/A')}
- Total transactions: {data_profile.get('total_rows', 'N/A')}
- Peak hour: {data_profile.get('peak_hour', 'N/A')}
"""

        user_content += f"""Data returned:
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
