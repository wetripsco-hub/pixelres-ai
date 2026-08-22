"use client";

import React, { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { generateDownloadUrl, updateOrderStatus, uploadDeliverable, generateThumbnailUrl } from "./actions";
import { 
  Shield, Download, Upload, CheckCircle2, Loader2, AlertCircle, Settings, 
  FileImage, User, Image as ImageIcon, Save, Check, RefreshCw, LayoutDashboard, 
  DollarSign, ArrowLeft, LogOut, Search, Filter, Sparkles, Database, ExternalLink, 
  CreditCard, HardDrive, CheckCircle, Clock, Zap, Copy, Terminal
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { ThemeToggle } from "@/components/shared/theme-toggle";

interface Order {
  id: string;
  user_id: string | null;
  guest_email: string | null;
  original_image_url: string;
  upscaled_image_url: string | null;
  target_resolution: string;
  enhancement_type: string;
  currency: string;
  amount_paid: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  created_at: string;
  completed_at: string | null;
}

interface Metrics {
  totalUsdRevenue: number;
  totalPkrRevenue: number;
  totalInrRevenue: number;
  estimatedTotalUsd: number;
  pendingJobs: number;
  completedJobs: number;
  totalOrders: number;
}

interface PricingRow {
  id: string;
  usd_price: number;
  pkr_price: number;
  inr_price: number;
}

const SUPABASE_PRICING_SQL = `-- Run in Supabase SQL Editor to create database pricing table:
CREATE TABLE IF NOT EXISTS public.pricing_settings (
  id TEXT PRIMARY KEY,
  usd_price NUMERIC NOT NULL,
  pkr_price NUMERIC NOT NULL,
  inr_price NUMERIC NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now()
);

INSERT INTO public.pricing_settings (id, usd_price, pkr_price, inr_price) VALUES
('web', 1.99, 499, 149),
('4k', 4.99, 1299, 399),
('8k', 9.99, 2499, 799)
ON CONFLICT (id) DO NOTHING;

ALTER TABLE public.pricing_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view pricing" ON public.pricing_settings FOR SELECT USING (true);
CREATE POLICY "Admin can update pricing" ON public.pricing_settings FOR ALL USING (true);`;

export function AdminDashboardClient({ 
  initialOrders, 
  metrics,
  initialPricing,
  adminEmail
}: { 
  initialOrders: Order[]; 
  metrics: Metrics;
  initialPricing: PricingRow[];
  adminEmail?: string;
}) {
  const router = useRouter();
  const supabase = createClient();

  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [activeNav, setActiveNav] = useState<"orders" | "pricing" | "settings">("orders");
  const [isProcessingId, setIsProcessingId] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Pricing State
  const [pricing, setPricing] = useState<PricingRow[]>(initialPricing);
  const [isSavingPricing, setIsSavingPricing] = useState(false);
  const [pricingMessage, setPricingMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [copiedSql, setCopiedSql] = useState(false);

  // Upload Modal State
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [uploadOrder, setUploadOrder] = useState<Order | null>(null);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Thumbnails Cache
  const [thumbnails, setThumbnails] = useState<Record<string, string>>({});

  // Filtered Orders
  const filteredOrders = orders.filter((order) => {
    const matchesStatus = statusFilter === "all" || order.status === statusFilter;
    const query = searchQuery.toLowerCase().trim();
    if (!query) return matchesStatus;

    const matchesSearch =
      order.id.toLowerCase().includes(query) ||
      (order.guest_email && order.guest_email.toLowerCase().includes(query)) ||
      order.target_resolution.toLowerCase().includes(query) ||
      order.enhancement_type.toLowerCase().includes(query);

    return matchesStatus && matchesSearch;
  });

  const handleRefresh = async () => {
    setIsRefreshing(true);
    router.refresh();
    setTimeout(() => {
      setIsRefreshing(false);
    }, 600);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    document.cookie = "admin_pin_access=; path=/; max-age=0;";
    router.push("/");
    router.refresh();
  };

  const loadThumbnail = async (orderId: string, filePath: string) => {
    if (thumbnails[orderId]) return;
    try {
      const url = await generateThumbnailUrl(filePath);
      setThumbnails((prev) => ({ ...prev, [orderId]: url }));
    } catch (err) {
      console.error("Failed to load thumbnail", err);
    }
  };

  const handleDownloadOriginal = async (orderId: string, filePath: string) => {
    try {
      setIsProcessingId(orderId);
      const signedUrl = await generateDownloadUrl(filePath);
      window.open(signedUrl, "_blank");
    } catch (error: any) {
      alert(error.message);
    } finally {
      setIsProcessingId(null);
    }
  };

  const handleStatusChange = async (orderId: string, status: "pending" | "processing" | "failed") => {
    try {
      setIsProcessingId(orderId);
      await updateOrderStatus(orderId, status);
      setOrders(orders.map((o) => (o.id === orderId ? { ...o, status } : o)));
    } catch (error: any) {
      alert(error.message);
    } finally {
      setIsProcessingId(null);
    }
  };

  const openUploadModal = (order: Order) => {
    setUploadOrder(order);
    setUploadFile(null);
    setUploadModalOpen(true);
  };

  const handleModalUpload = async () => {
    if (!uploadFile || !uploadOrder) return;

    try {
      setIsUploading(true);
      const formData = new FormData();
      formData.append("file", uploadFile);

      const res = await uploadDeliverable(uploadOrder.id, uploadOrder.user_id, formData);

      setOrders(
        orders.map((o) =>
          o.id === uploadOrder.id
            ? {
                ...o,
                status: "completed",
                upscaled_image_url: res.filePath,
                completed_at: new Date().toISOString(),
              }
            : o
        )
      );

      setUploadModalOpen(false);
      alert("Deliverable uploaded and order completed successfully.");
    } catch (error: any) {
      alert(`Upload failed: ${error.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  const handlePriceChange = (id: string, field: "usd_price" | "pkr_price" | "inr_price", value: number) => {
    setPricing(pricing.map((p) => (p.id === id ? { ...p, [field]: value } : p)));
  };

  const savePricing = async () => {
    try {
      setIsSavingPricing(true);
      setPricingMessage(null);

      const res = await fetch("/api/admin/pricing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tiers: pricing }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(data?.error || `Failed to update pricing settings (Status ${res.status})`);
      }

      setPricingMessage({
        type: "success",
        text: data?.message || "Multi-currency rates successfully updated and saved!"
      });
      router.refresh();
      setTimeout(() => setPricingMessage(null), 5000);
    } catch (error: any) {
      setPricingMessage({ type: "error", text: error.message || "Failed to update pricing." });
    } finally {
      setIsSavingPricing(false);
    }
  };

  const copySql = () => {
    if (typeof navigator !== 'undefined') {
      navigator.clipboard.writeText(SUPABASE_PRICING_SQL);
      setCopiedSql(true);
      setTimeout(() => setCopiedSql(false), 3000);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"><CheckCircle2 className="h-3 w-3 mr-1" /> Completed</Badge>;
      case "processing":
        return <Badge className="bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 border-cyan-500/30"><Loader2 className="h-3 w-3 mr-1 animate-spin" /> Processing</Badge>;
      case "failed":
        return <Badge variant="destructive" className="bg-red-500/15 text-red-600 dark:text-red-400 border-red-500/30"><AlertCircle className="h-3 w-3 mr-1" /> Failed</Badge>;
      default:
        return <Badge variant="outline" className="text-amber-600 dark:text-amber-400 border-amber-500/30 bg-amber-500/10"><Clock className="h-3 w-3 mr-1" /> Pending</Badge>;
    }
  };

  const formatPrice = (amount: number, currency: string) => {
    if (currency === "USD") return `$${amount.toFixed(2)}`;
    if (currency === "PKR") return `Rs. ${amount.toLocaleString()}`;
    if (currency === "INR") return `₹${amount.toLocaleString()}`;
    return `${amount} ${currency}`;
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-[#07090E] dark:text-slate-50 font-sans flex flex-col md:flex-row relative selection:bg-cyan-500/30 transition-colors duration-200">
      {/* Background Ambience */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[45%] h-[45%] rounded-full bg-cyan-500/10 dark:bg-cyan-900/10 blur-[140px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[45%] h-[45%] rounded-full bg-violet-500/10 dark:bg-violet-900/10 blur-[140px]" />
        <div className="absolute inset-0 bg-[radial-gradient(#00000008_1px,transparent_1px)] dark:bg-[radial-gradient(#ffffff08_1px,transparent_1px)] [background-size:24px_24px] opacity-40" />
      </div>

      {/* ── Collapsible / Fixed Modern Sidebar ── */}
      <aside className="w-full md:w-64 lg:w-72 bg-white/80 dark:bg-slate-950/80 border-r border-slate-200 dark:border-white/10 backdrop-blur-2xl flex flex-col justify-between z-20 shrink-0 sticky top-0 md:h-screen transition-colors duration-200">
        <div>
          {/* Brand Header */}
          <div className="p-6 border-b border-slate-200 dark:border-white/10">
            <Link href="/admin" className="flex items-center gap-3 group">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-cyan-500 to-violet-600 p-[1px] shadow-md shadow-cyan-500/20 group-hover:shadow-cyan-500/40 transition-all">
                <div className="h-full w-full bg-white dark:bg-[#07090E] rounded-[11px] flex items-center justify-center">
                  <Shield className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
                </div>
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-lg text-slate-900 dark:text-slate-100 tracking-tight">
                  PixelRes <span className="bg-gradient-to-r from-cyan-500 to-violet-500 bg-clip-text text-transparent">Admin</span>
                </span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold tracking-wider uppercase">Command Center</span>
              </div>
            </Link>

            <Link href="/studio" className="mt-4 block">
              <Button
                variant="outline"
                size="sm"
                className="w-full bg-slate-100 dark:bg-slate-900/60 border-slate-200 dark:border-white/10 hover:border-cyan-500/40 text-slate-700 dark:text-slate-300 rounded-xl text-xs flex items-center justify-center gap-2 transition-all shadow-sm"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Back to Studio App
              </Button>
            </Link>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1.5">
            <button
              onClick={() => setActiveNav("orders")}
              className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-semibold transition-all ${
                activeNav === "orders"
                  ? "bg-orange-500/10 dark:bg-cyan-500/15 border border-orange-500/30 dark:border-cyan-500/30 text-orange-600 dark:text-cyan-400 shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900/50"
              }`}
            >
              <div className="flex items-center gap-3">
                <LayoutDashboard className="h-4 w-4" />
                <span>Orders & Overview</span>
              </div>
              <Badge variant="outline" className="text-[10px] font-mono border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-900/80 text-slate-700 dark:text-slate-300">
                {orders.length}
              </Badge>
            </button>

            <button
              onClick={() => setActiveNav("pricing")}
              className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-semibold transition-all ${
                activeNav === "pricing"
                  ? "bg-orange-500/10 dark:bg-cyan-500/15 border border-orange-500/30 dark:border-cyan-500/30 text-orange-600 dark:text-cyan-400 shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900/50"
              }`}
            >
              <div className="flex items-center gap-3">
                <DollarSign className="h-4 w-4" />
                <span>Pricing & Multi-Currency</span>
              </div>
            </button>

            <button
              onClick={() => setActiveNav("settings")}
              className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-semibold transition-all ${
                activeNav === "settings"
                  ? "bg-orange-500/10 dark:bg-cyan-500/15 border border-orange-500/30 dark:border-cyan-500/30 text-orange-600 dark:text-cyan-400 shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900/50"
              }`}
            >
              <div className="flex items-center gap-3">
                <Settings className="h-4 w-4" />
                <span>System Settings</span>
              </div>
            </button>
          </nav>
        </div>

        {/* Bottom Pinned Profile & Logout */}
        <div className="p-4 border-t border-slate-200 dark:border-white/10 space-y-3">
          <div className="flex items-center gap-3 p-2.5 rounded-2xl bg-slate-100 dark:bg-slate-900/60 border border-slate-200 dark:border-white/10">
            <div className="h-9 w-9 rounded-xl bg-violet-500/10 border border-violet-500/30 flex items-center justify-center text-violet-600 dark:text-violet-400">
              <User className="h-4 w-4" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-bold text-slate-900 dark:text-slate-200 truncate">
                {adminEmail || "wetrips.co@gmail.com"}
              </div>
              <div className="text-[10px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-medium">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                Super Admin
              </div>
            </div>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="w-full text-slate-600 dark:text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 border border-transparent rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all"
          >
            <LogOut className="h-3.5 w-3.5" />
            Sign Out of Admin
          </Button>
        </div>
      </aside>

      {/* ── Main Content Area ── */}
      <div className="flex-1 flex flex-col min-w-0 z-10">
        {/* Top Header */}
        <header className="h-18 px-6 sm:px-8 border-b border-slate-200 dark:border-white/10 bg-white/70 dark:bg-slate-950/70 backdrop-blur-xl sticky top-0 z-30 flex items-center justify-between transition-colors duration-200">
          <div className="flex items-center gap-3">
            <div className="flex flex-col">
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 tracking-tight">
                {activeNav === "orders" && "Orders Command Center"}
                {activeNav === "pricing" && "Multi-Currency Dynamic Pricing Manager"}
                {activeNav === "settings" && "System Health & Infrastructure"}
              </h2>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                {activeNav === "orders" && "Manage customer queue, deliver finished 8K renders, and track revenue."}
                {activeNav === "pricing" && "Configure live resolution rates for global currencies (USD, PKR, INR)."}
                {activeNav === "settings" && "Overview of storage buckets, database RLS bypass, and Stripe webhook status."}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <ThemeToggle />

            <div className="hidden sm:inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-medium">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>System Online</span>
            </div>

            <Button
              size="sm"
              variant="outline"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="border-slate-200 dark:border-white/10 bg-white/80 dark:bg-slate-900/60 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-xl text-xs flex items-center gap-2 shadow-sm"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? "animate-spin text-cyan-500" : ""}`} />
              Refresh Data
            </Button>
          </div>
        </header>

        {/* Dynamic Panels */}
        <main className="p-6 sm:p-8 space-y-8 flex-1 overflow-y-auto">
          {/* ═══════════ ORDERS PANEL ═══════════ */}
          {activeNav === "orders" && (
            <>
              {/* Stat Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                <Card className="bg-white/80 dark:bg-slate-900/60 border border-slate-200/90 dark:border-white/10 backdrop-blur-2xl rounded-3xl p-5 shadow-xl">
                  <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-medium">
                    <span>Total Revenue</span>
                    <DollarSign className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div className="mt-2 text-2xl font-black text-slate-900 dark:text-white font-mono">
                    ${metrics.totalUsdRevenue.toFixed(2)}
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-2 flex flex-wrap gap-2">
                    <span className="text-cyan-600 dark:text-cyan-400 font-mono">Rs. {metrics.totalPkrRevenue.toLocaleString()}</span>
                    <span>•</span>
                    <span className="text-violet-600 dark:text-violet-400 font-mono">₹{metrics.totalInrRevenue.toLocaleString()}</span>
                  </div>
                </Card>

                <Card className="bg-white/80 dark:bg-slate-900/60 border border-slate-200/90 dark:border-white/10 backdrop-blur-2xl rounded-3xl p-5 shadow-xl">
                  <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-medium">
                    <span>Active / Processing</span>
                    <Zap className="h-4 w-4 text-cyan-600 dark:text-cyan-400" />
                  </div>
                  <div className="mt-2 text-2xl font-black text-cyan-600 dark:text-cyan-400 font-mono">
                    {metrics.pendingJobs}
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-2">
                    Jobs awaiting AI render or delivery
                  </div>
                </Card>

                <Card className="bg-white/80 dark:bg-slate-900/60 border border-slate-200/90 dark:border-white/10 backdrop-blur-2xl rounded-3xl p-5 shadow-xl">
                  <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-medium">
                    <span>Completed Deliverables</span>
                    <CheckCircle className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div className="mt-2 text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
                    {metrics.completedJobs}
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-2">
                    Successfully fulfilled 8K outputs
                  </div>
                </Card>

                <Card className="bg-white/80 dark:bg-slate-900/60 border border-slate-200/90 dark:border-white/10 backdrop-blur-2xl rounded-3xl p-5 shadow-xl">
                  <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-medium">
                    <span>Total Orders Volume</span>
                    <FileImage className="h-4 w-4 text-violet-600 dark:text-violet-400" />
                  </div>
                  <div className="mt-2 text-2xl font-black text-slate-900 dark:text-white font-mono">
                    {metrics.totalOrders}
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-2">
                    Combined guest & customer queue
                  </div>
                </Card>
              </div>

              {/* Search & Filter Bar */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    placeholder="Search by Order ID, customer email, or resolution…"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 h-11 bg-white/80 dark:bg-slate-900/80 border-slate-200 dark:border-white/10 text-slate-900 dark:text-white rounded-2xl text-xs placeholder:text-slate-400"
                  />
                </div>

                <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
                  {["all", "processing", "completed", "pending", "failed"].map((status) => (
                    <button
                      key={status}
                      onClick={() => setStatusFilter(status)}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all whitespace-nowrap ${
                        statusFilter === status
                          ? "bg-cyan-500/15 text-cyan-700 dark:text-cyan-300 border border-cyan-500/40 shadow-sm"
                          : "bg-white/80 dark:bg-slate-900/60 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-slate-800"
                      }`}
                    >
                      {status} ({orders.filter((o) => status === "all" || o.status === status).length})
                    </button>
                  ))}
                </div>
              </div>

              {/* Orders Table */}
              <Card className="bg-white/80 dark:bg-slate-900/60 border border-slate-200/90 dark:border-white/10 backdrop-blur-2xl rounded-3xl shadow-2xl overflow-hidden">
                <CardHeader className="p-6 border-b border-slate-100 dark:border-white/10 bg-slate-50/50 dark:bg-slate-950/40">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg font-bold text-slate-900 dark:text-slate-100">Orders Management Queue</CardTitle>
                      <CardDescription className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        Showing {filteredOrders.length} of {orders.length} total orders
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm text-slate-700 dark:text-slate-300">
                    <thead className="bg-slate-100/80 dark:bg-slate-950/80 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider border-b border-slate-200 dark:border-white/10">
                      <tr>
                        <th className="py-4 px-6">Order Details</th>
                        <th className="py-4 px-6">Customer</th>
                        <th className="py-4 px-6">Input Image</th>
                        <th className="py-4 px-6">Resolution / Mode</th>
                        <th className="py-4 px-6">Amount</th>
                        <th className="py-4 px-6">Status</th>
                        <th className="py-4 px-6 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-white/5 font-medium">
                      {filteredOrders.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="text-center py-16 text-slate-400">
                            <FileImage className="h-10 w-10 text-slate-400 dark:text-slate-600 mx-auto mb-3" />
                            <p className="font-semibold text-base text-slate-800 dark:text-slate-300">No orders match your filter.</p>
                            <p className="text-xs text-slate-500 mt-1">Try changing the status filter or clearing your search term.</p>
                          </td>
                        </tr>
                      ) : (
                        filteredOrders.map((order) => (
                          <tr key={order.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                            {/* Order ID & Date */}
                            <td className="py-4 px-6">
                              <div className="font-mono font-bold text-slate-900 dark:text-slate-200 text-xs">{order.id.substring(0, 8)}…</div>
                              <div className="text-[11px] text-slate-500 mt-0.5" title={order.created_at}>
                                {formatDistanceToNow(new Date(order.created_at), { addSuffix: true })}
                              </div>
                            </td>

                            {/* Customer Email */}
                            <td className="py-4 px-6">
                              <div className="text-xs font-semibold text-slate-900 dark:text-slate-200">
                                {order.guest_email || "Guest Order"}
                              </div>
                              <div className="text-[10px] text-slate-500">
                                {order.user_id ? "Registered User" : "Instant Guest"}
                              </div>
                            </td>

                            {/* Thumbnail */}
                            <td className="py-4 px-6">
                              <div
                                onClick={() => loadThumbnail(order.id, order.original_image_url)}
                                className="h-12 w-12 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-white/10 flex items-center justify-center overflow-hidden cursor-pointer hover:border-cyan-500 transition-all relative group"
                                title="Click to load image preview"
                              >
                                {thumbnails[order.id] ? (
                                  // eslint-disable-next-line @next/next/no-img-element
                                  <img src={thumbnails[order.id]} alt="Original Preview" className="h-full w-full object-cover" />
                                ) : (
                                  <ImageIcon className="h-5 w-5 text-slate-400 group-hover:text-cyan-500" />
                                )}
                              </div>
                            </td>

                            {/* Resolution & Mode */}
                            <td className="py-4 px-6">
                              <div className="flex items-center gap-1.5">
                                <Badge variant="outline" className="font-mono text-cyan-700 dark:text-cyan-400 border-cyan-500/30 bg-cyan-50 dark:bg-cyan-950/40 text-[10px] uppercase">
                                  {order.target_resolution}
                                </Badge>
                              </div>
                              <div className="text-[11px] text-slate-500 dark:text-slate-400 capitalize mt-1">
                                {order.enhancement_type}
                              </div>
                            </td>

                            {/* Amount */}
                            <td className="py-4 px-6 font-mono font-bold text-slate-900 dark:text-slate-200">
                              {formatPrice(order.amount_paid, order.currency)}
                            </td>

                            {/* Status */}
                            <td className="py-4 px-6">
                              {getStatusBadge(order.status)}
                            </td>

                            {/* Actions */}
                            <td className="py-4 px-6 text-right space-x-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleDownloadOriginal(order.id, order.original_image_url)}
                                disabled={isProcessingId === order.id}
                                className="h-8 px-2.5 bg-white dark:bg-slate-900/60 border-slate-200 dark:border-white/10 hover:border-cyan-500/40 text-xs text-slate-700 dark:text-slate-300 rounded-xl shadow-sm"
                                title="Download Customer Raw File"
                              >
                                <Download className="h-3.5 w-3.5" />
                              </Button>

                              <Button
                                size="sm"
                                onClick={() => openUploadModal(order)}
                                className="h-8 px-3 bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 text-xs font-semibold text-white rounded-xl shadow-sm"
                              >
                                <Upload className="h-3.5 w-3.5 mr-1" />
                                Upload 8K
                              </Button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </Card>
            </>
          )}

          {/* ═══════════ PRICING & MULTI-CURRENCY PANEL ═══════════ */}
          {activeNav === "pricing" && (
            <div className="max-w-4xl space-y-6">
              <Card className="bg-white/80 dark:bg-slate-900/60 border border-slate-200/90 dark:border-white/10 backdrop-blur-2xl rounded-3xl shadow-2xl p-6 sm:p-8">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-white/10 pb-6">
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                      <CreditCard className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
                      Resolution Tier Pricing Rates
                    </h3>
                    <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">
                      Set base rates for Web (~2K), 4K Ultra HD, and 8K Print-Ready in USD, PKR, and INR.
                    </p>
                  </div>

                  <Button
                    onClick={savePricing}
                    disabled={isSavingPricing}
                    className="bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 text-white rounded-xl font-bold text-xs px-6 h-11 shadow-lg shadow-cyan-500/20"
                  >
                    {isSavingPricing ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-1.5" />
                    ) : (
                      <Save className="h-4 w-4 mr-1.5" />
                    )}
                    Save Pricing Changes
                  </Button>
                </div>

                {pricingMessage && (
                  <div
                    className={`mt-4 p-4 rounded-2xl text-xs font-semibold flex items-center gap-2 ${
                      pricingMessage.type === "success"
                        ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400"
                        : "bg-red-500/10 border border-red-500/20 text-red-700 dark:text-red-400"
                    }`}
                  >
                    <CheckCircle2 className="h-4 w-4 shrink-0" />
                    {pricingMessage.text}
                  </div>
                )}

                <div className="space-y-6 mt-6">
                  {pricing.map((tier) => (
                    <div key={tier.id} className="p-6 rounded-2xl bg-slate-50/80 dark:bg-slate-950/60 border border-slate-200 dark:border-white/10 space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-base text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                          {tier.id === "web" && "Web & Social (~2000px)"}
                          {tier.id === "4k" && "4K Ultra HD (~4000px)"}
                          {tier.id === "8k" && "8K Print-Ready (~8000px)"}
                        </span>
                        <Badge variant="outline" className="font-mono text-cyan-700 dark:text-cyan-400 border-cyan-500/30 text-xs uppercase">
                          Tier: {tier.id}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="space-y-1.5">
                          <Label className="text-xs text-slate-600 dark:text-slate-400 font-semibold">USD Price ($)</Label>
                          <Input
                            type="number"
                            step="0.01"
                            value={tier.usd_price}
                            onChange={(e) => handlePriceChange(tier.id, "usd_price", parseFloat(e.target.value) || 0)}
                            className="bg-white dark:bg-slate-900/80 border-slate-200 dark:border-white/10 text-slate-900 dark:text-white rounded-xl text-sm font-mono"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <Label className="text-xs text-slate-600 dark:text-slate-400 font-semibold">PKR Price (Rs.)</Label>
                          <Input
                            type="number"
                            step="1"
                            value={tier.pkr_price}
                            onChange={(e) => handlePriceChange(tier.id, "pkr_price", parseFloat(e.target.value) || 0)}
                            className="bg-white dark:bg-slate-900/80 border-slate-200 dark:border-white/10 text-slate-900 dark:text-white rounded-xl text-sm font-mono"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <Label className="text-xs text-slate-600 dark:text-slate-400 font-semibold">INR Price (₹)</Label>
                          <Input
                            type="number"
                            step="1"
                            value={tier.inr_price}
                            onChange={(e) => handlePriceChange(tier.id, "inr_price", parseFloat(e.target.value) || 0)}
                            className="bg-white dark:bg-slate-900/80 border-slate-200 dark:border-white/10 text-slate-900 dark:text-white rounded-xl text-sm font-mono"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Optional Supabase SQL Database Migration Helper */}
                <div className="mt-8 pt-6 border-t border-slate-100 dark:border-white/10">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300">
                      <Terminal className="h-4 w-4 text-cyan-600 dark:text-cyan-400" />
                      Supabase SQL Table Schema (Optional Database Sync)
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={copySql}
                      className="h-8 px-3 text-xs rounded-xl border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-900 flex items-center gap-1.5"
                    >
                      {copiedSql ? (
                        <>
                          <Check className="h-3.5 w-3.5 text-emerald-500" />
                          <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Copied SQL</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-3.5 w-3.5 text-slate-500" />
                          <span>Copy SQL Query</span>
                        </>
                      )}
                    </Button>
                  </div>
                  <pre className="p-4 rounded-2xl bg-slate-900 text-slate-300 text-xs font-mono overflow-x-auto border border-slate-800">
                    {SUPABASE_PRICING_SQL}
                  </pre>
                  <p className="text-[11px] text-slate-500 mt-2">
                    Pricing changes save immediately in your active workspace store. Paste the SQL query into your Supabase Dashboard &gt; SQL Editor to persist them in Postgres.
                  </p>
                </div>
              </Card>
            </div>
          )}

          {/* ═══════════ SETTINGS PANEL ═══════════ */}
          {activeNav === "settings" && (
            <div className="max-w-4xl space-y-6">
              <Card className="bg-white/80 dark:bg-slate-900/60 border border-slate-200/90 dark:border-white/10 backdrop-blur-2xl rounded-3xl shadow-2xl p-6 sm:p-8">
                <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2 border-b border-slate-100 dark:border-white/10 pb-4">
                  <Database className="h-5 w-5 text-violet-600 dark:text-violet-400" />
                  System Health & Infrastructure Overview
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
                  <div className="p-5 rounded-2xl bg-slate-50/80 dark:bg-slate-950/60 border border-slate-200 dark:border-white/10 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase">Storage: Raw Uploads</span>
                      <Badge className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-[10px] border-emerald-500/30">Active</Badge>
                    </div>
                    <p className="text-sm font-bold text-slate-900 dark:text-slate-200">raw-uploads (25MB Limit)</p>
                    <p className="text-xs text-slate-500">Bypasses client RLS via server upload router.</p>
                  </div>

                  <div className="p-5 rounded-2xl bg-slate-50/80 dark:bg-slate-950/60 border border-slate-200 dark:border-white/10 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase">Storage: Deliverables</span>
                      <Badge className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-[10px] border-emerald-500/30">Active</Badge>
                    </div>
                    <p className="text-sm font-bold text-slate-900 dark:text-slate-200">upscaled-outputs (Public / Signed)</p>
                    <p className="text-xs text-slate-500">Supports 8K renders with temporary signed download URLs.</p>
                  </div>

                  <div className="p-5 rounded-2xl bg-slate-50/80 dark:bg-slate-950/60 border border-slate-200 dark:border-white/10 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase">Payment Engine</span>
                      <Badge className="bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 text-[10px] border-cyan-500/30">Stripe / Sandbox</Badge>
                    </div>
                    <p className="text-sm font-bold text-slate-900 dark:text-slate-200">Stripe API (2025-02-24.acacia)</p>
                    <p className="text-xs text-slate-500">Includes automatic sandbox fallback for test checkouts.</p>
                  </div>

                  <div className="p-5 rounded-2xl bg-slate-50/80 dark:bg-slate-950/60 border border-slate-200 dark:border-white/10 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase">Admin Email Access</span>
                      <Badge className="bg-violet-500/15 text-violet-600 dark:text-violet-400 text-[10px] border-violet-500/30">Authorized</Badge>
                    </div>
                    <p className="text-sm font-bold text-slate-900 dark:text-slate-200">{adminEmail || "wetrips.co@gmail.com"}</p>
                    <p className="text-xs text-slate-500">Full admin rights granted by default.</p>
                  </div>
                </div>
              </Card>
            </div>
          )}
        </main>
      </div>

      {/* ── Deliverable Upload Modal ── */}
      <Dialog open={uploadModalOpen} onOpenChange={setUploadModalOpen}>
        <DialogContent className="bg-white dark:bg-slate-950 border-slate-200 dark:border-white/10 text-slate-900 dark:text-slate-50 max-w-md rounded-3xl p-6 shadow-2xl backdrop-blur-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold flex items-center gap-2 text-slate-900 dark:text-slate-100">
              <Upload className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
              Upload Finished 8K Deliverable
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Order ID: <span className="font-mono text-cyan-600 dark:text-cyan-300">{uploadOrder?.id}</span>
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 my-4">
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-white/10 text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Target Fidelity:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200 uppercase">{uploadOrder?.target_resolution}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Customer:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{uploadOrder?.guest_email || "Guest"}</span>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Select Upscaled High-Res Image</Label>
              <Input
                type="file"
                accept="image/*"
                onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                className="bg-white dark:bg-slate-900 border-slate-200 dark:border-white/10 text-xs file:text-cyan-600 dark:file:text-cyan-400 file:bg-cyan-50 dark:file:bg-cyan-950 file:border-0 file:rounded-lg file:px-3 file:py-1 rounded-xl cursor-pointer"
              />
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setUploadModalOpen(false)}
              className="border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-xl text-xs"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleModalUpload}
              disabled={!uploadFile || isUploading}
              className="bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 text-white rounded-xl text-xs font-bold shadow-md shadow-cyan-500/20"
            >
              {isUploading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-1.5" />
                  Uploading…
                </>
              ) : (
                <>
                  <Check className="h-4 w-4 mr-1.5" />
                  Complete & Notify Order
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
