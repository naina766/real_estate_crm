"use client";
import { useEffect, useState } from "react";
import { Card, Badge, Avatar, Spinner, StatCard, EmptyState } from "@/components/ui";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { BarChart3, TrendingUp, DollarSign, Users, Download } from "lucide-react";
import toast from "react-hot-toast";

const COLORS = ["#4f8ef7", "#7c5cfc", "#22d3a8", "#f9a23b", "#f04d5e", "#06b6d4"];

export default function ReportsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/reports/dashboard")
      .then((r) => r.json())
      .then((d) => { setData(d.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const handleExport = () => {
    toast("PDF export coming soon — install jspdf-autotable for full export", { icon: "📄" });
  };

  if (loading) return <div className="flex items-center justify-center h-64"><Spinner size="lg" /></div>;

  const summary = data?.summary || {};
  const charts = data?.charts || {};

  const leadData = (charts.leadsByStatus || []).map((s: any) => ({
    name: s.status, count: s.count,
  }));
  const dealData = (charts.dealsByStage || []).map((s: any) => ({
    name: s.stage.replace("_", " "), count: s.count,
  }));

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-[#f1f5ff]">Reports & Analytics</h2>
          <p className="text-xs text-[#8892b0]">Business performance overview</p>
        </div>
        <button
          onClick={handleExport}
          className="flex items-center gap-2 px-4 py-2 bg-[#1a2035] border border-[#2a3356] rounded-xl text-sm text-[#8892b0] hover:text-[#f1f5ff] hover:border-[#3a4366] transition-all"
          id="export-report-btn"
        >
          <Download size={14} />Export PDF
        </button>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Revenue" value={`₹${((summary.totalRevenue || 0) / 100000).toFixed(1)}L`}
          icon={<DollarSign size={18} />} gradient="from-emerald-500 to-teal-500" />
        <StatCard title="Commission Earned" value={`₹${((summary.totalCommission || 0) / 100000).toFixed(1)}L`}
          icon={<TrendingUp size={18} />} gradient="from-blue-500 to-cyan-500" />
        <StatCard title="Lead Conversion" value={`${summary.conversionRate || 0}%`}
          icon={<Users size={18} />} gradient="from-violet-500 to-purple-600" />
        <StatCard title="Deals Closed" value={summary.closedDeals || 0}
          icon={<BarChart3 size={18} />} gradient="from-orange-500 to-amber-500" />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Lead Status Chart */}
        <Card className="p-5">
          <h3 className="text-sm font-semibold text-[#f1f5ff] mb-1">Lead Status Breakdown</h3>
          <p className="text-xs text-[#8892b0] mb-4">Distribution across pipeline stages</p>
          {leadData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={leadData} barSize={32}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e2a44" vertical={false} />
                <XAxis dataKey="name" tick={{ fill: "#8892b0", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#8892b0", fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip contentStyle={{ background: "#1a2035", border: "1px solid #2a3356", borderRadius: 8, fontSize: 12 }}
                  labelStyle={{ color: "#f1f5ff" }} />
                <Bar dataKey="count" name="Leads" radius={[6, 6, 0, 0]}>
                  {leadData.map((_: any, i: number) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <EmptyState title="No lead data" description="Start capturing leads to see statistics" />
          )}
        </Card>

        {/* Deal Stage Chart */}
        <Card className="p-5">
          <h3 className="text-sm font-semibold text-[#f1f5ff] mb-1">Deal Pipeline Distribution</h3>
          <p className="text-xs text-[#8892b0] mb-4">Number of deals per stage</p>
          {dealData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={dealData} barSize={32}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e2a44" vertical={false} />
                <XAxis dataKey="name" tick={{ fill: "#8892b0", fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#8892b0", fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip contentStyle={{ background: "#1a2035", border: "1px solid #2a3356", borderRadius: 8, fontSize: 12 }}
                  labelStyle={{ color: "#f1f5ff" }} />
                <Bar dataKey="count" name="Deals" radius={[6, 6, 0, 0]}>
                  {dealData.map((_: any, i: number) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <EmptyState title="No deal data" description="Create deals to see pipeline analytics" />
          )}
        </Card>
      </div>

      {/* Summary Table */}
      <Card className="p-5">
        <h3 className="text-sm font-semibold text-[#f1f5ff] mb-4">Performance Summary</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#1e2a44]">
                {["Metric", "Value", "Status"].map((h) => (
                  <th key={h} className="text-left px-3 py-2 text-xs font-medium text-[#4a5a80] uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1e2a44]">
              {[
                { metric: "Total Leads", value: summary.totalLeads || 0, status: "neutral" },
                { metric: "Qualified Leads", value: summary.qualifiedLeads || 0, status: "success" },
                { metric: "Closed Leads", value: summary.closedLeads || 0, status: "success" },
                { metric: "Lost Leads", value: summary.lostLeads || 0, status: "danger" },
                { metric: "Conversion Rate", value: `${summary.conversionRate || 0}%`, status: summary.conversionRate > 20 ? "success" : "warning" },
                { metric: "Total Properties", value: summary.totalProperties || 0, status: "neutral" },
                { metric: "Available Properties", value: summary.availableProperties || 0, status: "info" },
                { metric: "Total Clients", value: summary.totalClients || 0, status: "neutral" },
                { metric: "Total Deals", value: summary.totalDeals || 0, status: "neutral" },
                { metric: "Deals Closed", value: summary.closedDeals || 0, status: "success" },
              ].map(({ metric, value, status }) => (
                <tr key={metric} className="hover:bg-[#1a2035] transition-colors">
                  <td className="px-3 py-2.5 text-sm text-[#8892b0]">{metric}</td>
                  <td className="px-3 py-2.5 text-sm font-semibold text-[#f1f5ff]">{value}</td>
                  <td className="px-3 py-2.5">
                    <Badge variant={status as any} size="sm">{status === "success" ? "Good" : status === "danger" ? "Review" : status === "warning" ? "Fair" : "—"}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
