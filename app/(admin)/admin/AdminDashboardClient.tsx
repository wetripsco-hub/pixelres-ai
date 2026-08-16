"use client";

import React, { useState, useRef } from "react";
import { formatDistanceToNow } from "date-fns";
import { generateDownloadUrl, updateOrderStatus, generateUploadUrl, finalizeOrder } from "./actions";
import { Shield, Download, Upload, CheckCircle2, Loader2, AlertCircle, Settings, FileImage } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { createClient } from "@/lib/supabase/client";

interface Order {
  id: string;
  user_id: string | null;
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
}

export function AdminDashboardClient({ initialOrders, metrics }: { initialOrders: Order[], metrics: Metrics }) {
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [isProcessingId, setIsProcessingId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>("all");

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingForOrderId, setUploadingForOrderId] = useState<string | null>(null);

  const filteredOrders = orders.filter(o => activeTab === 'all' || o.status === activeTab);

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

  const triggerUpload = (orderId: string) => {
    setUploadingForOrderId(orderId);
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    const orderId = uploadingForOrderId;

    if (!file || !orderId) return;

    const order = orders.find(o => o.id === orderId);
    if (!order) return;

    try {
      setIsProcessingId(orderId);
      const fileExt = file.name.split('.').pop() || 'jpg';

      // 1. Get signed upload URL
      const { signedUrl, token, filePath } = await generateUploadUrl(orderId, order.user_id || 'guest', fileExt);

      // 2. Upload file directly to Supabase using the signed URL
      const supabase = createClient();
      const { error: uploadError } = await supabase.storage
        .from('upscaled-outputs')
        .uploadToSignedUrl(filePath, token, file);

      if (uploadError) throw new Error(uploadError.message);

      // 3. Finalize order
      await finalizeOrder(orderId, filePath);

      setOrders(orders.map(o => o.id === orderId ? {
        ...o,
        status: 'completed',
        upscaled_image_url: filePath,
        completed_at: new Date().toISOString()
      } : o));

      alert("Deliverable uploaded and order completed successfully.");

    } catch (error: any) {
      alert(`Upload failed: ${error.message}`);
    } finally {
      setIsProcessingId(null);
      setUploadingForOrderId(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed': return <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/50">Completed</Badge>;
      case 'processing': return <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-500/50">Processing</Badge>;
      case 'failed': return <Badge variant="destructive" className="bg-red-500/20 text-red-400 border-red-500/50">Failed</Badge>;
      default: return <Badge variant="outline" className="text-slate-400 border-slate-700">Pending</Badge>;
    }
  };

  return (
    <div className="space-y-8">
      {/* Hidden file input for uploading deliverables */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept="image/jpeg, image/png, image/webp"
      />

      {/* Metrics Bar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="p-6">
            <div className="text-sm font-medium text-slate-400 mb-1">Estimated Total Revenue</div>
            <div className="text-2xl font-bold text-emerald-400">${metrics.estimatedTotalUsd.toFixed(2)} USD</div>
            <div className="text-xs text-slate-500 mt-2 flex gap-2">
               <span>USD: ${metrics.totalUsdRevenue.toFixed(2)}</span>
               <span>PKR: Rs.{metrics.totalPkrRevenue.toLocaleString()}</span>
               <span>INR: ₹{metrics.totalInrRevenue.toLocaleString()}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="p-6">
            <div className="text-sm font-medium text-slate-400 mb-1">Pending Jobs</div>
            <div className="text-2xl font-bold text-amber-400">{metrics.pendingJobs}</div>
            <div className="text-xs text-slate-500 mt-2">Awaiting AI processing</div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="p-6">
            <div className="text-sm font-medium text-slate-400 mb-1">Completed Deliveries</div>
            <div className="text-2xl font-bold text-cyan-400">{metrics.completedJobs}</div>
            <div className="text-xs text-slate-500 mt-2">Successfully upscaled</div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800 flex items-center justify-center">
           <CardContent className="p-6 text-center">
             <Shield className="h-8 w-8 text-violet-500 mx-auto mb-2" />
             <div className="text-sm font-medium text-slate-300">Admin Session Active</div>
           </CardContent>
        </Card>
      </div>

      {/* Orders Table */}
      <Card className="bg-slate-900 border-slate-800">
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle>Order Management</CardTitle>
              <CardDescription>Fulfill enhancement requests and manage order status.</CardDescription>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full sm:w-auto">
              <TabsList className="bg-slate-950 border border-slate-800">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="pending">Pending</TabsTrigger>
                <TabsTrigger value="processing">Processing</TabsTrigger>
                <TabsTrigger value="completed">Completed</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-slate-300">
              <thead className="text-xs text-slate-400 uppercase bg-slate-950/50 border-b border-slate-800">
                <tr>
                  <th className="px-4 py-3 font-medium">Order Details</th>
                  <th className="px-4 py-3 font-medium">Resolution / Type</th>
                  <th className="px-4 py-3 font-medium">Revenue</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-8 text-slate-500">No orders found.</td>
                  </tr>
                ) : (
                  filteredOrders.map((order) => {
                    const isBusy = isProcessingId === order.id;
                    return (
                      <tr key={order.id} className="border-b border-slate-800/50 hover:bg-slate-800/20 transition-colors">
                        <td className="px-4 py-3">
                          <div className="font-mono text-xs text-slate-200">{order.id.substring(0, 8)}...</div>
                          <div className="text-[11px] text-slate-500 mt-0.5">
                            {formatDistanceToNow(new Date(order.created_at), { addSuffix: true })}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-medium text-cyan-400 uppercase text-xs">{order.target_resolution}</div>
                          <div className="text-[11px] text-slate-400 capitalize">{order.enhancement_type}</div>
                        </td>
                        <td className="px-4 py-3 font-mono text-xs">
                          {order.currency === 'USD' && '$'}{order.currency === 'INR' && '₹'}{order.currency === 'PKR' && 'Rs. '}
                          {order.amount_paid} {order.currency}
                        </td>
                        <td className="px-4 py-3">
                          {getStatusBadge(order.status)}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {/* Download Original */}
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-8 px-2 bg-slate-900 border-slate-700 text-slate-300 hover:text-white"
                              onClick={() => handleDownloadOriginal(order.id, order.original_image_url)}
                              disabled={isBusy}
                              title="Download Original"
                            >
                              {isBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                            </Button>

                            {/* Mark Processing */}
                            {order.status === 'pending' && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-8 px-2 bg-slate-900 border-slate-700 text-cyan-400 hover:text-cyan-300"
                                onClick={() => handleStatusChange(order.id, 'processing')}
                                disabled={isBusy}
                                title="Mark as Processing"
                              >
                                <Settings className="h-4 w-4" />
                              </Button>
                            )}

                            {/* Upload Deliverable */}
                            {(order.status === 'pending' || order.status === 'processing') && (
                              <Button
                                size="sm"
                                className="h-8 px-3 bg-cyan-600 hover:bg-cyan-500 text-white"
                                onClick={() => triggerUpload(order.id)}
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
                               className="h-8 px-2 text-slate-500 hover:text-cyan-400"
                               onClick={() => triggerUpload(order.id)}
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
    </div>
  );
}
