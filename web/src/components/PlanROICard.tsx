"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ROIInfo } from "@/lib/api";
import type { Lang } from "@/lib/i18n";
import { t } from "@/lib/i18n";

export function PlanROICard({ roi, lang = "ja" }: { roi: ROIInfo | null; lang?: Lang }) {
  const i = t(lang);
  if (!roi) return null;

  const isProfitable = roi.is_profitable ?? false;
  const ratio = roi.roi_ratio ?? 0;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {i.planROI}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold">
            {ratio.toFixed(1)}x
          </span>
          <span className="text-lg">{isProfitable ? "✅" : "❌"}</span>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">{roi.message}</p>
      </CardContent>
    </Card>
  );
}
