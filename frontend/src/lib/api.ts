const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export interface DashboardStats {
  total_transactions: number;
  success_rate: number;
  fraud_flag_rate: number;
  avg_amount_inr: number;
  peak_hour: number;
  top_transaction_type: string;
  top_state: string;
  device_distribution: Record<string, number>;
  transaction_type_distribution: Record<string, number>;
  date_range: { min: string; max: string };
}

export interface ChatMessage {
  answer: string;
  sql_used?: string;
  chart?: { type: string; data: any[]; x_key: string; y_key: string } | null;
  proactive_insight?: string;
  query_intent?: string;
  execution_time_ms?: number;
  is_clarification: boolean;
  session_id?: string;
  error?: string;
}

export interface Session {
  session_id: string;
  created_at: string;
  turn_count: number;
  title?: string;
}

export interface TurnRecord {
  turn_id: number;
  session_id: string;
  role: string;
  content: string;
  sql_used?: string;
  execution_time_ms?: number;
  chart?: any;
  timestamp: string;
}

export const api = {
  async getDashboard(): Promise<DashboardStats> {
    const res = await fetch(`${BASE_URL}/api/dashboard`);
    if (!res.ok) throw new Error('Dashboard fetch failed');
    return res.json();
  },

  async createSession(): Promise<{ session_id: string; created_at: string }> {
    const res = await fetch(`${BASE_URL}/api/sessions`, { method: 'POST' });
    if (!res.ok) throw new Error('Session creation failed');
    return res.json();
  },

  async getSessions(): Promise<Session[]> {
    const res = await fetch(`${BASE_URL}/api/sessions`);
    if (!res.ok) return [];
    return res.json();
  },

  async deleteSession(sessionId: string): Promise<void> {
    await fetch(`${BASE_URL}/api/sessions/${sessionId}`, { method: 'DELETE' });
  },

  async renameSession(sessionId: string, newTitle: string): Promise<void> {
    const res = await fetch(`${BASE_URL}/api/sessions/${sessionId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: newTitle }),
    });
    if (!res.ok) throw new Error('Session rename failed');
  },

  async askQuestion(question: string, sessionId: string): Promise<ChatMessage> {
    const res = await fetch(`${BASE_URL}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question, session_id: sessionId })
    });
    if (!res.ok) throw new Error('Chat request failed');
    return res.json();
  },

  async getSessionMessages(sessionId: string): Promise<TurnRecord[]> {
    const res = await fetch(`${BASE_URL}/api/sessions/${sessionId}/messages`);
    if (!res.ok) throw new Error('Failed to fetch messages');
    const data = await res.json();
    return data.messages || [];
  }
};
