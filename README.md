# InsightX: Conversational UPI Analytics Platform

InsightX is an intelligent analytics platform that allows users to query UPI transaction data using natural language. Built with a modern tech stack (Next.js, FastAPI, DuckDB, OpenAI), it converts English questions into optimized SQL queries, executes them against a high-performance in-memory database, and presents insights with interactive visualizations.

![InsightX Screenshot](https://via.placeholder.com/800x450?text=InsightX+Dashboard)

## 🚀 Key Features

- **Natural Language to SQL**: Converts complex questions ("Show me fraud trends in Mumbai last week") into precise SQL queries.
- **Multi-Step Reasoning**: Handles complex multi-part questions using recursive query decomposition.
- **Interactive Dashboard**: Real-time KPI cards showing transaction volumes, success rates, and fraud risks.
- **Rich Visualizations**: Auto-generated bar, line, and pie charts embedded in the chat interface.
- **Business Intelligence**:
  - **Business Implications**: Contextual analysis of data trends.
  - **Proactive Insights**: "Did you know?" style discoveries found in the data.
  - **Executive Summaries**: High-level overviews for quick decision-making.
- **Transparent Logic**: View the generated SQL and execution steps for every answer.

---

## 🛠️ Architecture

InsightX follows a clean, decoupled architecture:

1.  **Frontend (Next.js 14)**:
    - **Chat Interface**: `ChatWindow`, `MessageBubble`, `InputBar`.
    - **Visualization**: `Recharts` for dynamic charting.
    - **State Management**: `Zustand` for seamless session and data handling.
    - **Styling**: `Tailwind CSS` with a custom dark mode design system.

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

1.  **Dashboard**: Upon loading, you'll see a live dashboard with high-level metrics like "Total Transactions" and "Fraud Risk".
2.  **Ask a Question**: Use the chat bar to ask questions like:
    - _"Show me the trend of failed transactions over the last 7 days."_
    - _"Compare the average transaction amount between iOS and Android users."_
    - _"Which state has the highest fraud rate for P2M transactions?"_
3.  **Interact**:
    - Hover over charts for details.
    - Click **"View SQL"** to see the generated code.
    - Copy SQL queries to clipboard.
    - Start a **"New Chat"** from the sidebar to clear context.

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
