import { env } from "cloudflare:workers";
import { notFound } from "next/navigation";
import { requireAdmin } from "../admin-auth";
import AdminDashboard, { type FeedbackRow } from "./admin-dashboard";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const user = await requireAdmin("/admin");
  if (!user) notFound();
  const result = await env.DB.prepare("SELECT id, category, title, message, related_url AS relatedUrl, email, status, created_at AS createdAt, updated_at AS updatedAt FROM feedback ORDER BY created_at DESC LIMIT 500").all<FeedbackRow>();
  return <AdminDashboard initialRows={result.results} adminName={user.displayName}/>;
}
