"use client";
import { useEffect, useState } from "react";
import { StatCard, Card, Badge, Avatar, Spinner } from "@/components/ui";
import {
  Users, Building2, Handshake, TrendingUp, DollarSign,
  UserCheck, Target, Activity, ArrowRight, AlertCircle,
} from "lucide-react";
import Link from "next/link";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, Legend,
} from "recharts";
import { fetchJson, ApiClientError } from "@/lib/api-client";

const COLORS = ["#4f8ef7", "#7c5cfc", "#22d3a8", "#f9a23b", "#f04d5e", "#06b6d4"];

const STATUS_LABELS: Record<string, string> = {
  NEW: "New", CONTACTED: "Contacted", QUALIFIED: "Qualified", CLOSED: "Closed", LOST: "Lost",
};
const STAGE_LABELS: Record<string, string> = {
  PROSPECTING: "Prospecting", NEGOTIATION: "Negotiation", AGREEMENT: "Agreement",
  DUE_DILIGENCE: "Due Diligence", CLOSED_WON: "Won", CLOSED_LOST: "Lost",
};

export default function DashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const result = await fetchJson<{ data: any }>("/api/reports/dashboard");
        setData(result.data);
      } catch (err) {
        // Silently handle errors - user will see empty state
        console.error("Failed to load dashboard data:", err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  const summary = data?.summary || {};
  const charts = data?.charts || {};
  const recent = data?.recentActivity || {};

  const leadsChartData = (charts.leadsByStatus || []).map((s: any) => ({
    name: STATUS_LABELS[s.status] || s.status,
    value: s.count,
  }));

  const dealsChartData = (charts.dealsByStage || []).map((s: any) => ({
    name: STAGE_LABELS[s.stage] || s.stage,
    count: s.count,
  }));

  const revenueData = (charts.monthlyRevenue || []).map((m: any) => ({
    month: new Date(m.month).toLocaleDateString("en-IN", { month: "short" }),
    revenue: Number(m.revenue) || 0,
    deals: Number(m.deals) || 0,
  }));

  return (
    <div className="space-y-6 max-w-350 mx-auto">
      {/* ── KPI Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Leads"
          value={summary.totalLeads || 0}
          change={`${summary.newLeads || 0} new this month`}
          changeType="up"
          icon={<Users size={18} />}
          gradient="from-blue-500 to-blue-600"
        />
        <StatCard
          title="Properties"
          value={summary.totalProperties || 0}
          change={`${summary.availableProperties || 0} available`}
          changeType="neutral"
          icon={<Building2 size={18} />}
          gradient="from-violet-500 to-violet-600"
        />
        <StatCard
          title="Active Deals"
          value={summary.totalDeals || 0}
          change={`${summary.closedDeals || 0} closed`}
          changeType="up"
          icon={<Handshake size={18} />}
          gradient="from-emerald-500 to-teal-500"
        />
        <StatCard
          title="Revenue"
          value={`₹${((summary.totalRevenue || 0) / 100000).toFixed(1)}L`}
          change={`${summary.conversionRate || 0}% conversion`}
          changeType="up"
          icon={<DollarSign size={18} />}
          gradient="from-orange-500 to-amber-500"
        />
      </div>

      {/* ── Secondary KPIs ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "New Leads", value: summary.newLeads || 0, color: "text-blue-400" },
          { label: "Qualified", value: summary.qualifiedLeads || 0, color: "text-emerald-400" },
          { label: "Total Clients", value: summary.totalClients || 0, color: "text-violet-400" },
          { label: "Commission", value: `₹${((summary.totalCommission || 0) / 100000).toFixed(1)}L`, color: "text-amber-400" },
        ].map(({ label, value, color }) => (
          <Card key={label} className="p-4 flex items-center gap-3">
            <div className={`text-xl font-bold ${color}`}>{value}</div>
            <div className="text-xs text-[#8892b0]">{label}</div>
          </Card>
        ))}
      </div>

      {/* ── Charts Row ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <Card className="lg:col-span-2 p-5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-sm font-semibold text-[#f1f5ff]">Revenue Trend</h3>
              <p className="text-xs text-[#8892b0]">Last 6 months</p>
            </div>
            <TrendingUp size={16} className="text-blue-400" />
          </div>
          {revenueData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f8ef7" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#4f8ef7" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e2a44" />
                <XAxis dataKey="month" tick={{ fill: "#8892b0", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#8892b0", fontSize: 11 }} axisLine={false} tickLine={false}
                  tickFormatter={(v) => `₹${(v / 100000).toFixed(0)}L`} />
                <Tooltip
                  contentStyle={{ background: "#1a2035", border: "1px solid #2a3356", borderRadius: 8, fontSize: 12 }}
                  labelStyle={{ color: "#f1f5ff" }}
                  formatter={(v: any) => [`₹${(v / 100000).toFixed(2)}L`, "Revenue"]}
                />
                <Area type="monotone" dataKey="revenue" stroke="#4f8ef7" strokeWidth={2} fill="url(#revGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-48 flex items-center justify-center text-sm text-[#4a5a80]">
              <AlertCircle size={16} className="mr-2" /> No revenue data yet
            </div>
          )}
        </Card>

        {/* Lead Status Donut */}
        <Card className="p-5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-sm font-semibold text-[#f1f5ff]">Lead Funnel</h3>
              <p className="text-xs text-[#8892b0]">By status</p>
            </div>
            <Target size={16} className="text-violet-400" />
          </div>
          {leadsChartData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie data={leadsChartData} cx="50%" cy="50%" innerRadius={45} outerRadius={70}
                    dataKey="value" paddingAngle={3}>
                    {leadsChartData.map((_: any, i: number) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ background: "#1a2035", border: "1px solid #2a3356", borderRadius: 8, fontSize: 12 }}
                    labelStyle={{ color: "#f1f5ff" }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2 mt-2">
                {leadsChartData.map((item: any, i: number) => (
                  <div key={item.name} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                      <span className="text-[#8892b0]">{item.name}</span>
                    </div>
                    <span className="text-[#f1f5ff] font-medium">{item.value}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="h-40 flex items-center justify-center text-sm text-[#4a5a80]">No leads yet</div>
          )}
        </Card>
      </div>

      {/* ── Deal Pipeline Bar Chart ── */}
      <Card className="p-5">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-sm font-semibold text-[#f1f5ff]">Deal Pipeline</h3>
            <p className="text-xs text-[#8892b0]">By stage</p>
          </div>
          <Activity size={16} className="text-emerald-400" />
        </div>
        <ResponsiveContainer width="100%" height={160}>
          <BarChart data={dealsChartData} barSize={28}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e2a44" vertical={false} />
            <XAxis dataKey="name" tick={{ fill: "#8892b0", fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: "#8892b0", fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
            <Tooltip
              contentStyle={{ background: "#1a2035", border: "1px solid #2a3356", borderRadius: 8, fontSize: 12 }}
              labelStyle={{ color: "#f1f5ff" }}
            />
            <Bar dataKey="count" name="Deals" radius={[6, 6, 0, 0]}>
              {dealsChartData.map((_: any, i: number) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {/* ── Recent Activity ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Leads */}
        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-[#f1f5ff]">Recent Leads</h3>
            <Link href="/leads" className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1">
              View all <ArrowRight size={12} />
            </Link>
          </div>
          <div className="space-y-3">
            {(recent.leads || []).length === 0 ? (
              <p className="text-sm text-[#4a5a80] py-4 text-center">No leads yet</p>
            ) : (
              (recent.leads || []).map((lead: any) => (
                <Link key={lead.id} href={`/leads/${lead.id}`}
                  className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-[#1e2640] transition-all group">
                  <Avatar name={lead.name} size="sm" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-[#f1f5ff] truncate group-hover:text-blue-400 transition-colors">{lead.name}</p>
                    <p className="text-[11px] text-[#4a5a80]">{lead.phone}</p>
                  </div>
                  <Badge variant={
                    lead.status === "NEW" ? "info" :
                    lead.status === "QUALIFIED" ? "success" :
                    lead.status === "CLOSED" ? "purple" :
                    lead.status === "LOST" ? "danger" : "warning"
                  } size="sm">{lead.status}</Badge>
                </Link>
              ))
            )}
          </div>
        </Card>

        {/* Recent Deals */}
        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-[#f1f5ff]">Recent Deals</h3>
            <Link href="/deals" className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1">
              View all <ArrowRight size={12} />
            </Link>
          </div>
          <div className="space-y-3">
            {(recent.deals || []).length === 0 ? (
              <p className="text-sm text-[#4a5a80] py-4 text-center">No deals yet</p>
            ) : (
              (recent.deals || []).map((deal: any) => (
                <Link key={deal.id} href={`/deals/${deal.id}`}
                  className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-[#1e2640] transition-all group">
                  <div className="w-8 h-8 rounded-lg bg-linear-to-br from-violet-500 to-violet-700 flex items-center justify-center shrink-0">
                    <Handshake size={14} className="text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-[#f1f5ff] truncate group-hover:text-violet-400 transition-colors">{deal.title}</p>
                    <p className="text-[11px] text-[#4a5a80]">{deal.client?.name}</p>
                  </div>
                  <Badge variant={
                    deal.stage === "CLOSED_WON" ? "success" :
                    deal.stage === "CLOSED_LOST" ? "danger" : "info"
                  } size="sm">{STAGE_LABELS[deal.stage] || deal.stage}</Badge>
                </Link>
              ))
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
