"use client";

import { useEffect, useState } from "react";
import { getDashboard, type DashboardSummary } from "@/lib/api";
import { type Lang, t, formatTokensI18n } from "@/lib/i18n";
import { PlanSelector } from "@/components/PlanSelector";
import { LangToggle } from "@/components/LangToggle";
import { PlanROICard } from "@/components/PlanROICard";
import { StatCard } from "@/components/StatCard";
import { TokenUsageChart } from "@/components/TokenUsageChart";
import { ProjectCostTable } from "@/components/ProjectCostTable";

export default function Dashboard() {
  const [data, setData] = useState<DashboardSummary | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [plan, setPlan] = useState<string>("max_5x");
  const [lang, setLang] = useState<Lang>("ja");

  useEffect(() => {
    setError(null);
    getDashboard(plan, lang)
      .then((d) => {
        setData(d);
        if (!plan) setPlan(d.plan);
      })
      .catch((e) => setError(e.message));
  }, [plan, lang]);

  const i = t(lang);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-bold mb-2">{i.connectionError}</h2>
          <p className="text-muted-foreground">{error}</p>
          <p className="text-sm text-muted-foreground mt-2">{i.backendCheck}</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">{i.loading}</p>
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
            <PlanSelector current={plan} onChange={setPlan} />
            <LangToggle current={lang} onChange={setLang} />
            <span className="text-sm text-muted-foreground">{i.monthlySummary}</span>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title={i.totalTokens}
            value={formatTokensI18n(totalTokens, lang)}
            sub={`${data.session_count} ${i.sessions}`}
          />
          <StatCard
            title={i.apiEquivalent}
            value={`$${data.api_equivalent_cost.toFixed(2)}`}
            sub={`${data.total_messages} ${i.messages}`}
          />
          <PlanROICard roi={data.roi} lang={lang} />
          <StatCard
            title={i.savingsEstimate}
            value={`$${savingsEstimate.toFixed(2)}`}
            sub={i.sonnetSwitch}
          />
        </div>
        <p className="text-xs text-muted-foreground">{i.roiDisclaimer}</p>

        <TokenUsageChart data={data.weekly_tokens} lang={lang} />

        <ProjectCostTable projects={data.projects} lang={lang} />
      </main>
    </div>
  );
}
