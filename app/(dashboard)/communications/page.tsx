"use client";
import { useEffect, useState, useCallback } from "react";
import { Card, Avatar, Badge, Spinner, EmptyState, Button } from "@/components/ui";
import { MessageSquare, Phone, Mail, Eye, FileText, StickyNote, Users, Calendar, CheckCircle2 } from "lucide-react";
import toast from "react-hot-toast";

const ACTIVITY_ICONS: Record<string, any> = {
  CALL: Phone, EMAIL: Mail, VISIT: Eye, NOTE: StickyNote,
  MEETING: Users, DOCUMENT_UPLOAD: FileText, FOLLOW_UP: Calendar,
  STATUS_CHANGE: CheckCircle2, DEAL_STAGE_CHANGE: CheckCircle2,
};
const ACTIVITY_COLORS: Record<string, string> = {
  CALL: "from-blue-500 to-blue-600", EMAIL: "from-violet-500 to-violet-600",
  VISIT: "from-emerald-500 to-teal-500", NOTE: "from-amber-500 to-orange-500",
  MEETING: "from-cyan-500 to-blue-500", DOCUMENT_UPLOAD: "from-purple-500 to-pink-500",
  STATUS_CHANGE: "from-green-500 to-emerald-500", DEAL_STAGE_CHANGE: "from-pink-500 to-rose-500",
};

export default function CommunicationsPage() {
  const [activities, setActivities] = useState<any[]>([]);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState("");
  const [page, setPage] = useState(1);

  const fetchActivities = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: "30" });
      if (typeFilter) params.set("type", typeFilter);
      const res = await fetch(`/api/communications?${params}`);
      const data = await res.json();
      setActivities(data.data?.items || []);
      setPagination(data.data?.pagination || {});
    } catch { toast.error("Failed to fetch activities"); }
    finally { setLoading(false); }
  }, [page, typeFilter]);

  useEffect(() => { fetchActivities(); }, [fetchActivities]);

  const relativeTime = (date: string) => {
    const diff = Date.now() - new Date(date).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  return (
    <div className="space-y-5 max-w-3xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-[#f1f5ff]">Activity Timeline</h2>
          <p className="text-xs text-[#8892b0]">{pagination.total} activities recorded</p>
        </div>
        <select value={typeFilter} onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}
          className="bg-[#161b27] border border-[#2a3356] rounded-xl px-4 py-2.5 text-sm text-[#f1f5ff] focus:outline-none focus:border-blue-500/60 min-w-[140px]"
          id="activity-type-filter">
          <option value="">All Types</option>
          <option value="CALL">Calls</option>
          <option value="EMAIL">Emails</option>
          <option value="VISIT">Visits</option>
          <option value="NOTE">Notes</option>
          <option value="MEETING">Meetings</option>
          <option value="FOLLOW_UP">Follow-ups</option>
        </select>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20"><Spinner /></div>
      ) : activities.length === 0 ? (
        <EmptyState icon={<MessageSquare size={24} />} title="No activities yet" description="Activities are logged automatically when you interact with leads and clients" />
      ) : (
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-5 top-0 bottom-0 w-px bg-[#1e2a44]" />

          <div className="space-y-4">
            {activities.map((activity) => {
              const Icon = ACTIVITY_ICONS[activity.type] || StickyNote;
              const gradient = ACTIVITY_COLORS[activity.type] || "from-gray-500 to-gray-600";
              return (
                <div key={activity.id} className="flex gap-4 pl-0">
                  {/* Icon */}
                  <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center flex-shrink-0 z-10 shadow-lg`}>
                    <Icon size={14} className="text-white" />
                  </div>
                  {/* Content */}
                  <Card className="flex-1 p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-[#f1f5ff]">{activity.title}</p>
                        {activity.description && (
                          <p className="text-xs text-[#8892b0] mt-0.5">{activity.description}</p>
                        )}
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2">
                          {activity.user && (
                            <div className="flex items-center gap-1.5">
                              <Avatar name={activity.user.name} src={activity.user.avatar} size="sm" />
                              <span className="text-xs text-[#4a5a80]">{activity.user.name}</span>
                            </div>
                          )}
                          {activity.lead && (
                            <span className="text-xs text-blue-400/70">Lead: {activity.lead.name}</span>
                          )}
                          {activity.client && (
                            <span className="text-xs text-violet-400/70">Client: {activity.client.name}</span>
                          )}
                          {activity.deal && (
                            <span className="text-xs text-emerald-400/70">Deal: {activity.deal.title}</span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <Badge variant="default" size="sm">{activity.type.replace("_", " ")}</Badge>
                        <span className="text-[11px] text-[#4a5a80]">{relativeTime(activity.createdAt)}</span>
                      </div>
                    </div>
                  </Card>
                </div>
              );
            })}
          </div>

          {pagination.totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-6">
              <Button variant="secondary" size="sm" onClick={() => setPage(p => p - 1)} disabled={page === 1}>Load Earlier</Button>
              {page < pagination.totalPages && (
                <Button variant="secondary" size="sm" onClick={() => setPage(p => p + 1)}>Load More</Button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
