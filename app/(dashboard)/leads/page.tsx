"use client";
import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import { Card, Badge, Avatar, Button, Input, Select, Spinner, EmptyState } from "@/components/ui";
import { Plus, Search, Filter, Phone, Mail, Calendar, Brain, MoreHorizontal, Users, RefreshCw } from "lucide-react";
import { fetchJson } from "@/lib/api-client";

const STATUS_OPTIONS = [
  { value: "", label: "All Statuses" },
  { value: "NEW", label: "New" },
  { value: "CONTACTED", label: "Contacted" },
  { value: "QUALIFIED", label: "Qualified" },
  { value: "CLOSED", label: "Closed" },
  { value: "LOST", label: "Lost" },
];

const STATUS_BADGE: Record<string, any> = {
  NEW: "info", CONTACTED: "warning", QUALIFIED: "success", CLOSED: "purple", LOST: "danger",
};

const SOURCE_LABELS: Record<string, string> = {
  WEBSITE: "Website", REFERRAL: "Referral", PORTAL: "Portal",
  SOCIAL_MEDIA: "Social", COLD_CALL: "Cold Call", WALK_IN: "Walk-in",
  API_WEBHOOK: "Webhook", OTHER: "Other",
};

export default function LeadsPage() {
  const [leads, setLeads] = useState<any[]>([]);
  const [pagination, setPagination] = useState({ page: 1, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);

  const fetchLeads = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: "20" });
      if (search) params.set("search", search);
      if (status) params.set("status", status);
      const result = await fetchJson<{ data: { items: any[]; pagination: any } }>(`/api/leads?${params}`);
      setLeads(result.data.items || []);
      setPagination(result.data.pagination || {});
    } catch (err) {
      console.error("Failed to fetch leads:", err);
      setLeads([]);
      setPagination({ page: 1, total: 0, totalPages: 1 });
    } finally {
      setLoading(false);
    }
  }, [page, search, status]);

  useEffect(() => { fetchLeads(); }, [fetchLeads]);

  const handleScore = async (leadId: string) => {
    const toastId = toast.loading("Scoring lead...");
    try {
      const res = await fetch("/api/ai/score-lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leadId }),
      });
      const data = await res.json();
      toast.success(`Lead scored: ${data.data?.score}/100`, { id: toastId });
      fetchLeads();
    } catch {
      toast.error("Scoring failed", { id: toastId });
    }
  };

  return (
    <div className="space-y-5 max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-[#f1f5ff]">All Leads</h2>
          <p className="text-xs text-[#8892b0]">{pagination.total || 0} total leads</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" onClick={fetchLeads} leftIcon={<RefreshCw size={13} />}>Refresh</Button>
          <Link href="/leads/new">
            <Button size="sm" leftIcon={<Plus size={13} />}>New Lead</Button>
          </Link>
        </div>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#4a5a80]" />
            <input
              placeholder="Search leads by name, email, phone..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="w-full bg-[#161b27] border border-[#2a3356] rounded-xl pl-9 pr-4 py-2.5 text-sm text-[#f1f5ff] placeholder-[#4a5a80] focus:outline-none focus:border-blue-500/60 transition-all"
              id="leads-search"
            />
          </div>
          <select
            value={status}
            onChange={(e) => { setStatus(e.target.value); setPage(1); }}
            className="bg-[#161b27] border border-[#2a3356] rounded-xl px-4 py-2.5 text-sm text-[#f1f5ff] focus:outline-none focus:border-blue-500/60 transition-all min-w-[150px]"
            id="leads-status-filter"
          >
            {STATUS_OPTIONS.map((o) => (
              <option key={o.value} value={o.value} className="bg-[#161b27]">{o.label}</option>
            ))}
          </select>
        </div>
      </Card>

      {/* Leads Table */}
      <Card className="overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Spinner />
          </div>
        ) : leads.length === 0 ? (
          <EmptyState
            icon={<Users size={24} />}
            title="No leads found"
            description="Add your first lead or adjust your filters"
            action={
              <Link href="/leads/new">
                <Button size="sm" leftIcon={<Plus size={13} />}>Add Lead</Button>
              </Link>
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#1e2a44]">
                  {["Lead", "Contact", "Budget", "Source", "Status", "Score", "Agent", "Actions"].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-medium text-[#4a5a80] uppercase tracking-wide">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1e2a44]">
                {leads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-[#1a2035] transition-colors group">
                    <td className="px-4 py-3">
                      <Link href={`/leads/${lead.id}`} className="flex items-center gap-3">
                        <Avatar name={lead.name} size="sm" />
                        <div>
                          <p className="text-sm font-medium text-[#f1f5ff] group-hover:text-blue-400 transition-colors">{lead.name}</p>
                          <p className="text-xs text-[#4a5a80]">{new Date(lead.createdAt).toLocaleDateString("en-IN")}</p>
                        </div>
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5 text-xs text-[#8892b0]">
                          <Phone size={11} />{lead.phone}
                        </div>
                        {lead.email && (
                          <div className="flex items-center gap-1.5 text-xs text-[#8892b0]">
                            <Mail size={11} />{lead.email}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-[#f1f5ff]">
                      {lead.budget ? `₹${Number(lead.budget).toLocaleString("en-IN")}` : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant="default" size="sm">{SOURCE_LABELS[lead.source] || lead.source}</Badge>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={STATUS_BADGE[lead.status] || "default"} size="sm">{lead.status}</Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-[#1e2a44] rounded-full max-w-[60px]">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-blue-500 to-violet-600"
                            style={{ width: `${lead.score || 0}%` }}
                          />
                        </div>
                        <span className="text-xs text-[#8892b0]">{lead.score || 0}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {lead.assignedTo ? (
                        <div className="flex items-center gap-2">
                          <Avatar name={lead.assignedTo.name} src={lead.assignedTo.avatar} size="sm" />
                          <span className="text-xs text-[#8892b0] hidden lg:block">{lead.assignedTo.name.split(" ")[0]}</span>
                        </div>
                      ) : (
                        <span className="text-xs text-[#4a5a80]">Unassigned</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleScore(lead.id)}
                          className="p-1.5 rounded-lg text-[#4a5a80] hover:text-violet-400 hover:bg-violet-500/10 transition-all"
                          title="AI Score"
                        >
                          <Brain size={13} />
                        </button>
                        <Link href={`/leads/${lead.id}`} className="p-1.5 rounded-lg text-[#4a5a80] hover:text-blue-400 hover:bg-blue-500/10 transition-all">
                          <MoreHorizontal size={13} />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {!loading && pagination.totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-[#1e2a44]">
            <p className="text-xs text-[#4a5a80]">
              Showing {((page - 1) * 20) + 1}–{Math.min(page * 20, pagination.total)} of {pagination.total}
            </p>
            <div className="flex gap-2">
              <Button variant="secondary" size="sm" onClick={() => setPage(p => p - 1)} disabled={page === 1}>Prev</Button>
              <Button variant="secondary" size="sm" onClick={() => setPage(p => p + 1)} disabled={page >= pagination.totalPages}>Next</Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
