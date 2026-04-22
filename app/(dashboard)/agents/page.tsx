"use client";
import { useEffect, useState, useCallback } from "react";
import toast from "react-hot-toast";
import { Card, Badge, Avatar, Spinner, EmptyState, Button } from "@/components/ui";
import { Search, ShieldCheck, Users, Handshake, Building2, Plus } from "lucide-react";
import Link from "next/link";

const ROLE_BADGE: Record<string, any> = { ADMIN: "danger", MANAGER: "warning", AGENT: "info" };

export default function AgentsPage() {
  const [agents, setAgents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchAgents = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ limit: "50" });
      if (search) params.set("search", search);
      const res = await fetch(`/api/users?${params}`);
      const data = await res.json();
      setAgents(data.data?.items || []);
    } catch { toast.error("Failed to fetch agents"); }
    finally { setLoading(false); }
  }, [search]);

  useEffect(() => { fetchAgents(); }, [fetchAgents]);

  return (
    <div className="space-y-5 max-w-[1400px] mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-[#f1f5ff]">Agent Management</h2>
          <p className="text-xs text-[#8892b0]">{agents.length} team members</p>
        </div>
        <Link href="/register">
          <Button size="sm" leftIcon={<Plus size={13} />}>Invite Agent</Button>
        </Link>
      </div>

      <Card className="p-4">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#4a5a80]" />
          <input placeholder="Search agents by name or email..." value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#161b27] border border-[#2a3356] rounded-xl pl-9 pr-4 py-2.5 text-sm text-[#f1f5ff] placeholder-[#4a5a80] focus:outline-none focus:border-blue-500/60 transition-all"
            id="agents-search" />
        </div>
      </Card>

      {loading ? (
        <div className="flex items-center justify-center py-20"><Spinner /></div>
      ) : agents.length === 0 ? (
        <EmptyState icon={<ShieldCheck size={24} />} title="No agents found" description="Invite team members to get started" />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {agents.map((agent) => (
            <Card key={agent.id} className="p-5 hover:border-[#3a4366] transition-all">
              <div className="flex items-start gap-4 mb-4">
                <Avatar name={agent.name} src={agent.avatar} size="lg" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <h3 className="text-sm font-semibold text-[#f1f5ff] truncate">{agent.name}</h3>
                    <Badge variant={ROLE_BADGE[agent.role] || "default"} size="sm">{agent.role}</Badge>
                  </div>
                  <p className="text-xs text-[#4a5a80] truncate">{agent.email}</p>
                  {agent.phone && <p className="text-xs text-[#4a5a80]">{agent.phone}</p>}
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 pt-3 border-t border-[#1e2a44]">
                {[
                  { icon: Users, label: "Leads", value: agent._count?.assignedLeads || 0, color: "text-blue-400" },
                  { icon: Handshake, label: "Deals", value: agent._count?.deals || 0, color: "text-violet-400" },
                  { icon: Building2, label: "Properties", value: agent._count?.properties || 0, color: "text-emerald-400" },
                ].map(({ icon: Icon, label, value, color }) => (
                  <div key={label} className="text-center">
                    <div className={`flex items-center justify-center gap-1 text-sm font-bold ${color}`}>
                      <Icon size={11} />{value}
                    </div>
                    <p className="text-[10px] text-[#4a5a80]">{label}</p>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between mt-3">
                <Badge variant={agent.isActive ? "success" : "danger"} size="sm">
                  {agent.isActive ? "Active" : "Inactive"}
                </Badge>
                {agent.lastLoginAt && (
                  <p className="text-[10px] text-[#4a5a80]">
                    Last seen {new Date(agent.lastLoginAt).toLocaleDateString("en-IN")}
                  </p>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
