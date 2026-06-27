import { sampleAnalyses, sampleAuditLog, sampleWatchEvents } from "@data/fixtures/analyses";
import type { Analysis } from "@shared/contracts";

export function getAllAnalyses(): Analysis[] {
  return sampleAnalyses;
}

export function getAnalysis(id: string): Analysis | undefined {
  return sampleAnalyses.find((a) => a.id === id);
}

export { sampleAuditLog, sampleWatchEvents };

export function severityColor(severity: "low" | "med" | "high") {
  switch (severity) {
    case "high":
      return { dot: "bg-red-500", text: "text-red-700", bg: "bg-red-50", ring: "ring-red-200" };
    case "med":
      return { dot: "bg-amber-500", text: "text-amber-700", bg: "bg-amber-50", ring: "ring-amber-200" };
    default:
      return { dot: "bg-emerald-500", text: "text-emerald-700", bg: "bg-emerald-50", ring: "ring-emerald-200" };
  }
}

export function riskLabel(score: number) {
  if (score >= 70) return { label: "High risk", color: "text-red-600" };
  if (score >= 35) return { label: "Moderate risk", color: "text-amber-600" };
  return { label: "Low risk", color: "text-emerald-600" };
}
