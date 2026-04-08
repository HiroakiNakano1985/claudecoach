"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { ProjectBreakdown } from "@/lib/api";
import type { Lang } from "@/lib/i18n";
import { t, formatTokensI18n } from "@/lib/i18n";

export function ProjectCostTable({ projects, lang = "ja" }: { projects: ProjectBreakdown[]; lang?: Lang }) {
  const i = t(lang);
  const maxCost = Math.max(...projects.map((p) => p.api_equivalent_cost), 0.01);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{i.projectCost}</CardTitle>
      </CardHeader>
      <CardContent>
        {projects.length === 0 ? (
          <p className="text-muted-foreground text-sm py-4 text-center">
            {i.noData}
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{i.project}</TableHead>
                <TableHead className="text-right">{i.sessions}</TableHead>
                <TableHead className="text-right">{i.tokenCount}</TableHead>
                <TableHead className="text-right">{i.apiEquivalent}</TableHead>
                <TableHead className="w-32"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {projects.map((p) => (
                <TableRow key={p.project_name}>
                  <TableCell className="font-medium truncate max-w-[200px]">
                    {p.project_name}
                  </TableCell>
                  <TableCell className="text-right">{p.session_count}</TableCell>
                  <TableCell className="text-right">
                    {formatTokensI18n(p.total_input + p.total_output, lang)}
                  </TableCell>
                  <TableCell className="text-right">
                    ${p.api_equivalent_cost.toFixed(2)}
                  </TableCell>
                  <TableCell>
                    <div className="h-2 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full rounded-full bg-primary"
                        style={{
                          width: `${(p.api_equivalent_cost / maxCost) * 100}%`,
                        }}
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
