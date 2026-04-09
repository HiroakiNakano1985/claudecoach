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

const MONTH_SHORT: Record<string, Record<number, string>> = {
  ja: { 1:"1月",2:"2月",3:"3月",4:"4月",5:"5月",6:"6月",7:"7月",8:"8月",9:"9月",10:"10月",11:"11月",12:"12月" },
  en: { 1:"Jan",2:"Feb",3:"Mar",4:"Apr",5:"May",6:"Jun",7:"Jul",8:"Aug",9:"Sep",10:"Oct",11:"Nov",12:"Dec" },
};

function formatWeekLabel(weekKey: string, lang: Lang): string {
  // ISO week: "2026-W14" → "07-13 Apr 2026"
  const match = weekKey.match(/^(\d{4})-W(\d{2})$/);
  if (!match) return weekKey;
  const year = parseInt(match[1]);
  const week = parseInt(match[2]);

  // ISO week 1 starts on the Monday of the week containing Jan 4
  const jan4 = new Date(year, 0, 4);
  const dayOfWeek = jan4.getDay() || 7; // Mon=1 ... Sun=7
  const monday = new Date(jan4);
  monday.setDate(jan4.getDate() - dayOfWeek + 1 + (week - 1) * 7);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);

  const m = MONTH_SHORT[lang] || MONTH_SHORT.en;
  const dd1 = String(monday.getDate()).padStart(2, "0");
  const dd2 = String(sunday.getDate()).padStart(2, "0");

  if (lang === "ja") {
    return `${monday.getMonth() + 1}/${dd1}-${dd2}`;
  }
  return `${dd1}-${dd2} ${m[monday.getMonth() + 1]} ${year}`;
}

function formatMonthLabel(monthKey: string, lang: Lang): string {
  // "2026-03" → "Mar 2026" / "2026年3月"
  const match = monthKey.match(/^(\d{4})-(\d{2})$/);
  if (!match) return monthKey;
  const year = parseInt(match[1]);
  const month = parseInt(match[2]);
  const m = MONTH_SHORT[lang] || MONTH_SHORT.en;
  if (lang === "ja") return `${year}年${month}月`;
  return `${m[month]} ${year}`;
}

function toCost(tokens: number, pricePerMillion: number): number {
  return Math.round((tokens / 1_000_000) * pricePerMillion * 100) / 100;
}

interface Props {
  data: WeeklyTokens[];
  lang?: Lang;
  period?: "weekly" | "monthly";
}

export function TokenUsageChart({ data, lang = "ja", period = "weekly" }: Props) {
  const i = t(lang);
  const isMonthly = period === "monthly";

  const chartData = data.map((w) => ({
    key: w.week,
    label: isMonthly
      ? formatMonthLabel(w.week, lang)
      : formatWeekLabel(w.week, lang),
    Input: toCost(w.input_tokens, INPUT_PRICE),
    Output: toCost(w.output_tokens, OUTPUT_PRICE),
    Cache: toCost(w.cache_read_tokens, CACHE_PRICE),
  }));

  const title = isMonthly
    ? (lang === "ja" ? "月次API換算コスト" : "Monthly API-Equivalent Cost")
    : (lang === "ja" ? "週次API換算コスト" : "Weekly API-Equivalent Cost");
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
                <XAxis dataKey="label" fontSize={11} />
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
