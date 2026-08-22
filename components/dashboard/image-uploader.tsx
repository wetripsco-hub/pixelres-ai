"use client";

import React, { useState, useCallback, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { UploadCloud, Image as ImageIcon, X, Loader2, Info, CreditCard, ArrowRight, ShieldCheck, Check } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { getAllPricingTiersDynamic, getAllPricingTiers, PricingInfo } from "@/lib/pricing";
import { motion, AnimatePresence } from "framer-motion";

export interface ImageUploaderProps {
  countryCode?: string;
  initialTier?: string;
  dynamicPricing?: any;
  onUploadSuccess?: () => void;
}

export function ImageUploader({
  countryCode = 'US',
  initialTier = '4k',
  dynamicPricing = null,
  onUploadSuccess
}: ImageUploaderProps) {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [selectedTier, setSelectedTier] = useState<string>(initialTier);
  const [enhancementType, setEnhancementType] = useState<string>("general");
  
  const [pricingTiers, setPricingTiers] = useState<PricingInfo[]>(getAllPricingTiers(countryCode));
  const [isLoadingPricing, setIsLoadingPricing] = useState(true);

  const activePricing = pricingTiers.find((t) => t.tier === selectedTier) || pricingTiers[1];
  const supabase = createClient();

  useEffect(() => {
    let isMounted = true;
    getAllPricingTiersDynamic(countryCode).then(tiers => {
      if (isMounted) {
        setPricingTiers(tiers);
        setIsLoadingPricing(false);
        if (initialTier && tiers.some(t => t.tier === initialTier)) {
          setSelectedTier(initialTier);
        }
      }
    });
    return () => { isMounted = false };
  }, [countryCode, initialTier]);

  // Object URL Memory Cleanup
  useEffect(() => {
    return () => {
      if (previewUrl && previewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setError(null);
    if (acceptedFiles.length > 0) {
      const selectedFile = acceptedFiles[0];
      if (selectedFile.size > 25 * 1024 * 1024) {
        setError("File exceeds 25MB limit.");
        return;
      }
      if (previewUrl && previewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrl);
      }
      setFile(selectedFile);
      setPreviewUrl(URL.createObjectURL(selectedFile));
    }
  }, [previewUrl]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/jpeg": [".jpeg", ".jpg"],
      "image/png": [".png"],
      "image/webp": [".webp"],
    },
    maxFiles: 1,
    disabled: isUploading || isLoadingPricing,
    noClick: false,
    noKeyboard: false,
  });

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    setFile(null);
    if (previewUrl && previewUrl.startsWith("blob:")) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
    setError(null);
  };

  const handleUploadAndCheckout = async () => {
    if (!file) return;

    setIsUploading(true);
    setError(null);
    setUploadProgress(10);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      const userId = user?.id || null;
      const orderId = crypto.randomUUID();
      const fileExt = file.name.split('.').pop() || 'jpg';
      const storagePath = `${userId || 'guest'}/${orderId}.${fileExt}`;

      setUploadProgress(30);

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

      const orderRes = await fetch("/api/orders/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId,
          userId,
          customerEmail: user?.email || null,
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

      const checkoutRes = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId,
          tier: selectedTier,
          enhancementType,
          currency: activePricing.currency,
          amount: activePricing.price,
          customerEmail: user?.email,
          userId: user?.id,
        }),
      });

      const checkoutData = await checkoutRes.json();
      if (!checkoutRes.ok) {
        throw new Error(checkoutData.error || 'Failed to initialize checkout.');
      }

      setUploadProgress(100);

      if (checkoutData.url) {
        window.location.href = checkoutData.url;
      } else {
        throw new Error('No checkout URL returned.');
      }
    } catch (err: any) {
      console.error("Upload/Checkout error:", err);
      setError(err.message || "An error occurred. Please try again.");
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  return (
    <Card className="bg-white/80 dark:bg-slate-900/60 border border-slate-200/90 dark:border-white/10 shadow-2xl w-full max-w-4xl mx-auto rounded-[2.5rem] overflow-hidden backdrop-blur-2xl transition-all">
      <CardHeader className="bg-slate-50/50 dark:bg-slate-950/40 border-b border-slate-100 dark:border-white/10 p-6 sm:p-8">
        <CardTitle className="text-2xl text-slate-900 dark:text-slate-100 flex items-center gap-3 font-bold tracking-tight">
          <div className="h-10 w-10 rounded-xl bg-orange-500/10 dark:bg-cyan-500/10 border border-orange-500/20 dark:border-cyan-500/20 flex items-center justify-center text-orange-600 dark:text-cyan-400">
             <UploadCloud className="h-5 w-5" />
          </div>
          New Enhancement Order
        </CardTitle>
        <CardDescription className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm mt-1">
          Upload your image and configure the AI enhancement parameters.
        </CardDescription>
      </CardHeader>

      <CardContent className="p-6 sm:p-8 space-y-8">
        {/* Full clickable dropzone */}
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-3xl p-8 sm:p-12 text-center transition-all duration-300 cursor-pointer relative overflow-hidden group ${
            isDragActive 
              ? "border-orange-500 dark:border-cyan-500 bg-orange-50 dark:bg-cyan-950/30 shadow-[0_0_40px_rgba(249,115,22,0.2)] dark:shadow-[0_0_40px_rgba(6,182,212,0.2)] scale-[1.01]" 
              : file 
              ? "border-slate-300 dark:border-slate-700 bg-slate-100/50 dark:bg-slate-950/50" 
              : "border-slate-300 dark:border-white/10 bg-slate-50/80 dark:bg-slate-950/30 hover:border-orange-500/50 dark:hover:border-cyan-500/50 hover:bg-orange-500/5 dark:hover:bg-cyan-500/5"
          } ${(isUploading || isLoadingPricing) ? "pointer-events-none opacity-80" : ""}`}
        >
          <input {...getInputProps()} />

          <AnimatePresence mode="wait">
            {previewUrl ? (
              <motion.div
                key="preview"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="relative w-full max-h-[400px] flex items-center justify-center"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={previewUrl} alt="Preview" className="max-h-[400px] max-w-full rounded-2xl object-contain shadow-2xl border border-slate-200 dark:border-white/10" />
                {!isUploading && (
                  <button
                    type="button"
                    onClick={handleClear}
                    className="absolute top-4 right-4 bg-slate-900/80 hover:bg-red-500 text-white rounded-full p-2.5 backdrop-blur-md transition-colors shadow-lg z-30"
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
                <div className="h-20 w-20 bg-slate-100 dark:bg-slate-900 rounded-3xl flex items-center justify-center mb-6 group-hover:scale-110 transition-all duration-300 shadow-xl border border-slate-200 dark:border-white/10">
                  {isLoadingPricing ? <Loader2 className="h-9 w-9 animate-spin text-slate-400" /> : <ImageIcon className="h-9 w-9 text-slate-400 group-hover:text-orange-500 dark:group-hover:text-cyan-500 transition-colors" />}
                </div>
                <p className="text-slate-900 dark:text-slate-100 font-extrabold text-lg mb-2 tracking-tight">
                  {isLoadingPricing ? "Loading configurations..." : isDragActive ? "Drop the image here" : "Click anywhere or drag & drop an image"}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  Supports PNG, JPG, WEBP up to 25MB
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {isUploading && (
            <div className="absolute inset-0 bg-slate-900/90 dark:bg-[#07090E]/95 backdrop-blur-md flex flex-col items-center justify-center z-20 rounded-3xl p-6">
              <Loader2 className="h-12 w-12 text-orange-400 dark:text-cyan-400 animate-spin mb-6" />
              <div className="w-full max-w-xs bg-slate-800 rounded-full h-3 mb-3 border border-white/10 overflow-hidden p-0.5">
                <div className="bg-gradient-to-r from-orange-500 to-amber-500 dark:from-cyan-500 dark:to-violet-500 h-full rounded-full transition-all duration-300 shadow-[0_0_15px_rgba(249,115,22,0.6)] dark:shadow-[0_0_15px_rgba(6,182,212,0.6)]" style={{ width: `${uploadProgress}%` }}></div>
              </div>
              <span className="text-slate-200 font-semibold text-sm">{uploadProgress < 100 ? `Uploading (${uploadProgress}%)` : "Redirecting to checkout…"}</span>
            </div>
          )}
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 text-red-600 dark:text-red-400 text-xs font-semibold flex items-center gap-3">
            <Info className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          {/* Resolution selector */}
          <div className="space-y-4">
            <Label className="text-slate-900 dark:text-slate-100 font-bold text-base flex items-center gap-2">
              <span className="bg-orange-500/20 text-orange-600 dark:bg-cyan-500/20 dark:text-cyan-400 h-6 w-6 rounded-full flex items-center justify-center text-xs font-black">1</span>
              Target Resolution
            </Label>
            <RadioGroup value={selectedTier} onValueChange={setSelectedTier} disabled={isUploading || isLoadingPricing} className="gap-3">
              {pricingTiers.map((tier) => (
                <div
                  key={tier.tier}
                  onClick={() => setSelectedTier(tier.tier)}
                  className={`flex items-start space-x-3 border rounded-2xl p-4 transition-all duration-200 cursor-pointer ${
                    selectedTier === tier.tier
                      ? "border-orange-500 bg-orange-500/5 dark:border-cyan-500 dark:bg-cyan-500/10 shadow-sm"
                      : "border-slate-200 dark:border-white/10 bg-slate-50/60 dark:bg-slate-950/40 hover:bg-slate-100 dark:hover:bg-slate-900"
                  }`}
                >
                  <RadioGroupItem value={tier.tier} id={`dash-res-${tier.tier}`} className="border-slate-400 dark:border-slate-600 text-orange-500 dark:text-cyan-500 mt-1" />
                  <div className="flex-1 w-full">
                    <div className="font-bold text-slate-900 dark:text-slate-100 flex items-center justify-between w-full text-sm sm:text-base">
                      <span>{tier.label}</span>
                      <span className="text-orange-600 dark:text-cyan-400 font-mono font-extrabold">
                        {isLoadingPricing ? <Loader2 className="h-4 w-4 animate-spin inline" /> : tier.formattedPrice}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{tier.description}</p>
                  </div>
                </div>
              ))}
            </RadioGroup>
          </div>

          {/* Enhancement selector */}
          <div className="space-y-4">
            <Label className="text-slate-900 dark:text-slate-100 font-bold text-base flex items-center gap-2">
              <span className="bg-violet-500/20 text-violet-600 dark:text-violet-400 h-6 w-6 rounded-full flex items-center justify-center text-xs font-black">2</span>
              Enhancement Type
            </Label>
            <RadioGroup value={enhancementType} onValueChange={setEnhancementType} disabled={isUploading} className="gap-3">
              <div
                onClick={() => setEnhancementType("general")}
                className={`flex items-start space-x-3 border rounded-2xl p-4 transition-all duration-200 cursor-pointer ${
                  enhancementType === "general"
                    ? "border-violet-500 bg-violet-500/10 shadow-sm"
                    : "border-slate-200 dark:border-white/10 bg-slate-50/60 dark:bg-slate-950/40 hover:bg-slate-100 dark:hover:bg-slate-900"
                }`}
              >
                <RadioGroupItem value="general" id="dash-type-general" className="border-slate-400 dark:border-slate-600 text-violet-500 mt-1" />
                <div className="flex-1">
                  <div className="font-bold text-slate-900 dark:text-slate-100 text-sm sm:text-base">Universal Super-Res</div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Noise reduction, artwork, text, and general photos.</p>
                </div>
              </div>

              <div
                onClick={() => setEnhancementType("face")}
                className={`flex items-start space-x-3 border rounded-2xl p-4 transition-all duration-200 cursor-pointer ${
                  enhancementType === "face"
                    ? "border-violet-500 bg-violet-500/10 shadow-sm"
                    : "border-slate-200 dark:border-white/10 bg-slate-50/60 dark:bg-slate-950/40 hover:bg-slate-100 dark:hover:bg-slate-900"
                }`}
              >
                <RadioGroupItem value="face" id="dash-type-face" className="border-slate-400 dark:border-slate-600 text-violet-500 mt-1" />
                <div className="flex-1">
                  <div className="font-bold text-slate-900 dark:text-slate-100 text-sm sm:text-base">Face / Portrait Restoration</div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Generative restoration for eyes, skin, and hair.</p>
                </div>
              </div>
            </RadioGroup>
          </div>
        </div>
      </CardContent>

      <CardFooter className="bg-slate-50/50 dark:bg-slate-950/60 p-6 sm:p-8 flex flex-col sm:flex-row justify-between items-center border-t border-slate-100 dark:border-white/10 gap-6">
        <div className="text-center sm:text-left">
          <div className="text-xs text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wider">Total Investment</div>
          <div className="font-black text-slate-900 dark:text-white text-3xl sm:text-4xl font-mono">
            {isLoadingPricing ? <Loader2 className="h-7 w-7 animate-spin inline-block mt-1" /> : activePricing.formattedPrice}
          </div>
        </div>
        <Button
          onClick={handleUploadAndCheckout}
          disabled={!file || isUploading || isLoadingPricing}
          className="w-full sm:w-auto bg-gradient-to-r from-orange-500 via-amber-500 to-orange-500 dark:from-cyan-600 dark:to-cyan-500 hover:opacity-95 text-white h-14 px-10 text-base font-bold rounded-2xl shadow-lg shadow-orange-500/20 dark:shadow-cyan-500/20 btn-interactive flex items-center justify-center gap-3 disabled:opacity-50 group"
        >
          {isUploading ? (
             <>
               <Loader2 className="h-5 w-5 animate-spin" />
               Processing Order…
             </>
          ) : (
             <>
               <CreditCard className="h-5 w-5 group-hover:scale-110 transition-transform" />
               Proceed to Checkout
               <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
             </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
