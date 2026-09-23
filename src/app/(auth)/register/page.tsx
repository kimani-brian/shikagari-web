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
import { cn } from "@/lib/utils";

const ROLES = [
  {
    value: "buyer",
    label: "Buying",
    description: "Browse listings and contact sellers",
  },
  {
    value: "seller",
    label: "Selling",
    description: "List vehicles as dealer or private seller",
  },
];

export default function RegisterPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [role, setRole] = useState<"buyer" | "seller">("buyer");
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
    if (!fullName.trim() || fullName.trim().length < 2) errs.fullName = "Full name must be at least 2 characters";
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

      if (role === "seller") {
        router.push("/dashboard");
      } else {
        router.push("/listings");
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
        </div>

        <div className="mb-6">
          <p className="text-sm font-medium text-neutral-700 mb-3">I am joining as</p>
          <div className="grid grid-cols-2 gap-3">
            {ROLES.map((r) => {
              const isActive = role === r.value;
              return (
                <button
                  key={r.value}
                  type="button"
                  onClick={() => setRole(r.value as "buyer" | "seller")}
                  className={cn(
                    "flex flex-col items-start gap-2 p-4 rounded-xl border text-left transition-colors",
                    isActive ? "bg-neutral-900 text-white border-neutral-900" : "bg-white text-neutral-700 border-neutral-300 hover:border-neutral-900"
                  )}
                >
                  <Icon name={r.value === "buyer" ? "search" : "storefront"} size={18} className={isActive ? "text-white" : "text-neutral-500"} />
                  <div>
                    <p className={cn("text-sm font-medium", isActive ? "text-white" : "text-neutral-900")}>{r.label}</p>
                    <p className={cn("text-xs leading-relaxed mt-0.5", isActive ? "text-neutral-300" : "text-neutral-500")}>
                      {r.description}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {apiError && (
          <div className="flex items-start gap-3 p-3 bg-neutral-50 border border-neutral-200 rounded-xl mb-5 text-sm text-neutral-700">
            <Icon name="error" size={18} className="shrink-0 mt-0.5" />
            {apiError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Full name"
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="John Kamau"
            leftIcon={<Icon name="person" size={18} />}
            error={errors.fullName}
            required
            autoComplete="name"
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

          {role === "seller" && (
            <div className="flex items-start gap-3 p-3 bg-neutral-50 border border-neutral-200 rounded-xl text-xs text-neutral-600">
              <Icon name="info" size={18} className="shrink-0 mt-0.5" />
              <p>
                After registering, you will create a dealer or private seller profile. Admin approval is required before listing.
              </p>
            </div>
          )}

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
