"use client";

import React, { useState, useCallback, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { UploadCloud, Image as ImageIcon, X, Loader2, Info, CreditCard } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { getAllPricingTiers, ResolutionTier, PricingInfo } from "@/lib/pricing";
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

  const pricingTiers = getAllPricingTiers(countryCode);
  const activePricing = pricingTiers.find((t) => t.tier === selectedTier) || pricingTiers[1];
  const supabase = createClient();

  useEffect(() => {
    if (initialTier && pricingTiers.some(t => t.tier === initialTier)) {
      setSelectedTier(initialTier);
    }
  }, [initialTier, pricingTiers]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setError(null);
    if (acceptedFiles.length > 0) {
      const selectedFile = acceptedFiles[0];
      if (selectedFile.size > 25 * 1024 * 1024) {
        setError("File exceeds 25MB limit.");
        return;
      }
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
    disabled: isUploading,
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

    setIsUploading(true);
    setError(null);
    setUploadProgress(10);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      const userId = user?.id || 'guest';
      const orderId = crypto.randomUUID();
      const fileExt = file.name.split('.').pop();
      const filePath = `${userId}/${orderId}.${fileExt}`;

      setUploadProgress(40);
      const { error: uploadError } = await supabase.storage
        .from('raw-uploads')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw new Error(uploadError.message);

      setUploadProgress(80);

      const { error: insertError } = await supabase.from('orders').insert({
        id: orderId,
        user_id: user?.id || null,
        original_image_url: filePath,
        target_resolution: selectedTier,
        enhancement_type: enhancementType,
        currency: activePricing.currency,
        amount_paid: activePricing.price,
        status: 'pending' // Remains pending until Stripe webhook triggers
      });

      if (insertError) throw new Error(insertError.message);

      setUploadProgress(100);

      const checkoutResponse = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId,
          tier: selectedTier,
          enhancementType,
          currency: activePricing.currency,
          amount: activePricing.price,
          customerEmail: user?.email,
          userId: user?.id
        })
      });

      const checkoutData = await checkoutResponse.json();

      if (!checkoutResponse.ok) {
        throw new Error(checkoutData.error || 'Failed to initialize checkout');
      }

      window.location.href = checkoutData.url;

    } catch (err: any) {
      console.error("Upload/Checkout error:", err);
      setError(err.message || "An error occurred. Please try again.");
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  return (
    <Card className="bg-slate-950/40 border-slate-800/80 shadow-2xl w-full max-w-4xl mx-auto rounded-[2rem] overflow-hidden backdrop-blur-md">
      <CardHeader className="bg-slate-900/40 border-b border-slate-800/50 p-6 sm:p-8">
        <CardTitle className="text-2xl text-slate-100 flex items-center gap-2 font-bold">
          <div className="h-10 w-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
             <UploadCloud className="h-5 w-5" />
          </div>
          New Enhancement Order
        </CardTitle>
        <CardDescription className="text-slate-400 text-base mt-2">
          Upload your image and configure the AI enhancement parameters.
        </CardDescription>
      </CardHeader>

      <CardContent className="p-6 sm:p-8 space-y-8">
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center transition-all duration-300 cursor-pointer relative overflow-hidden group ${
            isDragActive ? "border-cyan-500 bg-cyan-950/20 shadow-[inset_0_0_50px_rgba(6,182,212,0.1)]" :
            file ? "border-slate-700 bg-slate-900/50" : "border-slate-700 bg-slate-900/30 hover:border-slate-500 hover:bg-slate-900/50"
          } ${isUploading ? "pointer-events-none opacity-80" : ""}`}
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
                <img src={previewUrl} alt="Preview" className="max-h-[400px] max-w-full rounded-xl object-contain shadow-2xl" />
                {!isUploading && (
                  <button
                    onClick={handleClear}
                    className="absolute top-4 right-4 bg-slate-950/80 hover:bg-red-500 text-white rounded-full p-2.5 backdrop-blur-md transition-colors shadow-lg"
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
                className="flex flex-col items-center justify-center py-8"
              >
                <div className="h-20 w-20 bg-slate-800/80 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-slate-800 transition-all duration-300 shadow-xl border border-slate-700">
                  <ImageIcon className="h-10 w-10 text-slate-400 group-hover:text-cyan-400 transition-colors" />
                </div>
                <p className="text-slate-200 font-semibold text-lg mb-2">
                  {isDragActive ? "Drop the image here" : "Drag & drop an image, or click to browse"}
                </p>
                <p className="text-sm text-slate-500 font-medium">
                  Supports PNG, JPG, WEBP up to 25MB
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {isUploading && (
            <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md flex flex-col items-center justify-center z-10 rounded-2xl">
              <Loader2 className="h-12 w-12 text-cyan-400 animate-spin mb-6" />
              <div className="w-72 bg-slate-800/50 rounded-full h-3 mb-3 border border-slate-700/50 overflow-hidden p-0.5">
                <div className="bg-gradient-to-r from-cyan-600 to-cyan-400 h-full rounded-full transition-all duration-300 ease-out shadow-[0_0_10px_rgba(6,182,212,0.5)]" style={{ width: `${uploadProgress}%` }}></div>
              </div>
              <span className="text-cyan-100 font-medium text-lg">{uploadProgress < 100 ? `${uploadProgress}%` : "Redirecting to checkout..."}</span>
            </div>
          )}
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-red-400 text-sm flex items-center gap-3">
            <Info className="h-5 w-5 shrink-0" />
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
          <div className="space-y-5">
            <Label className="text-slate-100 font-bold text-lg flex items-center gap-2">
              <span className="bg-cyan-500/20 text-cyan-400 h-6 w-6 rounded-full flex items-center justify-center text-xs">1</span>
              Output Resolution
            </Label>
            <RadioGroup value={selectedTier} onValueChange={setSelectedTier} disabled={isUploading} className="gap-3">
              {pricingTiers.map((tier) => (
                <div key={tier.tier} className={`flex items-start space-x-3 border rounded-xl p-4 transition-all duration-200 ${selectedTier === tier.tier ? 'border-cyan-500 bg-cyan-500/5 shadow-[0_0_15px_rgba(6,182,212,0.1)]' : 'border-slate-800 bg-slate-900/40 hover:bg-slate-900/80 hover:border-slate-700'}`}>
                  <RadioGroupItem value={tier.tier} id={`res-${tier.tier}`} className="border-slate-500 text-cyan-500 mt-0.5" />
                  <div className="flex-1 cursor-pointer w-full">
                    <Label htmlFor={`res-${tier.tier}`} className="cursor-pointer font-bold text-slate-200 flex items-center justify-between w-full text-base">
                      <span>{tier.label}</span>
                      <span className="text-cyan-400">{tier.formattedPrice}</span>
                    </Label>
                    <p className="text-sm text-slate-500 mt-1">{tier.description}</p>
                  </div>
                </div>
              ))}
            </RadioGroup>
          </div>

          <div className="space-y-5">
            <Label className="text-slate-100 font-bold text-lg flex items-center gap-2">
              <span className="bg-violet-500/20 text-violet-400 h-6 w-6 rounded-full flex items-center justify-center text-xs">2</span>
              Enhancement Type
            </Label>
            <RadioGroup value={enhancementType} onValueChange={setEnhancementType} disabled={isUploading} className="gap-3">
              <div className={`flex items-start space-x-3 border rounded-xl p-4 transition-all duration-200 ${enhancementType === 'general' ? 'border-violet-500 bg-violet-500/5 shadow-[0_0_15px_rgba(139,92,246,0.1)]' : 'border-slate-800 bg-slate-900/40 hover:bg-slate-900/80 hover:border-slate-700'}`}>
                <RadioGroupItem value="general" id="type-general" className="border-slate-500 text-violet-500 mt-0.5" />
                <div className="flex-1 cursor-pointer">
                  <Label htmlFor="type-general" className="cursor-pointer font-bold text-slate-200 text-base">
                    General Upscale / Denoiser
                  </Label>
                  <p className="text-sm text-slate-500 mt-1">Best for landscapes, anime, and general photography.</p>
                </div>
              </div>

              <div className={`flex items-start space-x-3 border rounded-xl p-4 transition-all duration-200 ${enhancementType === 'face' ? 'border-violet-500 bg-violet-500/5 shadow-[0_0_15px_rgba(139,92,246,0.1)]' : 'border-slate-800 bg-slate-900/40 hover:bg-slate-900/80 hover:border-slate-700'}`}>
                <RadioGroupItem value="face" id="type-face" className="border-slate-500 text-violet-500 mt-0.5" />
                <div className="flex-1 cursor-pointer">
                  <Label htmlFor="type-face" className="cursor-pointer font-bold text-slate-200 text-base">
                    Face / Portrait Restoration
                  </Label>
                  <p className="text-sm text-slate-500 mt-1">Specialized models to recover facial details and eyes.</p>
                </div>
              </div>
            </RadioGroup>
          </div>
        </div>
      </CardContent>

      <CardFooter className="bg-slate-900/60 p-6 sm:p-8 flex flex-col sm:flex-row justify-between items-center border-t border-slate-800/50 gap-6">
        <div className="text-center sm:text-left">
          <div className="text-sm text-slate-400 font-medium">Total Cost</div>
          <div className="font-extrabold text-white text-3xl">{activePricing.formattedPrice}</div>
        </div>
        <Button
          onClick={handleUploadAndCheckout}
          disabled={!file || isUploading}
          className="w-full sm:w-auto bg-cyan-600 hover:bg-cyan-500 text-white h-14 px-8 text-lg font-semibold rounded-xl shadow-[0_0_20px_rgba(6,182,212,0.3)] hover:shadow-[0_0_30px_rgba(6,182,212,0.5)] transition-all flex items-center justify-center gap-3"
        >
          {isUploading ? (
             <>
               <Loader2 className="h-5 w-5 animate-spin" />
               Processing...
             </>
          ) : (
             <>
               <CreditCard className="h-5 w-5" />
               Proceed to Checkout
             </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
