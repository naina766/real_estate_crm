"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Card, Button, Input, Select, Textarea } from "@/components/ui";
import { ArrowLeft, User, Phone, Mail, UserCheck, Sparkles, Tag } from "lucide-react";
import Link from "next/link";

export default function NewClientPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    type: "BUYER",
    preferences: "",
    notes: "",
    tags: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});
    try {
      const preferencesObj = form.preferences ? JSON.parse(form.preferences) : undefined;
      const tagsArray = form.tags ? form.tags.split(",").map(t => t.trim()).filter(Boolean) : [];

      const payload = {
        ...form,
        preferences: preferencesObj,
        tags: tagsArray,
      };

      const res = await fetch("/api/clients", {
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
      toast.success("Client created successfully!");
      router.push(`/clients/${data.data.id}`);
    } catch (err: any) {
      toast.error(err.message || "Failed to create client");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-8">
      {/* Header */}
      <div className="flex items-center gap-4 py-2">
        <Link href="/clients" className="p-2 rounded-xl text-[#8892b0] hover:text-[#f1f5ff] hover:bg-[#1a2035] hover:border border border-[#2a3356] transition-all">
          <ArrowLeft size={18} />
        </Link>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-[#f1f5ff] flex items-center gap-2">
            <User className="text-emerald-400" size={22} />
            Add New Client
          </h1>
          <p className="text-sm text-[#8892b0] mt-1">Create a new client profile to manage relationships</p>
        </div>
      </div>

      <Card className="border border-[#2a3356] bg-[#1a2035]">
        <form onSubmit={handleSubmit} className="p-6 space-y-8">
          
          {/* Contact Information Section */}
          <section>
            <div className="flex items-center gap-2 mb-5 pb-3 border-b border-[#1e2a44]">
              <div className="p-1.5 rounded-lg bg-emerald-500/10">
                <UserCheck size={16} className="text-emerald-400" />
              </div>
              <h2 className="text-base font-semibold text-[#f1f5ff]">Contact Information</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="md:col-span-2">
                <Input 
                  label="Full Name *" 
                  id="client-name" 
                  placeholder="e.g., John Doe" 
                  value={form.name}
                  onChange={set("name")} 
                  error={errors.name} 
                  required 
                />
              </div>
              <Input 
                label="Phone Number *" 
                id="client-phone" 
                type="tel" 
                placeholder="+91 98765 43210" 
                value={form.phone}
                onChange={set("phone")} 
                error={errors.phone} 
                required 
              />
              <Input 
                label="Email Address" 
                id="client-email" 
                type="email" 
                placeholder="john@example.com" 
                value={form.email}
                onChange={set("email")} 
                error={errors.email} 
              />
              <Select 
                label="Client Type *" 
                id="client-type" 
                value={form.type}
                onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
                options={[
                  { value: "BUYER", label: "🏠 Buyer - Looking to purchase property" },
                  { value: "SELLER", label: "💰 Seller - Looking to sell property" },
                  { value: "BOTH", label: "🔄 Both - Buying and selling" },
                ]} 
              />
            </div>
          </section>

          {/* Preferences Section */}
          <section>
            <div className="flex items-center gap-2 mb-5 pb-3 border-b border-[#1e2a44]">
              <div className="p-1.5 rounded-lg bg-blue-500/10">
                <Tag size={16} className="text-blue-400" />
              </div>
              <h2 className="text-base font-semibold text-[#f1f5ff]">Preferences & Notes</h2>
            </div>
            <div className="space-y-5">
              <div>
                <label className="text-sm font-medium text-[#8892b0] block mb-2">Preferences (JSON)</label>
                <Textarea
                  id="client-preferences"
                  placeholder='{"locations": ["Mumbai", "Pune"], "budget": {"min": 5000000, "max": 10000000}, "propertyType": "2BHK", "bedrooms": 2}'
                  value={form.preferences}
                  onChange={set("preferences")}
                  rows={4}
                  className="w-full bg-[#161b27] border border-[#2a3356] rounded-xl px-4 py-3 text-sm text-[#f1f5ff] placeholder-[#4a5a80] focus:outline-none focus:border-blue-500/60 focus:ring-1 focus:ring-blue-500/30 transition-all resize-none font-mono"
                />
                <p className="text-xs text-[#4a5a80] mt-2">
                  Store client preferences like budget, preferred locations, property type, etc.
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-[#8892b0] block mb-2">Notes</label>
                <Textarea
                  id="client-notes"
                  placeholder="Add any relevant notes about this client - requirements, timeline, special considerations..."
                  value={form.notes}
                  onChange={set("notes")}
                  rows={3}
                  className="w-full bg-[#161b27] border border-[#2a3356] rounded-xl px-4 py-3 text-sm text-[#f1f5ff] placeholder-[#4a5a80] focus:outline-none focus:border-blue-500/60 focus:ring-1 focus:ring-blue-500/30 transition-all resize-none"
                />
              </div>
              <div>
                <Input 
                  label="Tags" 
                  id="client-tags" 
                  placeholder="VIP, Hot Lead, Investor, First-time Buyer"
                  value={form.tags} 
                  onChange={set("tags")} 
                />
                <p className="text-xs text-[#4a5a80] mt-2">Separate multiple tags with commas</p>
              </div>
            </div>
          </section>

          {/* Submit Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t border-[#1e2a44]">
            <Link href="/clients">
              <Button variant="secondary" type="button" className="px-6">Cancel</Button>
            </Link>
            <Button type="submit" isLoading={loading} leftIcon={<Sparkles size={16} />} className="px-6">
              Create Client
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}