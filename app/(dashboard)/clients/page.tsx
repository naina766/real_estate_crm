"use client";
import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import { Card, Badge, Avatar, Button, Spinner, EmptyState } from "@/components/ui";
import { Plus, Search, Phone, Mail, UserCheck, BarChart2 } from "lucide-react";

const TYPE_BADGE: Record<string, any> = { BUYER: "info", SELLER: "success", BOTH: "purple" };

export default function ClientsPage() {
  const [clients, setClients] = useState<any[]>([]);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [page, setPage] = useState(1);

  const fetchClients = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: "20" });
      if (search) params.set("search", search);
      if (typeFilter) params.set("type", typeFilter);
      const res = await fetch(`/api/clients?${params}`);
      const data = await res.json();
      setClients(data.data?.items || []);
      setPagination(data.data?.pagination || {});
    } catch { toast.error("Failed to fetch clients"); }
    finally { setLoading(false); }
  }, [page, search, typeFilter]);

  useEffect(() => { fetchClients(); }, [fetchClients]);

  return (
    <div className="space-y-5 max-w-[1400px] mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-[#f1f5ff]">Clients</h2>
          <p className="text-xs text-[#8892b0]">{pagination.total} client profiles</p>
        </div>
        <div className="flex gap-2">
          <Link href="/clients/new"><Button size="sm" leftIcon={<Plus size={13} />}>Add Client</Button></Link>
        </div>
      </div>

      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#4a5a80]" />
            <input placeholder="Search clients..." value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="w-full bg-[#161b27] border border-[#2a3356] rounded-xl pl-9 pr-4 py-2.5 text-sm text-[#f1f5ff] placeholder-[#4a5a80] focus:outline-none focus:border-blue-500/60 transition-all"
              id="clients-search" />
          </div>
          <select value={typeFilter} onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}
            className="bg-[#161b27] border border-[#2a3356] rounded-xl px-4 py-2.5 text-sm text-[#f1f5ff] focus:outline-none focus:border-blue-500/60 min-w-[150px]"
            id="client-type-filter">
            <option value="">All Types</option>
            <option value="BUYER">Buyers</option>
            <option value="SELLER">Sellers</option>
            <option value="BOTH">Both</option>
          </select>
        </div>
      </Card>

      {loading ? (
        <div className="flex items-center justify-center py-20"><Spinner /></div>
      ) : clients.length === 0 ? (
        <EmptyState icon={<UserCheck size={24} />} title="No clients found"
          description="Add your first client profile"
          action={<Link href="/clients/new"><Button size="sm" leftIcon={<Plus size={13} />}>Add Client</Button></Link>} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {clients.map((c) => (
            <Link key={c.id} href={`/clients/${c.id}`}>
              <Card className="p-4 hover:border-[#3a4366] hover:shadow-[0_8px_32px_rgba(79,142,247,0.1)] transition-all group cursor-pointer">
                <div className="flex items-center gap-3 mb-3">
                  <Avatar name={c.name} size="lg" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-semibold text-[#f1f5ff] group-hover:text-blue-400 transition-colors truncate">{c.name}</h3>
                      <Badge variant={TYPE_BADGE[c.type] || "default"} size="sm">{c.type}</Badge>
                    </div>
                    {c.email && <p className="text-xs text-[#4a5a80] truncate">{c.email}</p>}
                  </div>
                </div>
                <div className="space-y-1.5 mb-3">
                  <div className="flex items-center gap-2 text-xs text-[#8892b0]">
                    <Phone size={11} />{c.phone}
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2 pt-3 border-t border-[#1e2a44]">
                  {[
                    { label: "Leads", value: c._count?.leads || 0 },
                    { label: "Deals", value: c._count?.deals || 0 },
                    { label: "Activities", value: c._count?.activities || 0 },
                  ].map(({ label, value }) => (
                    <div key={label} className="text-center">
                      <p className="text-sm font-bold text-[#f1f5ff]">{value}</p>
                      <p className="text-[10px] text-[#4a5a80]">{label}</p>
                    </div>
                  ))}
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}

      {!loading && pagination.totalPages > 1 && (
        <div className="flex justify-end gap-2">
          <Button variant="secondary" size="sm" onClick={() => setPage(p => p - 1)} disabled={page === 1}>Prev</Button>
          <span className="flex items-center text-xs text-[#8892b0] px-3">Page {page} of {pagination.totalPages}</span>
          <Button variant="secondary" size="sm" onClick={() => setPage(p => p + 1)} disabled={page >= pagination.totalPages}>Next</Button>
        </div>
      )}
    </div>
  );
}
