"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { Button, Input } from "@/components/ui";
import { Eye, EyeOff, Zap, Building2, Users, TrendingUp } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      toast.success("Welcome back!");
      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      toast.error((err as Error).message || "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  const loginAsDemo = async (role: string) => {
    const creds = {
      ADMIN: { email: "admin@realcrm.com", password: "Admin@1234" },
      AGENT: { email: "agent@realcrm.com", password: "Agent@1234" },
    }[role];
    if (creds) {
      setForm(creds);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f1117] flex">
      {/* Left panel: Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-sm">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-10">
            <div className="w-10 h-10 rounded-xl bg-linear-to-br from-blue-500 to-violet-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-[#f1f5ff]">RealCRM</h1>
              <p className="text-xs text-[#4a5a80]">Real Estate Management</p>
            </div>
          </div>

          <h2 className="text-2xl font-bold text-[#f1f5ff] mb-1">Welcome back</h2>
          <p className="text-sm text-[#8892b0] mb-8">Sign in to your CRM account</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email Address"
              type="email"
              id="login-email"
              placeholder="admin@realcrm.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
              autoComplete="email"
            />
            <Input
              label="Password"
              type={showPassword ? "text" : "password"}
              id="login-password"
              placeholder="••••••••"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
              autoComplete="current-password"
              rightIcon={
                <button type="button" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              }
            />
            <Button type="submit" className="w-full mt-2" isLoading={isLoading} size="lg" id="login-submit">
              Sign In
            </Button>
          </form>

          {/* Demo logins */}
          <div className="mt-6">
            <p className="text-xs text-[#4a5a80] text-center mb-3">— Quick Demo Access —</p>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => loginAsDemo("ADMIN")}
                className="px-3 py-2 bg-[#1a2035] border border-[#2a3356] rounded-xl text-xs text-[#8892b0] hover:border-blue-500/40 hover:text-[#f1f5ff] transition-all"
              >
                Admin Demo
              </button>
              <button
                onClick={() => loginAsDemo("AGENT")}
                className="px-3 py-2 bg-[#1a2035] border border-[#2a3356] rounded-xl text-xs text-[#8892b0] hover:border-blue-500/40 hover:text-[#f1f5ff] transition-all"
              >
                Agent Demo
              </button>
            </div>
          </div>

          <p className="text-center text-sm text-[#8892b0] mt-6">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="text-blue-400 hover:text-blue-300 font-medium">
              Register
            </Link>
          </p>
        </div>
      </div>

      {/* Right panel: Feature showcase */}
      <div className="hidden lg:flex flex-1 bg-linear-to-br from-[#0d1528] via-[#0f1117] to-[#1a0d2e] items-center justify-center p-12 relative overflow-hidden">
        {/* Background glow */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-violet-600/10 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 max-w-md text-center">
          <h2 className="text-4xl font-bold text-[#f1f5ff] mb-4 leading-tight">
            Real Estate CRM{" "}
            <span className="bg-linear-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent">
              Reimagined
            </span>
          </h2>
          <p className="text-[#8892b0] mb-10 leading-relaxed">
            Manage leads, properties, deals, and your entire team — all in one powerful platform.
          </p>

          <div className="grid grid-cols-3 gap-4">
            {[
              { icon: Users, label: "Lead Tracking", color: "from-blue-500 to-cyan-500" },
              { icon: Building2, label: "Property Mgmt", color: "from-violet-500 to-pink-500" },
              { icon: TrendingUp, label: "Deal Pipeline", color: "from-emerald-500 to-teal-500" },
            ].map(({ icon: Icon, label, color }) => (
              <div key={label} className="bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-sm hover:bg-white/8 transition-all">
                <div className={`w-10 h-10 rounded-xl bg-linear-to-br ${color} flex items-center justify-center mx-auto mb-2 shadow-lg`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <p className="text-xs font-medium text-[#8892b0]">{label}</p>
              </div>
            ))}
          </div>

          <div className="mt-10 flex items-center justify-center gap-6 text-sm text-[#4a5a80]">
            <span>✦ AI Lead Scoring</span>
            <span>✦ Kanban Pipeline</span>
            <span>✦ Analytics</span>
          </div>
        </div>
      </div>
    </div>
  );
}
