"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useLogin } from "../../../hooks/useLogin";
import { useAuthStore } from "../../../store/useAuthStore";
import { Eye, EyeOff, Lock, Mail, ArrowRight, ShieldCheck } from "lucide-react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const loginMutation = useLogin();
  const { accessToken } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (accessToken) router.push("/portal");
  }, [accessToken, router]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loginMutation.mutate({ email, password });
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-neutral-50 via-white to-[#f8fdea] dark:from-neutral-950 dark:via-neutral-900 dark:to-[#1a2400]">
      {/* subtle grid */}
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#00000008_1px,transparent_1px),linear-gradient(to_bottom,#00000008_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#ffffff10_1px,transparent_1px),linear-gradient(to_bottom,#ffffff10_1px,transparent_1px)] bg-[size:44px_44px] [mask-image:radial-gradient(ellipse_60%_55%_at_50%_35%,black,transparent)]" />

      <div className="relative z-10 flex min-h-screen items-center justify-center px-5 py-12">
        <div className="w-full max-w-[460px]">

          {/* Card */}
          <div className="relative overflow-hidden rounded-[1.6rem] border border-black/10 dark:border-white/10 bg-white/70 dark:bg-white/5 backdrop-blur-xl shadow-[0_20px_70px_-35px_rgba(0,0,0,0.35)]">
            {/* inner glow */}
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(800px_260px_at_15%_0%,rgba(163,217,0,0.04),transparent_60%)]" />

            <div className="relative p-7 sm:p-8">
              {/* Heading */}
              <div className="text-center">
                <div className="inline-flex items-center gap-2 rounded-full border border-black/10 dark:border-white/10 bg-white/60 dark:bg-white/5 px-4 py-2">
                  <span className="h-2 w-2 rounded-full bg-[#a3d900]" />
                  <span className="geist text-xs font-bold tracking-wide uppercase opacity-80">
                    Admin Portal
                  </span>
                </div>

                <h1 className="mango mt-5 text-3xl sm:text-4xl font-black tracking-tight text-neutral-900 dark:text-white">
                  Sign in to manage your platform
                </h1>
                <p className="geist mt-2 text-sm sm:text-base opacity-75">
                  Secure access for LogaXP administrators.
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="mt-8 space-y-4">
                {/* Email */}
                <div className="space-y-2">
                  <label className="geist text-sm font-semibold opacity-80">
                    Email address
                  </label>

                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-black/40 dark:text-white/40">
                      <Mail className="h-5 w-5" />
                    </span>

                    <input
                      type="email"
                      placeholder="admin@company.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="
                        w-full rounded-2xl border border-black/10 dark:border-white/10
                        bg-white/80 dark:bg-white/5 backdrop-blur
                        px-11 py-3.5
                        geist text-sm sm:text-base
                        text-neutral-900 dark:text-white
                        placeholder:text-black/35 dark:placeholder:text-white/35
                        outline-none
                        focus:ring-2 focus:ring-[#a3d900]/40 focus:border-[#a3d900]/40
                        transition
                      "
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="space-y-2">
                  <label className="geist text-sm font-semibold opacity-80">
                    Password
                  </label>

                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-black/40 dark:text-white/40">
                      <Lock className="h-5 w-5" />
                    </span>

                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="
                        w-full rounded-2xl border border-black/10 dark:border-white/10
                        bg-white/80 dark:bg-white/5 backdrop-blur
                        px-11 pr-12 py-3.5
                        geist text-sm sm:text-base
                        text-neutral-900 dark:text-white
                        placeholder:text-black/35 dark:placeholder:text-white/35
                        outline-none
                        focus:ring-2 focus:ring-[#a3d900]/40 focus:border-[#a3d900]/40
                        transition
                      "
                    />

                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 rounded-xl p-2 text-black/45 hover:text-black/70 dark:text-white/45 dark:hover:text-white/70 transition"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                {/* Actions row */}
                <div className="flex items-center justify-between pt-1">
                  <div className="geist text-xs opacity-70">
                    Protected by enterprise-grade security.
                  </div>

                  <Link
                    href="/contact"
                    className="geist text-xs font-semibold text-neutral-900 dark:text-white hover:opacity-80 transition"
                  >
                    Need access?
                  </Link>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loginMutation.isPending}
                  className="
                    group w-full mt-2
                    inline-flex items-center justify-center gap-2
                    rounded-2xl
                    bg-[#a3d900] text-black
                    px-5 py-3.5
                    mango font-black text-base
                    shadow-lg shadow-[#a3d900]/25
                    hover:shadow-[#a3d900]/40 hover:brightness-95
                    disabled:opacity-60 disabled:cursor-not-allowed
                    transition
                  "
                >
                  {loginMutation.isPending ? "Signing in..." : "Sign In"}
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-0.5 transition-transform" />
                </button>

                {/* Error */}
                {loginMutation.isError && (
                  <div className="mt-3 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3">
                    <p className="geist text-sm text-red-700 dark:text-red-300">
                      Login failed. Please check your credentials.
                    </p>
                  </div>
                )}
              </form>
            </div>

            {/* bottom edge */}
            <div className="h-px w-full bg-black/10 dark:bg-white/10" />
            <div className="px-7 sm:px-8 py-4 flex items-center justify-between">
              <p className="geist text-xs opacity-60">© {new Date().getFullYear()} LogaXP</p>
              <p className="geist text-xs opacity-60">Admin • Secure • Audited</p>
            </div>
          </div>

          {/* small helper */}
          <div className="mt-6 text-center geist text-xs opacity-60">
            By continuing, you agree to LogaXP platform security policies.
          </div>
        </div>
      </div>
    </div>
  );
}
