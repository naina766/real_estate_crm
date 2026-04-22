"use client";
import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import { Card, Badge, Button, Spinner, EmptyState } from "@/components/ui";
import { Plus, Search, Grid, List, MapPin, Bed, Bath, Square, Building2, RefreshCw } from "lucide-react";

const TYPE_BADGE: Record<string, any> = {
  RESIDENTIAL: "info", COMMERCIAL: "purple", INDUSTRIAL: "warning",
  LAND: "success", MIXED_USE: "default",
};

const STATUS_BADGE: Record<string, any> = {
  AVAILABLE: "success", UNDER_OFFER: "warning", SOLD: "danger",
  RENTED: "purple", OFF_MARKET: "default",
};

export default function PropertiesPage() {
  const [properties, setProperties] = useState<any[]>([]);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<"grid" | "list">("grid");
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("AVAILABLE");
  const [page, setPage] = useState(1);

  const fetchProperties = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: "12" });
      if (search) params.set("search", search);
      if (typeFilter) params.set("type", typeFilter);
      if (statusFilter) params.set("status", statusFilter);
      const res = await fetch(`/api/properties?${params}`);
      const data = await res.json();
      setProperties(data.data?.items || []);
      setPagination(data.data?.pagination || {});
    } catch {
      toast.error("Failed to fetch properties");
    } finally {
      setLoading(false);
    }
  }, [page, search, typeFilter, statusFilter]);

  useEffect(() => { fetchProperties(); }, [fetchProperties]);

  return (
    <div className="space-y-5 max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-[#f1f5ff]">Properties</h2>
          <p className="text-xs text-[#8892b0]">{pagination.total} listings</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex border border-[#2a3356] rounded-xl overflow-hidden">
            <button onClick={() => setView("grid")} className={`p-2 transition-all ${view === "grid" ? "bg-[#1a2035] text-blue-400" : "text-[#4a5a80] hover:text-[#8892b0]"}`}>
              <Grid size={15} />
            </button>
            <button onClick={() => setView("list")} className={`p-2 transition-all ${view === "list" ? "bg-[#1a2035] text-blue-400" : "text-[#4a5a80] hover:text-[#8892b0]"}`}>
              <List size={15} />
            </button>
          </div>
          <Button variant="secondary" size="sm" onClick={fetchProperties} leftIcon={<RefreshCw size={13} />}>Refresh</Button>
          <Link href="/properties/new">
            <Button size="sm" leftIcon={<Plus size={13} />}>Add Property</Button>
          </Link>
        </div>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#4a5a80]" />
            <input
              placeholder="Search by title, address, city..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="w-full bg-[#161b27] border border-[#2a3356] rounded-xl pl-9 pr-4 py-2.5 text-sm text-[#f1f5ff] placeholder-[#4a5a80] focus:outline-none focus:border-blue-500/60 transition-all"
              id="properties-search"
            />
          </div>
          <select value={typeFilter} onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}
            className="bg-[#161b27] border border-[#2a3356] rounded-xl px-4 py-2.5 text-sm text-[#f1f5ff] focus:outline-none focus:border-blue-500/60 min-w-[150px]"
            id="property-type-filter">
            <option value="">All Types</option>
            <option value="RESIDENTIAL">Residential</option>
            <option value="COMMERCIAL">Commercial</option>
            <option value="INDUSTRIAL">Industrial</option>
            <option value="LAND">Land</option>
          </select>
          <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="bg-[#161b27] border border-[#2a3356] rounded-xl px-4 py-2.5 text-sm text-[#f1f5ff] focus:outline-none focus:border-blue-500/60 min-w-[150px]"
            id="property-status-filter">
            <option value="">All Statuses</option>
            <option value="AVAILABLE">Available</option>
            <option value="UNDER_OFFER">Under Offer</option>
            <option value="SOLD">Sold</option>
            <option value="RENTED">Rented</option>
          </select>
        </div>
      </Card>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-20"><Spinner /></div>
      ) : properties.length === 0 ? (
        <EmptyState
          icon={<Building2 size={24} />}
          title="No properties found"
          description="Add your first property listing"
          action={<Link href="/properties/new"><Button size="sm" leftIcon={<Plus size={13} />}>Add Property</Button></Link>}
        />
      ) : view === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {properties.map((p) => (
            <Link key={p.id} href={`/properties/${p.id}`}>
              <Card className="overflow-hidden hover:border-[#3a4366] hover:shadow-[0_8px_32px_rgba(79,142,247,0.1)] transition-all group cursor-pointer">
                {/* Image */}
                <div className="h-44 bg-gradient-to-br from-[#161b27] to-[#1a2035] relative overflow-hidden">
                  {p.thumbnailUrl ? (
                    <img src={p.thumbnailUrl} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Building2 size={40} className="text-[#2a3356]" />
                    </div>
                  )}
                  <div className="absolute top-2 left-2">
                    <Badge variant={STATUS_BADGE[p.status] || "default"} size="sm">{p.status}</Badge>
                  </div>
                  {p.isFeatured && (
                    <div className="absolute top-2 right-2">
                      <Badge variant="warning" size="sm">Featured</Badge>
                    </div>
                  )}
                </div>
                {/* Info */}
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h3 className="text-sm font-semibold text-[#f1f5ff] line-clamp-1 group-hover:text-blue-400 transition-colors">{p.title}</h3>
                    <Badge variant={TYPE_BADGE[p.type] || "default"} size="sm">{p.type}</Badge>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-[#8892b0] mb-3">
                    <MapPin size={11} />{p.city}, {p.state}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-[#8892b0] mb-3">
                    {p.bedrooms != null && <span className="flex items-center gap-1"><Bed size={11} />{p.bedrooms}</span>}
                    {p.bathrooms != null && <span className="flex items-center gap-1"><Bath size={11} />{p.bathrooms}</span>}
                    {p.size && <span className="flex items-center gap-1"><Square size={11} />{p.size} sq.ft</span>}
                  </div>
                  <p className="text-base font-bold text-[#f1f5ff]">
                    ₹{Number(p.price).toLocaleString("en-IN")}
                  </p>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#1e2a44]">
                  {["Property", "Location", "Type", "Price", "Size", "Status", "Agent"].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-medium text-[#4a5a80] uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1e2a44]">
                {properties.map((p) => (
                  <tr key={p.id} className="hover:bg-[#1a2035] transition-colors group">
                    <td className="px-4 py-3">
                      <Link href={`/properties/${p.id}`} className="text-sm font-medium text-[#f1f5ff] group-hover:text-blue-400 transition-colors line-clamp-1">{p.title}</Link>
                    </td>
                    <td className="px-4 py-3 text-sm text-[#8892b0]">{p.city}, {p.state}</td>
                    <td className="px-4 py-3"><Badge variant={TYPE_BADGE[p.type] || "default"} size="sm">{p.type}</Badge></td>
                    <td className="px-4 py-3 text-sm font-semibold text-[#f1f5ff]">₹{Number(p.price).toLocaleString("en-IN")}</td>
                    <td className="px-4 py-3 text-sm text-[#8892b0]">{p.size ? `${p.size} sq.ft` : "—"}</td>
                    <td className="px-4 py-3"><Badge variant={STATUS_BADGE[p.status] || "default"} size="sm">{p.status}</Badge></td>
                    <td className="px-4 py-3 text-sm text-[#8892b0]">{p.agent?.name || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Pagination */}
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
