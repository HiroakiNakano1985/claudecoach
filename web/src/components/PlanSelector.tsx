"use client";

const PLANS = [
  { value: "pro", label: "Pro" },
  { value: "max_5x", label: "MAX 5x" },
  { value: "max_20x", label: "MAX 20x" },
  { value: "api", label: "API" },
] as const;

interface PlanSelectorProps {
  current: string;
  onChange: (plan: string) => void;
}

export function PlanSelector({ current, onChange }: PlanSelectorProps) {
  return (
    <div className="flex gap-1">
      {PLANS.map((p) => (
        <button
          key={p.value}
          onClick={() => onChange(p.value)}
          className={`px-3 py-1 text-xs font-medium rounded-full border transition-colors ${
            current === p.value
              ? "bg-primary text-primary-foreground border-primary"
              : "bg-background text-muted-foreground border-border hover:bg-muted"
          }`}
        >
          {p.label}
        </button>
      ))}
    </div>
  );
}
