"use client";

import React, { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { ImageUploader } from "@/components/dashboard/image-uploader";
import { History, Download, Shield, LogOut, Loader2, AlertCircle, CheckCircle2, Image as ImageIcon, PartyPopper } from "lucide-react";
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

  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTier = searchParams.get('tier') || '4k';
  const supabase = createClient();

  // Payment success celebration
  useEffect(() => {
    const payment = searchParams.get('payment');
    if (payment === 'success') {
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#22d3ee', '#8b5cf6', '#ffffff']
      });
      // Clean URL
      router.replace('/dashboard', undefined);
    }
  }, [searchParams, router]);

  // Real-time order updates
  useEffect(() => {
    const channel = supabase
      .channel('dashboard-orders')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setOrders(prev => [payload.new as Order, ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            setOrders(prev => prev.map(o => o.id === payload.new.id ? payload.new as Order : o));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, user.id]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  };

  const loadThumbnail = async (orderId: string, filePath: string) => {
    if (thumbnails[orderId]) return;
    try {
      const { data } = await supabase.storage
        .from('raw-uploads')
        .createSignedUrl(filePath, 120);
      if (data?.signedUrl) {
        setThumbnails(prev => ({ ...prev, [orderId]: data.signedUrl }));
      }
    } catch (err) {
      console.error("Failed to load thumbnail", err);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed': return <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/50"><CheckCircle2 className="h-3 w-3 mr-1" /> Completed</Badge>;
      case 'processing': return <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-500/50"><Loader2 className="h-3 w-3 mr-1 animate-spin" /> Processing</Badge>;
      case 'failed': return <Badge variant="destructive" className="bg-red-500/20 text-red-400 border-red-500/50"><AlertCircle className="h-3 w-3 mr-1" /> Failed</Badge>;
      default: return <Badge variant="outline" className="text-amber-400 border-amber-500/50 bg-amber-500/10">Pending</Badge>;
    }
  };

  const handleDownload = async (order: Order) => {
    if (!order.upscaled_image_url) return;
    try {
      const { data } = await supabase.storage
        .from('upscaled-outputs')
        .createSignedUrl(order.upscaled_image_url, 300);
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
    <div className="min-h-screen bg-slate-950 text-slate-50 font-sans selection:bg-cyan-900/50 flex flex-col">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
        <div className="container max-w-7xl mx-auto px-4 sm:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-cyan-500 to-violet-600 p-[1px]">
              <div className="h-full w-full bg-slate-950 rounded-[7px] flex items-center justify-center">
                <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-violet-500 text-xs">PX</span>
              </div>
            </div>
            <span className="font-bold text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-slate-100 to-slate-400 hidden sm:block">
              PixelRes AI Workspace
            </span>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-500 hidden md:block">{user.email}</span>
            <Link href="/admin">
              <Button size="sm" variant="ghost" className="text-slate-400 hover:text-slate-200">
                <Shield className="h-4 w-4 mr-1 text-violet-400" /> Admin
              </Button>
            </Link>
            <Button size="sm" variant="outline" onClick={handleLogout} className="border-slate-700 hover:bg-slate-800 text-slate-300">
              <LogOut className="h-4 w-4 mr-2" /> Sign Out
            </Button>
          </div>
        </div>
      </header>

      {/* Payment Success Banner */}
      {searchParams.get('payment') === 'success' && (
        <div className="bg-emerald-500/10 border-b border-emerald-500/30 px-4 py-3 text-center">
          <p className="text-emerald-400 font-medium flex items-center justify-center gap-2">
            <PartyPopper className="h-5 w-5" />
            Payment successful! Your image is now being processed.
          </p>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 container max-w-7xl mx-auto p-4 sm:p-8 grid grid-cols-1 xl:grid-cols-12 gap-8">

        {/* Left Column: Uploader */}
        <div className="xl:col-span-7">
           <ImageUploader countryCode={countryCode} initialTier={initialTier} />
        </div>

        {/* Right Column: Order History */}
        <div className="xl:col-span-5 space-y-6">
          <Card className="bg-slate-900 border-slate-800 h-full flex flex-col shadow-xl">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between text-lg text-slate-100">
                <span className="flex items-center gap-2">
                  <History className="h-5 w-5 text-cyan-400" /> Recent Enhancements
                </span>
                <Badge variant="outline" className="text-xs border-slate-700 text-slate-400">
                  {orders.length} Orders
                </Badge>
              </CardTitle>
              <CardDescription className="text-slate-400">
                Track status and download your upscaled high-resolution renders.
              </CardDescription>
            </CardHeader>

            <CardContent className="flex-1 space-y-4 overflow-y-auto max-h-[600px] pr-2 custom-scrollbar">
              {orders.length === 0 ? (
                <div className="text-center py-12 px-4 border border-slate-800 border-dashed rounded-xl bg-slate-950/30">
                  <p className="text-slate-400 text-sm">No enhancement orders yet.</p>
                  <p className="text-slate-500 text-xs mt-1">Upload an image to get started.</p>
                </div>
              ) : (
                orders.map((order) => (
                  <div
                    key={order.id}
                    className="p-4 rounded-xl border border-slate-800 bg-slate-950/50 hover:bg-slate-900 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 group"
                  >
                    <div className="flex items-center gap-3 w-full sm:w-auto">
                      {/* Thumbnail */}
                      <div 
                        className="h-14 w-14 rounded-lg bg-slate-800 border border-slate-700 overflow-hidden relative flex-shrink-0 flex items-center justify-center cursor-pointer hover:ring-2 hover:ring-cyan-500/50 transition-all"
                        onClick={() => loadThumbnail(order.id, order.original_image_url)}
                        title="Click to load preview"
                      >
                        {thumbnails[order.id] ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={thumbnails[order.id]} alt="preview" className="w-full h-full object-cover" />
                        ) : (
                          <ImageIcon className="h-6 w-6 text-slate-500 group-hover:text-slate-400" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-sm text-slate-200 flex items-center gap-2 truncate">
                          Order {order.id.substring(0, 8)}
                        </div>
                        <div className="text-xs text-slate-400 flex flex-wrap items-center gap-2 mt-1">
                          <span className="text-cyan-400 font-mono uppercase bg-cyan-950/50 px-1.5 rounded">{order.target_resolution}</span>
                          <span>•</span>
                          <span className="capitalize">{order.enhancement_type}</span>
                          <span>•</span>
                          <span className="text-slate-500">{formatPrice(order.amount_paid, order.currency)}</span>
                        </div>
                        <div className="text-[11px] text-slate-500 mt-1">{formatDate(order.created_at)}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                      {getStatusBadge(order.status)}

                      <Button
                        size="icon"
                        variant="ghost"
                        className={`h-8 w-8 rounded-full transition-colors ${order.status === 'completed' ? 'text-cyan-400 hover:text-cyan-300 hover:bg-cyan-950' : 'text-slate-600 cursor-not-allowed'}`}
                        disabled={order.status !== 'completed'}
                        onClick={() => handleDownload(order)}
                        title={order.status === 'completed' ? "Download Output" : "Waiting for completion..."}
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
