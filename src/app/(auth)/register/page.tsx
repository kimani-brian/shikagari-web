"use client";

import { useState, FormEvent, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import api from "@/lib/api";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Icon from "@/components/ui/Icon";
import toast from "react-hot-toast";

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();

  // Everyone registers as a buyer. Dealerships arrive via /register?role=dealer
  // (linked from the dealer pages), which only changes how the form reads.
  const role: "buyer" | "dealer" =
    searchParams.get("role") === "dealer" ? "dealer" : "buyer";
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [apiError, setApiError] = useState("");

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!fullName.trim() || fullName.trim().length < 2)
      errs.fullName = role === "dealer"
        ? "Dealer name must be at least 2 characters"
        : "Full name must be at least 2 characters";
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = "Please enter a valid email";
    if (!phone.trim() || phone.trim().length < 10) errs.phone = "Please enter a valid phone number";
    if (password.length < 8) errs.password = "Password must be at least 8 characters";
    if (password !== confirm) errs.confirm = "Passwords do not match";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setApiError("");
    if (!validate()) return;

    try {
      setLoading(true);
      const res = await api.post("/auth/register", {
        full_name: fullName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        password,
        role,
      });
      const { token, user } = res.data.data;
      login(token, user);
      toast.success(`Welcome, ${user.full_name.split(" ")[0]}`);

      if (role === "buyer") {
        router.push("/listings");
      } else {
        router.push("/dashboard");
      }
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? "Registration failed. Please try again.";
      setApiError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-neutral-900 flex items-center justify-center">
              <Icon name="directions_car" size={20} className="text-white" />
            </div>
            <span className="font-semibold text-lg tracking-tight text-neutral-900">ShikaGari</span>
          </Link>
          <h1 className="text-2xl font-semibold text-neutral-900 mt-6">Create account</h1>
          <p className="text-sm text-neutral-500 mt-2">
            Already have an account?{" "}
            <Link href="/login" className="font-medium text-neutral-900 hover:underline">
              Sign in
            </Link>
          </p>
          {role !== "dealer" && (
            <Link
              href="/register?role=dealer"
              className="mt-5 inline-block px-5 py-3 rounded-xl bg-neutral-900 text-sm font-bold tracking-tight text-white hover:bg-neutral-800 transition-colors"
            >
              Register as a dealer
            </Link>
          )}
        </div>

        {apiError && (
          <div className="flex items-start gap-3 p-3 bg-neutral-50 border border-neutral-200 rounded-xl mb-5 text-sm text-neutral-700">
            <Icon name="error" size={18} className="shrink-0 mt-0.5" />
            {apiError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label={role === "dealer" ? "Dealer name" : "Full name"}
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder={role === "dealer" ? "Shika Motors Ltd" : "John Kamau"}
            leftIcon={<Icon name="person" size={18} />}
            error={errors.fullName}
            required
            autoComplete={role === "dealer" ? "organization" : "name"}
          />

          <Input
            label="Email address"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@example.com"
            leftIcon={<Icon name="mail" size={18} />}
            error={errors.email}
            required
            autoComplete="email"
          />

          <Input
            label="Phone number"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="0712 345 678"
            leftIcon={<Icon name="phone" size={18} />}
            error={errors.phone}
            hint="Used by sellers to contact you"
            required
            autoComplete="tel"
          />

          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="At least 8 characters"
            leftIcon={<Icon name="info" size={18} />}
            error={errors.password}
            required
            autoComplete="new-password"
          />

          <Input
            label="Confirm password"
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder="Repeat password"
            leftIcon={<Icon name="info" size={18} />}
            error={errors.confirm}
            success={confirm && confirm === password ? "Passwords match" : undefined}
            required
            autoComplete="new-password"
          />

          <Button type="submit" variant="primary" fullWidth size="lg" loading={loading} className="mt-2">
            Create account
          </Button>
        </form>

        <p className="text-xs text-neutral-400 text-center mt-6 leading-relaxed">
          By creating an account, you agree to our{" "}
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

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-white flex items-center justify-center px-4 py-12">
          <p className="text-sm text-neutral-500">Loading</p>
        </div>
      }
    >
      <RegisterForm />
    </Suspense>
  );
}
