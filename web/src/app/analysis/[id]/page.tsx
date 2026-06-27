import { notFound } from "next/navigation";
import { getAnalysis } from "@/lib/data";
import { AnalysisView } from "@/components/AnalysisView";

export default async function AnalysisPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const analysis = getAnalysis(id);
  if (!analysis) return notFound();

  return <AnalysisView analysis={analysis} />;
}
