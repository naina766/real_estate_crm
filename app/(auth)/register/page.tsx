"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { Button, Input, Select } from "@/components/ui";
import { Eye, EyeOff, Zap } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "", phone: "", role: "AGENT" });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      if (data.data?.user?.isApproved) {
        toast.success("Account created! Redirecting...");
        router.push("/dashboard");
      } else {
        toast.success("Registration successful! Awaiting approval.");
        router.push("/login");
      }
    } catch (err) {
      toast.error((err as Error).message || "Registration failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f1117] flex items-center justify-center p-8">
      <div className="w-full max-w-sm">
        <div className="flex items-center gap-3 mb-10">
          <div className="w-10 h-10 rounded-xl bg-linear-to-br from-blue-500 to-violet-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-lg font-bold text-[#f1f5ff]">RealCRM</h1>
        </div>

        <h2 className="text-2xl font-bold text-[#f1f5ff] mb-1">Create account</h2>
        <p className="text-sm text-[#8892b0] mb-8">Join your team&apos;s CRM platform</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Full Name" id="reg-name" placeholder="John Doe" value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <Input label="Email Address" type="email" id="reg-email" placeholder="john@example.com" value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          <Input label="Phone Number" type="tel" id="reg-phone" placeholder="+91 98765 43210" value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          <Input label="Password" type={showPassword ? "text" : "password"} id="reg-password"
            placeholder="Min 8 chars, 1 uppercase, 1 number" value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })} required
            rightIcon={<button type="button" onClick={() => setShowPassword(!showPassword)}>
              {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>} />
          <Select label="Role" id="reg-role" value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value })}
            options={[
              { value: "AGENT", label: "Sales Agent" },
              { value: "MANAGER", label: "Manager" },
              { value: "ADMIN", label: "Admin" },
            ]} />
          <Button type="submit" className="w-full mt-2" isLoading={isLoading} size="lg" id="register-submit">
            Create Account
          </Button>
        </form>

         <p className="text-center text-sm text-[#8892b0] mt-6">
           Already have an account?{" "}
          <Link href="/login" className="text-blue-400 hover:text-blue-300 font-medium">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
