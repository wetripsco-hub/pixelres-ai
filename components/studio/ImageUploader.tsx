"use client";

import React, { useState, useCallback, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { UploadCloud, Image as ImageIcon, X, Loader2, Info, CreditCard, AlertTriangle, Mail, Sparkles, Check, ArrowRight } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { getAllPricingTiersDynamic, getAllPricingTiers, PricingInfo } from "@/lib/pricing";
import { motion, AnimatePresence } from "framer-motion";

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
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [selectedTier, setSelectedTier] = useState<string>(initialTier);
  const [enhancementType, setEnhancementType] = useState<string>("general");
  
  // User & Guest State
  const [currentUser, setCurrentUser] = useState<{ id: string; email: string } | null>(null);
  const [guestEmail, setGuestEmail] = useState("");
  const [isCheckedUser, setIsCheckedUser] = useState(false);

  // Pricing: start with sync fallback, then load dynamic
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

  // File drop handler with validation
  const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: any[]) => {
    setError(null);
    if (rejectedFiles.length > 0) {
      const rejection = rejectedFiles[0];
      if (rejection.errors?.[0]?.code === "file-too-large") {
        setError("File exceeds 25 MB limit.");
      } else if (rejection.errors?.[0]?.code === "file-invalid-type") {
        setError("Unsupported format. Please upload JPG, PNG, or WEBP.");
      } else {
        setError("File rejected. Please try a different image.");
      }
      return;
    }
    if (acceptedFiles.length > 0) {
      const selectedFile = acceptedFiles[0];
      setFile(selectedFile);
      setPreviewUrl(URL.createObjectURL(selectedFile));
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

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    setFile(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setError(null);
  };

  const handleUploadAndCheckout = async () => {
    if (!file) return;

    // Optional validation for guest email format if entered
    if (!currentUser && guestEmail.trim() && !guestEmail.includes("@")) {
      setError("Please enter a valid email address to receive your order receipt.");
      return;
    }

    setIsUploading(true);
    setError(null);
    setUploadProgress(10);

    try {
      // 1. Get user id & customer email
      const userId = currentUser?.id || null;
      const effectiveCustomerEmail = currentUser?.email || (guestEmail.trim() ? guestEmail.trim() : null);
      const orderId = crypto.randomUUID();
      const fileExt = file.name.split(".").pop() || "jpg";
      const storagePath = `${userId || "guest"}/${orderId}.${fileExt}`;

      setUploadProgress(25);

      // 2. Upload raw image securely via server API (bypasses Storage RLS)
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

      setUploadProgress(50);

      // 3. Create order via server-side route (bypasses RLS)
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

      setUploadProgress(75);

      // 4. Create Stripe checkout session
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

      // 5. Redirect to Stripe (or sandbox fallback)
      if (checkoutData.url) {
        window.location.href = checkoutData.url;
      } else {
        throw new Error("No checkout URL returned.");
      }
    } catch (err: any) {
      console.error("Upload/Checkout error:", err);
      setError(err.message || "An unexpected error occurred. Please try again.");
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  return (
    <Card className="bg-slate-900/60 border-white/10 shadow-2xl w-full max-w-4xl mx-auto rounded-[2.5rem] overflow-hidden backdrop-blur-2xl transition-all duration-300">
      <CardHeader className="bg-slate-900/80 border-b border-white/10 p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <CardTitle className="text-2xl text-slate-100 flex items-center gap-3 font-bold tracking-tight">
              <div className="h-10 w-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                <UploadCloud className="h-5 w-5" />
              </div>
              Neural Upscale & Enhancement Order
            </CardTitle>
            <CardDescription className="text-slate-400 text-sm mt-1">
              Upload your image, choose target fidelity, and configure AI enhancement models.
            </CardDescription>
          </div>

          {currentUser ? (
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Signed in as <strong className="font-semibold">{currentUser.email}</strong></span>
            </div>
          ) : (
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-300 text-xs font-medium">
              <Sparkles className="h-3 w-3 text-violet-400" />
              <span>Instant Guest Mode Active</span>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="p-6 sm:p-8 space-y-8">
        {/* ── Full-area clickable dropzone ── */}
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-3xl p-8 sm:p-12 text-center transition-all duration-300 cursor-pointer relative overflow-hidden group ${
            isDragActive
              ? "border-cyan-400 bg-cyan-950/30 shadow-[inset_0_0_60px_rgba(6,182,212,0.15)] scale-[1.01]"
              : file
              ? "border-slate-700 bg-slate-950/60"
              : "border-white/10 bg-slate-950/40 hover:border-cyan-500/40 hover:bg-slate-950/70 shadow-inner"
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
                className="relative w-full max-h-[420px] flex items-center justify-center"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="max-h-[420px] max-w-full rounded-2xl object-contain shadow-2xl border border-white/10"
                />
                {!isUploading && (
                  <button
                    type="button"
                    onClick={handleClear}
                    className="absolute top-4 right-4 bg-slate-950/90 hover:bg-red-500 text-white rounded-full p-2.5 backdrop-blur-md transition-colors shadow-xl z-30 border border-white/10"
                    title="Remove image"
                  >
                    <X className="h-5 w-5" />
                  </button>
                )}
              </motion.div>
            ) : (
              <motion.div
                key="placeholder"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center py-10 pointer-events-none"
              >
                <div className="h-20 w-20 bg-slate-900/90 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-slate-800 transition-all duration-300 shadow-2xl border border-white/10 group-hover:border-cyan-500/30">
                  {isLoadingPricing ? (
                    <Loader2 className="h-9 w-9 animate-spin text-slate-400" />
                  ) : (
                    <ImageIcon className="h-9 w-9 text-slate-400 group-hover:text-cyan-400 transition-colors" />
                  )}
                </div>
                <p className="text-slate-100 font-bold text-lg mb-2 tracking-tight">
                  {isDragActive ? "Drop image to upscale" : "Click anywhere or drag & drop an image"}
                </p>
                <p className="text-xs text-slate-400 font-medium">
                  Supports High-Res PNG, JPG, WEBP up to 25 MB
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {isUploading && (
            <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md flex flex-col items-center justify-center z-20 rounded-3xl p-6">
              <Loader2 className="h-12 w-12 text-cyan-400 animate-spin mb-6" />
              <div className="w-full max-w-xs bg-slate-800/80 rounded-full h-3 mb-3 border border-white/10 overflow-hidden p-0.5 shadow-inner">
                <div
                  className="bg-gradient-to-r from-cyan-500 to-violet-500 h-full rounded-full transition-all duration-300 ease-out shadow-[0_0_15px_rgba(6,182,212,0.6)]"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <span className="text-slate-200 font-semibold text-sm">
                {uploadProgress < 100 ? `Uploading neural asset (${uploadProgress}%)` : "Redirecting to checkout…"}
              </span>
            </div>
          )}
        </div>

        {/* ── Error alert ── */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 text-red-400 text-sm flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 shrink-0" />
            <span className="font-medium">{error}</span>
          </div>
        )}

        {/* ── Guest Contact Email Field (If unauthenticated) ── */}
        {!currentUser && isCheckedUser && (
          <div className="p-5 rounded-2xl bg-slate-950/50 border border-white/10 space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="guest-email" className="text-slate-200 font-semibold text-sm flex items-center gap-2">
                <Mail className="h-4 w-4 text-cyan-400" />
                Contact Email <span className="text-xs text-slate-400 font-normal">(for receipt & download link)</span>
              </Label>
              <span className="text-[10px] text-violet-400 uppercase tracking-wider font-semibold bg-violet-500/10 px-2 py-0.5 rounded-full border border-violet-500/20">
                No Password Required
              </span>
            </div>
            <Input
              id="guest-email"
              type="email"
              placeholder="name@example.com (optional, for your order link)"
              value={guestEmail}
              onChange={(e) => setGuestEmail(e.target.value)}
              disabled={isUploading}
              className="h-11 bg-slate-900/80 border-white/10 focus:border-cyan-500 text-white rounded-xl text-sm placeholder:text-slate-500"
            />
          </div>
        )}

        {/* ── Resolution & Enhancement selectors ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          {/* Resolution */}
          <div className="space-y-4">
            <Label className="text-slate-100 font-bold text-base flex items-center gap-2">
              <span className="bg-cyan-500/20 text-cyan-400 h-6 w-6 rounded-full flex items-center justify-center text-xs font-extrabold">1</span>
              Target Resolution
            </Label>
            <RadioGroup value={selectedTier} onValueChange={setSelectedTier} disabled={isUploading} className="gap-3">
              {pricingTiers.map((tier) => (
                <label
                  key={tier.tier}
                  htmlFor={`studio-res-${tier.tier}`}
                  className={`flex items-start space-x-3 border rounded-2xl p-4 transition-all duration-200 cursor-pointer ${
                    selectedTier === tier.tier
                      ? "border-cyan-500 bg-cyan-500/10 shadow-[0_0_20px_rgba(6,182,212,0.12)]"
                      : "border-white/10 bg-slate-950/40 hover:bg-slate-900/60 hover:border-slate-700"
                  }`}
                >
                  <RadioGroupItem value={tier.tier} id={`studio-res-${tier.tier}`} className="border-slate-500 text-cyan-500 mt-1" />
                  <div className="flex-1 w-full">
                    <div className="font-bold text-slate-100 flex items-center justify-between w-full text-sm sm:text-base">
                      <span>{tier.label}</span>
                      <span className="text-cyan-400 font-extrabold">
                        {isLoadingPricing ? <Loader2 className="h-4 w-4 animate-spin inline" /> : tier.formattedPrice}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">{tier.description}</p>
                  </div>
                </label>
              ))}
            </RadioGroup>
          </div>

          {/* Enhancement Type */}
          <div className="space-y-4">
            <Label className="text-slate-100 font-bold text-base flex items-center gap-2">
              <span className="bg-violet-500/20 text-violet-400 h-6 w-6 rounded-full flex items-center justify-center text-xs font-extrabold">2</span>
              Neural Processing Mode
            </Label>
            <RadioGroup value={enhancementType} onValueChange={setEnhancementType} disabled={isUploading} className="gap-3">
              <label
                htmlFor="studio-type-general"
                className={`flex items-start space-x-3 border rounded-2xl p-4 transition-all duration-200 cursor-pointer ${
                  enhancementType === "general"
                    ? "border-violet-500 bg-violet-500/10 shadow-[0_0_20px_rgba(139,92,246,0.12)]"
                    : "border-white/10 bg-slate-950/40 hover:bg-slate-900/60 hover:border-slate-700"
                }`}
              >
                <RadioGroupItem value="general" id="studio-type-general" className="border-slate-500 text-violet-500 mt-1" />
                <div className="flex-1">
                  <div className="font-bold text-slate-100 text-sm sm:text-base">Universal Super-Resolution</div>
                  <p className="text-xs text-slate-400 mt-1">Noise reduction, text clarity, landscape & anime sharpening.</p>
                </div>
              </label>

              <label
                htmlFor="studio-type-face"
                className={`flex items-start space-x-3 border rounded-2xl p-4 transition-all duration-200 cursor-pointer ${
                  enhancementType === "face"
                    ? "border-violet-500 bg-violet-500/10 shadow-[0_0_20px_rgba(139,92,246,0.12)]"
                    : "border-white/10 bg-slate-950/40 hover:bg-slate-900/60 hover:border-slate-700"
                }`}
              >
                <RadioGroupItem value="face" id="studio-type-face" className="border-slate-500 text-violet-500 mt-1" />
                <div className="flex-1">
                  <div className="font-bold text-slate-100 text-sm sm:text-base">Portrait & Face Detail Recovery</div>
                  <p className="text-xs text-slate-400 mt-1">Specialized facial generative models for skin, eyes, and hair.</p>
                </div>
              </label>
            </RadioGroup>
          </div>
        </div>
      </CardContent>

      <CardFooter className="bg-slate-950/80 p-6 sm:p-8 flex flex-col sm:flex-row justify-between items-center border-t border-white/10 gap-6">
        <div className="text-center sm:text-left">
          <div className="text-xs text-slate-400 font-medium uppercase tracking-wider">Total Investment</div>
          <div className="font-black text-white text-3xl sm:text-4xl tracking-tight">
            {isLoadingPricing ? (
              <Loader2 className="h-7 w-7 animate-spin inline-block mt-1" />
            ) : (
              activePricing.formattedPrice
            )}
          </div>
        </div>
        <Button
          onClick={handleUploadAndCheckout}
          disabled={!file || isUploading || isLoadingPricing}
          className="w-full sm:w-auto bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 text-white h-14 px-10 text-base font-bold rounded-2xl shadow-[0_0_25px_rgba(6,182,212,0.3)] hover:shadow-[0_0_35px_rgba(6,182,212,0.5)] transition-all duration-300 flex items-center justify-center gap-3 disabled:opacity-50 group"
        >
          {isUploading ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Processing Order…
            </>
          ) : (
            <>
              <CreditCard className="h-5 w-5 group-hover:scale-110 transition-transform" />
              Proceed to Secure Checkout
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
