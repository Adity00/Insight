import math
import logging
from typing import Any

logger = logging.getLogger(__name__)


class StatsEngine:
    """
    Computes statistical enrichment on DuckDB query results.
    Called after query execution, before GPT-4 narration.
    Pure computation — never calls external APIs, never modifies data.
    """

    def enrich(self, data: list[dict], query_intent: str, sql: str) -> dict:
        if not data or len(data) < 2:
            return {}

        enrichment = {}
        try:
            numeric_cols = self._get_numeric_cols(data)
            categorical_cols = self._get_categorical_cols(data)

            if len(data) >= 3 and numeric_cols:
                zscore_result = self._compute_zscores(data, numeric_cols[0], categorical_cols)
                if zscore_result:
                    enrichment['zscore'] = zscore_result

            time_indicators = ['hour_of_day', 'day_of_week', 'hour', 'day', 'month']
            is_time_query = any(t in sql.lower() for t in time_indicators)
            if is_time_query and len(data) >= 4 and numeric_cols:
                trend_result = self._compute_trend(data, numeric_cols[0])
                if trend_result:
                    enrichment['trend'] = trend_result

            correlation_keywords = ['relationship', 'correlation', 'related', 'associated', 'impact', 'affect', 'influence']
            is_correlation_query = any(k in query_intent.lower() for k in correlation_keywords)
            if is_correlation_query and numeric_cols and len(data) >= 3:
                enrichment['correlation_note'] = (
                    "Values shown are group-level aggregates. "
                    "Interpret directional differences as indicative associations. "
                    "Statistical significance requires larger variation than observed here."
                )

        except Exception as e:
            logger.warning(f"StatsEngine.enrich failed: {e}")
            return {}

        return enrichment

    def _get_numeric_cols(self, data: list[dict]) -> list[str]:
        first = data[0]
        return [k for k, v in first.items() if isinstance(v, (int, float)) and not isinstance(v, bool)]

    def _get_categorical_cols(self, data: list[dict]) -> list[str]:
        first = data[0]
        return [k for k, v in first.items() if isinstance(v, str)]

    def _compute_zscores(self, data: list[dict], col: str, categorical_cols: list[str]) -> dict | None:
        try:
            values = [float(row[col]) for row in data if row.get(col) is not None]
            if len(values) < 3:
                return None

            n = len(values)
            mean = sum(values) / n
            variance = sum((v - mean) ** 2 for v in values) / n
            std = math.sqrt(variance)

            if std < 1e-9:
                return None

            label_col = categorical_cols[0] if categorical_cols else None
            anomalies = []
            highest = None
            lowest = None
            highest_z = float('-inf')
            lowest_z = float('inf')

            for row in data:
                val = float(row[col])
                z = (val - mean) / std
                label = str(row.get(label_col, 'Unknown')) if label_col else 'Unknown'

                if z > highest_z:
                    highest_z = z
                    highest = {'label': label, 'value': round(val, 4), 'z_score': round(z, 2)}
                if z < lowest_z:
                    lowest_z = z
                    lowest = {'label': label, 'value': round(val, 4), 'z_score': round(z, 2)}
                if abs(round(z, 2)) >= 2.0:
                    anomalies.append({
                        'label': label,
                        'value': round(val, 4),
                        'z_score': round(z, 2),
                        'direction': 'above' if z > 0 else 'below'
                    })

            return {
                'mean': round(mean, 4),
                'std_dev': round(std, 4),
                'highest': highest,
                'lowest': lowest,
                'anomalies': anomalies,
                'anomaly_count': len(anomalies)
            }
        except Exception as e:
            logger.warning(f"Z-score failed: {e}")
            return None

    def _compute_trend(self, data: list[dict], col: str) -> dict | None:
        try:
            values = [float(row[col]) for row in data if row.get(col) is not None]
            n = len(values)
            if n < 4:
                return None

            x = list(range(n))
            x_mean = sum(x) / n
            y_mean = sum(values) / n

            numerator = sum((x[i] - x_mean) * (values[i] - y_mean) for i in range(n))
            denominator = sum((xi - x_mean) ** 2 for xi in x)

            if denominator < 1e-9:
                return None

            slope = numerator / denominator
            pct_per_unit = (slope / y_mean * 100) if y_mean != 0 else 0
            total_pct = ((values[-1] - values[0]) / values[0] * 100) if values[0] != 0 else 0

            direction = 'increasing' if slope > 0 else 'decreasing'
            if abs(pct_per_unit) > 10:
                magnitude = 'sharply'
            elif abs(pct_per_unit) > 2:
                magnitude = 'gradually'
            else:
                magnitude = 'relatively stable'

            return {
                'slope': round(slope, 6),
                'direction': direction,
                'magnitude': magnitude,
                'pct_change_per_unit': round(pct_per_unit, 2),
                'first_value': round(values[0], 4),
                'last_value': round(values[-1], 4),
                'total_change_pct': round(total_pct, 2)
            }
        except Exception as e:
            logger.warning(f"Trend failed: {e}")
            return None


    def get_verdict(self, zscore_result: dict) -> str:
        """
        Returns a pre-written plain-English verdict based on z-scores.
        This is injected into the prompt as a FACT, not an instruction.
        GPT-4 must repeat facts; it ignores instructions.
        """
        if not zscore_result:
            return ""

        highest = zscore_result.get('highest', {})
        anomalies = zscore_result.get('anomalies', [])
        mean = zscore_result.get('mean', 0)
        std = zscore_result.get('std_dev', 0)

        if anomalies:
            # True statistical anomaly exists
            a = anomalies[0]
            return (
                f"VERIFIED STATISTICAL ANOMALY: {a['label']} with value {a['value']} "
                f"is {abs(a['z_score'])} standard deviations {a['direction']} the mean "
                f"({mean} \u00b1 {std}). This IS a statistically significant outlier (z > 2.0)."
            )
        else:
            # No true anomaly — highest is just the highest, nothing more
            h = highest
            return (
                f"NO STATISTICAL ANOMALY DETECTED. {h['label']} has the highest value "
                f"at {h['value']} (z-score: {h['z_score']}), which is only "
                f"{abs(h['z_score'])} standard deviations from the mean. "
                f"This does not qualify as a statistical anomaly (threshold: z > 2.0). "
                f"It is merely the highest value in a uniform distribution."
            )


stats_engine = StatsEngine()
