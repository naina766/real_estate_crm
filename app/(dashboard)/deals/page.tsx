"use client";
import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import { Card, Badge, Avatar, Button, Spinner, EmptyState } from "@/components/ui";
import { Plus, DollarSign, User, Building2, Handshake } from "lucide-react";
import { fetchJson } from "@/lib/api-client";

const STAGES = [
  { id: "PROSPECTING", label: "Prospecting", color: "border-t-slate-500", badge: "default" },
  { id: "NEGOTIATION", label: "Negotiation", color: "border-t-blue-500", badge: "info" },
  { id: "AGREEMENT", label: "Agreement", color: "border-t-amber-500", badge: "warning" },
  { id: "DUE_DILIGENCE", label: "Due Diligence", color: "border-t-violet-500", badge: "purple" },
  { id: "CLOSED_WON", label: "Closed Won", color: "border-t-emerald-500", badge: "success" },
  { id: "CLOSED_LOST", label: "Closed Lost", color: "border-t-red-500", badge: "danger" },
] as const;

export default function DealsPage() {
  const [deals, setDeals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [draggingId, setDraggingId] = useState<string | null>(null);

  const fetchDeals = useCallback(async () => {
    setLoading(true);
    try {
      const result = await fetchJson<{ data: { items: any[] } }>("/api/deals?limit=100");
      setDeals(result.data.items || []);
    } catch (err) {
      console.error("Failed to fetch deals:", err);
      setDeals([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchDeals(); }, [fetchDeals]);

  const dealsByStage = (stageId: string) => deals.filter((d) => d.stage === stageId);

  const handleDrop = async (dealId: string, newStage: string) => {
    const previous = deals.find((d) => d.id === dealId);
    if (!previous || previous.stage === newStage) return;

    // Optimistic update
    setDeals((prev) => prev.map((d) => d.id === dealId ? { ...d, stage: newStage } : d));

    try {
      const res = await fetch(`/api/deals/${dealId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stage: newStage }),
      });
      if (!res.ok) throw new Error("Update failed");
      toast.success(`Moved to ${STAGES.find((s) => s.id === newStage)?.label}`);
    } catch {
      // Revert
      setDeals((prev) => prev.map((d) => d.id === dealId ? previous : d));
      toast.error("Failed to update stage");
    }
    setDraggingId(null);
  };

  const totalValue = deals.filter((d) => d.stage === "CLOSED_WON")
    .reduce((sum, d) => sum + (Number(d.amount) || 0), 0);

  return (
    <div className="space-y-5 max-w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-[#f1f5ff]">Deal Pipeline</h2>
          <p className="text-xs text-[#8892b0]">
            {deals.length} deals · ₹{(totalValue / 100000).toFixed(1)}L revenue closed
          </p>
        </div>
        <Link href="/deals/new">
          <Button size="sm" leftIcon={<Plus size={13} />}>New Deal</Button>
        </Link>
      </div>

      {/* Kanban board */}
      {loading ? (
        <div className="flex items-center justify-center py-20"><Spinner /></div>
      ) : (
        <div className="flex gap-4 overflow-x-auto pb-4 min-h-[600px]">
          {STAGES.map((stage) => {
            const stageDeals = dealsByStage(stage.id);
            const stageValue = stageDeals.reduce((sum, d) => sum + (Number(d.amount) || 0), 0);

            return (
              <div
                key={stage.id}
                className="flex-shrink-0 w-72"
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  if (draggingId) handleDrop(draggingId, stage.id);
                }}
              >
                {/* Column header */}
                <div className={`bg-[#1a2035] border border-[#2a3356] rounded-xl p-3 mb-3 border-t-2 ${stage.color}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-[#f1f5ff]">{stage.label}</span>
                      <span className="w-5 h-5 rounded-full bg-[#161b27] flex items-center justify-center text-[10px] font-bold text-[#8892b0]">
                        {stageDeals.length}
                      </span>
                    </div>
                    {stageValue > 0 && (
                      <span className="text-xs text-[#8892b0]">₹{(stageValue / 100000).toFixed(1)}L</span>
                    )}
                  </div>
                </div>

                {/* Deal cards */}
                <div className="space-y-3">
                  {stageDeals.length === 0 && (
                    <div className="border-2 border-dashed border-[#1e2a44] rounded-xl p-6 text-center">
                      <p className="text-xs text-[#4a5a80]">Drop deals here</p>
                    </div>
                  )}
                  {stageDeals.map((deal) => (
                    <div
                      key={deal.id}
                      draggable
                      onDragStart={() => setDraggingId(deal.id)}
                      onDragEnd={() => setDraggingId(null)}
                      className={`group cursor-grab active:cursor-grabbing transition-all ${
                        draggingId === deal.id ? "opacity-50 scale-95" : ""
                      }`}
                    >
                      <Card className="p-4 hover:border-[#3a4366] hover:shadow-[0_4px_20px_rgba(79,142,247,0.1)] transition-all">
                        <div className="flex items-start justify-between mb-2">
                          <Link href={`/deals/${deal.id}`} className="text-sm font-semibold text-[#f1f5ff] group-hover:text-blue-400 transition-colors line-clamp-2 flex-1">
                            {deal.title}
                          </Link>
                        </div>

                        {deal.amount && (
                          <div className="flex items-center gap-1.5 mb-3">
                            <DollarSign size={12} className="text-emerald-400" />
                            <span className="text-sm font-bold text-emerald-400">
                              ₹{Number(deal.amount).toLocaleString("en-IN")}
                            </span>
                          </div>
                        )}

                        <div className="space-y-1.5 mb-3">
                          {deal.client && (
                            <div className="flex items-center gap-1.5 text-xs text-[#8892b0]">
                              <User size={11} />{deal.client.name}
                            </div>
                          )}
                          {deal.property && (
                            <div className="flex items-center gap-1.5 text-xs text-[#8892b0]">
                              <Building2 size={11} className="flex-shrink-0" />
                              <span className="truncate">{deal.property.title}</span>
                            </div>
                          )}
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-[#1e2a44]">
                          {deal.agent ? (
                            <div className="flex items-center gap-1.5">
                              <Avatar name={deal.agent.name} src={deal.agent.avatar} size="sm" />
                              <span className="text-[11px] text-[#4a5a80]">{deal.agent.name.split(" ")[0]}</span>
                            </div>
                          ) : <span />}
                          {deal.commissionAmount && (
                            <span className="text-[10px] text-[#4a5a80]">
                              {deal.commissionRate}% · ₹{Number(deal.commissionAmount).toLocaleString("en-IN")}
                            </span>
                          )}
                        </div>
                      </Card>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
