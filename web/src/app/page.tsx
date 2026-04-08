"use client";

import { useEffect, useState } from "react";
import { getDashboard, type DashboardSummary } from "@/lib/api";
import { PlanBadge } from "@/components/PlanBadge";
import { PlanROICard } from "@/components/PlanROICard";
import { StatCard } from "@/components/StatCard";
import { TokenUsageChart } from "@/components/TokenUsageChart";
import { ProjectCostTable } from "@/components/ProjectCostTable";

function formatTokens(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(0)}万`;
  if (n >= 10_000) return `${(n / 10_000).toFixed(1)}万`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return String(n);
}

export default function Dashboard() {
  const [data, setData] = useState<DashboardSummary | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getDashboard().then(setData).catch((e) => setError(e.message));
  }, []);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-bold mb-2">接続エラー</h2>
          <p className="text-muted-foreground">{error}</p>
          <p className="text-sm text-muted-foreground mt-2">
            バックエンド (localhost:8000) が起動しているか確認してください
          </p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">読み込み中...</p>
      </div>
    );
  }

  const totalTokens = data.total_input + data.total_output;
  const savingsEstimate = data.api_equivalent_cost * 0.4;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <h1 className="text-xl font-bold">ClaudeCoach</h1>
          <div className="flex items-center gap-3">
            <PlanBadge plan={data.plan} />
            <span className="text-sm text-muted-foreground">今月サマリー</span>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Summary cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="総トークン"
            value={formatTokens(totalTokens)}
            sub={`${data.session_count}セッション`}
          />
          <StatCard
            title="API換算"
            value={`$${data.api_equivalent_cost.toFixed(2)}`}
            sub={`${data.total_messages}メッセージ`}
          />
          <PlanROICard roi={data.roi} />
          <StatCard
            title="節約余地"
            value={`$${savingsEstimate.toFixed(2)}`}
            sub="Sonnet切替で推定"
          />
        </div>

        {/* Weekly chart */}
        <TokenUsageChart data={data.weekly_tokens} />

        {/* Project breakdown */}
        <ProjectCostTable projects={data.projects} />
      </main>
    </div>
  );
}
