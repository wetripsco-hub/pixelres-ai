"use client";

import React, { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sparkles, Loader2, Mail, Lock, ArrowRight, Chrome, Zap, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const supabase = createClient();
  const router = useRouter();

  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    (typeof window !== "undefined" ? window.location.origin : "");

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      if (isLogin) {
        // Sign In
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (signInError) throw signInError;

        router.refresh();
        router.push("/dashboard");
      } else {
        // Sign Up
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${siteUrl}/api/auth/callback`,
          },
        });

        if (signUpError) throw signUpError;

        // If Supabase confirms the user immediately (auto-confirm enabled)
        if (data.session) {
          router.refresh();
          router.push("/dashboard");
        } else {
          setSuccessMessage("Check your email for a confirmation link to complete sign up.");
        }
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${siteUrl}/api/auth/callback`,
      },
    });

    if (error) {
      setError(error.message);
    }
  };

  const handleGuestCheckout = () => {
    if (typeof window !== "undefined") {
      localStorage.setItem("pixelres_guest_mode", "true");
    }
    router.push("/studio");
  };

  return (
    <div className="min-h-screen bg-[#07090E] text-slate-50 font-sans flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Ambient Lighting Gradients */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-15%] left-[-10%] w-[50%] h-[50%] rounded-full bg-cyan-600/15 blur-[140px]" />
        <div className="absolute bottom-[-15%] right-[-10%] w-[50%] h-[50%] rounded-full bg-violet-600/15 blur-[140px]" />
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff08_1px,transparent_1px)] [background-size:24px_24px] opacity-40" />
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Brand Header */}
        <div className="flex justify-center mb-8">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-cyan-500 to-violet-600 p-[1px] shadow-lg shadow-cyan-500/25 group-hover:shadow-cyan-500/40 group-hover:scale-105 transition-all duration-300">
              <div className="h-full w-full bg-[#07090E] rounded-[15px] flex items-center justify-center">
                <Sparkles className="h-5 w-5 text-cyan-400 group-hover:rotate-12 transition-transform duration-300" />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-2xl tracking-tight text-slate-100">
                PixelRes <span className="bg-gradient-to-r from-cyan-400 to-violet-400 bg-clip-text text-transparent">AI</span>
              </span>
              <span className="text-[10px] text-slate-400 font-medium tracking-wider uppercase">High-Res Neural Studio</span>
            </div>
          </Link>
        </div>

        <Card className="bg-slate-900/60 border-white/10 backdrop-blur-2xl shadow-2xl rounded-3xl overflow-hidden">
          <CardHeader className="text-center pb-2 pt-8">
            <CardTitle className="text-2xl font-bold text-slate-100 tracking-tight">
              {isLogin ? "Welcome Back" : "Create Account"}
            </CardTitle>
            <CardDescription className="text-slate-400 text-sm mt-1">
              {isLogin ? "Sign in to manage your orders and renders" : "Sign up to start upscaling up to 8K Ultra HD"}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 sm:p-8 space-y-6">
            {/* Google OAuth Button */}
            <Button
              type="button"
              onClick={handleGoogleSignIn}
              className="w-full h-12 bg-slate-800/80 hover:bg-slate-700/80 text-white border border-white/10 hover:border-cyan-500/30 rounded-xl font-medium transition-all duration-200 flex items-center justify-center gap-3 shadow-sm hover:shadow-cyan-500/10"
            >
              <Chrome className="h-5 w-5 text-cyan-400" />
              Continue with Google
            </Button>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10"></div>
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-4 bg-slate-900/80 text-slate-400 font-medium uppercase tracking-wider">or with email</span>
              </div>
            </div>

            {/* Email/Password Form */}
            <form onSubmit={handleEmailAuth} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-slate-300 text-xs font-semibold uppercase tracking-wider">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="pl-10 h-12 bg-slate-950/80 border-white/10 focus:border-cyan-500/80 text-white rounded-xl placeholder:text-slate-500 focus:ring-1 focus:ring-cyan-500/50 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-slate-300 text-xs font-semibold uppercase tracking-wider">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    className="pl-10 h-12 bg-slate-950/80 border-white/10 focus:border-cyan-500/80 text-white rounded-xl placeholder:text-slate-500 focus:ring-1 focus:ring-cyan-500/50 transition-all"
                  />
                </div>
              </div>

              {error && (
                <div className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl p-3.5 text-center font-medium">
                  {error}
                </div>
              )}

              {successMessage && (
                <div className="text-sm text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3.5 text-center font-medium">
                  {successMessage}
                </div>
              )}

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 text-white rounded-xl font-semibold shadow-[0_0_25px_rgba(6,182,212,0.3)] hover:shadow-[0_0_35px_rgba(6,182,212,0.5)] transition-all duration-300 flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <>
                    {isLogin ? "Sign In to Workspace" : "Create My Account"}
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            </form>

            {/* Toggle Login/Signup */}
            <div className="text-center text-sm text-slate-400">
              {isLogin ? (
                <p>
                  Don&apos;t have an account?{" "}
                  <button
                    type="button"
                    onClick={() => { setIsLogin(false); setError(null); setSuccessMessage(null); }}
                    className="text-cyan-400 hover:text-cyan-300 font-semibold transition-colors underline-offset-4 hover:underline"
                  >
                    Sign up
                  </button>
                </p>
              ) : (
                <p>
                  Already have an account?{" "}
                  <button
                    type="button"
                    onClick={() => { setIsLogin(true); setError(null); setSuccessMessage(null); }}
                    className="text-cyan-400 hover:text-cyan-300 font-semibold transition-colors underline-offset-4 hover:underline"
                  >
                    Sign in
                  </button>
                </p>
              )}
            </div>

            {/* Guest Checkout Quick Action */}
            <div className="pt-2 border-t border-white/10">
              <Button
                type="button"
                variant="outline"
                onClick={handleGuestCheckout}
                className="w-full h-11 bg-slate-950/40 hover:bg-slate-800/60 border-white/10 hover:border-violet-500/40 text-slate-300 hover:text-white rounded-xl text-xs font-semibold tracking-wide transition-all duration-200 flex items-center justify-center gap-2 group"
              >
                <Zap className="h-3.5 w-3.5 text-violet-400 group-hover:scale-110 transition-transform" />
                Continue as Guest / Instant Checkout
                <ArrowRight className="h-3.5 w-3.5 text-slate-500 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Security badge */}
        <div className="flex items-center justify-center gap-2 mt-6 text-xs text-slate-400">
          <ShieldCheck className="h-4 w-4 text-emerald-400" />
          <span>256-bit Encrypted SSL & Secure Stripe Processing</span>
        </div>
      </div>
    </div>
  );
}
