import os
import duckdb
import logging
import time
from typing import Dict, List, Any, Optional
from dotenv import load_dotenv

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class DatabaseManager:
    def __init__(self):
        load_dotenv()
        self.csv_path = os.getenv("CSV_PATH", "backend/data/upi_transactions_2024.csv")
        self.connection = duckdb.connect(database=':memory:')
        self.data_profile = {}
        self._initialized = False

    def initialize(self) -> None:
        """Load CSV data into DuckDB and compute data profile.
        Safe to call from notebooks without a running FastAPI server.
        Idempotent — calling twice re-initializes cleanly.
        """
        self._load_data()
        self._initialized = True
        
    def _load_data(self):
        # Handle path resolution if running from root or backend
        if not os.path.exists(self.csv_path):
            # Check relative to project root if running from there
            if os.path.exists(os.path.join("insightx", self.csv_path)):
                self.csv_path = os.path.join("insightx", self.csv_path)
            elif os.path.exists(os.path.join("backend", "data", "upi_transactions_2024.csv")):
                self.csv_path = os.path.join("backend", "data", "upi_transactions_2024.csv")
            elif os.path.exists("backend/data/upi_transactions_2024.csv"):
                 self.csv_path = "backend/data/upi_transactions_2024.csv"
            else:
                error_msg = f"CSV file not found at {self.csv_path}. Please place the CSV in backend/data/."
                logger.error(error_msg)
                raise FileNotFoundError(error_msg)
                
        try:
            # Create view with exact column mapping
            query = f"""
                CREATE OR REPLACE VIEW transactions AS 
                SELECT 
                    "transaction id" AS transaction_id,
                    "timestamp" AS timestamp,
                    "transaction type" AS transaction_type,
                    "merchant_category" AS merchant_category,
                    "amount (INR)" AS amount_inr,
                    "transaction_status" AS transaction_status,
                    "sender_age_group" AS sender_age_group,
                    "receiver_age_group" AS receiver_age_group,
                    "sender_state" AS sender_state,
                    "sender_bank" AS sender_bank,
                    "receiver_bank" AS receiver_bank,
                    "device_type" AS device_type,
                    "network_type" AS network_type,
                    "fraud_flag" AS fraud_flag,
                    "hour_of_day" AS hour_of_day,
                    "day_of_week" AS day_of_week,
                    "is_weekend" AS is_weekend
                FROM read_csv_auto('{self.csv_path}');
            """
            self.connection.execute(query)
            
            # Log row count
            count_result = self.connection.execute("SELECT COUNT(*) FROM transactions").fetchone()
            row_count = count_result[0] if count_result else 0
            logger.info(f"Loaded {row_count} rows from {self.csv_path} into 'transactions' view.")
            
            # Compute profile
            self._compute_data_profile()
            
        except Exception as e:
            logger.error(f"Failed to load data: {e}")
            raise e

    def execute_query(self, sql: str) -> Dict[str, Any]:
        start_time = time.time()
        sql = sql.strip().rstrip(';')
        
        # Enforce LIMIT 500 if not present
        if "LIMIT" not in sql.upper():
            limit_val = os.getenv('MAX_ROWS_RETURNED', '500')
            sql += f" LIMIT {limit_val}"
            
        try:
            # Execute and fetch as DF then dict
            result = self.connection.execute(sql).fetchdf()
            # Convert timestamp to string for JSON serialization compatibility if needed, 
            # though pandas to_dict usually handles it. 
            # Force conversion of timestamp/date columns if necessary? 
            # Usually pydantic handles it, but let's see.
            
            data = result.to_dict(orient='records')
            row_count = len(data)
            execution_time = (time.time() - start_time) * 1000
            
            return {
                "success": True,
                "data": data,
                "row_count": row_count,
                "error": None,
                "execution_time_ms": execution_time
            }
        except Exception as e:
            execution_time = (time.time() - start_time) * 1000
            error_msg = str(e)
            logger.error(f"Query failed: {sql} | Error: {error_msg}")
            return {
                "success": False,
                "data": [],
                "row_count": 0,
                "error": error_msg,
                "execution_time_ms": execution_time
            }

    def get_schema_description(self) -> str:
        # Get actual count for the prompt
        try:
            count_result = self.connection.execute("SELECT COUNT(*) FROM transactions").fetchone()
            actual_count = count_result[0] if count_result else 0
        except:
            actual_count = 0
        
        return f"""Table name: transactions
Total rows: {actual_count}

Columns:
- transaction_id: STRING — unique identifier
- timestamp: DATE — transaction date and time
- transaction_type: STRING — values: P2P, P2M, Bill Payment, Recharge
- merchant_category: STRING (NULLABLE) — NULL for P2P transactions. Values: Food, Grocery, Fuel, Entertainment, Shopping, Healthcare, Education, Transport, Utilities, Other
- amount_inr: INTEGER — transaction amount in Indian Rupees
- transaction_status: STRING — values: SUCCESS, FAILED
- sender_age_group: STRING — values: 18-25, 26-35, 36-45, 46-55, 56+
- receiver_age_group: STRING (NULLABLE) — NULL for non-P2P transactions
- sender_state: STRING — Indian state name
- sender_bank: STRING — values: SBI, HDFC, ICICI, Axis, PNB, Kotak, IndusInd, Yes Bank
- receiver_bank: STRING — same values as sender_bank
- device_type: STRING — values: Android, iOS, Web
- network_type: STRING — values: 4G, 5G, WiFi, 3G
- fraud_flag: INTEGER — 0 = not flagged, 1 = flagged for review (NOT confirmed fraud)
- hour_of_day: INTEGER — 0 to 23, derived from timestamp
- day_of_week: STRING — Monday through Sunday
- is_weekend: INTEGER — 0 = weekday, 1 = weekend

Important query rules:
- Always filter merchant_category IS NOT NULL when querying P2M-specific metrics
- Always filter receiver_age_group IS NOT NULL for P2P-specific analysis
- fraud_flag = 1 means flagged for review, not confirmed fraud — phrase responses accordingly
- Use amount_inr not "amount (INR)" — columns are already aliased"""

    def _compute_data_profile(self) -> None:
        try:
            # Total rows
            total_rows = self.connection.execute("SELECT COUNT(*) FROM transactions").fetchone()[0]
            
            # Date range
            min_date = self.connection.execute("SELECT MIN(timestamp) FROM transactions").fetchone()[0]
            max_date = self.connection.execute("SELECT MAX(timestamp) FROM transactions").fetchone()[0]
            
            # Success rate - ensure proper division
            success_count = self.connection.execute("SELECT COUNT(*) FROM transactions WHERE transaction_status = 'SUCCESS'").fetchone()[0]
            success_rate = (success_count / total_rows * 100) if total_rows > 0 else 0.0
            
            # Fraud flag rate
            fraud_count = self.connection.execute("SELECT COUNT(*) FROM transactions WHERE fraud_flag = 1").fetchone()[0]
            fraud_flag_rate = (fraud_count / total_rows * 100) if total_rows > 0 else 0.0
            
            # Avg/Max/Min amount
            stats = self.connection.execute("SELECT AVG(amount_inr), MAX(amount_inr), MIN(amount_inr) FROM transactions").fetchone()
            avg_amount = stats[0] if stats[0] is not None else 0.0
            max_amount = stats[1] if stats[1] is not None else 0
            min_amount = stats[2] if stats[2] is not None else 0
            
            # Transaction type distribution
            type_dist = self.connection.execute("SELECT transaction_type, COUNT(*) FROM transactions GROUP BY transaction_type").fetchall()
            type_dist_dict = {row[0]: row[1] for row in type_dist}
            
            # Top 5 states - ensure list of dicts
            top_states = self.connection.execute("SELECT sender_state, COUNT(*) as cnt FROM transactions GROUP BY sender_state ORDER BY cnt DESC LIMIT 5").fetchall()
            top_5_states = [{"state": row[0], "count": row[1]} for row in top_states]
            
            # Peak hour
            peak_hour_res = self.connection.execute("SELECT hour_of_day, COUNT(*) as cnt FROM transactions GROUP BY hour_of_day ORDER BY cnt DESC LIMIT 1").fetchone()
            peak_hour = peak_hour_res[0] if peak_hour_res else 0
            
            # Device distribution
            device_dist = self.connection.execute("SELECT device_type, COUNT(*) FROM transactions GROUP BY device_type").fetchall()
            device_dist_dict = {row[0]: row[1] for row in device_dist}
            
            # Network distribution
            network_dist = self.connection.execute("SELECT network_type, COUNT(*) FROM transactions GROUP BY network_type").fetchall()
            network_dist_dict = {row[0]: row[1] for row in network_dist}
            
            self.data_profile = {
                "total_rows": int(total_rows),
                "date_range": {"min": str(min_date), "max": str(max_date)},
                "success_rate": float(success_rate),
                "fraud_flag_rate": float(fraud_flag_rate),
                "avg_amount_inr": float(avg_amount),
                "max_amount_inr": int(max_amount),
                "min_amount_inr": int(min_amount),
                "transaction_type_distribution": type_dist_dict,
                "top_5_states": top_5_states,
                "peak_hour": int(peak_hour),
                "device_distribution": device_dist_dict,
                "network_distribution": network_dist_dict
            }
            
        except Exception as e:
            logger.error(f"Failed to compute data profile: {e}")
            self.data_profile = {}

    def get_data_profile(self) -> dict:
        return self.data_profile

# Singleton — auto-initializes at import time
db = DatabaseManager()
try:
    db.initialize()
except Exception as e:
    import logging as _logging
    _logging.getLogger(__name__).warning(f"DB auto-init failed: {e}")
