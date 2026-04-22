"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Card, Button, Input, Select, Textarea } from "@/components/ui";
import { ArrowLeft, Handshake, User, Building2, DollarSign, Calendar, Sparkles, FileText } from "lucide-react";
import Link from "next/link";

interface Client {
  id: string;
  name: string;
  phone: string;
}

interface Property {
  id: string;
  title: string;
  city: string;
}

export default function NewDealPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [clients, setClients] = useState<Client[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [form, setForm] = useState({
    title: "",
    clientId: "",
    propertyId: "",
    amount: "",
    commissionRate: "2.0",
    expectedCloseDate: "",
    notes: "",
    stage: "PROSPECTING",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [clientsRes, propertiesRes] = await Promise.all([
          fetch("/api/clients?limit=100"),
          fetch("/api/properties?limit=100"),
        ]);
        const clientsData = await clientsRes.json();
        const propertiesData = await propertiesRes.json();
        setClients(clientsData.data?.items || []);
        setProperties(propertiesData.data?.items || []);
      } catch (err) {
        console.error("Failed to fetch data:", err);
      }
    };
    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});
    try {
      const payload = {
        ...form,
        amount: form.amount ? parseFloat(form.amount) : undefined,
        commissionRate: parseFloat(form.commissionRate) || 2.0,
        propertyId: form.propertyId || undefined,
        expectedCloseDate: form.expectedCloseDate || undefined,
      };

      const res = await fetch("/api/deals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.errors?.fieldErrors) setErrors(
          Object.fromEntries(Object.entries(data.errors.fieldErrors).map(([k, v]) => [k, (v as string[])[0]]))
        );
        throw new Error(data.message);
      }
      toast.success("Deal created successfully!");
      router.push(`/deals/${data.data.id}`);
    } catch (err: any) {
      toast.error(err.message || "Failed to create deal");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-8">
      {/* Header */}
      <div className="flex items-center gap-4 py-2">
        <Link href="/deals" className="p-2 rounded-xl text-[#8892b0] hover:text-[#f1f5ff] hover:bg-[#1a2035] hover:border border border-[#2a3356] transition-all">
          <ArrowLeft size={18} />
        </Link>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-[#f1f5ff] flex items-center gap-2">
            <Handshake className="text-violet-400" size={22} />
            Add New Deal
          </h1>
          <p className="text-sm text-[#8892b0] mt-1">Create a new deal opportunity and track its progress</p>
        </div>
      </div>

      <Card className="border border-[#2a3356] bg-[#1a2035]">
        <form onSubmit={handleSubmit} className="p-6 space-y-8">
          
          {/* Deal Details Section */}
          <section>
            <div className="flex items-center gap-2 mb-5 pb-3 border-b border-[#1e2a44]">
              <div className="p-1.5 rounded-lg bg-violet-500/10">
                <FileText size={16} className="text-violet-400" />
              </div>
              <h2 className="text-base font-semibold text-[#f1f5ff]">Deal Details</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="md:col-span-2">
                <Input 
                  label="Deal Title *" 
                  id="deal-title" 
                  placeholder="e.g., 3BHK Bandra - Vikram Malhotra" 
                  value={form.title}
                  onChange={set("title")} 
                  error={errors.title} 
                  required 
                />
              </div>
              <Select 
                label="Client *" 
                id="deal-client" 
                value={form.clientId}
                onChange={(e) => setForm((f) => ({ ...f, clientId: e.target.value }))}
                options={[
                  { value: "", label: "Select a client" },
                  ...clients.map((c) => ({ value: c.id, label: c.name })),
                ]}
                error={errors.clientId}
                required 
              />
              <Select 
                label="Property (Optional)" 
                id="deal-property" 
                value={form.propertyId}
                onChange={(e) => setForm((f) => ({ ...f, propertyId: e.target.value }))}
                options={[
                  { value: "", label: "No property linked" },
                  ...properties.map((p) => ({ value: p.id, label: `${p.title} - ${p.city}` })),
                ]} 
              />
              <Select 
                label="Deal Stage *" 
                id="deal-stage" 
                value={form.stage}
                onChange={(e) => setForm((f) => ({ ...f, stage: e.target.value }))}
                options={[
                  { value: "PROSPECTING", label: "🔍 Prospecting - Initial contact" },
                  { value: "NEGOTIATION", label: "🤝 Negotiation - Discussing terms" },
                  { value: "AGREEMENT", label: "📋 Agreement - Finalizing contract" },
                  { value: "DUE_DILIGENCE", label: "🔎 Due Diligence - Verification phase" },
                  { value: "CLOSED_WON", label: "✅ Closed Won - Deal completed" },
                  { value: "CLOSED_LOST", label: "❌ Closed Lost - Deal lost" },
                ]} 
              />
            </div>
          </section>

          {/* Financial Details Section */}
          <section>
            <div className="flex items-center gap-2 mb-5 pb-3 border-b border-[#1e2a44]">
              <div className="p-1.5 rounded-lg bg-amber-500/10">
                <DollarSign size={16} className="text-amber-400" />
              </div>
              <h2 className="text-base font-semibold text-[#f1f5ff]">Financial Details</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <Input 
                label="Deal Amount (₹)" 
                id="deal-amount" 
                type="number" 
                step="1000" 
                placeholder="50,00,000" 
                value={form.amount}
                onChange={set("amount")} 
                error={errors.amount} 
              />
              <Input 
                label="Commission Rate (%)" 
                id="deal-commission" 
                type="number" 
                step="0.1" 
                min="0" 
                max="100" 
                placeholder="2.0" 
                value={form.commissionRate}
                onChange={set("commissionRate")} 
              />
              {form.amount && form.commissionRate && (
                <div className="md:col-span-2">
                  <div className="bg-[#161b27] rounded-xl p-4 border border-[#2a3356]">
                    <p className="text-sm text-[#8892b0]">Estimated Commission</p>
                    <p className="text-xl font-bold text-emerald-400 mt-1">
                      ₹{((parseFloat(form.amount) || 0) * (parseFloat(form.commissionRate) || 0) / 100).toLocaleString("en-IN")}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* Additional Details Section */}
          <section>
            <div className="flex items-center gap-2 mb-5 pb-3 border-b border-[#1e2a44]">
              <div className="p-1.5 rounded-lg bg-blue-500/10">
                <Calendar size={16} className="text-blue-400" />
              </div>
              <h2 className="text-base font-semibold text-[#f1f5ff]">Additional Details</h2>
            </div>
            <div className="space-y-5">
              <Input 
                label="Expected Close Date" 
                id="deal-close-date" 
                type="date" 
                value={form.expectedCloseDate}
                onChange={set("expectedCloseDate")} 
              />
              <div>
                <label className="text-sm font-medium text-[#8892b0] block mb-2">Notes</label>
                <Textarea
                  id="deal-notes"
                  placeholder="Add any relevant notes about this deal - client requirements, negotiation points, important dates..."
                  value={form.notes}
                  onChange={set("notes")}
                  rows={4}
                  className="w-full bg-[#161b27] border border-[#2a3356] rounded-xl px-4 py-3 text-sm text-[#f1f5ff] placeholder-[#4a5a80] focus:outline-none focus:border-blue-500/60 focus:ring-1 focus:ring-blue-500/30 transition-all resize-none"
                />
              </div>
            </div>
          </section>

          {/* Submit Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t border-[#1e2a44]">
            <Link href="/deals">
              <Button variant="secondary" type="button" className="px-6">Cancel</Button>
            </Link>
            <Button type="submit" isLoading={loading} leftIcon={<Sparkles size={16} />} className="px-6">
              Create Deal
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}