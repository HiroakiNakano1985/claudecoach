"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ROIInfo } from "@/lib/api";

export function PlanROICard({ roi }: { roi: ROIInfo | null }) {
  if (!roi) return null;

  const isProfitable = roi.is_profitable ?? false;
  const ratio = roi.roi_ratio ?? 0;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          プランROI
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold">
            {ratio.toFixed(1)}倍
          </span>
          <span className="text-lg">{isProfitable ? "✅" : "❌"}</span>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">{roi.message}</p>
      </CardContent>
    </Card>
  );
}
