"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Mail, Lock, User, Phone, Car,
  AlertCircle, CheckCircle2, ArrowRight,
  ShieldCheck, Users, Zap
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import api from "@/lib/api";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import toast from "react-hot-toast";
import { cn } from "@/lib/utils";

// ── Role selector ──────────────────────────────────────────────────────────────
const ROLES = [
  {
    value:       "buyer",
    label:       "I want to buy",
    description: "Browse listings, save favourites, contact sellers",
    icon:        Users,
    color:       "border-brand-200 bg-brand-50 text-brand-700",
    activeColor: "border-brand-600 bg-brand-600 text-white",
  },
  {
    value:       "seller",
    label:       "I want to sell",
    description: "List vehicles as a dealer or private seller",
    icon:        Car,
    color:       "border-slate-200 bg-white text-slate-700",
    activeColor: "border-brand-600 bg-brand-600 text-white",
  },
];

// ── Password strength ──────────────────────────────────────────────────────────
function getPasswordStrength(password: string): {
  score:  number;
  label:  string;
  color:  string;
} {
  if (!password) return { score: 0, label: "", color: "" };
  let score = 0;
  if (password.length >= 8)               score++;
  if (/[A-Z]/.test(password))             score++;
  if (/[0-9]/.test(password))             score++;
  if (/[^A-Za-z0-9]/.test(password))      score++;

  const map = [
    { score: 1, label: "Weak",      color: "bg-red-500"    },
    { score: 2, label: "Fair",      color: "bg-amber-500"  },
    { score: 3, label: "Good",      color: "bg-blue-500"   },
    { score: 4, label: "Strong",    color: "bg-emerald-500"},
  ];
  return map[score - 1] ?? { score: 0, label: "", color: "" };
}

