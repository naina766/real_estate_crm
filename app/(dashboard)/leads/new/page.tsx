"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Card, Button, Input, Select } from "@/components/ui";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function NewLeadPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "", phone: "", email: "", budget: "", source: "WEBSITE",
    status: "NEW", notes: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, budget: form.budget ? parseFloat(form.budget) : undefined }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.errors?.fieldErrors) setErrors(
          Object.fromEntries(Object.entries(data.errors.fieldErrors).map(([k, v]) => [k, (v as string[])[0]]))
        );
        throw new Error(data.message);
      }
      toast.success("Lead created successfully!");
      router.push(`/leads/${data.data.id}`);
    } catch (err: any) {
      toast.error(err.message || "Failed to create lead");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/leads" className="p-2 rounded-xl text-[#8892b0] hover:text-[#f1f5ff] hover:bg-[#1a2035] transition-all">
          <ArrowLeft size={16} />
        </Link>
        <div>
          <h2 className="text-lg font-semibold text-[#f1f5ff]">Create New Lead</h2>
          <p className="text-xs text-[#8892b0]">Capture and track a new prospect</p>
        </div>
      </div>

      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Full Name" id="lead-name" placeholder="John Doe" value={form.name}
              onChange={set("name")} error={errors.name} required />
            <Input label="Phone Number" id="lead-phone" type="tel" placeholder="+91 98765 43210"
              value={form.phone} onChange={set("phone")} error={errors.phone} required />
            <Input label="Email Address" id="lead-email" type="email" placeholder="john@example.com"
              value={form.email} onChange={set("email")} error={errors.email} />
            <Input label="Budget (₹)" id="lead-budget" type="number" placeholder="5000000"
              value={form.budget} onChange={set("budget")} error={errors.budget} />
            <Select label="Lead Source" id="lead-source" value={form.source} onChange={(e) => setForm((f) => ({ ...f, source: e.target.value }))}
              options={[
                { value: "WEBSITE", label: "Website" },
                { value: "REFERRAL", label: "Referral" },
                { value: "PORTAL", label: "Property Portal" },
                { value: "SOCIAL_MEDIA", label: "Social Media" },
                { value: "COLD_CALL", label: "Cold Call" },
                { value: "WALK_IN", label: "Walk-in" },
                { value: "OTHER", label: "Other" },
              ]} />
            <Select label="Initial Status" id="lead-status" value={form.status}
              onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
              options={[
                { value: "NEW", label: "New" },
                { value: "CONTACTED", label: "Contacted" },
                { value: "QUALIFIED", label: "Qualified" },
              ]} />
          </div>
          <div>
            <label className="text-xs font-medium text-[#8892b0] uppercase tracking-wide block mb-1.5">Notes</label>
            <textarea
              id="lead-notes"
              placeholder="Add any relevant notes about this lead..."
              value={form.notes}
              onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
              rows={4}
              className="w-full bg-[#161b27] border border-[#2a3356] rounded-xl px-4 py-2.5 text-sm text-[#f1f5ff] placeholder-[#4a5a80] focus:outline-none focus:border-blue-500/60 focus:ring-1 focus:ring-blue-500/30 transition-all resize-none"
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Link href="/leads">
              <Button variant="secondary" type="button">Cancel</Button>
            </Link>
            <Button type="submit" isLoading={loading} id="create-lead-submit">Create Lead</Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
