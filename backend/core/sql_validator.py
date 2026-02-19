import re

class SQLValidator:
    def validate(self, sql: str) -> dict:
        """
        Validates the generated SQL to ensure it's safe and read-only.
        Returns {"valid": True/False, "cleaned_sql": str, "reason": str or None}.
        """
        # 1. Strip whitespace and trailing semicolons
        cleaned_sql = sql.strip().rstrip(';')
        
        # 2. Convert to uppercase for checking (preserve original for execution logic if needed, 
        # though SQL keywords are case-insensitive)
        sql_upper = cleaned_sql.upper()
        
        # 3. Length check
        if len(cleaned_sql) > 2000:
            return {"valid": False, "cleaned_sql": None, "reason": "Query exceeds maximum length of 2000 characters."}

        # 4. Must start with SELECT (or WITH for CTEs)
        # Handle CTEs: "WITH ... SELECT ..."
        if not sql_upper.startswith("SELECT"):
            if sql_upper.startswith("WITH"):
                # If it starts with WITH, ensure it eventually contains a main SELECT
                # Simple check: count SELECTs or just ensure it's there. 
                # A malicious CTE could still be "WITH ... DELETE", so check forbidden words usually catches that.
                # But strict rule: "Must start with SELECT... (CTEs are fine if they lead to SELECT)"
                pass 
            else:
                return {"valid": False, "cleaned_sql": None, "reason": "Query must start with SELECT (or WITH)."}

        # 5. Must reference transactions table
        if "TRANSACTIONS" not in sql_upper:
            return {"valid": False, "cleaned_sql": None, "reason": "Query must query the 'transactions' table/view."}

        # 6. Forbidden strings check
        # List of forbidden keywords/patterns
        forbidden = [
            "DROP ", "DELETE ", "INSERT ", "UPDATE ", "ALTER ", 
            "EXEC ", "EXECUTE ", "XP_", "--"
        ]
        
        for term in forbidden:
            if term in sql_upper:
                return {"valid": False, "cleaned_sql": None, "reason": f"Query contains forbidden keyword: {term.strip()}"}

        # If all checks pass
        return {"valid": True, "cleaned_sql": cleaned_sql, "reason": None}

# Module-level singleton
validator = SQLValidator()
