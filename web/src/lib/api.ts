const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api";

export interface ROIInfo {
  plan: string;
  plan_cost: number | null;
  api_equivalent: number;
  roi_ratio: number | null;
  is_profitable: boolean | null;
  message: string;
}

export interface ProjectBreakdown {
  project_name: string;
  session_count: number;
  total_input: number;
  total_output: number;
  total_cache_read: number;
  api_equivalent_cost: number;
}

export interface WeeklyTokens {
  week: string;
  input_tokens: number;
  output_tokens: number;
  cache_read_tokens: number;
  session_count: number;
}

export interface DashboardSummary {
  session_count: number;
  total_input: number;
  total_output: number;
  total_cache_read: number;
  total_cache_creation: number;
  total_tool_calls: number;
  total_messages: number;
  total_long_prompts: number;
  total_clarifications: number;
  api_equivalent_cost: number;
  plan: string;
  roi: ROIInfo | null;
  projects: ProjectBreakdown[];
  weekly_tokens: WeeklyTokens[];
}

export interface SessionMetadata {
  session_id: string;
  timestamp: string;
  project_name: string;
  model: string;
  input_tokens: number;
  output_tokens: number;
  cache_read_tokens: number;
  cache_creation_tokens: number;
  tool_calls: number;
  message_count: number;
  session_duration_minutes: number;
  prompt_lengths: number[];
  long_prompt_count: number;
  clarification_count: number;
  model_switches: number;
  created_at: string | null;
  updated_at: string | null;
}

async function fetchAPI<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, { cache: "no-store" });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

export function getDashboard() {
  return fetchAPI<DashboardSummary>("/dashboard");
}

export function getSessions(limit = 50, offset = 0) {
  return fetchAPI<SessionMetadata[]>(`/sessions?limit=${limit}&offset=${offset}`);
}

export function getSession(id: string) {
  return fetchAPI<SessionMetadata>(`/sessions/${id}`);
}
