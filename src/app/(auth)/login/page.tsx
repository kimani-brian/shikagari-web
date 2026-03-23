"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, Lock, Car, ArrowRight, AlertCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import api from "@/lib/api";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import toast from "react-hot-toast";

export default function LoginPage() {
  const router     = useRouter();
  const { login }  = useAuth();

  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email.trim() || !password) {
      setError("Please enter your email and password.");
      return;
    }

    try {
      setLoading(true);
      const res = await api.post("/auth/login", { email, password });
      const { token, user } = res.data.data;
      login(token, user);
      toast.success(`Welcome back, ${user.full_name.split(" ")[0]}! 👋`);
      router.push("/");
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? "Login failed. Please try again.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface-muted flex">

      {/* ── Left panel (decorative) ──────────────────────────────────────── */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-navy via-navy-light to-brand-700 relative overflow-hidden">
        {/* BG circles */}
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-brand-600/20 blur-3xl" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-blue-800/20 blur-3xl" />

        <div className="relative flex flex-col justify-between p-12 text-white w-full">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
              <Car className="w-5 h-5 text-white" strokeWidth={2.5} />
            </div>
            <span className="font-display font-bold text-xl tracking-tight">
              Shika<span className="text-brand-300">Gari</span>
            </span>
          </Link>

          {/* Content */}
          <div>
            <h2 className="font-display text-4xl font-bold mb-4 leading-tight">
              Welcome back to Kenya's car marketplace
            </h2>
            <p className="text-blue-200/80 text-lg leading-relaxed mb-8">
              Sign in to browse listings, contact sellers, and manage your favourites.
            </p>

            {/* Feature list */}
            <div className="space-y-3">
              {[
                "Browse 12,000+ verified listings",
                "Contact dealers and private sellers",
                "Save your favourite cars",
                "Manage your own listings",
              ].map((item) => (
                <div key={item} className="flex items-center gap-3 text-sm text-blue-100/80">
                  <div className="w-5 h-5 rounded-full bg-brand-400/20 flex items-center justify-center shrink-0">
                    <ArrowRight className="w-3 h-3 text-brand-300" />
                  </div>
                  {item}
                </div>
              ))}
            </div>
          </div>

          {/* Testimonial */}
          <div className="bg-white/10 rounded-2xl p-5 border border-white/20">
            <p className="text-sm text-blue-100/90 italic leading-relaxed">
              "Found my Toyota Premio in under 10 minutes. The seller was verified
              and the process was incredibly smooth!"
            </p>
            <div className="flex items-center gap-3 mt-4">
              <div className="w-9 h-9 rounded-full bg-brand-400/30 flex items-center justify-center">
                <span className="text-sm font-bold text-white">JK</span>
              </div>
              <div>
                <p className="text-sm font-semibold text-white">James Kariuki</p>
                <p className="text-xs text-blue-200/60">Nairobi, Kenya</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Right panel (form) ───────────────────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">

          {/* Mobile logo */}
          <div className="flex justify-center mb-8 lg:hidden">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-brand-700 flex items-center justify-center">
                <Car className="w-5 h-5 text-white" strokeWidth={2.5} />
              </div>
              <span className="font-display font-bold text-xl text-navy tracking-tight">
                Shika<span className="text-brand-600">Gari</span>
              </span>
            </Link>
          </div>

          {/* Heading */}
          <div className="mb-8">
            <h1 className="font-display text-3xl font-bold text-slate-900 mb-2">
              Sign in
            </h1>
            <p className="text-slate-500">
              Don't have an account?{" "}
              <Link href="/register" className="text-brand-700 font-semibold hover:text-brand-800 transition-colors">
                Create one free
              </Link>
            </p>
          </div>

          {/* Error alert */}
          {error && (
            <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl mb-6 text-sm text-red-700 animate-fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="john@example.com"
              leftIcon={<Mail className="w-4 h-4" />}
              required
              autoComplete="email"
            />

            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              leftIcon={<Lock className="w-4 h-4" />}
              required
              autoComplete="current-password"
            />

            {/* Forgot password */}
            <div className="flex justify-end">
              <Link
                href="/forgot-password"
                className="text-sm text-brand-700 hover:text-brand-800 font-medium transition-colors"
              >
                Forgot password?
              </Link>
            </div>

            <Button
              type="submit"
              variant="primary"
              fullWidth
              size="lg"
              loading={loading}
              className="mt-2"
            >
              Sign in
            </Button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center">
              <span className="px-4 text-xs text-slate-400 bg-surface-muted">
                or continue as
              </span>
            </div>
          </div>

          {/* Guest browse */}
          <Link href="/listings">
            <Button variant="secondary" fullWidth size="lg">
              Browse cars without signing in
            </Button>
          </Link>

          {/* Terms */}
          <p className="text-xs text-slate-400 text-center mt-6 leading-relaxed">
            By signing in, you agree to our{" "}
            <Link href="/terms" className="underline hover:text-slate-600">Terms of Service</Link>
            {" "}and{" "}
            <Link href="/privacy" className="underline hover:text-slate-600">Privacy Policy</Link>
          </p>
        </div>
      </div>
    </div>
  );
}