export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export interface DashboardStats {
  total_transactions: number;
  success_rate: number;
  fraud_flag_rate: number;
  avg_amount_inr: number;
  peak_hour: number;
  top_transaction_type: string;
  top_state: string;
  device_distribution: Record<string, number>;
  network_distribution: Record<string, number>;
  transaction_type_distribution: Record<string, number>;
  date_range: { min: string; max: string };
}

export interface ChatMessage {
  answer: string;
  sql_used?: string;
  chart?: {
    type: string;
    data: any[];
    x_key: string;
    y_key: string;
  };
  proactive_insight?: string;
  query_intent?: string;
  execution_time_ms?: number;
  is_clarification: boolean;
  error?: string;
}

export const api = {
  async getDashboard(): Promise<DashboardStats> {
    const res = await fetch(`${API_BASE_URL}/api/dashboard`);
    if (!res.ok) throw new Error("Failed to fetch dashboard");
    return res.json();
  },

  async createSession(): Promise<{ session_id: string }> {
    const res = await fetch(`${API_BASE_URL}/api/sessions`, { method: "POST" });
    if (!res.ok) throw new Error("Failed to create session");
    return res.json();
  },

  async askQuestion(question: string, sessionId: string): Promise<ChatMessage> {
    const res = await fetch(`${API_BASE_URL}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question, session_id: sessionId }),
    });
    if (!res.ok) throw new Error("Chat request failed");
    return res.json();
  },
};
