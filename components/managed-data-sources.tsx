"use client";

import Link from "next/link";
import { ArrowLeft, CircleAlert, Database, RefreshCw, ShieldCheck } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { ManagedDataSource } from "@/lib/types";

type User = { email: string; role: string; tenant_id: string };

export function ManagedDataSources() {
  const [actor, setActor] = useState<User | null>(null);
  const [source, setSource] = useState<ManagedDataSource | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const token = localStorage.getItem("secure-bi-token");
    if (!token) { setError("Sign in is required before viewing data sources."); setLoading(false); return; }
    setLoading(true); setError(null);
    try {
      const current = await api.me(token);
      setActor(current);
      if (!["tenant_admin", "security_admin"].includes(current.role)) throw new Error("Only tenant administrators and security administrators can view data-source configuration.");
      setSource(await api.managedDataSource(token));
    } catch (reason) {
      const message = reason instanceof Error ? reason.message : "Unable to load managed data source.";
      if (/session token|session expired|sign in is required/i.test(message)) localStorage.removeItem("secure-bi-token");
      setError(message);
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { void load(); }, [load]);

  return <main className="min-h-screen px-4 py-6 md:px-8"><div className="mx-auto max-w-5xl"><Link href="/" className="inline-flex items-center gap-2 text-sm text-[#64748b] hover:text-[#17213b]"><ArrowLeft size={16}/>Back to Executive Command Centre</Link><header className="mt-6 flex flex-wrap items-end justify-between gap-4 border-b border-[#e3e9f5] pb-5"><div><div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#536be8]"><Database size={15}/>Managed data source</div><h1 className="mt-2 text-3xl font-semibold text-[#17213b]">Data Sources</h1><p className="mt-2 text-sm text-[#64748b]">The enterprise DAG reads only from a backend-managed, tenant-bound operating database.</p></div><button onClick={() => void load()} disabled={loading} className="inline-flex items-center gap-2 rounded-md border border-[#d7e0f0] bg-white px-3 py-2 text-xs font-semibold text-[#334155] shadow-sm"><RefreshCw size={14} className={loading ? "animate-spin" : ""}/>Refresh status</button></header>{error && <div className="mt-5 flex gap-2 rounded-lg border border-[#fecdd3] bg-[#fff1f2] p-3 text-sm text-[#be123c]"><CircleAlert size={16}/>{error}</div>}{source && <div className="mt-6 grid gap-5 lg:grid-cols-[minmax(0,1fr)_300px]"><section className="rounded-xl border border-[#cfd9f2] bg-[#f8faff] p-6 shadow-sm"><div className="flex items-center gap-3"><span className="flex size-11 items-center justify-center rounded-lg bg-[#e8edff] text-[#536be8]"><Database size={22}/></span><div><h2 className="font-semibold text-[#17213b]">{source.name}</h2><p className="mt-1 flex items-center gap-1.5 text-xs font-semibold text-[#0f766e]"><span className="inline-block size-2 rounded-full bg-[#14b8a6]"/>Connected</p></div></div><dl className="mt-7 grid gap-x-10 gap-y-5 sm:grid-cols-2"><div><dt className="text-xs font-semibold uppercase tracking-wide text-[#64748b]">Engine</dt><dd className="mt-1 text-base font-semibold text-[#17213b]">{source.engine}</dd></div><div><dt className="text-xs font-semibold uppercase tracking-wide text-[#64748b]">Database</dt><dd className="mt-1 text-base font-semibold text-[#17213b]">{source.database}</dd></div><div><dt className="text-xs font-semibold uppercase tracking-wide text-[#64748b]">Host</dt><dd className="mt-1 text-base font-semibold text-[#17213b]">{source.host}</dd></div><div><dt className="text-xs font-semibold uppercase tracking-wide text-[#64748b]">Tenant control</dt><dd className="mt-1 text-base font-semibold text-[#17213b]">{source.tenant_binding}</dd></div></dl></section><aside className="rounded-xl border border-[#dfe7f7] bg-white p-5 shadow-sm"><h2 className="flex items-center gap-2 font-semibold text-[#17213b]"><ShieldCheck size={18} className="text-[#536be8]"/>Why no browser credentials?</h2><p className="mt-3 text-sm leading-6 text-[#64748b]">{source.credential_policy}. This preserves the role catalog, read-only SQL validation, audit trail and server-bound tenant filter.</p><p className="mt-5 text-xs font-semibold uppercase tracking-wide text-[#64748b]">Enabled data domains</p><div className="mt-2 flex flex-wrap gap-2">{source.enabled_domains.map((domain) => <span className="rounded-full bg-[#eef2ff] px-2.5 py-1 text-xs font-medium text-[#3445a9]" key={domain}>{domain}</span>)}</div></aside></div>}{!loading && actor && !source && !error && <p className="mt-6 text-sm text-[#64748b]">No managed data source is available.</p>}</div></main>;
}
