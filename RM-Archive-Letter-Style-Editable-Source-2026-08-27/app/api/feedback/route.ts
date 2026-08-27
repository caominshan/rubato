import { env } from "cloudflare:workers";

const categories = new Set(["想补充的故事", "想修改的内容", "关于图片的留言", "给网站的建议", "只是想说句话"]);

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try { body = await request.json(); } catch { return Response.json({ok:false}, {status:400}); }

  if (body.website) return Response.json({ok:true});
  const category = clean(body.category, 40);
  const title = clean(body.title, 120);
  const message = clean(body.message, 3000);
  const relatedUrl = clean(body.relatedUrl, 500);
  const email = clean(body.email, 254).toLowerCase();

  if (!categories.has(category) || !title || message.length < 2) return Response.json({ok:false}, {status:400});
  if (relatedUrl && !isHttpUrl(relatedUrl)) return Response.json({ok:false}, {status:400});
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return Response.json({ok:false}, {status:400});

  await env.DB.prepare("INSERT INTO feedback (id, category, title, message, related_url, email, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)")
    .bind(crypto.randomUUID(), category, title, message, relatedUrl || null, email || null, new Date().toISOString()).run();
  return Response.json({ok:true}, {status:201});
}

function clean(value: unknown, max: number) { return typeof value === "string" ? value.trim().slice(0, max) : ""; }
function isHttpUrl(value: string) { try { const url = new URL(value); return url.protocol === "http:" || url.protocol === "https:"; } catch { return false; } }
