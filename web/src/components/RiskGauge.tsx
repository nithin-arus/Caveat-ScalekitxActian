import { riskLabel } from "@/lib/data";

export function RiskGauge({ score }: { score: number }) {
  const { label, color } = riskLabel(score);
  const circumference = 2 * Math.PI * 54;
  const offset = circumference * (1 - score / 100);

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative h-32 w-32">
        <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90">
          <circle cx="60" cy="60" r="54" fill="none" stroke="var(--color-paper-muted)" strokeWidth="10" />
          <circle
            cx="60"
            cy="60"
            r="54"
            fill="none"
            stroke="var(--color-seal)"
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-semibold">{score}</span>
          <span className="text-xs text-ink-muted">/ 100</span>
        </div>
      </div>
      <p className={`text-sm font-semibold ${color}`}>{label}</p>
    </div>
  );
}
