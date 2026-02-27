# InsightX — Setup Guide

> This guide gets InsightX running on your machine from scratch.
> Estimated time: **5-10 minutes** on a clean machine.
> If anything goes wrong, every error has a fix in the [Troubleshooting](#troubleshooting) section at the bottom.

---

## ⚠️ Critical Prerequisite — Python Version

**InsightX requires Python 3.11 or Python 3.12 specifically.**

Python 3.13 and 3.14 are NOT supported. Several dependencies (DuckDB 0.10.3, SciPy 1.13) have not released wheels for Python 3.13+ and will fail to install with a `No matching distribution found` error.

**Check your Python version first:**

```bash
python --version
# or
python3 --version
```

You need to see `Python 3.11.x` or `Python 3.12.x`.

If you see `Python 3.13.x` or `Python 3.14.x` — **stop here and install 3.12 first.**

### Installing Python 3.12 (if needed)

**Windows:**

1. Go to [https://www.python.org/downloads/release/python-3129/](https://www.python.org/downloads/release/python-3129/)
2. Download `Windows installer (64-bit)`
3. Run installer — **check "Add Python to PATH"** during installation
4. Open a new terminal and verify: `python --version`

**macOS:**

```bash
# Using Homebrew (recommended):
brew install python@3.12
# Then use python3.12 instead of python
python3.12 --version
```

**Ubuntu/Linux:**

```bash
sudo apt update
sudo apt install python3.12 python3.12-venv python3.12-dev
python3.12 --version
```

If you have multiple Python versions installed, use `py -3.12` (Windows) or `python3.12` (macOS/Linux) in all commands below.

---

## Prerequisites Checklist

Before starting, confirm you have all of these:

| Requirement    | Check Command      | Required Version                        |
| -------------- | ------------------ | --------------------------------------- |
| Python         | `python --version` | **3.11.x or 3.12.x ONLY**               |
| Node.js        | `node --version`   | 18.x or higher                          |
| npm            | `npm --version`    | 9.x or higher                           |
| Git            | `git --version`    | Any recent version                      |
| OpenAI API key | —                  | Provided by the team via WhatsApp/email |

---

## Step 1 — Clone the Repository

```bash
git clone https://github.com/Adity00/Insight.git
cd Insight
```

Verify you're in the right folder — you should see these files:

```bash
# Windows:
dir
# macOS/Linux:
ls
```

Expected output includes: `README.md`, `SETUP.md`, `requirements.txt`, `backend/`, `frontend/`, `.env.example`

---

## Step 2 — Add Your API Key

You should have received an OpenAI API key from the InsightX team via WhatsApp or email. It starts with `sk-proj-` or `sk-`.

**2a. Copy the example environment file:**

```bash
# Windows (Command Prompt):
copy .env.example .env

# Windows (PowerShell):
Copy-Item .env.example .env

# macOS/Linux:
cp .env.example .env
```

**2b. Open `.env` in any text editor and add your key:**

The file looks like this:

```env
OPENAI_API_KEY=your_openai_api_key_here   ← replace this entire value
MODEL_PRIMARY=gpt-4
MODEL_FALLBACK=gpt-3.5-turbo
CSV_PATH=backend/data/upi_transactions_2024.csv
MAX_ROWS_RETURNED=500
SESSION_MEMORY_TURNS=8
```

Replace `your_openai_api_key_here` with the key you received. The line should look like:

```env
OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

Save the file. **The `.env` file must be in the root folder of the project (same level as `README.md`), not inside `backend/`.**

---

## Step 3 — Backend Setup

### 3a. Create a virtual environment

A virtual environment keeps InsightX's dependencies separate from your system Python.

```bash
# Windows:
python -m venv venv

# macOS/Linux (if python points to 3.13+, use python3.12 explicitly):
python3.12 -m venv venv
```

### 3b. Activate the virtual environment

**This step is required every time you start a new terminal session.**

```bash
# Windows (Command Prompt):
venv\Scripts\activate

# Windows (PowerShell):
venv\Scripts\Activate.ps1

# macOS/Linux:
source venv/bin/activate
```

After activation, your terminal prompt will show `(venv)` at the start. If you don't see `(venv)`, the environment is not active — do not proceed.

### 3c. Verify you're using the right Python inside the venv

```bash
python --version
```

Must show `3.11.x` or `3.12.x`. If it shows 3.13 or 3.14, your venv was created with the wrong Python. Delete the `venv/` folder and redo Step 3a using `python3.12 -m venv venv`.

### 3d. Install Python dependencies

```bash
pip install -r requirements.txt
```

This installs FastAPI, DuckDB, OpenAI SDK, and all other packages. Takes 1-3 minutes on first run.

Expected last line: `Successfully installed fastapi-0.111.0 uvicorn-...` (versions may vary slightly in output).

If you see any `ERROR` — go to [Troubleshooting](#troubleshooting).

### 3e. Start the backend server

```bash
python -m uvicorn backend.main:app --reload --port 8000
```

**Wait for this exact output before continuing:**

```
INFO:     Loaded 250000 rows from backend/data/upi_transactions_2024.csv
INFO:     DuckDB initialized successfully
INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)
```

> 💡 First startup takes 10-20 seconds while DuckDB loads all 250,000 rows into memory. Subsequent startups are faster because the database file is cached.

**Do not close this terminal.** The backend must keep running.

---

## Step 4 — Frontend Setup

Open a **new terminal window**. The backend must remain running in the first terminal.

Navigate back to the project root first:

```bash
cd path/to/Insight
# For example:
# Windows: cd C:\Users\YourName\Insight
# macOS: cd ~/Insight
```

Then:

```bash
cd frontend
npm install
```

This installs all Node.js packages. Takes 1-2 minutes on first run.

If you see peer dependency warnings, run instead:

```bash
npm install --legacy-peer-deps
```

Then start the frontend:

```bash
npm run dev
```

**Expected output:**

```
▲ Next.js 16.1.6
- Local:   http://localhost:3000
- Ready in ~2s
```

---

## Step 5 — Verify Everything is Working

Open your browser and go to: **[http://localhost:3000](http://localhost:3000)**

### ✅ What you must see

The dashboard KPI cards should show these exact values:

| Card                   | Expected Value |
| ---------------------- | -------------- |
| Total Transactions     | 250,000        |
| Success Rate           | 95.05%         |
| Flagged for Review     | 0.19%          |
| Avg Transaction Amount | ₹1,311.76      |

If these numbers appear — **InsightX is fully working.**

### Test a query

Click the chat interface and type:

```
What is the total transaction volume by transaction type?
```

You should receive an answer within 5-10 seconds showing all 4 transaction types (P2P, P2M, Bill Payment, Recharge) with percentages and a bar chart.

---

## Running InsightX Again (After Closing)

Every time you want to run InsightX again after closing:

**Terminal 1 — Backend:**

```bash
cd Insight

# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

python -m uvicorn backend.main:app --reload --port 8000
```

**Terminal 2 — Frontend:**

```bash
cd Insight/frontend
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000).

