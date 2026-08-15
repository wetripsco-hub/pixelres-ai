"use client";

import React, { useState, useCallback, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { UploadCloud, Image as ImageIcon, X, Loader2, Info } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { getAllPricingTiers, ResolutionTier, PricingInfo } from "@/lib/pricing";

interface ImageUploaderProps {
  countryCode: string;
  initialTier?: string;
  onUploadSuccess?: () => void;
}

export function ImageUploader({ countryCode, initialTier = "4k", onUploadSuccess }: ImageUploaderProps) {
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
    // If the URL passes a valid tier, update the state
    if (initialTier && pricingTiers.some(t => t.tier === initialTier)) {
      setSelectedTier(initialTier);
    }
  }, [initialTier, pricingTiers]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setError(null);
    if (acceptedFiles.length > 0) {
      const selectedFile = acceptedFiles[0];
      // Max 25MB check
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

  const handleUpload = async () => {
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

      // Upload to Storage
      setUploadProgress(40);
      const { error: uploadError, data: uploadData } = await supabase.storage
        .from('raw-uploads')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw new Error(uploadError.message);

      setUploadProgress(80);

      // Get public URL or signed URL (if private, you might need a signed URL, but we save path)
      const { data: { publicUrl } } = supabase.storage.from('raw-uploads').getPublicUrl(filePath);
      // Note: 'raw-uploads' is private, so publicUrl won't work directly without RLS or signed url.
      // But we just store the filePath or publicUrl structure in DB and the edge function handles it.
      // Alternatively, just store the full path. We'll store the object path.

      // Insert Order
      const { error: insertError } = await supabase.from('orders').insert({
        id: orderId,
        user_id: user?.id || null, // null if guest
        original_image_url: filePath,
        target_resolution: selectedTier,
        enhancement_type: enhancementType,
        currency: activePricing.currency,
        amount_paid: activePricing.price,
        status: 'pending'
      });

      if (insertError) throw new Error(insertError.message);

      setUploadProgress(100);

      // Reset after brief delay
      setTimeout(() => {
        setFile(null);
        setPreviewUrl(null);
        setIsUploading(false);
        setUploadProgress(0);
        if (onUploadSuccess) onUploadSuccess();
      }, 1000);

    } catch (err: any) {
      console.error("Upload error:", err);
      setError(err.message || "Failed to upload image. Please try again.");
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  return (
    <Card className="bg-slate-900 border-slate-800 shadow-xl w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl text-slate-100 flex items-center gap-2">
          <UploadCloud className="h-6 w-6 text-cyan-400" />
          New Enhancement Order
        </CardTitle>
        <CardDescription className="text-slate-400">
          Upload your image and choose the enhancement parameters.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-8">
        {/* Dropzone */}
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 cursor-pointer relative overflow-hidden ${
            isDragActive ? "border-cyan-500 bg-cyan-950/20" :
            file ? "border-slate-700 bg-slate-900" : "border-slate-700 bg-slate-800/50 hover:border-slate-600 hover:bg-slate-800"
          } ${isUploading ? "pointer-events-none opacity-80" : ""}`}
        >
          <input {...getInputProps()} />

          {previewUrl ? (
            <div className="relative w-full max-h-[300px] flex items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={previewUrl} alt="Preview" className="max-h-[300px] max-w-full rounded-lg object-contain" />
              {!isUploading && (
                <button
                  onClick={handleClear}
                  className="absolute top-2 right-2 bg-slate-950/80 hover:bg-red-500/80 text-white rounded-full p-2 backdrop-blur-sm transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8">
              <div className="h-16 w-16 bg-slate-800 rounded-full flex items-center justify-center mb-4">
                <ImageIcon className="h-8 w-8 text-slate-400" />
              </div>
              <p className="text-slate-200 font-medium mb-1">
                {isDragActive ? "Drop the image here" : "Drag & drop an image, or click to browse"}
              </p>
              <p className="text-sm text-slate-500">
                Supports PNG, JPG, WEBP up to 25MB
              </p>
            </div>
          )}

          {isUploading && (
            <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm flex flex-col items-center justify-center z-10 rounded-xl">
              <Loader2 className="h-10 w-10 text-cyan-400 animate-spin mb-4" />
              <div className="w-64 bg-slate-800 rounded-full h-2 mb-2">
                <div className="bg-cyan-500 h-2 rounded-full transition-all duration-300" style={{ width: `${uploadProgress}%` }}></div>
              </div>
              <span className="text-cyan-400 font-medium">{uploadProgress}%</span>
            </div>
          )}
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-red-400 text-sm flex items-center gap-2">
            <Info className="h-4 w-4" />
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Resolution Selector */}
          <div className="space-y-4">
            <Label className="text-slate-200 font-semibold text-base">Output Resolution</Label>
            <RadioGroup value={selectedTier} onValueChange={setSelectedTier} disabled={isUploading}>
              {pricingTiers.map((tier) => (
                <div key={tier.tier} className="flex items-center space-x-2 border border-slate-800 rounded-lg p-3 bg-slate-950/30 hover:bg-slate-900/50 transition-colors">
                  <RadioGroupItem value={tier.tier} id={`res-${tier.tier}`} className="border-slate-500 text-cyan-500" />
                  <div className="flex-1 cursor-pointer">
                    <Label htmlFor={`res-${tier.tier}`} className="cursor-pointer font-medium text-slate-300 flex items-center justify-between w-full">
                      <span>{tier.label}</span>
                      <span className="text-cyan-400">{tier.formattedPrice}</span>
                    </Label>
                    <p className="text-xs text-slate-500 mt-0.5">{tier.description}</p>
                  </div>
                </div>
              ))}
            </RadioGroup>
          </div>

          {/* Enhancement Type */}
          <div className="space-y-4">
            <Label className="text-slate-200 font-semibold text-base">Enhancement Type</Label>
            <RadioGroup value={enhancementType} onValueChange={setEnhancementType} disabled={isUploading}>
              <div className="flex items-center space-x-2 border border-slate-800 rounded-lg p-3 bg-slate-950/30 hover:bg-slate-900/50 transition-colors">
                <RadioGroupItem value="general" id="type-general" className="border-slate-500 text-cyan-500" />
                <div className="flex-1 cursor-pointer">
                  <Label htmlFor="type-general" className="cursor-pointer font-medium text-slate-300">
                    General Upscale / Denoiser
                  </Label>
                  <p className="text-xs text-slate-500 mt-0.5">Best for landscapes, anime, and general photography.</p>
                </div>
              </div>

              <div className="flex items-center space-x-2 border border-slate-800 rounded-lg p-3 bg-slate-950/30 hover:bg-slate-900/50 transition-colors">
                <RadioGroupItem value="face" id="type-face" className="border-slate-500 text-cyan-500" />
                <div className="flex-1 cursor-pointer">
                  <Label htmlFor="type-face" className="cursor-pointer font-medium text-slate-300">
                    Face / Portrait Restoration
                  </Label>
                  <p className="text-xs text-slate-500 mt-0.5">Specialized models to recover facial details and eyes.</p>
                </div>
              </div>
            </RadioGroup>
          </div>
        </div>
      </CardContent>

      <CardFooter className="bg-slate-950/50 pt-6 flex justify-between items-center rounded-b-xl border-t border-slate-800">
        <div className="text-sm">
          <span className="text-slate-400">Total: </span>
          <span className="font-bold text-white text-lg">{activePricing.formattedPrice}</span>
        </div>
        <Button
          onClick={handleUpload}
          disabled={!file || isUploading}
          className="bg-cyan-600 hover:bg-cyan-500 text-white min-w-[150px]"
        >
          {isUploading ? "Processing..." : "Start Enhancement"}
        </Button>
      </CardFooter>
    </Card>
  );
}
