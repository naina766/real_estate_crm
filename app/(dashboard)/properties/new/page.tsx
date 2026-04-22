"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Card, Button, Input, Select, Textarea } from "@/components/ui";
import { ArrowLeft, Home, MapPin, DollarSign, BedDouble, Bath, Building2, Tag, Sparkles } from "lucide-react";
import Link from "next/link";

export default function NewPropertyPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    type: "RESIDENTIAL",
    address: "",
    city: "",
    state: "",
    country: "India",
    pincode: "",
    latitude: "",
    longitude: "",
    price: "",
    size: "",
    bedrooms: "",
    bathrooms: "",
    floors: "",
    yearBuilt: "",
    amenities: "",
    features: "",
    isFeatured: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleCheckbox = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [field]: e.target.checked }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});
    try {
      const amenitiesArray = form.amenities ? form.amenities.split(",").map(a => a.trim()).filter(Boolean) : [];
      const featuresObj = form.features ? JSON.parse(form.features) : undefined;

      const payload = {
        ...form,
        price: form.price ? parseFloat(form.price) : undefined,
        size: form.size ? parseFloat(form.size) : undefined,
        bedrooms: form.bedrooms ? parseInt(form.bedrooms) : undefined,
        bathrooms: form.bathrooms ? parseInt(form.bathrooms) : undefined,
        floors: form.floors ? parseInt(form.floors) : undefined,
        yearBuilt: form.yearBuilt ? parseInt(form.yearBuilt) : undefined,
        latitude: form.latitude ? parseFloat(form.latitude) : undefined,
        longitude: form.longitude ? parseFloat(form.longitude) : undefined,
        amenities: amenitiesArray,
        features: featuresObj,
      };

      const res = await fetch("/api/properties", {
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
      toast.success("Property created successfully!");
      router.push(`/properties/${data.data.id}`);
    } catch (err: any) {
      toast.error(err.message || "Failed to create property");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-8">
      {/* Header */}
      <div className="flex items-center gap-4 py-2">
        <Link href="/properties" className="p-2 rounded-xl text-[#8892b0] hover:text-[#f1f5ff] hover:bg-[#1a2035] hover:border border border-[#2a3356] transition-all">
          <ArrowLeft size={18} />
        </Link>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-[#f1f5ff] flex items-center gap-2">
            <Home className="text-blue-400" size={22} />
            Add New Property
          </h1>
          <p className="text-sm text-[#8892b0] mt-1">Create a new property listing with all the details</p>
        </div>
      </div>

      <Card className="border border-[#2a3356] bg-[#1a2035]">
        <form onSubmit={handleSubmit} className="p-6 space-y-8">
          
          {/* Basic Information Section */}
          <section>
            <div className="flex items-center gap-2 mb-5 pb-3 border-b border-[#1e2a44]">
              <div className="p-1.5 rounded-lg bg-blue-500/10">
                <Building2 size={16} className="text-blue-400" />
              </div>
              <h2 className="text-base font-semibold text-[#f1f5ff]">Basic Information</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="md:col-span-2">
                <Input 
                  label="Property Title *" 
                  id="property-title" 
                  placeholder="e.g., Luxury 3BHK Apartment in Bandra West" 
                  value={form.title}
                  onChange={set("title")} 
                  error={errors.title} 
                  required 
                />
              </div>
              <Select 
                label="Property Type *" 
                id="property-type" 
                value={form.type} 
                onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
                options={[
                  { value: "RESIDENTIAL", label: "🏠 Residential" },
                  { value: "COMMERCIAL", label: "🏢 Commercial" },
                  { value: "INDUSTRIAL", label: "🏭 Industrial" },
                  { value: "LAND", label: "🌍 Land" },
                  { value: "MIXED_USE", label: "🏘️ Mixed Use" },
                ]} 
              />
              <div className="md:col-span-2">
                <label className="text-sm font-medium text-[#8892b0] block mb-2">Description</label>
                <Textarea
                  id="property-description"
                  placeholder="Describe the property features, location highlights, nearby amenities, and any other important details..."
                  value={form.description}
                  onChange={set("description")}
                  rows={4}
                  className="w-full bg-[#161b27] border border-[#2a3356] rounded-xl px-4 py-3 text-sm text-[#f1f5ff] placeholder-[#4a5a80] focus:outline-none focus:border-blue-500/60 focus:ring-1 focus:ring-blue-500/30 transition-all resize-none"
                />
              </div>
            </div>
          </section>

          {/* Location Section */}
          <section>
            <div className="flex items-center gap-2 mb-5 pb-3 border-b border-[#1e2a44]">
              <div className="p-1.5 rounded-lg bg-emerald-500/10">
                <MapPin size={16} className="text-emerald-400" />
              </div>
              <h2 className="text-base font-semibold text-[#f1f5ff]">Location Details</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="md:col-span-3">
                <Input 
                  label="Street Address *" 
                  id="property-address" 
                  placeholder="123 Main Street, Landmark" 
                  value={form.address}
                  onChange={set("address")} 
                  error={errors.address} 
                  required 
                />
              </div>
              <Input 
                label="City *" 
                id="property-city" 
                placeholder="Mumbai" 
                value={form.city}
                onChange={set("city")} 
                error={errors.city} 
                required 
              />
              <Input 
                label="State *" 
                id="property-state" 
                placeholder="Maharashtra" 
                value={form.state}
                onChange={set("state")} 
                error={errors.state} 
                required 
              />
              <Input 
                label="Pincode" 
                id="property-pincode" 
                placeholder="400001" 
                value={form.pincode}
                onChange={set("pincode")} 
              />
              <Input 
                label="Country" 
                id="property-country" 
                value={form.country}
                onChange={set("country")} 
              />
              <Input 
                label="Latitude" 
                id="property-latitude" 
                type="number" 
                step="any" 
                placeholder="19.0760" 
                value={form.latitude}
                onChange={set("latitude")} 
              />
              <Input 
                label="Longitude" 
                id="property-longitude" 
                type="number" 
                step="any" 
                placeholder="72.8777" 
                value={form.longitude}
                onChange={set("longitude")} 
              />
            </div>
          </section>

          {/* Pricing & Size Section */}
          <section>
            <div className="flex items-center gap-2 mb-5 pb-3 border-b border-[#1e2a44]">
              <div className="p-1.5 rounded-lg bg-amber-500/10">
                <DollarSign size={16} className="text-amber-400" />
              </div>
              <h2 className="text-base font-semibold text-[#f1f5ff]">Pricing & Size</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <Input 
                label="Price (₹) *" 
                id="property-price" 
                type="number" 
                step="1000" 
                placeholder="50,00,000" 
                value={form.price}
                onChange={set("price")} 
                error={errors.price} 
                required 
              />
              <Input 
                label="Size (sq.ft)" 
                id="property-size" 
                type="number" 
                step="1" 
                placeholder="1,200" 
                value={form.size}
                onChange={set("size")} 
              />
            </div>
          </section>

          {/* Property Features Section */}
          <section>
            <div className="flex items-center gap-2 mb-5 pb-3 border-b border-[#1e2a44]">
              <div className="p-1.5 rounded-lg bg-violet-500/10">
                <BedDouble size={16} className="text-violet-400" />
              </div>
              <h2 className="text-base font-semibold text-[#f1f5ff]">Property Features</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
              <Input 
                label="Bedrooms" 
                id="property-bedrooms" 
                type="number" 
                step="1" 
                min="0"
                placeholder="3" 
                value={form.bedrooms}
                onChange={set("bedrooms")} 
              />
              <Input 
                label="Bathrooms" 
                id="property-bathrooms" 
                type="number" 
                step="1" 
                min="0"
                placeholder="2" 
                value={form.bathrooms}
                onChange={set("bathrooms")} 
              />
              <Input 
                label="Floors" 
                id="property-floors" 
                type="number" 
                step="1" 
                min="1"
                placeholder="1" 
                value={form.floors}
                onChange={set("floors")} 
              />
              <Input 
                label="Year Built" 
                id="property-year-built" 
                type="number" 
                step="1" 
                min="1800"
                max={new Date().getFullYear()}
                placeholder="2020" 
                value={form.yearBuilt}
                onChange={set("yearBuilt")} 
              />
            </div>
          </section>

          {/* Amenities & Features Section */}
          <section>
            <div className="flex items-center gap-2 mb-5 pb-3 border-b border-[#1e2a44]">
              <div className="p-1.5 rounded-lg bg-pink-500/10">
                <Tag size={16} className="text-pink-400" />
              </div>
              <h2 className="text-base font-semibold text-[#f1f5ff]">Amenities & Features</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="text-sm font-medium text-[#8892b0] block mb-2">Amenities</label>
                <Input 
                  id="property-amenities" 
                  placeholder="Swimming Pool, Gym, Parking, Security" 
                  value={form.amenities}
                  onChange={set("amenities")} 
                />
                <p className="text-xs text-[#4a5a80] mt-2">Separate multiple amenities with commas</p>
              </div>
              <div>
                <label className="text-sm font-medium text-[#8892b0] block mb-2">Features (JSON)</label>
                <Input 
                  id="property-features" 
                  placeholder='{"parking": 2, "pool": true}' 
                  value={form.features}
                  onChange={set("features")} 
                />
                <p className="text-xs text-[#4a5a80] mt-2">Optional: Add custom features as JSON</p>
              </div>
            </div>
          </section>

          {/* Options Section */}
          <section>
            <div className="flex items-center gap-6 py-3 px-4 bg-[#161b27] rounded-xl border border-[#2a3356]">
              <label className="flex items-center gap-3 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={form.isFeatured} 
                  onChange={handleCheckbox("isFeatured")} 
                  className="w-5 h-5 rounded border-[#2a3356] text-blue-500 focus:ring-blue-500/30 bg-[#161b27]"
                />
                <div>
                  <span className="text-sm font-medium text-[#f1f5ff]">Featured Listing</span>
                  <p className="text-xs text-[#4a5a80]">Highlight this property on the listings page</p>
                </div>
              </label>
            </div>
          </section>

          {/* Submit Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t border-[#1e2a44]">
            <Link href="/properties">
              <Button variant="secondary" type="button" className="px-6">Cancel</Button>
            </Link>
            <Button type="submit" isLoading={loading} leftIcon={<Sparkles size={16} />} className="px-6">
              Create Property
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}