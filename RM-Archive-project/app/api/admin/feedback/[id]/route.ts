import { env } from "cloudflare:workers";
import { isAdmin } from "../../../../admin-auth";

const statuses = new Set(["new", "reading", "done"]);

export async function PATCH(request:Request,{params}:{params:Promise<{id:string}>}) {
  if (!await isAdmin()) return Response.json({ok:false},{status:403});
  const {id} = await params;
  const body = await request.json().catch(()=>({}));
  if (!statuses.has(body.status)) return Response.json({ok:false},{status:400});
  const result = await env.DB.prepare("UPDATE feedback SET status = ?, updated_at = ? WHERE id = ?").bind(body.status,new Date().toISOString(),id).run();
  return Response.json({ok:true,changed:result.meta.changes});
}

export async function DELETE(_request:Request,{params}:{params:Promise<{id:string}>}) {
  if (!await isAdmin()) return Response.json({ok:false},{status:403});
  const {id} = await params;
  const result = await env.DB.prepare("DELETE FROM feedback WHERE id = ?").bind(id).run();
  return Response.json({ok:true,changed:result.meta.changes});
}
