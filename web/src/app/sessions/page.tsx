"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getSessions, type SessionMetadata } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

function formatTokens(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return String(n);
}

function formatDate(ts: string): string {
  const d = new Date(ts);
  return d.toLocaleDateString("ja-JP", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function SessionsPage() {
  const [sessions, setSessions] = useState<SessionMetadata[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getSessions(100).then(setSessions).catch((e) => setError(e.message));
  }, []);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto flex items-center gap-4 px-4 py-4">
          <Link href="/" className="text-xl font-bold hover:underline">
            ClaudeCoach
          </Link>
          <span className="text-muted-foreground">/</span>
          <span className="text-muted-foreground">セッション一覧</span>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <Card>
          <CardHeader>
            <CardTitle>セッション一覧（直近100件）</CardTitle>
          </CardHeader>
          <CardContent>
            {sessions.length === 0 ? (
              <p className="text-muted-foreground text-sm py-4 text-center">
                読み込み中...
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>日時</TableHead>
                    <TableHead>プロジェクト</TableHead>
                    <TableHead>モデル</TableHead>
                    <TableHead className="text-right">Input</TableHead>
                    <TableHead className="text-right">Output</TableHead>
                    <TableHead className="text-right">メッセージ</TableHead>
                    <TableHead className="text-right">ツール呼出</TableHead>
                    <TableHead className="text-right">時間(分)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sessions.map((s) => (
                    <TableRow key={s.session_id}>
                      <TableCell className="whitespace-nowrap">
                        {formatDate(s.timestamp)}
                      </TableCell>
                      <TableCell className="truncate max-w-[180px]">
                        {s.project_name}
                      </TableCell>
                      <TableCell className="text-xs">{s.model}</TableCell>
                      <TableCell className="text-right">
                        {formatTokens(s.input_tokens)}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatTokens(s.output_tokens)}
                      </TableCell>
                      <TableCell className="text-right">
                        {s.message_count}
                      </TableCell>
                      <TableCell className="text-right">
                        {s.tool_calls}
                      </TableCell>
                      <TableCell className="text-right">
                        {s.session_duration_minutes.toFixed(0)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
