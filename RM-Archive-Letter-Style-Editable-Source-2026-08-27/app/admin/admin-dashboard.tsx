"use client";

import { useMemo, useState } from "react";
import styles from "./admin.module.css";

export type FeedbackRow = {id:string;category:string;title:string;message:string;relatedUrl:string|null;email:string|null;status:"new"|"reading"|"done";createdAt:string;updatedAt:string|null};
const statusText = {new:"新留言",reading:"处理中",done:"已完成"};

export default function AdminDashboard({initialRows,adminName}:{initialRows:FeedbackRow[];adminName:string}) {
  const [rows,setRows] = useState(initialRows);
  const [query,setQuery] = useState("");
  const [status,setStatus] = useState("all");
  const [selected,setSelected] = useState<FeedbackRow|null>(null);
  const [busy,setBusy] = useState("");
  const visible = useMemo(()=>rows.filter(row => (status === "all" || row.status === status) && `${row.title} ${row.message} ${row.category} ${row.email || ""}`.toLowerCase().includes(query.toLowerCase())),[rows,query,status]);
  const counts = {all:rows.length,new:rows.filter(r=>r.status==="new").length,reading:rows.filter(r=>r.status==="reading").length,done:rows.filter(r=>r.status==="done").length};

  const update = async (id:string,next:FeedbackRow["status"]) => {
    setBusy(id); const response = await fetch(`/api/admin/feedback/${id}`,{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({status:next})});
    if (response.ok) { setRows(list=>list.map(row=>row.id===id?{...row,status:next,updatedAt:new Date().toISOString()}:row)); setSelected(row=>row?.id===id?{...row,status:next}:row); }
    setBusy("");
  };
  const remove = async (id:string) => {
    if (!window.confirm("确定删除这封留言吗？删除后无法恢复。")) return;
    setBusy(id); const response = await fetch(`/api/admin/feedback/${id}`,{method:"DELETE"});
    if (response.ok) { setRows(list=>list.filter(row=>row.id!==id)); setSelected(null); }
    setBusy("");
  };

  return <main className={styles.page}>
    <header className={styles.header}><a href="/" className={styles.brand}><b>RM</b><span>LETTER DESK</span></a><div><span>{adminName}</span><a href="/signout-with-chatgpt?return_to=/">退出</a></div></header>
    <section className={styles.hero}><small>PRIVATE · OWNER ONLY</small><h1>留言管理后台</h1><p>读每一封来信，也记录网站接下来要生长的方向。</p></section>
    <section className={styles.stats}><button onClick={()=>setStatus("all")} className={status==="all"?styles.active:""}><span>全部</span><b>{counts.all}</b></button><button onClick={()=>setStatus("new")} className={status==="new"?styles.active:""}><span>新留言</span><b>{counts.new}</b></button><button onClick={()=>setStatus("reading")} className={status==="reading"?styles.active:""}><span>处理中</span><b>{counts.reading}</b></button><button onClick={()=>setStatus("done")} className={status==="done"?styles.active:""}><span>已完成</span><b>{counts.done}</b></button></section>
    <section className={styles.workspace}><div className={styles.toolbar}><label>⌕<input value={query} onChange={e=>setQuery(e.target.value)} placeholder="搜索标题、正文或邮箱"/></label><span>{visible.length.toString().padStart(2,"0")} 封来信</span></div>
      <div className={styles.list}>{visible.length?visible.map(row=><button key={row.id} className={`${styles.card} ${selected?.id===row.id?styles.selected:""}`} onClick={()=>setSelected(row)}><div><span className={`${styles.dot} ${styles[row.status]}`}></span><small>{statusText[row.status]} · {row.category}</small><time>{formatDate(row.createdAt)}</time></div><h2>{row.title}</h2><p>{row.message}</p>{row.email&&<em>{row.email}</em>}</button>):<div className={styles.empty}>这里暂时没有来信。</div>}</div>
      <aside className={`${styles.detail} ${selected?styles.open:""}`}>{selected?<><button className={styles.close} onClick={()=>setSelected(null)}>×</button><small>{selected.category} · {formatDate(selected.createdAt)}</small><h2>{selected.title}</h2><p>{selected.message}</p>{selected.relatedUrl&&<a href={selected.relatedUrl} target="_blank" rel="noreferrer">打开相关链接 ↗</a>}{selected.email&&<a href={`mailto:${selected.email}`}>回复 {selected.email} ↗</a>}<div className={styles.actions}><button disabled={busy===selected.id} onClick={()=>update(selected.id,"new")}>标为新留言</button><button disabled={busy===selected.id} onClick={()=>update(selected.id,"reading")}>标为处理中</button><button disabled={busy===selected.id} onClick={()=>update(selected.id,"done")}>标为已完成</button><button disabled={busy===selected.id} className={styles.delete} onClick={()=>remove(selected.id)}>删除留言</button></div></>:<div className={styles.prompt}><span>↗</span><p>选择左侧的一封来信</p></div>}</aside>
    </section>
  </main>;
}

function formatDate(value:string){return new Intl.DateTimeFormat("zh-CN",{year:"numeric",month:"2-digit",day:"2-digit",hour:"2-digit",minute:"2-digit"}).format(new Date(value));}
