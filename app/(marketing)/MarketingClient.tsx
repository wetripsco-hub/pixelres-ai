"use client";

import React, { useState, useEffect } from "react";
import { ReactCompareSlider, ReactCompareSliderImage } from "react-compare-slider";
import { CheckCircle2, Zap, Layers, Cpu, ArrowRight, ImageIcon, Sparkles, Globe } from "lucide-react";
import { ResolutionTier, getAllPricingTiers, PricingInfo } from "@/lib/pricing";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ImageUploader } from "@/components/dashboard/image-uploader";
import { motion } from "framer-motion";

interface MarketingClientProps {
  initialCountryCode: string;
}

export function MarketingClient({ initialCountryCode }: MarketingClientProps) {
  const [selectedTier, setSelectedTier] = useState<ResolutionTier>("4k");
  const [countryCode, setCountryCode] = useState(initialCountryCode);

  // Client-side Geo-IP fallback
  useEffect(() => {
    fetch('https://ipapi.co/json/')
      .then(res => res.json())
      .then(data => {
        if (data && data.country_code) {
          setCountryCode(data.country_code);
        }
      })
      .catch(err => console.error('Geo-IP fetch failed:', err));
  }, []);

  const pricingTiers = getAllPricingTiers(countryCode);

  const scrollToUpload = (tier?: ResolutionTier) => {
    if (tier) setSelectedTier(tier);
    const element = document.getElementById('upload');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="pt-32 pb-24 px-4 sm:px-8 max-w-7xl mx-auto text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900/80 border border-cyan-500/30 backdrop-blur-md text-sm text-cyan-100 mb-8 shadow-[0_0_15px_rgba(6,182,212,0.15)]"
        >
          <Sparkles className="h-4 w-4 text-cyan-400" />
          ⚡ Next-Gen 8K Image Upscaling & Restoration
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-5xl sm:text-7xl md:text-8xl font-extrabold tracking-tight mb-8 leading-[1.1]"
        >
          <span className="text-slate-100">Breathe life into your </span>
          <br className="hidden sm:block" />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-blue-500 to-violet-500">
            low-res images.
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto mb-12 leading-relaxed"
        >
          State-of-the-art AI upscaling. Transform blurry, compressed photos into stunning 4K and 8K masterpieces in seconds. No complex software required.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Button
            onClick={() => scrollToUpload()}
            className="w-full sm:w-auto h-14 px-10 text-lg font-semibold bg-cyan-600 hover:bg-cyan-500 text-white rounded-full transition-all hover:scale-105 shadow-[0_0_30px_rgba(6,182,212,0.4)]"
          >
            Upscale Your Image
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              document.getElementById('demo')?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="w-full sm:w-auto h-14 px-10 text-lg font-medium rounded-full border-slate-700 bg-slate-900/50 hover:bg-slate-800 hover:text-white backdrop-blur-sm transition-all hover:scale-105"
          >
            View Interactive Demo
          </Button>
        </motion.div>
      </section>

      {/* Before/After Section */}
      <section id="demo" className="py-16 px-4 sm:px-8 max-w-7xl mx-auto flex flex-col items-center relative z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="w-full max-w-6xl p-2 rounded-[2rem] bg-gradient-to-br from-slate-800/80 to-slate-900/40 backdrop-blur-xl border border-slate-700/50 shadow-2xl shadow-cyan-900/20"
        >
          <div className="rounded-[1.5rem] overflow-hidden relative bg-slate-950">
            <ReactCompareSlider
              handle={
                <div className="w-1.5 h-full bg-white/90 shadow-[0_0_20px_rgba(255,255,255,0.9)] backdrop-blur-md relative cursor-col-resize group flex items-center justify-center">
                  <div className="w-10 h-10 bg-white rounded-full shadow-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                     <div className="flex gap-1.5">
                       <div className="w-0.5 h-4 bg-slate-400 rounded-full"></div>
                       <div className="w-0.5 h-4 bg-slate-400 rounded-full"></div>
                     </div>
                  </div>
                </div>
              }
              itemOne={
                <ReactCompareSliderImage
                  src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=100&w=2000&auto=format&fit=crop"
                  alt="Low Resolution Original"
                  style={{ filter: 'blur(8px) contrast(0.85) saturate(0.8)' }}
                />
              }
              itemTwo={
                <ReactCompareSliderImage
                  src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=100&w=2000&auto=format&fit=crop"
                  alt="8K Enhanced Output"
                />
              }
              className="w-full aspect-[4/3] md:aspect-[21/9]"
            />
            <div className="absolute bottom-6 left-6 bg-slate-950/80 backdrop-blur-md px-4 py-2 rounded-lg border border-slate-700/50 text-xs sm:text-sm font-mono text-slate-300 pointer-events-none shadow-lg">
               ORIGINAL (LOW RES)
            </div>
            <div className="absolute bottom-6 right-6 bg-cyan-950/80 backdrop-blur-md px-4 py-2 rounded-lg border border-cyan-500/50 text-xs sm:text-sm font-mono text-cyan-400 font-bold pointer-events-none shadow-[0_0_20px_rgba(6,182,212,0.4)]">
               PIXELRES AI (8K)
            </div>
          </div>
        </motion.div>
      </section>

      {/* Bento Grid Feature Showcase */}
      <section id="features" className="py-24 px-4 sm:px-8 max-w-7xl mx-auto relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <Badge variant="outline" className="mb-4 border-cyan-500/30 text-cyan-400 bg-cyan-500/10 px-4 py-1.5 rounded-full backdrop-blur-md">Engineered for Perfection</Badge>
          <h2 className="text-4xl sm:text-5xl font-extrabold text-slate-100 tracking-tight">
            Enterprise-Grade Features
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[300px]">
          {/* Large Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="md:col-span-2 md:row-span-2 rounded-[2rem] bg-gradient-to-br from-slate-900/80 to-slate-900/30 border border-slate-800/80 backdrop-blur-md p-10 flex flex-col justify-end relative overflow-hidden group hover:border-cyan-500/50 transition-colors"
          >
            <div className="absolute inset-0 bg-gradient-to-t from-cyan-900/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="absolute -right-20 -top-20 w-[400px] h-[400px] bg-cyan-500/10 rounded-full blur-[100px] pointer-events-none" />
            <div className="relative z-10">
              <div className="h-16 w-16 rounded-2xl bg-cyan-950/80 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mb-6 shadow-lg shadow-cyan-900/30 group-hover:scale-110 transition-transform duration-500">
                <Zap className="h-8 w-8" />
              </div>
              <h3 className="text-3xl font-bold text-slate-100 mb-4">8K Ultra-Print Scaling</h3>
              <p className="text-lg text-slate-400 max-w-lg">
                Scale images up to 800% their original dimensions without introducing blur or jagged edges. Perfect for massive fine-art prints and high-DPI publishing.
              </p>
            </div>
          </motion.div>

          {/* Small Card 1 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="rounded-[2rem] bg-slate-900/50 border border-slate-800/80 backdrop-blur-md p-8 flex flex-col relative overflow-hidden group hover:border-violet-500/50 transition-colors"
          >
            <div className="h-14 w-14 rounded-2xl bg-violet-950/80 border border-violet-500/30 flex items-center justify-center text-violet-400 mb-6 group-hover:scale-110 transition-transform duration-500">
              <Layers className="h-7 w-7" />
            </div>
            <h3 className="text-xl font-bold text-slate-100 mb-2">Face Restoration</h3>
            <p className="text-slate-400 text-sm flex-1">
              Specialized neural models reconstruct micro-details like hair, skin texture, and eye reflections with realistic precision.
            </p>
          </motion.div>

          {/* Small Card 2 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="rounded-[2rem] bg-slate-900/50 border border-slate-800/80 backdrop-blur-md p-8 flex flex-col relative overflow-hidden group hover:border-cyan-500/50 transition-colors"
          >
            <div className="h-14 w-14 rounded-2xl bg-cyan-950/80 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mb-6 group-hover:scale-110 transition-transform duration-500">
              <Cpu className="h-7 w-7" />
            </div>
            <h3 className="text-xl font-bold text-slate-100 mb-2">Instant Cloud Processing</h3>
            <p className="text-slate-400 text-sm flex-1">
              Leverage our massive GPU cluster. Your upscales are processed in seconds and securely delivered via the cloud.
            </p>
          </motion.div>

          {/* Small Card 3 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="rounded-[2rem] bg-slate-900/50 border border-slate-800/80 backdrop-blur-md p-8 flex flex-col relative overflow-hidden group hover:border-emerald-500/50 transition-colors"
          >
            <div className="h-14 w-14 rounded-2xl bg-emerald-950/80 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-6 group-hover:scale-110 transition-transform duration-500">
              <Globe className="h-7 w-7" />
            </div>
            <h3 className="text-xl font-bold text-slate-100 mb-2">Localized Pricing</h3>
            <p className="text-slate-400 text-sm flex-1">
              Pay in your local currency. We automatically adjust rates for USD, PKR, and INR to provide global accessibility.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Embedded Uploader & Pricing Section */}
      <section id="upload" className="py-24 px-4 sm:px-8 max-w-7xl mx-auto border-t border-slate-800/40 relative z-10">
         <div className="text-center max-w-3xl mx-auto mb-16">
           <Badge variant="outline" className="mb-4 border-violet-500/30 text-violet-400 bg-violet-500/10 px-4 py-1.5 rounded-full backdrop-blur-md">Start Enhancing</Badge>
           <h2 className="text-4xl sm:text-5xl font-extrabold text-slate-100 tracking-tight">
             Upload & Upscale
           </h2>
           <p className="mt-6 text-lg text-slate-400">
             Drop your image below, select your target resolution, and our AI will do the rest.
           </p>
         </div>

         <div className="bg-slate-900/30 p-4 sm:p-8 rounded-[2rem] border border-slate-800/80 backdrop-blur-xl">
           <ImageUploader countryCode={countryCode} initialTier={selectedTier} />
         </div>
      </section>

      {/* Pricing / Tiers Quick Ref */}
      <section id="pricing" className="py-24 px-4 sm:px-8 max-w-7xl mx-auto border-t border-slate-800/40 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <Badge variant="outline" className="mb-4 border-cyan-500/30 text-cyan-400 bg-cyan-500/10 px-4 py-1.5 rounded-full backdrop-blur-md">Transparent Pricing</Badge>
          <h2 className="text-4xl sm:text-5xl font-extrabold text-slate-100 tracking-tight">
            Pay As You Go
          </h2>
          <p className="mt-6 text-lg text-slate-400">
            No subscriptions required. Just pay for the resolution you need.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {pricingTiers.map((tier) => (
            <Card
              key={tier.tier}
              className={`bg-slate-900/50 border-slate-800/80 flex flex-col justify-between backdrop-blur-md transition-all hover:border-slate-600 rounded-[1.5rem] ${tier.tier === '4k' ? 'ring-1 ring-cyan-500/50 shadow-[0_0_30px_rgba(6,182,212,0.15)] relative transform md:-translate-y-4' : ''}`}
            >
              {tier.tier === '4k' && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-cyan-500 to-violet-600 text-white text-xs font-bold px-4 py-1 rounded-full uppercase tracking-wider shadow-lg">
                  Most Popular
                </div>
              )}
              <CardHeader className="p-8">
                <Badge variant="outline" className={`w-fit mb-6 ${tier.tier === '4k' ? 'border-cyan-500/50 text-cyan-400 bg-cyan-500/10' : 'border-slate-700 text-slate-400 bg-slate-800/50'}`}>
                  {tier.tier.toUpperCase()} Target
                </Badge>
                <CardTitle className="text-3xl font-bold">{tier.label}</CardTitle>
                <div className="mt-6 flex items-baseline gap-1">
                  <span className={`text-5xl font-extrabold ${tier.tier === '4k' ? 'text-cyan-400' : 'text-white'}`}>{tier.formattedPrice}</span>
                  <span className="text-slate-400 text-sm font-medium">/ image</span>
                </div>
                <CardDescription className="mt-4 text-base">{tier.description}</CardDescription>
              </CardHeader>
              <CardContent className="px-8 space-y-4 text-sm text-slate-300">
                <div className="flex items-center gap-3"><CheckCircle2 className="h-5 w-5 text-cyan-500" /> High Priority Processing</div>
                <div className="flex items-center gap-3"><CheckCircle2 className="h-5 w-5 text-cyan-500" /> Face & Texture Restoration</div>
                <div className="flex items-center gap-3"><CheckCircle2 className="h-5 w-5 text-cyan-500" /> Secure Cloud Storage</div>
              </CardContent>
              <CardFooter className="p-8 mt-4 border-t border-slate-800/50">
                <Button
                  onClick={() => scrollToUpload(tier.tier)}
                  className={`w-full h-14 rounded-xl text-base font-semibold transition-all ${tier.tier === '4k' ? 'bg-cyan-600 hover:bg-cyan-500 text-white hover:shadow-[0_0_20px_rgba(6,182,212,0.4)]' : 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-700'}`}
                >
                  Select & Upload
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
