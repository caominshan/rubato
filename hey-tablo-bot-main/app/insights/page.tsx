import type { Metadata } from "next";
import { EditorialHeader } from "@/components/editorial/EditorialHeader";
import { InsightsDashboard } from "@/components/insights/InsightsDashboard";

export const metadata: Metadata = {
  title: "Insights · Hey Tablo Agent",
  description: "Hey Tablo 用户反馈与推荐质量看板。",
};

export default function InsightsPage() {
  return (
    <main className="insights-page">
      <EditorialHeader active="insights" />
      <InsightsDashboard />
    </main>
  );
}
