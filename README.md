<div align="center">

# 🔍 InsightX

### Conversational AI Analytics for UPI Payments

[![Python](https://img.shields.io/badge/Python-3.11+-blue?logo=python)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.111-green?logo=fastapi)](https://fastapi.tiangolo.com)
[![Next.js](https://img.shields.io/badge/Next.js-16.1-black?logo=nextdotjs)](https://nextjs.org)
[![DuckDB](https://img.shields.io/badge/DuckDB-0.10-yellow)](https://duckdb.org)
[![GPT-4](https://img.shields.io/badge/OpenAI-GPT--4-412991?logo=openai)](https://openai.com)

_Ask business questions in plain English. Get data-backed answers instantly._

**IIT Bombay Techfest 2025-26 — InsightX: Leadership Analytics Challenge**

</div>

---

## ⚡ Quick Start — 3 Steps, Under 5 Minutes

> ✅ **No API key setup required.** The environment is pre-configured. Just clone and run.

### Step 1 — Clone

```bash
git clone https://github.com/Adity00/Insight.git
cd Insight
```

### Step 2 — Start Backend

```bash
# Create and activate virtual environment
python -m venv venv

# Windows:
venv\Scripts\activate
# macOS / Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start the server
python -m uvicorn backend.main:app --reload --port 8000
```

**You should see this output — do not proceed until you see it:**

```
INFO:     Loaded 250000 rows from backend/data/upi_transactions_2024.csv
INFO:     DuckDB initialized successfully
INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)
```

> 💡 First startup takes 10-15 seconds while DuckDB loads the dataset into memory.
> All subsequent startups are faster as the database file is cached.

### Step 3 — Start Frontend

Open a **new terminal window** (keep backend running in the first one):

```bash
cd frontend
npm install
npm run dev
```

**You should see:**

```
▲ Next.js 16.1.6
- Local:   http://localhost:3000
- Ready in ~2s
```

### ✅ Verify It's Working

Open [http://localhost:3000](http://localhost:3000)

The dashboard KPI cards must show exactly:
| Metric | Expected Value |
|--------|---------------|
| Total Transactions | 250,000 |
| Success Rate | 95.05% |
| Flagged for Review | 0.19% |
| Avg Transaction Amount | ₹1,311.76 |

If you see these numbers — **setup is complete and working correctly.**

---

## What is InsightX?

InsightX is a conversational analytics system that lets business leaders query 250,000 UPI payment transactions using natural language — no SQL, no dashboards, no data analyst required.

Ask: _"Which state has the highest fraud flag rate compared to the national average?"_

Get: A statistically enriched answer with z-scores, benchmarks, a ranked bar chart, and an actionable recommendation — in under 5 seconds.

---

## System Architecture

```
User Query (Natural Language)
       │
       ▼
┌─────────────────────────────────────────────┐
│              FastAPI Backend                │
│                                             │
│  Intent Classifier                          │
│       │                                     │
│       ├── GREETING → Direct response        │
│       ├── KNOWLEDGE → Explanation           │
│       └── DATA_QUERY ──────────────────┐   │
│                                        │   │
│  Session Manager (Entity Tracker)      │   │
│  Remembers context across turns        │   │
│                                        ▼   │
│                          GPT-4 Pass 1       │
│                          SQL Generation     │
│                          temp=0, few-shot   │
│                               │             │
│                               ▼             │
│                    DuckDB In-Memory         │
│                    250k rows, <100ms        │
│                               │             │
│                               ▼             │
│                   Statistical Enrichment    │
│                   z-scores, benchmarks      │
│                               │             │
│                               ▼             │
│                          GPT-4 Pass 2       │
│                          Narration          │
│                          temp=0.3           │
└───────────────────────────────┼─────────────┘
                                │
                                ▼
                   ┌────────────────────┐
                   │   Next.js Frontend  │
                   │  Chat + Charts +    │
                   │  SQL View + KPIs    │
                   └────────────────────┘
```

| Layer      | Technology                | Version | Purpose                            |
| ---------- | ------------------------- | ------- | ---------------------------------- |
| Frontend   | Next.js + Tailwind CSS v4 | 16.1.6  | Chat UI, charts, dashboard         |
| Charts     | Recharts                  | 3.7     | Bar, line, and area visualizations |
| API        | FastAPI + Pydantic        | 0.111   | REST endpoints, request validation |
| AI         | OpenAI GPT-4              | —       | NL-to-SQL + insight narration      |
| Database   | DuckDB (in-memory)        | 0.10.3  | Sub-100ms analytical queries       |
| Session    | Custom entity tracker     | —       | Multi-turn context retention       |
| Statistics | SciPy + custom engine     | —       | Z-scores, deviation, benchmarks    |

---

## Supported Query Types

InsightX handles all 6 query categories from the problem statement:

| Category          | Example                                                     | Key Insight Returned                         |
| ----------------- | ----------------------------------------------------------- | -------------------------------------------- |
| **Descriptive**   | "What is the average transaction amount for P2P?"           | ₹1,308.68 with benchmark vs overall          |
| **Comparative**   | "Compare failure rates between Android and iOS"             | Both ~4.9%, statistically equivalent         |
| **Temporal**      | "What are the peak hours for flagged transactions?"         | Hour 19 (7PM) peaks, line chart              |
| **Segmentation**  | "Which age group uses P2P most frequently?"                 | 26-35 leads with 87,432 transactions         |
| **Correlation**   | "Is there a relationship between network type and success?" | WiFi 95.14%, 3G 94.78% — marginal difference |
| **Risk Analysis** | "Which state has the highest fraud flag rate?"              | Karnataka 0.23% (z=1.53 above national avg)  |

### Multi-Turn Conversation Example

```
You → "Which bank has the most failed transactions?"
Bot → "SBI leads with 3,095 failed transactions across 62,693 total."

You → "What percentage of their transactions is that?"
Bot → "SBI's failure rate is 4.94% — slightly above the platform average of 4.96%."

You → "Compare with HDFC"
Bot → "HDFC has a 4.82% failure rate (1,808 failed / 37,485 total).
        Both banks perform within normal range — no statistical anomaly detected."
```

Context is retained automatically across all turns. No need to repeat bank names or filters.

---

## UI Features

- **View Stack** — Every response shows the exact SQL generated, query intent classification, and execution time. Full transparency.
- **Proactive Insights** — Automatically surfaces patterns beyond your question (e.g., "You might also find it interesting that...")
- **Actionable Recommendations** — Business-level advice derived from the data, not generic text
- **Statistical Context** — Z-scores and benchmark comparisons on every numerical result
- **Chart Types** — Bar charts for comparisons, line charts for time-series, auto-selected based on query type
- **Save / Pin to Dash** — Pin important answers to the dashboard for reference
- **Export as PDF** — Download any answer as a formatted PDF report

---

## Project Structure

```
insightx/
├── backend/
│   ├── core/
│   │   ├── query_pipeline.py    # Main orchestration — intent → SQL → DB → narration
│   │   ├── prompt_builder.py    # GPT-4 prompt engineering with 10 few-shot examples
│   │   ├── database.py          # DuckDB connection, query execution, data profile
│   │   ├── session_manager.py   # Multi-turn entity tracker, context injection
│   │   ├── sql_validator.py     # SQL security — blocks DROP, DELETE, injection
│   │   └── stats_engine.py      # Z-scores, deviation, percentile enrichment
│   ├── data/
│   │   ├── upi_transactions_2024.csv   # Official dataset (250,000 rows, 17 columns)
│   │   └── insightx.db                 # Auto-generated on first startup (gitignored)
│   └── main.py                  # FastAPI app, API routes, CORS config
├── frontend/
│   └── src/
│       ├── components/
│       │   ├── ChatWindow.tsx   # Main chat interface, message rendering
│       │   ├── KPICards.tsx     # Dashboard metrics cards
│       │   └── Charts.tsx       # Recharts visualizations
│       └── app/                 # Next.js app router
├── .env                         # Pre-configured environment (API key included)
├── .env.example                 # Template for reference
├── requirements.txt             # Python dependencies (pinned versions)
└── README.md
```

---

## Troubleshooting

### Backend Issues

**`ModuleNotFoundError` on startup**

```bash
# Virtual environment is not activated — run this first:
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Then reinstall:
pip install -r requirements.txt
```

**`CSV not found` or `Loaded 0 rows` error**

```bash
# Verify the CSV exists:
# Windows:
dir backend\data\upi_transactions_2024.csv
# macOS/Linux:
ls backend/data/upi_transactions_2024.csv

# If missing, re-clone the repository fresh
git clone https://github.com/Adity00/Insight.git
```

**`OpenAI API error` or `AuthenticationError`**

```bash
# The .env file is pre-configured with a valid key.
# If you see this error, the key may have expired.
# Contact the team for a fresh key.
# Verify .env exists in the ROOT directory (not inside backend/):
# Windows:
dir .env
# macOS/Linux:
ls -la .env
```

**Backend starts but returns 500 errors**

```bash
# Check the terminal where uvicorn is running for the full error message.
# Most common cause: rate limit on OpenAI API.
# Wait 60 seconds and retry the query.
```

**Port 8000 already in use**

```bash
# Kill whatever is using port 8000, then restart:
# Windows:
netstat -ano | findstr :8000
taskkill /PID  /F
# macOS/Linux:
lsof -ti:8000 | xargs kill -9

# Then restart:
python -m uvicorn backend.main:app --reload --port 8000
```

### Frontend Issues

**`npm install` fails with peer dependency conflicts**

```bash
npm install --legacy-peer-deps
```

**Frontend loads but shows no data / blank KPI cards**

```bash
# Backend is not running. Verify:
curl http://localhost:8000/health
# Expected response: {"status": "healthy", ...}

# If curl fails, backend is not running — go back to Step 2.
```

**Port 3000 already in use**

```bash
# Run frontend on a different port:
npm run dev -- -p 3001
# Then open http://localhost:3001
```

**Charts not rendering / blank visualizations**

```bash
# Hard refresh the browser: Ctrl+Shift+R (Windows) / Cmd+Shift+R (Mac)
# If still blank, check browser console (F12) for errors
```

### Windows-Specific Issues

**`venv\Scripts\activate` gives permission error**

```powershell
# Run PowerShell as Administrator and execute:
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
# Then retry activation
```

**`python` command not found**

```bash
# Try py instead:
py -m venv venv
py -m uvicorn backend.main:app --reload --port 8000
```

---

## Dataset

The system uses the official IIT Bombay Techfest synthetic dataset of **250,000 UPI transactions**.

| Column               | Type    | Description                                            |
| -------------------- | ------- | ------------------------------------------------------ |
| `transaction_id`     | String  | Unique identifier                                      |
| `timestamp`          | Date    | Transaction date and time                              |
| `transaction_type`   | String  | P2P, P2M, Bill Payment, Recharge                       |
| `merchant_category`  | String  | Food, Grocery, Fuel, etc.                              |
| `amount (INR)`       | Integer | Transaction value in rupees                            |
| `transaction_status` | String  | SUCCESS or FAILED                                      |
| `sender_age_group`   | String  | 18-25, 26-35, 36-45, 46-55, 56+                        |
| `receiver_age_group` | String  | Same groups (P2P only)                                 |
| `sender_state`       | String  | Indian state of sender                                 |
| `sender_bank`        | String  | SBI, HDFC, ICICI, Axis, PNB, Kotak, IndusInd, Yes Bank |
| `receiver_bank`      | String  | Same banks                                             |
| `device_type`        | String  | Android, iOS, Web                                      |
| `network_type`       | String  | 4G, 5G, WiFi, 3G                                       |
| `fraud_flag`         | Integer | 1 = flagged for review, 0 = normal                     |
| `hour_of_day`        | Integer | 0-23                                                   |
| `day_of_week`        | String  | Monday-Sunday                                          |
| `is_weekend`         | Integer | 1 = weekend, 0 = weekday                               |

> ⚠️ This dataset is synthetic and provided by IIT Bombay Techfest organizers for competition use only.

---

<div align="center">

Built for **IIT Bombay Techfest 2025-26**

InsightX: Leadership Analytics Challenge

</div>
