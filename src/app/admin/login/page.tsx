"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useLogin } from "../../../hooks/useLogin";
import { useAuthStore } from "../../../store/useAuthStore";
import { 
  Eye, 
  EyeOff, 
  Lock, 
  Mail, 
  ArrowRight, 
  ShieldCheck,
  Key,
  UserPlus,
  AlertCircle,
  Home
} from "lucide-react";
import { motion } from "framer-motion";

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

      {/* Floating particles */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-[#a3d900] rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0, 0.3, 0],
            }}
            transition={{
              duration: 5 + i,
              repeat: Infinity,
              delay: i * 0.8,
            }}
          />
        ))}
      </div>

      {/* Home Button - Fixed Position */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2 }}
        className="fixed top-6 left-6 z-20"
      >
        <Link
          href="/"
          className="group flex items-center gap-2 rounded-full border border-black/10 dark:border-white/10 bg-white/80 dark:bg-white/5 backdrop-blur-xl px-4 py-2.5 shadow-lg hover:shadow-xl transition-all hover:scale-105"
          aria-label="Go to homepage"
        >
          <motion.div
            whileHover={{ rotate: -15 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            <Home className="h-5 w-5 text-[#a3d900]" />
          </motion.div>
          <span className="geist text-sm font-medium">Back to Home</span>
          <motion.span
            className="h-2 w-2 rounded-full bg-[#a3d900]"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </Link>
      </motion.div>

      <div className="relative z-10 flex min-h-screen items-center justify-center px-5 py-12">
        <div className="w-full max-w-[460px]">
         
          {/* Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="relative overflow-hidden rounded-[1.6rem] border border-black/10 dark:border-white/10 bg-white/70 dark:bg-white/5 backdrop-blur-xl shadow-[0_20px_70px_-35px_rgba(0,0,0,0.35)]"
          >
            {/* inner glow */}
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(800px_260px_at_15%_0%,rgba(163,217,0,0.04),transparent_60%)]" />

            <div className="relative p-7 sm:p-8">
              {/* Heading */}
              <div className="text-center">
                <div className="inline-flex items-center gap-2 rounded-full border border-black/10 dark:border-white/10 bg-white/60 dark:bg-white/5 px-4 py-2">
                  <span className="h-2 w-2 rounded-full bg-[#a3d900]" />
                  <span className="geist text-xs font-bold tracking-wide uppercase opacity-80">
                    Secure Access
                  </span>
                </div>

                <h1 className="mango mt-5 text-3xl sm:text-4xl font-black tracking-tight text-neutral-900 dark:text-white">
                  Welcome back
                </h1>
                <p className="geist mt-2 text-sm sm:text-base opacity-75">
                  Sign in to manage your LogaXP platform.
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="mt-8 space-y-4">
                {/* Email */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  className="space-y-2"
                >
                  <label className="geist text-sm font-semibold opacity-80 flex items-center gap-1">
                    <Mail className="h-4 w-4" />
                    Email address
                  </label>

                  <div className="relative">
                    <input
                      type="email"
                      placeholder="admin@company.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="
                        w-full rounded-2xl border border-black/10 dark:border-white/10
                        bg-white/80 dark:bg-white/5 backdrop-blur
                        px-4 py-3.5 pl-11
                        geist text-sm sm:text-base
                        text-neutral-900 dark:text-white
                        placeholder:text-black/35 dark:placeholder:text-white/35
                        outline-none
                        focus:ring-2 focus:ring-[#a3d900]/40 focus:border-[#a3d900]/40
                        transition
                      "
                    />
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-black/40 dark:text-white/40" />
                  </div>
                </motion.div>

                {/* Password */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.25 }}
                  className="space-y-2"
                >
                  <label className="geist text-sm font-semibold opacity-80 flex items-center gap-1">
                    <Lock className="h-4 w-4" />
                    Password
                  </label>

                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="
                        w-full rounded-2xl border border-black/10 dark:border-white/10
                        bg-white/80 dark:bg-white/5 backdrop-blur
                        px-4 pr-12 py-3.5 pl-11
                        geist text-sm sm:text-base
                        text-neutral-900 dark:text-white
                        placeholder:text-black/35 dark:placeholder:text-white/35
                        outline-none
                        focus:ring-2 focus:ring-[#a3d900]/40 focus:border-[#a3d900]/40
                        transition
                      "
                    />
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-black/40 dark:text-white/40" />
                    
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 rounded-xl p-1.5 text-black/45 hover:text-black/70 dark:text-white/45 dark:hover:text-white/70 transition"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </motion.div>

                {/* Links Row - Forgot Password & Need Access */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="flex items-center justify-between pt-2"
                >
                  {/* Forgot Password Link */}
                  <Link
                    href="/forgot-password"
                    className="geist text-xs font-medium text-[#a3d900] hover:text-[#b2e619] transition flex items-center gap-1 group"
                  >
                    <Key className="h-3 w-3 group-hover:rotate-12 transition-transform" />
                    Forgot password?
                  </Link>

                  {/* Need Access Link */}
                  <Link
                    href="/request-access"
                    className="geist text-xs font-medium text-neutral-900 dark:text-white hover:opacity-80 transition flex items-center gap-1 group"
                  >
                    <UserPlus className="h-3 w-3 group-hover:scale-110 transition-transform" />
                    Need access?
                  </Link>
                </motion.div>

                {/* Security Badge */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.32 }}
                  className="flex items-center justify-center gap-2 pt-1"
                >
                  <ShieldCheck className="h-3 w-3 text-[#a3d900]" />
                  <span className="geist text-xs opacity-60">
                    Protected by enterprise-grade security
                  </span>
                </motion.div>

                {/* Submit */}
                <motion.button
                  type="submit"
                  disabled={loginMutation.isPending}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.35 }}
                  className="
                    group w-full mt-4
                    inline-flex items-center justify-center gap-2
                    rounded-2xl
                    bg-[#a3d900] text-black
                    px-5 py-4
                    mango font-black text-base
                    shadow-lg shadow-[#a3d900]/25
                    hover:shadow-[#a3d900]/40 hover:brightness-95 hover:scale-[1.02]
                    disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100
                    transition-all
                  "
                >
                  {loginMutation.isPending ? (
                    <>
                      <div className="h-5 w-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    <>
                      Sign In
                      <ArrowRight className="h-5 w-5 group-hover:translate-x-0.5 transition-transform" />
                    </>
                  )}
                </motion.button>

                {/* Error */}
                {loginMutation.isError && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-3 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3"
                  >
                    <p className="geist text-sm text-red-700 dark:text-red-300 flex items-center gap-2">
                      <AlertCircle className="h-4 w-4" />
                      Login failed. Please check your credentials.
                    </p>
                  </motion.div>
                )}
              </form>
            </div>

            {/* bottom edge */}
            <div className="h-px w-full bg-black/10 dark:bg-white/10" />
            <div className="px-7 sm:px-8 py-4 flex items-center justify-between">
              <p className="geist text-xs opacity-60">© {new Date().getFullYear()} LogaXP</p>
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-3 w-3 text-[#a3d900]" />
                <p className="geist text-xs opacity-60">Secure • Audited</p>
              </div>
            </div>
          </motion.div>

          {/* small helper with links */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-6 text-center geist text-xs opacity-60 flex items-center justify-center gap-2"
          >
            <span>By continuing, you agree to our</span>
            <Link href="/terms" className="text-[#a3d900] hover:underline">
              Terms
            </Link>
            <span>and</span>
            <Link href="/privacy" className="text-[#a3d900] hover:underline">
              Privacy Policy
            </Link>
          </motion.div>

          {/* Mobile Home Button (hidden on larger screens) */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-4 text-center md:hidden"
          >
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm opacity-60 hover:opacity-100 transition"
            >
              <Home className="h-4 w-4" />
              Back to Home
            </Link>
          </motion.div>
        </div>
      </div>

      {/* Decorative bottom gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#a3d900]/5 to-transparent pointer-events-none" />
    </div>
  );
}