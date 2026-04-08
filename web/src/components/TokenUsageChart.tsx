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

function formatTokens(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return String(n);
}

export function TokenUsageChart({ data }: { data: WeeklyTokens[] }) {
  const chartData = data.map((w) => ({
    week: w.week,
    Input: w.input_tokens,
    Output: w.output_tokens,
    Cache: w.cache_read_tokens,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>週次トークン使用量</CardTitle>
      </CardHeader>
      <CardContent>
        {chartData.length === 0 ? (
          <p className="text-muted-foreground text-sm py-8 text-center">
            データがありません
          </p>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="week" fontSize={12} />
              <YAxis tickFormatter={formatTokens} fontSize={12} />
              <Tooltip formatter={(v) => formatTokens(Number(v))} />
              <Legend />
              <Bar dataKey="Input" stackId="a" fill="hsl(220, 70%, 55%)" />
              <Bar dataKey="Output" stackId="a" fill="hsl(160, 60%, 45%)" />
              <Bar dataKey="Cache" stackId="a" fill="hsl(40, 70%, 55%)" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
