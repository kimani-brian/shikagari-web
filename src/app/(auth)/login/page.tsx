"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import api from "@/lib/api";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Icon from "@/components/ui/Icon";
import toast from "react-hot-toast";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email.trim() || !password) {
      setError("Please enter your email and password");
      return;
    }

    try {
      setLoading(true);
      const res = await api.post("/auth/login", { email, password });
      const { token, user } = res.data.data;
      login(token, user);
      toast.success(`Welcome back, ${user.full_name.split(" ")[0]}`);
      router.push("/");
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? "Login failed. Please try again.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-neutral-900 flex items-center justify-center">
              <Icon name="directions_car" size={20} className="text-white" />
            </div>
            <span className="font-semibold text-lg tracking-tight text-neutral-900">ShikaGari</span>
          </Link>
          <h1 className="text-2xl font-semibold text-neutral-900 mt-6">Sign in</h1>
          <p className="text-sm text-neutral-500 mt-2">
            Do not have an account?{" "}
            <Link href="/register" className="font-medium text-neutral-900 hover:underline">
              Create account
            </Link>
          </p>
        </div>

        {error && (
          <div className="flex items-start gap-3 p-3 bg-neutral-50 border border-neutral-200 rounded-xl mb-6 text-sm text-neutral-700">
            <Icon name="error" size={18} className="text-neutral-700 mt-0.5 shrink-0" />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Email address"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@example.com"
            leftIcon={<Icon name="mail" size={18} />}
            required
            autoComplete="email"
          />

          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter password"
            leftIcon={<Icon name="lock" size={18} className="text-neutral-400" />}
            required
            autoComplete="current-password"
          />

          <div className="flex justify-end">
            <Link href="/forgot-password" className="text-xs font-medium text-neutral-600 hover:text-neutral-900">
              Forgot password
            </Link>
          </div>

          <Button type="submit" variant="primary" fullWidth size="lg" loading={loading} className="mt-2">
            Sign in
          </Button>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-neutral-200" />
          </div>
          <div className="relative flex justify-center">
            <span className="px-3 text-xs text-neutral-400 bg-white">or</span>
          </div>
        </div>

        <Link href="/listings">
          <Button variant="secondary" fullWidth size="lg">
            Browse vehicles without signing in
          </Button>
        </Link>

        <p className="text-xs text-neutral-400 text-center mt-6 leading-relaxed">
          By signing in, you agree to our{" "}
          <Link href="/terms" className="underline hover:text-neutral-600">
            Terms
          </Link>{" "}
          and{" "}
          <Link href="/privacy" className="underline hover:text-neutral-600">
            Privacy Policy
          </Link>
        </p>
      </div>
    </div>
  );
}