---

## Troubleshooting

### Python / Installation Issues

**`No matching distribution found for duckdb==0.10.3` or `scipy==1.13.0`**

```
Cause: You are using Python 3.13 or 3.14.
Fix: Install Python 3.12 (see top of this guide).
     Delete the venv/ folder, recreate with python3.12 -m venv venv,
     then run pip install -r requirements.txt again.
```

**`ModuleNotFoundError` when starting backend**

```
Cause: Virtual environment is not activated.
Fix: Run venv\Scripts\activate (Windows) or source venv/bin/activate (macOS/Linux)
     Then retry python -m uvicorn backend.main:app --reload --port 8000
```

**`pip install` fails with permission error**

```
Cause: Installing into system Python instead of venv.
Fix: Confirm (venv) appears in your terminal prompt.
     If not, reactivate the virtual environment first.
```

**PowerShell says `Activate.ps1 cannot be loaded, running scripts is disabled`**

```powershell
Fix: Run PowerShell as Administrator and execute:
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
Then retry: venv\Scripts\Activate.ps1
```

**`python` command not found on Windows**

```
Fix: Use py instead:
py -3.12 -m venv venv
venv\Scripts\activate
py -m uvicorn backend.main:app --reload --port 8000
```

### Backend Issues

**Server starts but shows `Loaded 0 rows` or CSV error**

```
Cause: CSV file is missing.
Fix: Verify the file exists:
     Windows: dir backend\data\upi_transactions_2024.csv
     macOS/Linux: ls backend/data/upi_transactions_2024.csv

     If missing, re-clone the repository:
     git clone https://github.com/Adity00/Insight.git
```

**`AuthenticationError` or `Invalid API key`**

```
Cause: API key in .env is wrong or not set.
Fix: Open .env in a text editor.
     Confirm OPENAI_API_KEY= has the full key starting with sk-
     Confirm .env is in the ROOT project folder, NOT inside backend/
     Confirm there are no spaces around the = sign
```

**`OpenAI RateLimitError` during a query**

```
Cause: API rate limit hit.
Fix: Wait 30-60 seconds and retry the query.
     If it persists, contact the team for a fresh API key.
```

**`Address already in use` on port 8000**

```bash
# Windows — find and kill the process using port 8000:
netstat -ano | findstr :8000
taskkill /PID  /F

# macOS/Linux:
lsof -ti:8000 | xargs kill -9

# Then restart:
python -m uvicorn backend.main:app --reload --port 8000
```

### Frontend Issues

**KPI cards show 0 or blank / chat returns no response**

```
Cause: Backend is not running.
Fix: Open Terminal 1 and check if uvicorn is still running.
     If not, reactivate venv and restart the backend.
     Verify backend is alive: open http://localhost:8000/health in browser.
     Expected response: {"status": "healthy"}
```

**`npm install` fails with `ERESOLVE` peer dependency error**

```bash
npm install --legacy-peer-deps
```

**Port 3000 already in use**

```bash
npm run dev -- -p 3001
# Then open http://localhost:3001 instead
```

**Page loads but charts are blank**

```
Fix: Hard refresh the browser:
     Windows/Linux: Ctrl + Shift + R
     macOS: Cmd + Shift + R
```

---

## Quick Reference — All Commands

```bash
# ── FIRST TIME SETUP ──────────────────────────────────
git clone https://github.com/Adity00/Insight.git && cd Insight
cp .env.example .env          # then add your API key to .env
python -m venv venv
venv\Scripts\activate         # Windows
pip install -r requirements.txt

# ── EVERY TIME ────────────────────────────────────────
# Terminal 1 (Backend):
venv\Scripts\activate
python -m uvicorn backend.main:app --reload --port 8000

# Terminal 2 (Frontend):
cd frontend && npm run dev

# ── THEN OPEN ─────────────────────────────────────────
# http://localhost:3000
```

---

_For questions about the project, refer to [README.md](README.md) for architecture and design decisions._
