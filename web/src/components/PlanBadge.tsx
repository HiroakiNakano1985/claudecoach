"use client";

import { Badge } from "@/components/ui/badge";

const PLAN_LABELS: Record<string, string> = {
  pro: "Pro",
  max_5x: "MAX 5x",
  max_20x: "MAX 20x",
  api: "API",
};

export function PlanBadge({ plan }: { plan: string }) {
  const label = PLAN_LABELS[plan] ?? plan;
  const variant = plan.startsWith("max") ? "default" : "secondary";
  return <Badge variant={variant}>{label}</Badge>;
}
