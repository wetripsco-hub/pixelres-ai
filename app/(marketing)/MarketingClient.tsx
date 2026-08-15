"use client";

import React, { useState, useEffect } from "react";
import { ReactCompareSlider, ReactCompareSliderImage } from "react-compare-slider";
import { CheckCircle2, Zap, Layers, Cpu, ArrowRight, ImageIcon } from "lucide-react";
import { ResolutionTier, getAllPricingTiers, PricingInfo } from "@/lib/pricing";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ImageUploader } from "@/components/dashboard/image-uploader";

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
      <section className="pt-32 pb-20 px-4 sm:px-8 max-w-7xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900/80 border border-slate-700/50 backdrop-blur-sm text-sm text-slate-300 mb-8 animate-fade-in">
          <span className="flex h-2 w-2 rounded-full bg-cyan-500 shadow-[0_0_8px_rgba(6,182,212,0.8)] animate-pulse"></span>
          PixelRes Model v2.4 is now live
        </div>

        <h1 className="text-5xl sm:text-7xl md:text-8xl font-extrabold tracking-tight mb-8 leading-[1.1] animate-fade-in">
          <span className="text-slate-100">Breathe life into your </span>
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-blue-500 to-violet-600">
            low-res images.
          </span>
        </h1>

        <p className="text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed animate-fade-in">
          State-of-the-art AI upscaling. Transform blurry, compressed photos into stunning 4K and 8K masterpieces in seconds. No complex software required.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in">
          <Button
            onClick={() => scrollToUpload()}
            className="w-full sm:w-auto h-14 px-8 text-lg font-semibold bg-cyan-600 hover:bg-cyan-500 text-white rounded-full transition-all hover:scale-105 shadow-[0_0_30px_rgba(6,182,212,0.3)] hover:shadow-[0_0_40px_rgba(6,182,212,0.5)]"
          >
            <ImageIcon className="mr-2 h-5 w-5" />
            Upscale an Image Now
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              document.getElementById('demo')?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="w-full sm:w-auto h-14 px-8 text-lg font-medium rounded-full border-slate-700 bg-slate-900/50 hover:bg-slate-800 hover:text-white backdrop-blur-sm"
          >
            View Interactive Demo
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>

        <p className="mt-6 text-sm text-slate-500 animate-fade-in">Secure payments powered by Stripe.</p>
      </section>

      {/* Before/After Section */}
      <section id="demo" className="py-24 px-4 sm:px-8 max-w-7xl mx-auto flex flex-col items-center">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <Badge variant="outline" className="mb-4 border-cyan-500/30 text-cyan-400 bg-cyan-500/10 px-4 py-1.5 rounded-full backdrop-blur-md">See the Difference</Badge>
          <h2 className="text-4xl sm:text-5xl font-extrabold text-slate-100 tracking-tight">
            Uncover Hidden Details
          </h2>
          <p className="mt-6 text-lg text-slate-400">
            Drag the slider to see how our AI reconstructs lost pixels, enhances textures, and removes compression artifacts.
          </p>
        </div>

        <div className="w-full max-w-5xl rounded-2xl overflow-hidden shadow-2xl shadow-cyan-900/20 border border-slate-800/80 bg-slate-900/50 relative">
          <ReactCompareSlider
            handle={
              <div className="w-1.5 h-full bg-white/80 shadow-[0_0_15px_rgba(255,255,255,0.8)] backdrop-blur-md relative cursor-col-resize group flex items-center justify-center">
                <div className="w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                   <div className="flex gap-1">
                     <div className="w-0.5 h-3 bg-slate-400 rounded-full"></div>
                     <div className="w-0.5 h-3 bg-slate-400 rounded-full"></div>
                   </div>
                </div>
              </div>
            }
            itemOne={
              <ReactCompareSliderImage
                src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=100&w=2000&auto=format&fit=crop"
                alt="Low Resolution Original"
                style={{ filter: 'blur(6px) contrast(0.9) saturate(0.8)' }}
              />
            }
            itemTwo={
              <ReactCompareSliderImage
                src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=100&w=2000&auto=format&fit=crop"
                alt="8K Enhanced Output"
              />
            }
            className="w-full aspect-[4/3] md:aspect-[16/9]"
          />
          <div className="absolute bottom-4 left-4 bg-slate-950/80 backdrop-blur-md px-3 py-1.5 rounded-md border border-slate-700/50 text-xs font-mono text-slate-300 pointer-events-none">
             ORIGINAL (LOW RES)
          </div>
          <div className="absolute bottom-4 right-4 bg-cyan-950/80 backdrop-blur-md px-3 py-1.5 rounded-md border border-cyan-500/50 text-xs font-mono text-cyan-400 font-bold pointer-events-none shadow-[0_0_15px_rgba(6,182,212,0.3)]">
             PIXELRES AI (8K)
          </div>
        </div>
      </section>

      {/* Embedded Uploader */}
      <section id="upload" className="py-24 px-4 sm:px-8 max-w-7xl mx-auto border-t border-slate-800/60 relative">
         <div className="absolute inset-0 bg-gradient-to-b from-slate-900/50 to-transparent pointer-events-none" />
         <div className="relative z-10">
           <div className="text-center max-w-3xl mx-auto mb-16">
             <Badge variant="outline" className="mb-4 border-violet-500/30 text-violet-400 bg-violet-500/10 px-4 py-1.5 rounded-full backdrop-blur-md">Start Enhancing</Badge>
             <h2 className="text-4xl sm:text-5xl font-extrabold text-slate-100 tracking-tight">
               Ready for your masterpiece?
             </h2>
             <p className="mt-6 text-lg text-slate-400">
               Upload your image directly here. We'll secure it, enhance it, and prepare it for download.
             </p>
           </div>

           <ImageUploader countryCode={countryCode} initialTier={selectedTier} />
         </div>
      </section>

      {/* Feature Grid */}
      <section id="features" className="py-24 px-4 sm:px-8 max-w-7xl mx-auto border-t border-slate-800/60">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <Badge variant="outline" className="mb-4 border-cyan-500/30 text-cyan-400 bg-cyan-500/10 px-4 py-1.5 rounded-full backdrop-blur-md">Engineered for Perfection</Badge>
          <h2 className="text-4xl sm:text-5xl font-extrabold text-slate-100 tracking-tight">
            Enterprise-Grade Image Super-Resolution
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="bg-slate-900/40 border-slate-800 hover:border-cyan-500/40 transition-all group hover:bg-slate-900/80 backdrop-blur-sm">
            <CardHeader>
              <div className="h-14 w-14 rounded-2xl bg-cyan-950/60 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mb-6 group-hover:scale-110 transition-transform shadow-lg shadow-cyan-900/20">
                <Zap className="h-7 w-7" />
              </div>
              <CardTitle className="text-xl">Instant 8K Upscaling</CardTitle>
              <CardDescription className="text-base mt-2">
                Scale images up to 800% original dimensions (up to 8K resolution) without introducing blur or jagged edges.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-slate-900/40 border-slate-800 hover:border-violet-500/40 transition-all group hover:bg-slate-900/80 backdrop-blur-sm">
            <CardHeader>
              <div className="h-14 w-14 rounded-2xl bg-violet-950/60 border border-violet-500/30 flex items-center justify-center text-violet-400 mb-6 group-hover:scale-110 transition-transform shadow-lg shadow-violet-900/20">
                <Layers className="h-7 w-7" />
              </div>
              <CardTitle className="text-xl">Face & Detail Restoration</CardTitle>
              <CardDescription className="text-base mt-2">
                Specialized neural models reconstruct micro-details like hair, skin texture, and eye reflections with realistic precision.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-slate-900/40 border-slate-800 hover:border-cyan-500/40 transition-all group hover:bg-slate-900/80 backdrop-blur-sm">
            <CardHeader>
              <div className="h-14 w-14 rounded-2xl bg-cyan-950/60 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mb-6 group-hover:scale-110 transition-transform shadow-lg shadow-cyan-900/20">
                <Cpu className="h-7 w-7" />
              </div>
              <CardTitle className="text-xl">Batch Processing API</CardTitle>
              <CardDescription className="text-base mt-2">
                Integrate PixelRes AI directly into your workflow or app using our lightning-fast REST & GraphQL endpoints.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24 px-4 sm:px-8 max-w-7xl mx-auto border-t border-slate-800/60">
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
              className={`bg-slate-900/50 border-slate-800 flex flex-col justify-between backdrop-blur-sm transition-all hover:border-slate-600 ${tier.tier === '4k' ? 'ring-1 ring-cyan-500/50 shadow-[0_0_30px_rgba(6,182,212,0.15)] relative' : ''}`}
            >
              {tier.tier === '4k' && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-cyan-500 to-violet-600 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-lg">
                  Most Popular
                </div>
              )}
              <CardHeader>
                <Badge variant="outline" className={`w-fit mb-4 ${tier.tier === '4k' ? 'border-cyan-500/50 text-cyan-400 bg-cyan-500/10' : 'border-slate-700 text-slate-400 bg-slate-800/50'}`}>
                  {tier.tier.toUpperCase()} Target
                </Badge>
                <CardTitle className="text-2xl">{tier.label}</CardTitle>
                <div className="mt-6 flex items-baseline gap-1">
                  <span className={`text-5xl font-extrabold ${tier.tier === '4k' ? 'text-cyan-400' : 'text-white'}`}>{tier.formattedPrice}</span>
                  <span className="text-slate-400 text-sm font-medium">/ image</span>
                </div>
                <CardDescription className="mt-3 text-base">{tier.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 text-sm text-slate-300 mt-4">
                <div className="flex items-center gap-3"><CheckCircle2 className="h-5 w-5 text-cyan-400" /> High Priority Processing</div>
                <div className="flex items-center gap-3"><CheckCircle2 className="h-5 w-5 text-cyan-400" /> Face & Texture Restoration</div>
                <div className="flex items-center gap-3"><CheckCircle2 className="h-5 w-5 text-cyan-400" /> Secure Cloud Storage</div>
              </CardContent>
              <CardFooter className="mt-8">
                <Button
                  onClick={() => scrollToUpload(tier.tier)}
                  className={`w-full h-12 text-base font-semibold ${tier.tier === '4k' ? 'bg-cyan-600 hover:bg-cyan-500 text-white' : 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-700'}`}
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
