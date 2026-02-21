# InsightX: Conversational UPI Analytics Platform

InsightX is an intelligent analytics platform that allows users to query UPI transaction data using natural language. Built with a modern tech stack (Next.js, FastAPI, DuckDB, OpenAI), it converts English questions into optimized SQL queries, executes them against a high-performance in-memory database, and presents insights with interactive visualizations.

![InsightX Screenshot](https://via.placeholder.com/800x450?text=InsightX+Dashboard)

## 🚀 Key Features

### 🌟 Premium Frontend Dashboard (V4)
- **Unified Workspace Experience**: Deep-purple accented dark theme and glassmorphism styling, featuring a collapsible side-navigation pane and seamless view switching between Chat and KPI Dashboard modes.
- **Interactive Chat Interface**: A sticky, floating prompt input with intelligent placeholder cycling and instant slash-command suggestions (`/compare`, `/trend`, `/forecast`).
- **Stack Execution Trace Drawer**: A right-sided slide-out drawer providing full transparency. Inspect the exact generated SQL query, view the verified origin data sources, and monitor execution metrics (latency, compute tier, confidence scores) for every query.
- **Insight Action Rows**: Save, download as PDF, share via link, or pin generated charts directly to your Custom Dashboard.
- **Proactive Insights System**: Data discoveries are presented cleanly with collapsible cards ("Did you know?" style insights) that don't crowd the conversation.

### 🧠 Advanced Backend AI
- **Natural Language to SQL**: Converts complex questions ("Show me fraud trends in Mumbai last week") into precise SQL queries.
- **Multi-Step Reasoning**: Handles complex multi-part questions using recursive query decomposition.
- **Business Intelligence**: Rich contextual analysis of data trends and automatic Executive Summaries for quick decision-making.

### 📊 Real-time Dashboard & KPI Tracking
- **Interactive KPI Cards**: Real-time KPI cards mapping out total transaction volume, tracking success rates, and highlighting top demographic states.
- **Rich Visualizations**: Auto-generated Recharts components (Area, Bar, Line, and Pie charts) featuring customized gradients that match the deep-purple branding.

---

## 🛠️ Architecture

InsightX follows a clean, decoupled architecture:

1.  **Frontend (Next.js 14, Tailwind V4 UI)**:
    - **Chat Interface & Dashboard**: Contains `ChatWindow`, `KPICards`, and a responsive Slide-over Context Panel.
    - **Visualization**: `Recharts` for dynamic charting with custom data color palettes and gradient SVGs.
    - **State Management**: React state hooks driving conditional rendering (Chat mode vs Dashboard mode, Sidebar toggles, Theme states).
    - **Styling**: Modern UI design system strictly utilizing CSS Variables (`globals.css`) for a comprehensive light/dark mode implementation with rich aesthetics.

2.  **Backend (FastAPI)**:
    - **API Layer**: REST endpoints for chat (`/api/chat`), sessions (`/api/sessions`), and dashboard (`/api/dashboard`).
    - **Orchestration**: `QueryPipeline` manages the flow from Prompt -> LLM -> SQL -> Execution -> Narrator.
    - **Prompt Engineering**: Context-aware prompts with schema injection and few-shot examples.

3.  **Data Layer (DuckDB)**:
    - **In-Memory Performance**: Lightning-fast analytical queries on 250k+ rows.
    - **Data Loading**: Auto-ingestion of CSV data into optimized views.

---

## 📊 Dataset Schema

The system is powered by a comprehensive synthetic dataset of **250,000 UPI transactions**.

| Column Name          | Type    | Description                                                     |
| :------------------- | :------ | :-------------------------------------------------------------- |
| `transaction_id`     | STRING  | Unique identifier for the transaction                           |
| `timestamp`          | DATE    | Date and time of the transaction                                |
| `transaction_type`   | STRING  | `P2P`, `P2M`, `Bill Payment`, `Recharge`                        |
| `merchant_category`  | STRING  | e.g., `Food`, `Grocery`, `Fuel`, `Entertainment` (NULL for P2P) |
| `amount_inr`         | INTEGER | Transaction value in Indian Rupees (₹)                          |
| `transaction_status` | STRING  | `SUCCESS`, `FAILED`                                             |
| `sender_age_group`   | STRING  | `18-25`, `26-35`, `36-45`, etc.                                 |
| `receiver_age_group` | STRING  | Age group of receiver (for P2P)                                 |
| `sender_state`       | STRING  | Origin state (e.g., `Maharashtra`, `Delhi`)                     |
| `sender_bank`        | STRING  | Bank name (e.g., `SBI`, `HDFC`)                                 |
| `device_type`        | STRING  | `Android`, `iOS`, `Web`                                         |
| `network_type`       | STRING  | `4G`, `5G`, `WiFi`                                              |
| `fraud_flag`         | INTEGER | `1` (Flagged for review), `0` (Normal)                          |

> **Note**: The raw dataset (`upi_transactions_2024.csv`) is **NOT** included in the repository due to size constraints. You must place it in `backend/data/`.

---

## 📦 Installation & Setup

### Prerequisites

- **Python 3.10+**
- **Node.js 18+**
- **Git**
- **OpenAI API Key**

### 1. Clone the Repository

```bash
git clone https://github.com/Adity00/Insight.git
cd InsightX
```

### 2. Backend Setup

Navigate to the project root (where `backend/` and `requirements.txt` are located).

1.  **Create Virtual Environment**:

    ```bash
    python -m venv venv
    source venv/bin/activate  # On Windows: venv\Scripts\activate
    ```

2.  **Install Dependencies**:

    ```bash
    pip install -r requirements.txt
    ```

3.  **Environment Variables**:
    Create a `.env` file in the root directory:

    ```env
    OPENAI_API_KEY=sk-your-openai-api-key-here
    CSV_PATH=backend/data/upi_transactions_2024.csv
    ```

4.  **Add Data**:
    Place your `upi_transactions_2024.csv` file inside `backend/data/`.

5.  **Run Server**:
    ```bash
    python -m uvicorn backend.main:app --reload --port 8000
    ```
    The API will be available at `http://localhost:8000`.

### 3. Frontend Setup

Navigate to the frontend directory.

1.  **Install Dependencies**:

    ```bash
    cd frontend
    npm install
    # or
    npm install --legacy-peer-deps  # if you encounter dependency conflicts
    ```

2.  **Run Development Server**:

    ```bash
    npm run dev
    ```

3.  **Open Application**:
    Visit `http://localhost:3000` in your browser.

---

## 🖥️ Usage Guide

1.  **Dashboard View**: Upon loading, you'll see a live dashboard with high-level KPI metrics formatted dynamically.
2.  **Ask a Question**: Open the Chat Interface to query your data.
    - Try Slash Commands directly from the UI dropdown: type `/trend last 7 days failed transactions`.
    - Alternatively type in plain English: _"Compare the average transaction amount between iOS and Android users."_
3.  **Explore the Context Drawer**:
    - Click **"View Stack"** on any generated answer.
    - A right-hand panel slides open showing exact SQL syntax, origin schemas, latency, and LLM compute models.
    - Easily copy the parsed SQL representation from here.
4.  **Interact with Insights**:
    - Hover over beautifully rendered gradient charts for full tooltips.
    - Expand "Proactive Insights" banners to dive deeper into automatically identified anomalies.

---

## 🤝 Contributing

Contributions are welcome! Please fork the repository and create a pull request.

1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---

**Built with ❤️ by the InsightX Team**
