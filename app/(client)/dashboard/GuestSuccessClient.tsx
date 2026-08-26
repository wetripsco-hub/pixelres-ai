"use client";

import React, { useEffect } from "react";
import { CheckCircle2, Sparkles, ArrowRight, Mail, Clock, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import confetti from "canvas-confetti";
import { ThemeToggle } from "@/components/shared/theme-toggle";

interface GuestOrder {
  id: string;
  status: string;
  target_resolution: string;
  enhancement_type: string;
  currency: string;
  amount_paid: number;
  created_at: string;
  guest_email: string | null;
}

interface GuestSuccessClientProps {
  order: GuestOrder | null;
  countryCode: string;
}

export function GuestSuccessClient({ order, countryCode }: GuestSuccessClientProps) {
  useEffect(() => {
    confetti({
      particleCount: 120,
      spread: 70,
      origin: { y: 0.6 },
      colors: ["#f97316", "#8b5cf6", "#ffffff"],
    });
  }, []);

  const formatPrice = (amount: number, currency: string) => {
    if (currency === "USD") return `$${amount.toFixed(2)}`;
    if (currency === "PKR") return `Rs. ${amount.toLocaleString()}`;
    if (currency === "INR") return `₹${amount.toLocaleString()}`;
    return `${amount} ${currency}`;
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-[#07090E] dark:text-slate-50 font-sans flex flex-col items-center justify-center p-4 relative overflow-hidden transition-colors duration-200">
      {/* Theme Toggle */}
      <div className="absolute top-6 right-6 z-20">
        <ThemeToggle />
      </div>

      {/* Background Ambience */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-15%] left-[-10%] w-[50%] h-[50%] rounded-full bg-orange-500/10 dark:bg-cyan-600/12 blur-[140px]" />
        <div className="absolute bottom-[-15%] right-[-10%] w-[50%] h-[50%] rounded-full bg-amber-500/10 dark:bg-violet-600/12 blur-[140px]" />
        <div className="absolute inset-0 bg-[radial-gradient(#00000008_1px,transparent_1px)] dark:bg-[radial-gradient(#ffffff08_1px,transparent_1px)] [background-size:24px_24px] opacity-40" />
      </div>

      <div className="w-full max-w-lg relative z-10 space-y-6">
        {/* Brand Header */}
        <div className="flex justify-center">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-orange-500 via-amber-500 to-orange-500 dark:from-cyan-500 dark:to-violet-600 p-[1px] shadow-md shadow-orange-500/20 dark:shadow-cyan-500/20 group-hover:shadow-orange-500/40 dark:group-hover:shadow-cyan-500/40 transition-all">
              <div className="h-full w-full bg-white dark:bg-[#07090E] rounded-[11px] flex items-center justify-center">
                <Sparkles className="h-4 w-4 text-orange-500 dark:text-cyan-400" />
              </div>
            </div>
            <span className="text-xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
              PixelRes <span className="bg-gradient-to-r from-orange-500 to-amber-500 dark:from-cyan-500 dark:to-violet-500 bg-clip-text text-transparent">AI</span>
            </span>
          </Link>
        </div>

        {/* Success Card */}
        <Card className="bg-white/90 dark:bg-slate-900/60 border border-slate-200/90 dark:border-white/10 backdrop-blur-2xl shadow-2xl rounded-3xl overflow-hidden">
          <CardHeader className="text-center pt-10 pb-4 px-8">
            <div className="mx-auto mb-5 h-20 w-20 rounded-full bg-emerald-500/10 border-2 border-emerald-500/30 flex items-center justify-center">
              <CheckCircle2 className="h-10 w-10 text-emerald-500" />
            </div>
            <CardTitle className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
              Order Confirmed!
            </CardTitle>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
              Your neural super-resolution job is now in the processing queue.
            </p>
          </CardHeader>

          <CardContent className="px-8 pb-10 space-y-6">
            {order ? (
              <>
                {/* Order Details */}
                <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-white/10 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500 dark:text-slate-400 font-medium">Order ID</span>
                    <span className="font-mono font-bold text-slate-900 dark:text-slate-200">{order.id.substring(0, 8)}…</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500 dark:text-slate-400 font-medium">Resolution</span>
                    <Badge variant="outline" className="font-mono text-[10px] border-orange-500/30 dark:border-cyan-500/30 text-orange-600 dark:text-cyan-400 bg-orange-500/10 dark:bg-cyan-500/10 uppercase">
                      {order.target_resolution}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500 dark:text-slate-400 font-medium">Enhancement</span>
                    <span className="capitalize font-semibold text-slate-700 dark:text-slate-300">{order.enhancement_type}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500 dark:text-slate-400 font-medium">Amount</span>
                    <span className="font-mono font-black text-lg text-slate-900 dark:text-white">{formatPrice(order.amount_paid, order.currency)}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500 dark:text-slate-400 font-medium">Status</span>
                    <Badge className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 text-xs">
                      <Clock className="h-3 w-3 mr-1" /> Processing
                    </Badge>
                  </div>
                  {order.guest_email && (
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500 dark:text-slate-400 font-medium">Delivery Email</span>
                      <span className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                        <Mail className="h-3 w-3 text-orange-500 dark:text-cyan-400" />
                        {order.guest_email}
                      </span>
                    </div>
                  )}
                </div>

                {/* Info Banner */}
                <div className="flex items-start gap-3 p-4 rounded-2xl bg-violet-500/5 border border-violet-500/15 text-xs text-violet-700 dark:text-violet-300">
                  <Shield className="h-4 w-4 shrink-0 mt-0.5 text-violet-500" />
                  <p>
                    Your upscaled render will be delivered to your email once processing is complete.
                    Create an account to track live order status and manage all your renders.
                  </p>
                </div>
              </>
            ) : (
              <div className="text-center py-6">
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Your order has been submitted. Create an account to track progress.
                </p>
              </div>
            )}

            {/* CTAs */}
            <div className="space-y-3 pt-2">
              <Link href="/login" className="block">
                <Button className="w-full h-12 bg-gradient-to-r from-orange-500 via-amber-500 to-orange-500 dark:from-cyan-600 dark:to-cyan-500 hover:opacity-95 text-white rounded-xl font-bold shadow-lg shadow-orange-500/20 dark:shadow-cyan-500/20 btn-interactive flex items-center justify-center gap-2">
                  Create Account to Track Orders
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>

              <Link href="/studio" className="block">
                <Button
                  variant="outline"
                  className="w-full h-11 rounded-xl text-xs font-bold border-slate-200 dark:border-white/10 bg-white/80 dark:bg-slate-900/60 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <Sparkles className="h-3.5 w-3.5 mr-2 text-orange-500 dark:text-cyan-400" />
                  Upscale Another Image
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
