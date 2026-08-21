"use client";

import React, { useState, useCallback, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { 
  UploadCloud, Image as ImageIcon, X, Loader2, CreditCard, AlertTriangle, 
  Mail, Sparkles, Check, ArrowRight, Maximize2, ShieldCheck, Lock, 
  Layers, UserCheck, Zap, Sliders, CheckCircle2, RefreshCw
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { getAllPricingTiersDynamic, getAllPricingTiers, PricingInfo } from "@/lib/pricing";
import { motion, AnimatePresence } from "framer-motion";
import { Dialog, DialogContent } from "@/components/ui/dialog";

export interface StudioImageUploaderProps {
  countryCode?: string;
  initialTier?: string;
}

export function StudioImageUploader({
  countryCode = "US",
  initialTier = "4k",
}: StudioImageUploaderProps) {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [fileMetadata, setFileMetadata] = useState<{ width: number; height: number; size: string } | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [selectedTier, setSelectedTier] = useState<string>(initialTier);
  const [enhancementType, setEnhancementType] = useState<string>("general");
  const [zoomOpen, setZoomOpen] = useState(false);
  
  // User & Guest State
  const [currentUser, setCurrentUser] = useState<{ id: string; email: string } | null>(null);
  const [guestEmail, setGuestEmail] = useState("");
  const [isCheckedUser, setIsCheckedUser] = useState(false);

  // Pricing
  const [pricingTiers, setPricingTiers] = useState<PricingInfo[]>(getAllPricingTiers(countryCode));
  const [isLoadingPricing, setIsLoadingPricing] = useState(true);

  const activePricing = pricingTiers.find((t) => t.tier === selectedTier) || pricingTiers[1];
  const supabase = createClient();

  // Check auth user status
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data?.user) {
        setCurrentUser({ id: data.user.id, email: data.user.email || "" });
      }
      setIsCheckedUser(true);
    });
  }, [supabase]);

  // Load dynamic pricing on mount
  useEffect(() => {
    let cancelled = false;
    setIsLoadingPricing(true);
    getAllPricingTiersDynamic(countryCode)
      .then((tiers) => {
        if (!cancelled) {
          setPricingTiers(tiers);
          setIsLoadingPricing(false);
        }
      })
      .catch(() => {
        if (!cancelled) setIsLoadingPricing(false);
      });
    return () => { cancelled = true; };
  }, [countryCode]);

  // Read file dimensions & size
  const handleFileSelection = (selectedFile: File) => {
    setFile(selectedFile);
    const objectUrl = URL.createObjectURL(selectedFile);
    setPreviewUrl(objectUrl);

    const sizeFormatted = (selectedFile.size / (1024 * 1024)).toFixed(2) + " MB";
    const img = new Image();
    img.onload = () => {
      setFileMetadata({
        width: img.naturalWidth,
        height: img.naturalHeight,
        size: sizeFormatted,
      });
    };
    img.src = objectUrl;
  };

  // Dropzone callback
  const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: any[]) => {
    setError(null);
    if (rejectedFiles.length > 0) {
      const rejection = rejectedFiles[0];
      if (rejection.errors?.[0]?.code === "file-too-large") {
        setError("File exceeds 25 MB limit. Please upload a smaller image.");
      } else if (rejection.errors?.[0]?.code === "file-invalid-type") {
        setError("Unsupported format. Please upload JPG, PNG, or WEBP.");
      } else {
        setError("File rejected. Please select a valid image.");
      }
      return;
    }
    if (acceptedFiles.length > 0) {
      handleFileSelection(acceptedFiles[0]);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/jpeg": [".jpeg", ".jpg"],
      "image/png": [".png"],
      "image/webp": [".webp"],
    },
    maxFiles: 1,
    maxSize: 25 * 1024 * 1024,
    disabled: isUploading,
    noClick: false,
    noKeyboard: false,
  });

  const handleClear = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setFile(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setFileMetadata(null);
    setError(null);
  };

  const handleUploadAndCheckout = async () => {
    if (!file) return;

    if (!currentUser && guestEmail.trim() && !guestEmail.includes("@")) {
      setError("Please enter a valid email address to receive your download link.");
      return;
    }

    setIsUploading(true);
    setError(null);
    setUploadProgress(15);

    try {
      const userId = currentUser?.id || null;
      const effectiveCustomerEmail = currentUser?.email || (guestEmail.trim() ? guestEmail.trim() : null);
      const orderId = crypto.randomUUID();
      const fileExt = file.name.split(".").pop() || "jpg";
      const storagePath = `${userId || "guest"}/${orderId}.${fileExt}`;

      setUploadProgress(35);

      // 1. Upload raw image securely to Supabase Storage via server API (bypasses RLS)
      const uploadFormData = new FormData();
      uploadFormData.append("file", file);
      uploadFormData.append("path", storagePath);

      const uploadRes = await fetch("/api/upload/raw", {
        method: "POST",
        body: uploadFormData,
      });

      const uploadData = await uploadRes.json();
      if (!uploadRes.ok) {
        throw new Error(uploadData.error || "Failed to upload image.");
      }

      setUploadProgress(60);

      // 2. Create order record
      const orderRes = await fetch("/api/orders/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId,
          userId,
          customerEmail: effectiveCustomerEmail,
          filePath: storagePath,
          targetResolution: selectedTier,
          enhancementType,
          currency: activePricing.currency,
          amountPaid: activePricing.price,
        }),
      });

      const orderData = await orderRes.json();
      if (!orderRes.ok) {
        throw new Error(orderData.error || "Failed to create order record.");
      }

      setUploadProgress(80);

      // 3. Create Stripe checkout session
      const checkoutRes = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId,
          tier: selectedTier,
          enhancementType,
          currency: activePricing.currency,
          amount: activePricing.price,
          customerEmail: effectiveCustomerEmail,
          userId,
        }),
      });

      const checkoutData = await checkoutRes.json();
      if (!checkoutRes.ok) {
        throw new Error(checkoutData.error || "Failed to initialize checkout.");
      }

      setUploadProgress(100);

      // 4. Redirect to checkout
      if (checkoutData.url) {
        window.location.href = checkoutData.url;
      } else {
        throw new Error("No checkout redirect URL returned.");
      }
    } catch (err: any) {
      console.error("Upload/Checkout error:", err);
      setError(err.message || "An unexpected error occurred. Please try again.");
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  return (
    <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* ════════════════ LEFT COLUMN: Workspace & Dropzone ════════════════ */}
      <div className="lg:col-span-7 space-y-6">
        <Card className="bg-white/80 dark:bg-slate-900/60 border border-slate-200/90 dark:border-white/10 shadow-2xl rounded-[2.5rem] overflow-hidden backdrop-blur-2xl transition-all duration-300">
          <CardHeader className="p-6 sm:p-7 border-b border-slate-100 dark:border-white/10 bg-slate-50/50 dark:bg-slate-950/40">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-600 dark:text-cyan-400">
                  <UploadCloud className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
                    Source Image
                  </CardTitle>
                  <CardDescription className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Drag & drop or select an image to upscale
                  </CardDescription>
                </div>
              </div>

              {previewUrl && !isUploading && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleClear}
                  className="rounded-full text-xs h-8 px-3 border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:text-red-500 hover:border-red-500/30"
                >
                  <RefreshCw className="h-3 w-3 mr-1.5" />
                  Change Image
                </Button>
              )}
            </div>
          </CardHeader>

          <CardContent className="p-6 sm:p-8">
            {/* ── Interactive Dropzone / Preview ── */}
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-3xl p-6 sm:p-10 text-center transition-all duration-300 cursor-pointer relative overflow-hidden group ${
                isDragActive
                  ? "border-cyan-500 bg-cyan-50 dark:bg-cyan-950/30 shadow-[0_0_40px_rgba(6,182,212,0.2)] scale-[1.01]"
                  : file
                  ? "border-slate-300 dark:border-slate-700 bg-slate-100/50 dark:bg-slate-950/50"
                  : "border-slate-300 dark:border-white/10 bg-slate-50/80 dark:bg-slate-950/30 hover:border-cyan-500/50 hover:bg-cyan-500/5 shadow-inner"
              } ${isUploading ? "pointer-events-none opacity-85" : ""}`}
            >
              <input {...getInputProps()} />

              <AnimatePresence mode="wait">
                {previewUrl ? (
                  <motion.div
                    key="preview"
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.96 }}
                    className="relative w-full flex flex-col items-center justify-center"
                  >
                    <div className="relative max-h-[380px] max-w-full rounded-2xl overflow-hidden shadow-2xl border border-slate-200 dark:border-white/10 group/img">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={previewUrl}
                        alt="Preview"
                        className="max-h-[380px] w-auto object-contain rounded-2xl"
                      />
                      
                      {/* Zoom Button Overlay */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setZoomOpen(true);
                        }}
                        className="absolute bottom-3 right-3 bg-black/70 hover:bg-cyan-600 text-white p-2 rounded-xl backdrop-blur-md transition-colors opacity-0 group-hover/img:opacity-100 shadow-lg"
                        title="View Full Size"
                      >
                        <Maximize2 className="h-4 w-4" />
                      </button>
                    </div>

                    {/* Image Metadata Badges */}
                    {fileMetadata && (
                      <div className="flex flex-wrap items-center justify-center gap-2 mt-4">
                        <Badge variant="outline" className="bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 text-xs font-mono">
                          {fileMetadata.width} × {fileMetadata.height} px
                        </Badge>
                        <Badge variant="outline" className="bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 text-xs font-mono">
                          {fileMetadata.size}
                        </Badge>
                        <Badge variant="outline" className="bg-cyan-500/10 border-cyan-500/30 text-cyan-600 dark:text-cyan-400 text-xs font-semibold uppercase">
                          {file?.name.split(".").pop()}
                        </Badge>
                      </div>
                    )}
                  </motion.div>
                ) : (
                  <motion.div
                    key="placeholder"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col items-center justify-center py-12 pointer-events-none"
                  >
                    <div className="h-20 w-20 bg-slate-100 dark:bg-slate-900 rounded-3xl flex items-center justify-center mb-5 group-hover:scale-110 group-hover:bg-cyan-500/10 transition-all duration-300 shadow-xl border border-slate-200 dark:border-white/10 group-hover:border-cyan-500/40">
                      {isLoadingPricing ? (
                        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
                      ) : (
                        <ImageIcon className="h-8 w-8 text-slate-400 group-hover:text-cyan-500 transition-colors" />
                      )}
                    </div>
                    <p className="text-slate-900 dark:text-slate-100 font-extrabold text-lg mb-1.5 tracking-tight">
                      {isDragActive ? "Drop your image right here" : "Click to select or drag & drop"}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                      PNG, JPG, or WEBP up to 25 MB
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Uploading Screen Overlay */}
              {isUploading && (
                <div className="absolute inset-0 bg-slate-900/90 dark:bg-[#07090E]/95 backdrop-blur-md flex flex-col items-center justify-center z-20 rounded-3xl p-6">
                  <Loader2 className="h-12 w-12 text-cyan-400 animate-spin mb-6" />
                  <div className="w-full max-w-xs bg-slate-800 rounded-full h-3 mb-3 border border-white/10 overflow-hidden p-0.5 shadow-inner">
                    <div
                      className="bg-gradient-to-r from-cyan-500 to-violet-500 h-full rounded-full transition-all duration-300 shadow-[0_0_15px_rgba(6,182,212,0.6)]"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                  <span className="text-slate-200 font-semibold text-sm">
                    {uploadProgress < 100 ? `Securing Asset (${uploadProgress}%)` : "Redirecting to checkout…"}
                  </span>
                </div>
              )}
            </div>

            {/* Error Message */}
            {error && (
              <div className="mt-4 bg-red-500/10 border border-red-500/20 rounded-2xl p-4 text-red-600 dark:text-red-400 text-xs font-semibold flex items-center gap-3">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Feature Highlights Underneath Dropzone */}
            <div className="grid grid-cols-3 gap-3 mt-6 pt-6 border-t border-slate-100 dark:border-white/10 text-center">
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950/40 border border-slate-200/60 dark:border-white/5">
                <div className="text-cyan-600 dark:text-cyan-400 font-bold text-xs">8000px</div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">Ultra HD Clarity</div>
              </div>
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950/40 border border-slate-200/60 dark:border-white/5">
                <div className="text-violet-600 dark:text-violet-400 font-bold text-xs">Zero Loss</div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">Neural Denoising</div>
              </div>
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950/40 border border-slate-200/60 dark:border-white/5">
                <div className="text-emerald-600 dark:text-emerald-400 font-bold text-xs">100% Mine</div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">Commercial Rights</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ════════════════ RIGHT COLUMN: Configuration & Order Summary ════════════════ */}
      <div className="lg:col-span-5 space-y-6">
        <Card className="bg-white/80 dark:bg-slate-900/60 border border-slate-200/90 dark:border-white/10 shadow-2xl rounded-[2.5rem] overflow-hidden backdrop-blur-2xl transition-all duration-300">
          <CardHeader className="p-6 border-b border-slate-100 dark:border-white/10 bg-slate-50/50 dark:bg-slate-950/40">
            <CardTitle className="text-xl font-extrabold text-slate-900 dark:text-slate-100 flex items-center justify-between">
              <span className="flex items-center gap-2.5">
                <Sliders className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
                Enhancement Setup
              </span>
              <Badge variant="outline" className="text-[10px] uppercase font-mono border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-slate-950 text-slate-600 dark:text-slate-400">
                Step by Step
              </Badge>
            </CardTitle>
          </CardHeader>

          <CardContent className="p-6 space-y-6">
            {/* ── STEP 1: Resolution Tier Selector ── */}
            <div className="space-y-3">
              <Label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
                <span className="h-5 w-5 rounded-full bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 flex items-center justify-center text-[10px] font-black">1</span>
                Select Target Resolution
              </Label>

              <div className="space-y-2.5">
                {pricingTiers.map((tier) => {
                  const isSelected = selectedTier === tier.tier;
                  return (
                    <div
                      key={tier.tier}
                      onClick={() => !isUploading && setSelectedTier(tier.tier)}
                      className={`p-4 rounded-2xl border transition-all duration-200 cursor-pointer relative ${
                        isSelected
                          ? "border-cyan-500 bg-cyan-500/10 shadow-[0_0_20px_rgba(6,182,212,0.12)]"
                          : "border-slate-200 dark:border-white/10 bg-slate-50/60 dark:bg-slate-950/40 hover:bg-slate-100 dark:hover:bg-slate-900/80"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`h-5 w-5 rounded-full border-2 flex items-center justify-center ${
                            isSelected ? "border-cyan-500 bg-cyan-500 text-white" : "border-slate-400 dark:border-slate-600"
                          }`}>
                            {isSelected && <Check className="h-3 w-3" />}
                          </div>
                          <div>
                            <div className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
                              {tier.label}
                              {tier.tier === "4k" && (
                                <span className="bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 text-[10px] font-bold px-2 py-0.5 rounded-full">
                                  Most Popular
                                </span>
                              )}
                              {tier.tier === "8k" && (
                                <span className="bg-violet-500/20 text-violet-600 dark:text-violet-400 text-[10px] font-bold px-2 py-0.5 rounded-full">
                                  Max Clarity
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                              {tier.description}
                            </div>
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="font-mono font-extrabold text-sm text-cyan-600 dark:text-cyan-400">
                            {isLoadingPricing ? <Loader2 className="h-4 w-4 animate-spin inline" /> : tier.formattedPrice}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* ── STEP 2: Enhancement Mode Toggle ── */}
            <div className="space-y-3">
              <Label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
                <span className="h-5 w-5 rounded-full bg-violet-500/20 text-violet-600 dark:text-violet-400 flex items-center justify-center text-[10px] font-black">2</span>
                AI Enhancement Engine
              </Label>

              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => !isUploading && setEnhancementType("general")}
                  className={`p-3.5 rounded-2xl border text-left transition-all ${
                    enhancementType === "general"
                      ? "border-violet-500 bg-violet-500/10 shadow-[0_0_15px_rgba(139,92,246,0.15)]"
                      : "border-slate-200 dark:border-white/10 bg-slate-50/60 dark:bg-slate-950/40 hover:bg-slate-100 dark:hover:bg-slate-900"
                  }`}
                >
                  <div className="font-bold text-xs text-slate-900 dark:text-slate-100">Universal Super-Res</div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">Artwork, Text, Graphic, Nature</div>
                </button>

                <button
                  type="button"
                  onClick={() => !isUploading && setEnhancementType("face")}
                  className={`p-3.5 rounded-2xl border text-left transition-all ${
                    enhancementType === "face"
                      ? "border-violet-500 bg-violet-500/10 shadow-[0_0_15px_rgba(139,92,246,0.15)]"
                      : "border-slate-200 dark:border-white/10 bg-slate-50/60 dark:bg-slate-950/40 hover:bg-slate-100 dark:hover:bg-slate-900"
                  }`}
                >
                  <div className="font-bold text-xs text-slate-900 dark:text-slate-100">Face & Portrait Restore</div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">Facial Generative Detailing</div>
                </button>
              </div>
            </div>

            {/* ── STEP 3: User/Guest Email Section ── */}
            <div className="pt-2 border-t border-slate-100 dark:border-white/10 space-y-2.5">
              {currentUser ? (
                <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between text-xs text-emerald-700 dark:text-emerald-400">
                  <div className="flex items-center gap-2 truncate">
                    <UserCheck className="h-4 w-4 shrink-0" />
                    <span className="truncate">Receiving render as <strong className="font-semibold">{currentUser.email}</strong></span>
                  </div>
                  <span className="text-[10px] bg-emerald-500/20 px-2 py-0.5 rounded-full font-bold">Linked</span>
                </div>
              ) : isCheckedUser ? (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="studio-guest-email" className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                      <Mail className="h-3.5 w-3.5 text-cyan-600 dark:text-cyan-400" />
                      Contact Email <span className="text-[10px] text-slate-400 font-normal">(Receipt & Download Link)</span>
                    </Label>
                    <span className="text-[10px] text-violet-600 dark:text-violet-400 font-semibold bg-violet-500/10 px-2 py-0.5 rounded-full">
                      No Password
                    </span>
                  </div>
                  <Input
                    id="studio-guest-email"
                    type="email"
                    placeholder="name@example.com (optional)"
                    value={guestEmail}
                    onChange={(e) => setGuestEmail(e.target.value)}
                    disabled={isUploading}
                    className="h-10 bg-slate-50 dark:bg-slate-950/80 border-slate-200 dark:border-white/10 text-xs rounded-xl"
                  />
                </div>
              ) : null}
            </div>

            {/* ── Dynamic Order Total & Checkout CTA ── */}
            <div className="pt-4 border-t border-slate-100 dark:border-white/10 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Order Total
                </span>
                <span className="text-2xl font-black text-slate-900 dark:text-white font-mono">
                  {isLoadingPricing ? <Loader2 className="h-5 w-5 animate-spin" /> : activePricing.formattedPrice}
                </span>
              </div>

              <Button
                onClick={handleUploadAndCheckout}
                disabled={!file || isUploading || isLoadingPricing}
                className="w-full h-13 py-3.5 bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 text-white rounded-2xl font-extrabold text-sm shadow-[0_0_25px_rgba(6,182,212,0.3)] hover:shadow-[0_0_35px_rgba(6,182,212,0.45)] transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 group"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Processing Order…
                  </>
                ) : (
                  <>
                    <CreditCard className="h-4 w-4 group-hover:scale-110 transition-transform" />
                    Proceed to Instant Checkout
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </Button>

              <div className="flex items-center justify-center gap-4 text-[11px] text-slate-500 dark:text-slate-400 pt-1">
                <div className="flex items-center gap-1">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
                  <span>Stripe Protected</span>
                </div>
                <span>•</span>
                <div className="flex items-center gap-1">
                  <Lock className="h-3.5 w-3.5 text-cyan-500" />
                  <span>256-bit SSL</span>
                </div>
                <span>•</span>
                <div className="flex items-center gap-1">
                  <Zap className="h-3.5 w-3.5 text-violet-500" />
                  <span>Instant Delivery</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── Zoom Preview Modal ── */}
      <Dialog open={zoomOpen} onOpenChange={setZoomOpen}>
        <DialogContent className="max-w-4xl bg-white/95 dark:bg-[#07090E]/95 border-slate-200 dark:border-white/10 p-4 rounded-3xl backdrop-blur-2xl">
          {previewUrl && (
            <div className="flex items-center justify-center max-h-[80vh] overflow-hidden rounded-2xl">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={previewUrl} alt="Zoom Preview" className="max-h-[80vh] w-auto object-contain rounded-2xl" />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
