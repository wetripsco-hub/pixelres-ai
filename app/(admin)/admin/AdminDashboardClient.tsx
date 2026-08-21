"use client";

import React, { useState, useRef, useEffect } from "react";
import { formatDistanceToNow } from "date-fns";
import { generateDownloadUrl, updateOrderStatus, generateUploadUrl, finalizeOrder, generateThumbnailUrl, uploadDeliverable } from "./actions";
import { Shield, Download, Upload, CheckCircle2, Loader2, AlertCircle, Settings, FileImage, User, Image as ImageIcon, Save, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";

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

export function AdminDashboardClient({ 
  initialOrders, 
  metrics,
  initialPricing 
}: { 
  initialOrders: Order[], 
  metrics: Metrics,
  initialPricing: PricingRow[]
}) {
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [isProcessingId, setIsProcessingId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>("orders");
  const [orderFilter, setOrderFilter] = useState<string>("all");

  // Pricing State
  const [pricing, setPricing] = useState<PricingRow[]>(initialPricing);
  const [isSavingPricing, setIsSavingPricing] = useState(false);
  const [pricingMessage, setPricingMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);

  // Upload Modal State
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [uploadOrder, setUploadOrder] = useState<Order | null>(null);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Thumbnails Cache
  const [thumbnails, setThumbnails] = useState<Record<string, string>>({});

  const filteredOrders = orders.filter(o => orderFilter === 'all' || o.status === orderFilter);

  const loadThumbnail = async (orderId: string, filePath: string) => {
    if (thumbnails[orderId]) return; // already loaded
    try {
      const url = await generateThumbnailUrl(filePath);
      setThumbnails(prev => ({ ...prev, [orderId]: url }));
    } catch (err) {
      console.error("Failed to load thumbnail", err);
    }
  };

  const handleDownloadOriginal = async (orderId: string, filePath: string) => {
    try {
      setIsProcessingId(orderId);
      const signedUrl = await generateDownloadUrl(filePath);
      window.open(signedUrl, '_blank');
    } catch (error: any) {
      alert(error.message);
    } finally {
      setIsProcessingId(null);
    }
  };

  const handleStatusChange = async (orderId: string, status: 'pending' | 'processing' | 'failed') => {
    try {
      setIsProcessingId(orderId);
      await updateOrderStatus(orderId, status);
      setOrders(orders.map(o => o.id === orderId ? { ...o, status } : o));
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
      formData.append('file', uploadFile);

      const res = await uploadDeliverable(uploadOrder.id, uploadOrder.user_id, formData);

      setOrders(orders.map(o => o.id === uploadOrder.id ? {
        ...o,
        status: 'completed',
        upscaled_image_url: res.filePath,
        completed_at: new Date().toISOString()
      } : o));

      setUploadModalOpen(false);
      alert("Deliverable uploaded and order completed successfully.");

    } catch (error: any) {
      alert(`Upload failed: ${error.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSavePricing = async () => {
    setIsSavingPricing(true);
    setPricingMessage(null);
    try {
      const res = await fetch('/api/admin/pricing', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tiers: pricing })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to save pricing');
      }
      setPricingMessage({ type: 'success', text: 'Pricing settings saved successfully.' });
      setTimeout(() => setPricingMessage(null), 3000);
    } catch (err: any) {
      setPricingMessage({ type: 'error', text: err.message });
    } finally {
      setIsSavingPricing(false);
    }
  };

  const updatePricingRow = (id: string, field: 'usd_price' | 'pkr_price' | 'inr_price', value: string) => {
    const numValue = parseFloat(value);
    if (isNaN(numValue)) return;
    setPricing(pricing.map(row => row.id === id ? { ...row, [field]: numValue } : row));
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed': return <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/50">Completed</Badge>;
      case 'processing': return <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-500/50">Processing</Badge>;
      case 'failed': return <Badge variant="destructive" className="bg-red-500/20 text-red-400 border-red-500/50">Failed</Badge>;
      default: return <Badge variant="outline" className="text-slate-400 border-slate-700">Pending</Badge>;
    }
  };

  const getResolutionBadge = (res: string) => {
    if (res === 'web') return <Badge variant="outline" className="text-slate-300 border-slate-600 bg-slate-800/50">WEB</Badge>;
    if (res === '4k') return <Badge variant="outline" className="text-cyan-300 border-cyan-600 bg-cyan-900/30">4K</Badge>;
    if (res === '8k') return <Badge variant="outline" className="text-violet-300 border-violet-600 bg-violet-900/30">8K</Badge>;
    return <Badge variant="outline">{res}</Badge>;
  };

  return (
    <div className="space-y-8">
      {/* Metrics Bar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="p-6">
            <div className="text-sm font-medium text-slate-400 mb-1">Total Revenue</div>
            <div className="text-2xl font-bold text-emerald-400">${metrics.estimatedTotalUsd.toFixed(2)} USD</div>
            <div className="text-xs text-slate-500 mt-2 flex flex-col gap-0.5">
               <span>USD: ${metrics.totalUsdRevenue.toFixed(2)}</span>
               <span>PKR: Rs.{metrics.totalPkrRevenue.toLocaleString()}</span>
               <span>INR: ₹{metrics.totalInrRevenue.toLocaleString()}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="p-6">
            <div className="text-sm font-medium text-slate-400 mb-1">Pending Orders</div>
            <div className="text-2xl font-bold text-amber-400">{metrics.pendingJobs}</div>
            <div className="text-xs text-slate-500 mt-2">Awaiting AI processing</div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="p-6">
            <div className="text-sm font-medium text-slate-400 mb-1">Completed Deliverables</div>
            <div className="text-2xl font-bold text-cyan-400">{metrics.completedJobs}</div>
            <div className="text-xs text-slate-500 mt-2">Successfully upscaled</div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800">
           <CardContent className="p-6 text-center">
             <div className="text-sm font-medium text-slate-400 mb-1">Total Orders</div>
             <div className="text-2xl font-bold text-violet-400">{metrics.totalOrders}</div>
             <div className="text-xs text-slate-500 mt-2 flex items-center justify-center gap-1"><Shield className="h-3 w-3" /> Admin Active</div>
           </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="bg-slate-950 border border-slate-800 mb-4">
          <TabsTrigger value="orders">Orders Management</TabsTrigger>
          <TabsTrigger value="pricing">Pricing Configuration</TabsTrigger>
        </TabsList>

        <TabsContent value="orders" className="space-y-4">
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader className="pb-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <CardTitle>Order Management</CardTitle>
                  <CardDescription>Fulfill enhancement requests and manage order status.</CardDescription>
                </div>

                <div className="flex gap-2">
                  {['all', 'pending', 'processing', 'completed'].map(f => (
                    <Button 
                      key={f} 
                      variant={orderFilter === f ? 'default' : 'outline'} 
                      size="sm"
                      onClick={() => setOrderFilter(f)}
                      className={orderFilter === f ? 'bg-cyan-600 hover:bg-cyan-500 text-white' : 'bg-slate-900 border-slate-700 text-slate-400'}
                    >
                      {f.charAt(0).toUpperCase() + f.slice(1)}
                    </Button>
                  ))}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto rounded-md border border-slate-800">
                <table className="w-full text-sm text-left text-slate-300">
                  <thead className="text-xs text-slate-400 uppercase bg-slate-950/80 border-b border-slate-800">
                    <tr>
                      <th className="px-4 py-4 font-medium">Order Details</th>
                      <th className="px-4 py-4 font-medium">Customer</th>
                      <th className="px-4 py-4 font-medium">Original Image</th>
                      <th className="px-4 py-4 font-medium">Resolution</th>
                      <th className="px-4 py-4 font-medium">Status</th>
                      <th className="px-4 py-4 font-medium text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOrders.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="text-center py-12 text-slate-500">No orders found.</td>
                      </tr>
                    ) : (
                      filteredOrders.map((order) => {
                        const isBusy = isProcessingId === order.id;
                        return (
                          <tr key={order.id} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors">
                            <td className="px-4 py-3">
                              <div className="font-mono text-xs text-slate-200">{order.id.substring(0, 8)}</div>
                              <div className="text-[11px] text-slate-500 mt-1">
                                {formatDistanceToNow(new Date(order.created_at), { addSuffix: true })}
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2 text-slate-300 text-xs">
                                <User className="h-3 w-3 text-slate-500" />
                                {order.guest_email || order.user_id?.substring(0, 8) || 'Guest'}
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-3">
                                <div 
                                  className="h-10 w-10 bg-slate-800 rounded flex items-center justify-center overflow-hidden cursor-pointer hover:ring-2 hover:ring-cyan-500 transition-all group"
                                  onClick={() => loadThumbnail(order.id, order.original_image_url)}
                                  title="Load Thumbnail"
                                >
                                  {thumbnails[order.id] ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img src={thumbnails[order.id]} alt="thumb" className="w-full h-full object-cover" />
                                  ) : (
                                    <ImageIcon className="h-4 w-4 text-slate-500 group-hover:text-slate-300" />
                                  )}
                                </div>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-8 px-2 text-slate-400 hover:text-white hover:bg-slate-800"
                                  onClick={() => handleDownloadOriginal(order.id, order.original_image_url)}
                                  disabled={isBusy}
                                  title="Download Original"
                                >
                                  <Download className="h-4 w-4" />
                                </Button>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              {getResolutionBadge(order.target_resolution)}
                            </td>
                            <td className="px-4 py-3">
                              {getStatusBadge(order.status)}
                            </td>
                            <td className="px-4 py-3 text-right">
                              <div className="flex items-center justify-end gap-2">
                                {/* Mark Processing */}
                                {order.status === 'pending' && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="h-8 px-2 bg-slate-900 border-slate-700 text-cyan-400 hover:text-cyan-300 hover:bg-cyan-950/30"
                                    onClick={() => handleStatusChange(order.id, 'processing')}
                                    disabled={isBusy}
                                    title="Mark as Processing"
                                  >
                                    <Settings className="h-4 w-4" />
                                  </Button>
                                )}

                                {/* Upload Deliverable Modal Trigger */}
                                {(order.status === 'pending' || order.status === 'processing') && (
                                  <Button
                                    size="sm"
                                    className="h-8 px-3 bg-gradient-to-r from-cyan-600 to-violet-600 hover:from-cyan-500 hover:to-violet-500 text-white shadow-lg"
                                    onClick={() => openUploadModal(order)}
                                    disabled={isBusy}
                                  >
                                    <Upload className="h-4 w-4 mr-1.5" /> Upload Output
                                  </Button>
                                )}

                                {/* Re-upload if completed */}
                                {order.status === 'completed' && (
                                   <Button
                                   size="sm"
                                   variant="ghost"
                                   className="h-8 px-2 text-slate-500 hover:text-violet-400 hover:bg-slate-800"
                                   onClick={() => openUploadModal(order)}
                                   disabled={isBusy}
                                   title="Re-upload Deliverable"
                                 >
                                   <FileImage className="h-4 w-4" />
                                 </Button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pricing" className="space-y-4">
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader>
              <CardTitle>Multi-Currency Pricing</CardTitle>
              <CardDescription>Configure the base prices for each resolution tier across all supported currencies. Changes will reflect immediately on the frontend.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-6">
                <div className="rounded-md border border-slate-800 overflow-hidden">
                  <table className="w-full text-sm text-left text-slate-300">
                    <thead className="text-xs text-slate-400 uppercase bg-slate-950/80 border-b border-slate-800">
                      <tr>
                        <th className="px-6 py-4 font-medium">Resolution Tier</th>
                        <th className="px-6 py-4 font-medium">USD ($)</th>
                        <th className="px-6 py-4 font-medium">PKR (Rs.)</th>
                        <th className="px-6 py-4 font-medium">INR (₹)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {['web', '4k', '8k'].map((tierId) => {
                        const row = pricing.find(p => p.id === tierId);
                        if (!row) return null;
                        return (
                          <tr key={tierId} className="border-b border-slate-800/50 bg-slate-900/20">
                            <td className="px-6 py-4 font-medium text-slate-200 uppercase">{tierId}</td>
                            <td className="px-6 py-4">
                              <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">$</span>
                                <Input 
                                  type="number" 
                                  step="0.01" 
                                  value={row.usd_price} 
                                  onChange={(e) => updatePricingRow(tierId, 'usd_price', e.target.value)}
                                  className="pl-7 bg-slate-950 border-slate-700 h-9"
                                />
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-xs">Rs.</span>
                                <Input 
                                  type="number" 
                                  step="1" 
                                  value={row.pkr_price} 
                                  onChange={(e) => updatePricingRow(tierId, 'pkr_price', e.target.value)}
                                  className="pl-8 bg-slate-950 border-slate-700 h-9"
                                />
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">₹</span>
                                <Input 
                                  type="number" 
                                  step="1" 
                                  value={row.inr_price} 
                                  onChange={(e) => updatePricingRow(tierId, 'inr_price', e.target.value)}
                                  className="pl-7 bg-slate-950 border-slate-700 h-9"
                                />
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <div className="flex items-center justify-between mt-4">
                  <div>
                    {pricingMessage && (
                      <div className={`flex items-center gap-2 text-sm ${pricingMessage.type === 'success' ? 'text-emerald-400' : 'text-red-400'}`}>
                        {pricingMessage.type === 'success' ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                        {pricingMessage.text}
                      </div>
                    )}
                  </div>
                  <Button 
                    onClick={handleSavePricing} 
                    disabled={isSavingPricing}
                    className="bg-violet-600 hover:bg-violet-500 text-white min-w-[120px]"
                  >
                    {isSavingPricing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                    Save Pricing
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Upload Modal */}
      <Dialog open={uploadModalOpen} onOpenChange={setUploadModalOpen}>
        <DialogContent className="bg-slate-900 border-slate-800 text-slate-100 sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Upload Upscaled Deliverable</DialogTitle>
            <DialogDescription className="text-slate-400">
              Select the finished 8K/4K file to upload and complete this order.
            </DialogDescription>
          </DialogHeader>
          
          {uploadOrder && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4 text-sm bg-slate-950 p-4 rounded-lg border border-slate-800">
                <div>
                  <span className="text-slate-500 block mb-1">Order ID</span>
                  <span className="font-mono text-slate-300">{uploadOrder.id.substring(0, 8)}...</span>
                </div>
                <div>
                  <span className="text-slate-500 block mb-1">Target Res</span>
                  {getResolutionBadge(uploadOrder.target_resolution)}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="file-upload">Select Image File</Label>
                <Input 
                  id="file-upload" 
                  type="file" 
                  accept="image/jpeg, image/png, image/webp"
                  onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                  className="bg-slate-950 border-slate-700 text-slate-300 cursor-pointer"
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setUploadModalOpen(false)} disabled={isUploading} className="border-slate-700 text-slate-300 hover:bg-slate-800">
              Cancel
            </Button>
            <Button onClick={handleModalUpload} disabled={!uploadFile || isUploading} className="bg-cyan-600 hover:bg-cyan-500 text-white">
              {isUploading ? (
                <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Uploading...</>
              ) : (
                <><Upload className="h-4 w-4 mr-2" /> Complete Order</>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}
