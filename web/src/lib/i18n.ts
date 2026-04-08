export type Lang = "ja" | "en";

const dict = {
  ja: {
    title: "ClaudeCoach",
    monthlySummary: "今月サマリー",
    totalTokens: "総トークン",
    apiEquivalent: "API換算",
    planROI: "プランROI",
    savingsEstimate: "節約余地",
    sonnetSwitch: "Sonnet切替で推定",
    sessions: "セッション",
    messages: "メッセージ",
    weeklyTokenUsage: "週次トークン使用量",
    noData: "データがありません",
    projectCost: "プロジェクト別コスト",
    project: "プロジェクト",
    tokenCount: "トークン",
    sessionList: "セッション一覧",
    sessionListRecent: "セッション一覧（直近100件）",
    date: "日時",
    model: "モデル",
    input: "Input",
    output: "Output",
    toolCalls: "ツール呼出",
    duration: "時間(分)",
    loading: "読み込み中...",
    connectionError: "接続エラー",
    backendCheck: "バックエンド (localhost:8000) が起動しているか確認してください",
    plan: "プラン",
    formatMan: "万",
    roiDisclaimer: "※ API従量課金の単価に基づく推定値です。サブスクリプションプランの実際の使用量計算とは異なる場合があります。",
  },
  en: {
    title: "ClaudeCoach",
    monthlySummary: "Monthly Summary",
    totalTokens: "Total Tokens",
    apiEquivalent: "API Equivalent",
    planROI: "Plan ROI",
    savingsEstimate: "Savings Estimate",
    sonnetSwitch: "Estimated with Sonnet",
    sessions: "sessions",
    messages: "messages",
    weeklyTokenUsage: "Weekly Token Usage",
    noData: "No data",
    projectCost: "Cost by Project",
    project: "Project",
    tokenCount: "Tokens",
    sessionList: "Sessions",
    sessionListRecent: "Sessions (last 100)",
    date: "Date",
    model: "Model",
    input: "Input",
    output: "Output",
    toolCalls: "Tool Calls",
    duration: "Min",
    loading: "Loading...",
    connectionError: "Connection Error",
    backendCheck: "Make sure the backend (localhost:8000) is running",
    plan: "Plan",
    formatMan: "M",
    roiDisclaimer: "* Estimated based on API pay-as-you-go pricing. Actual subscription plan usage accounting may differ.",
  },
} as const;

export type T = { [K in keyof typeof dict.ja]: string };

export function t(lang: Lang): T {
  return dict[lang];
}

export function formatTokensI18n(n: number, lang: Lang): string {
  if (lang === "ja") {
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(0)}万`;
    if (n >= 10_000) return `${(n / 10_000).toFixed(1)}万`;
  } else {
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  }
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return String(n);
}
