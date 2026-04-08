"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { WeeklyTokens } from "@/lib/api";
import type { Lang } from "@/lib/i18n";
import { t } from "@/lib/i18n";

// Same rates as plan_service.py
const INPUT_PRICE = 3.0;    // $ per 1M tokens
const OUTPUT_PRICE = 15.0;
const CACHE_PRICE = 0.30;

function toCost(tokens: number, pricePerMillion: number): number {
  return Math.round((tokens / 1_000_000) * pricePerMillion * 100) / 100;
}

export function TokenUsageChart({ data, lang = "ja" }: { data: WeeklyTokens[]; lang?: Lang }) {
  const i = t(lang);

  const chartData = data.map((w) => ({
    week: w.week,
    Input: toCost(w.input_tokens, INPUT_PRICE),
    Output: toCost(w.output_tokens, OUTPUT_PRICE),
    Cache: toCost(w.cache_read_tokens, CACHE_PRICE),
  }));

  const title = lang === "ja" ? "週次API換算コスト" : "Weekly API-Equivalent Cost";
  const note = lang === "ja"
    ? "API単価で換算: Input $3/M, Output $15/M, Cache Read $0.30/M"
    : "API rates: Input $3/M, Output $15/M, Cache Read $0.30/M";

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {chartData.length === 0 ? (
          <p className="text-muted-foreground text-sm py-8 text-center">
            {i.noData}
          </p>
        ) : (
          <div className="space-y-2">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="week" fontSize={12} />
                <YAxis tickFormatter={(v) => `$${v}`} fontSize={12} />
                <Tooltip formatter={(v) => `$${Number(v).toFixed(2)}`} />
                <Legend />
                <Bar dataKey="Cache" stackId="a" fill="hsl(40, 70%, 55%)" name="Cache Read" />
                <Bar dataKey="Output" stackId="a" fill="hsl(160, 60%, 45%)" />
                <Bar dataKey="Input" stackId="a" fill="hsl(220, 70%, 55%)" />
              </BarChart>
            </ResponsiveContainer>
            <p className="text-xs text-muted-foreground text-center">{note}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