// ── Page ───────────────────────────────────────────────────────────────────────
export default function RegisterPage() {
  const router    = useRouter();
  const { login } = useAuth();

  const [role,     setRole]     = useState<"buyer" | "seller">("buyer");
  const [fullName, setFullName] = useState("");
  const [email,    setEmail]    = useState("");
  const [phone,    setPhone]    = useState("");
  const [password, setPassword] = useState("");
  const [confirm,  setConfirm]  = useState("");
  const [loading,  setLoading]  = useState(false);
  const [errors,   setErrors]   = useState<Record<string, string>>({});
  const [apiError, setApiError] = useState("");

  const passwordStrength = getPasswordStrength(password);

  // ── Validation ─────────────────────────────────────────────────────────
  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!fullName.trim() || fullName.trim().length < 2)
      errs.fullName = "Full name must be at least 2 characters";
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      errs.email = "Please enter a valid email address";
    if (!phone.trim() || phone.trim().length < 10)
      errs.phone = "Please enter a valid phone number";
    if (password.length < 8)
      errs.password = "Password must be at least 8 characters";
    if (password !== confirm)
      errs.confirm = "Passwords do not match";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // ── Submit ─────────────────────────────────────────────────────────────
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setApiError("");
    if (!validate()) return;

    try {
      setLoading(true);
      const res = await api.post("/auth/register", {
        full_name: fullName.trim(),
        email:     email.trim(),
        phone:     phone.trim(),
        password,
        role,
      });
      const { token, user } = res.data.data;
      login(token, user);
      toast.success(`Welcome to ShikaGari, ${user.full_name.split(" ")[0]}! 🎉`);

      // Sellers go to profile creation
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
    <div className="min-h-screen bg-surface-muted flex">

      {/* ── Left decorative panel ────────────────────────────────────────── */}
      <div className="hidden lg:flex lg:w-5/12 bg-gradient-to-br from-navy via-navy-light to-brand-800 relative overflow-hidden">
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-brand-500/20 blur-3xl" />
        <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full bg-navy-dark/40 blur-3xl" />

        <div className="relative flex flex-col justify-between p-12 text-white w-full">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
              <Car className="w-5 h-5 text-white" strokeWidth={2.5} />
            </div>
            <span className="font-display font-bold text-xl tracking-tight">
              Shika<span className="text-brand-300">Gari</span>
            </span>
          </Link>

          <div>
            <h2 className="font-display text-4xl font-bold mb-4 leading-tight">
              Join Kenya's biggest car marketplace
            </h2>
            <p className="text-blue-200/80 text-lg leading-relaxed mb-10">
              Create your free account and start buying or selling cars today.
            </p>

            <div className="space-y-4">
              {[
                { icon: ShieldCheck, text: "Verified sellers and dealers only"         },
                { icon: Zap,         text: "List your car in under 5 minutes"           },
                { icon: Users,       text: "Join 4,500+ happy buyers across Kenya"      },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                    <Icon className="w-4 h-4 text-brand-300" />
                  </div>
                  <span className="text-sm text-blue-100/90">{text}</span>
                </div>
              ))}
            </div>
          </div>

          <p className="text-xs text-blue-200/50">
            © {new Date().getFullYear()} ShikaGari. Trusted across Kenya 🇰🇪
          </p>
        </div>
      </div>

      {/* ── Right form panel ─────────────────────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center p-6 overflow-y-auto">
        <div className="w-full max-w-lg py-8">

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
              Create your account
            </h1>
            <p className="text-slate-500">
              Already have an account?{" "}
              <Link href="/login" className="text-brand-700 font-semibold hover:text-brand-800 transition-colors">
                Sign in
              </Link>
            </p>
          </div>

          {/* Role selector */}
          <div className="mb-6">
            <p className="text-sm font-semibold text-slate-700 mb-3">I am joining as a:</p>
            <div className="grid grid-cols-2 gap-3">
              {ROLES.map((r) => {
                const Icon    = r.icon;
                const isActive = role === r.value;
                return (
                  <button
                    key={r.value}
                    type="button"
                    onClick={() => setRole(r.value as "buyer" | "seller")}
                    className={cn(
                      "flex flex-col items-start gap-2 p-4 rounded-xl border-2 transition-all text-left",
                      isActive ? r.activeColor : r.color
                    )}
                  >
                    <div className={cn(
                      "w-8 h-8 rounded-lg flex items-center justify-center",
                      isActive ? "bg-white/20" : "bg-slate-100"
                    )}>
                      <Icon className={cn("w-4 h-4", isActive ? "text-white" : "text-slate-600")} />
                    </div>
                    <div>
                      <p className={cn("text-sm font-bold", isActive ? "text-white" : "text-slate-800")}>
                        {r.label}
                      </p>
                      <p className={cn("text-[11px] leading-relaxed mt-0.5", isActive ? "text-white/80" : "text-slate-500")}>
                        {r.description}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* API error */}
          {apiError && (
            <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl mb-5 text-sm text-red-700 animate-fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              {apiError}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Full name"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="John Kamau"
              leftIcon={<User className="w-4 h-4" />}
              error={errors.fullName}
              required
              autoComplete="name"
            />

            <Input
              label="Email address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="john@example.com"
              leftIcon={<Mail className="w-4 h-4" />}
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
              leftIcon={<Phone className="w-4 h-4" />}
              error={errors.phone}
              hint="Used by sellers to contact you"
              required
              autoComplete="tel"
            />

            {/* Password */}
            <div>
              <Input
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min. 8 characters"
                leftIcon={<Lock className="w-4 h-4" />}
                error={errors.password}
                required
                autoComplete="new-password"
              />
              {/* Strength meter */}
              {password && (
                <div className="mt-2">
                  <div className="flex gap-1 mb-1">
                    {[1, 2, 3, 4].map((level) => (
                      <div
                        key={level}
                        className={cn(
                          "h-1 flex-1 rounded-full transition-all",
                          passwordStrength.score >= level
                            ? passwordStrength.color
                            : "bg-slate-200"
                        )}
                      />
                    ))}
                  </div>
                  <p className={cn(
                    "text-xs font-medium",
                    passwordStrength.score >= 3 ? "text-emerald-600" : "text-slate-500"
                  )}>
                    {passwordStrength.label && `Password strength: ${passwordStrength.label}`}
                  </p>
                </div>
              )}
            </div>

            {/* Confirm password */}
            <Input
              label="Confirm password"
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="Repeat your password"
              leftIcon={<Lock className="w-4 h-4" />}
              error={errors.confirm}
              success={confirm && confirm === password ? "Passwords match" : undefined}
              required
              autoComplete="new-password"
            />

            {/* Seller note */}
            {role === "seller" && (
              <div className="flex items-start gap-3 p-4 bg-brand-50 border border-brand-100 rounded-xl text-sm text-brand-700">
                <ShieldCheck className="w-5 h-5 shrink-0 mt-0.5 text-brand-500" />
                <p>
                  After registering, you'll need to create a{" "}
                  <strong>dealer</strong> or <strong>private seller</strong>{" "}
                  profile and wait for admin approval before listing vehicles.
                </p>
              </div>
            )}

            <Button
              type="submit"
              variant="primary"
              fullWidth
              size="lg"
              loading={loading}
              rightIcon={<ArrowRight className="w-4 h-4" />}
              className="mt-2"
            >
              Create account
            </Button>
          </form>

          {/* Terms */}
          <p className="text-xs text-slate-400 text-center mt-6 leading-relaxed">
            By creating an account, you agree to our{" "}
            <Link href="/terms" className="underline hover:text-slate-600">Terms of Service</Link>
            {" "}and{" "}
            <Link href="/privacy" className="underline hover:text-slate-600">Privacy Policy</Link>.
            We'll never share your data.
          </p>
        </div>
      </div>
    </div>
  );
}
