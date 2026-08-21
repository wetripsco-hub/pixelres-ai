"use client";

import React, { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { ImageUploader } from "@/components/dashboard/image-uploader";
import { History, Download, Shield, LogOut, Loader2, AlertCircle, CheckCircle2, Image as ImageIcon, PartyPopper, RefreshCw, Sparkles, User, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import confetti from "canvas-confetti";

interface Order {
  id: string;
  original_image_url: string;
  upscaled_image_url: string | null;
  target_resolution: string;
  enhancement_type: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  created_at: string;
  currency: string;
  amount_paid: number;
}

interface DashboardClientProps {
  countryCode: string;
  initialOrders: Order[];
  user: { id: string; email: string };
}

export function DashboardClient({ countryCode, initialOrders, user }: DashboardClientProps) {
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [thumbnails, setThumbnails] = useState<Record<string, string>>({});
  const [isRefreshing, setIsRefreshing] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTier = searchParams.get('tier') || '4k';
  const supabase = createClient();

  // Payment success celebration & auto-claim
  useEffect(() => {
    const payment = searchParams.get('payment');
    const orderId = searchParams.get('order_id');

    if (payment === 'success') {
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#22d3ee', '#8b5cf6', '#ffffff']
      });
    }

    if (payment === 'success' || orderId) {
      fetchFreshOrders(orderId || undefined);
    }
  }, [searchParams]);

  useEffect(() => {
    setOrders(initialOrders);
  }, [initialOrders]);

  // Real-time order updates on public:orders
  useEffect(() => {
    const channel = supabase
      .channel('dashboard-orders')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders',
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const newOrder = payload.new as Order;
            setOrders(prev => [newOrder, ...prev.filter(o => o.id !== newOrder.id)]);
          } else if (payload.eventType === 'UPDATE') {
            const updatedOrder = payload.new as Order;
            setOrders(prev => prev.map(o => o.id === updatedOrder.id ? updatedOrder : o));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  const fetchFreshOrders = async (orderId?: string) => {
    setIsRefreshing(true);
    try {
      const res = await fetch('/api/orders/claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId }),
      });
      const data = await res.json();
      if (data.orders) {
        setOrders(data.orders);
      }
    } catch (err) {
      console.error("Failed to fetch fresh orders:", err);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  };

  const loadThumbnail = async (orderId: string, filePath: string) => {
    if (thumbnails[orderId]) return;
    try {
      const res = await fetch("/api/storage/signed-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bucket: "raw-uploads", path: filePath, expiresIn: 300 }),
      });
      const data = await res.json();
      if (data?.signedUrl) {
        setThumbnails(prev => ({ ...prev, [orderId]: data.signedUrl }));
      }
    } catch (err) {
      console.error("Failed to load thumbnail", err);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed': return <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/40 text-xs font-semibold"><CheckCircle2 className="h-3 w-3 mr-1" /> Completed</Badge>;
      case 'processing': return <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-500/40 text-xs font-semibold"><Loader2 className="h-3 w-3 mr-1 animate-spin" /> Processing</Badge>;
      case 'failed': return <Badge variant="destructive" className="bg-red-500/20 text-red-400 border-red-500/40 text-xs font-semibold"><AlertCircle className="h-3 w-3 mr-1" /> Failed</Badge>;
      default: return <Badge variant="outline" className="text-amber-400 border-amber-500/40 bg-amber-500/10 text-xs font-semibold">Pending</Badge>;
    }
  };

  const handleDownload = async (order: Order) => {
    if (!order.upscaled_image_url) return;
    try {
      const res = await fetch("/api/storage/signed-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bucket: "upscaled-outputs", path: order.upscaled_image_url, expiresIn: 600 }),
      });
      const data = await res.json();
      if (data?.signedUrl) {
        window.open(data.signedUrl, '_blank');
      }
    } catch (e) {
      console.error("Download failed", e);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  const formatPrice = (amount: number, currency: string) => {
    if (currency === 'USD') return `$${amount.toFixed(2)}`;
    if (currency === 'PKR') return `Rs. ${amount.toLocaleString()}`;
    if (currency === 'INR') return `₹${amount.toLocaleString()}`;
    return `${amount} ${currency}`;
  };

  return (
    <div className="min-h-screen bg-[#07090E] text-slate-50 font-sans selection:bg-cyan-900/50 flex flex-col relative overflow-hidden">
      {/* Background Ambient Lighting */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-15%] left-[-10%] w-[50%] h-[50%] rounded-full bg-cyan-600/12 blur-[140px]" />
        <div className="absolute bottom-[-15%] right-[-10%] w-[50%] h-[50%] rounded-full bg-violet-600/12 blur-[140px]" />
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff08_1px,transparent_1px)] [background-size:24px_24px] opacity-35" />
      </div>

      {/* Header */}
      <header className="border-b border-white/10 bg-slate-950/70 backdrop-blur-xl sticky top-0 z-50">
        <div className="container max-w-7xl mx-auto px-4 sm:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-cyan-500 to-violet-600 p-[1px] shadow-lg shadow-cyan-500/20 group-hover:shadow-cyan-500/40 transition-all">
                <div className="h-full w-full bg-[#07090E] rounded-[10px] flex items-center justify-center">
                  <Sparkles className="h-4 w-4 text-cyan-400" />
                </div>
              </div>
              <span className="font-extrabold text-lg tracking-tight text-slate-100 hidden sm:block">
                PixelRes <span className="bg-gradient-to-r from-cyan-400 to-violet-400 bg-clip-text text-transparent">Workspace</span>
              </span>
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/60 border border-white/10 text-xs text-slate-300">
              <User className="h-3.5 w-3.5 text-cyan-400" />
              <span>{user.email}</span>
            </div>
            <Link href="/studio">
              <Button size="sm" variant="ghost" className="text-slate-300 hover:text-white text-xs font-semibold">
                Studio
              </Button>
            </Link>
            <Link href="/admin">
              <Button size="sm" variant="ghost" className="text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-1">
                <Shield className="h-3.5 w-3.5 text-violet-400" /> Admin
              </Button>
            </Link>
            <Button size="sm" variant="outline" onClick={handleLogout} className="border-white/10 bg-slate-900/60 hover:bg-slate-800 text-slate-300 hover:text-white rounded-xl text-xs font-semibold">
              <LogOut className="h-3.5 w-3.5 mr-1.5" /> Sign Out
            </Button>
          </div>
        </div>
      </header>

      {/* Payment Success Banner */}
      {searchParams.get('payment') === 'success' && (
        <div className="bg-emerald-500/10 border-b border-emerald-500/20 px-4 py-3 text-center z-10 backdrop-blur-md">
          <p className="text-emerald-400 font-semibold text-sm flex items-center justify-center gap-2">
            <PartyPopper className="h-4 w-4" />
            Payment confirmed! Your neural upscale is currently processing.
          </p>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 container max-w-7xl mx-auto p-4 sm:p-8 grid grid-cols-1 xl:grid-cols-12 gap-8 relative z-10">
        {/* Left Column: Uploader */}
        <div className="xl:col-span-7">
           <ImageUploader countryCode={countryCode} initialTier={initialTier} />
        </div>

        {/* Right Column: Order History */}
        <div className="xl:col-span-5 space-y-6">
          <Card className="bg-slate-900/60 border-white/10 backdrop-blur-2xl rounded-[2rem] h-full flex flex-col shadow-2xl overflow-hidden">
            <CardHeader className="p-6 border-b border-white/10">
              <CardTitle className="flex items-center justify-between text-lg text-slate-100 font-bold">
                <span className="flex items-center gap-2">
                  <History className="h-5 w-5 text-cyan-400" /> Recent Enhancements
                </span>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => fetchFreshOrders()}
                    disabled={isRefreshing}
                    className="h-8 px-2.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl"
                    title="Refresh Orders"
                  >
                    <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? 'animate-spin text-cyan-400' : ''}`} />
                  </Button>
                  <Badge variant="outline" className="text-xs border-white/10 bg-slate-950/60 text-slate-300 font-mono">
                    {orders.length} Orders
                  </Badge>
                </div>
              </CardTitle>
              <CardDescription className="text-slate-400 text-xs">
                Track live status and download your completed upscaled renders.
              </CardDescription>
            </CardHeader>

            <CardContent className="flex-1 p-6 space-y-4 overflow-y-auto max-h-[620px] pr-2 custom-scrollbar">
              {orders.length === 0 ? (
                <div className="text-center py-16 px-4 border border-dashed border-white/10 rounded-2xl bg-slate-950/40">
                  <ImageIcon className="h-10 w-10 text-slate-600 mx-auto mb-3" />
                  <p className="text-slate-300 text-sm font-semibold">No enhancement orders yet.</p>
                  <p className="text-slate-500 text-xs mt-1">Upload an image on the left to start upscaling.</p>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => fetchFreshOrders()}
                    disabled={isRefreshing}
                    className="mt-4 border-white/10 text-slate-300 hover:bg-slate-800 text-xs rounded-xl"
                  >
                    <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${isRefreshing ? 'animate-spin text-cyan-400' : ''}`} />
                    Refresh Orders
                  </Button>
                </div>
              ) : (
                orders.map((order) => (
                  <div
                    key={order.id}
                    className="p-4 rounded-2xl border border-white/10 bg-slate-950/60 hover:bg-slate-950/90 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 group shadow-sm"
                  >
                    <div className="flex items-center gap-3 w-full sm:w-auto">
                      {/* Thumbnail */}
                      <div 
                        className="h-14 w-14 rounded-xl bg-slate-800 border border-white/10 overflow-hidden relative flex-shrink-0 flex items-center justify-center cursor-pointer hover:ring-2 hover:ring-cyan-500/50 transition-all"
                        onClick={() => loadThumbnail(order.id, order.original_image_url)}
                        title="Click to load preview"
                      >
                        {thumbnails[order.id] ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={thumbnails[order.id]} alt="preview" className="w-full h-full object-cover" />
                        ) : (
                          <ImageIcon className="h-5 w-5 text-slate-500 group-hover:text-slate-400" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-xs text-slate-200 flex items-center gap-2 truncate">
                          Order {order.id.substring(0, 8)}
                        </div>
                        <div className="text-[11px] text-slate-400 flex flex-wrap items-center gap-2 mt-1">
                          <span className="text-cyan-400 font-mono uppercase bg-cyan-950/50 px-1.5 py-0.5 rounded border border-cyan-500/20">{order.target_resolution}</span>
                          <span>•</span>
                          <span className="capitalize">{order.enhancement_type}</span>
                          <span>•</span>
                          <span className="text-slate-400 font-mono font-medium">{formatPrice(order.amount_paid, order.currency)}</span>
                        </div>
                        <div className="text-[10px] text-slate-500 mt-1">{formatDate(order.created_at)}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                      {getStatusBadge(order.status)}

                      <Button
                        size="icon"
                        variant="ghost"
                        className={`h-9 w-9 rounded-xl transition-colors ${order.status === 'completed' ? 'text-cyan-400 hover:text-cyan-300 hover:bg-cyan-950/80 border border-cyan-500/30' : 'text-slate-600 cursor-not-allowed'}`}
                        disabled={order.status !== 'completed'}
                        onClick={() => handleDownload(order)}
                        title={order.status === 'completed' ? "Download Output" : "Processing deliverable..."}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
