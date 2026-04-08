"use client";

import type { Lang } from "@/lib/i18n";

interface LangToggleProps {
  current: Lang;
  onChange: (lang: Lang) => void;
}

export function LangToggle({ current, onChange }: LangToggleProps) {
  return (
    <button
      onClick={() => onChange(current === "ja" ? "en" : "ja")}
      className="px-2 py-1 text-xs font-medium rounded border border-border hover:bg-muted transition-colors"
    >
      {current === "ja" ? "EN" : "JA"}
    </button>
  );
}
