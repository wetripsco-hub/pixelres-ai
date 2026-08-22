"use client";

import React, { useState, useEffect } from "react";
import { ReactCompareSlider, ReactCompareSliderImage } from "react-compare-slider";
import { Zap, Layers, Cpu, ArrowRight, Globe, Star, Sparkles, Printer, ScanFace, Cloud, Banknote } from "lucide-react";
import { 
  ResolutionTier, 
  getPricingTiersFromConfig, 
  getAllPricingTiersDynamic, 
  PricingInfo, 
  PricingConfig, 
  DEFAULT_PRICING 
} from "@/lib/pricing";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface MarketingClientProps {
  initialCountryCode: string;
  initialPricing?: PricingConfig;
}

export function MarketingClient({ initialCountryCode, initialPricing = DEFAULT_PRICING }: MarketingClientProps) {
  const [selectedTier, setSelectedTier] = useState<ResolutionTier>("4k");
  const [countryCode, setCountryCode] = useState(initialCountryCode);
  const [pricingConfig, setPricingConfig] = useState<PricingConfig>(initialPricing);

  // Client-side Geo-IP fallback & live pricing fetch
  useEffect(() => {
    fetch('https://ipapi.co/json/')
      .then(res => res.json())
      .then(data => {
        if (data && data.country_code) {
          setCountryCode(data.country_code);
        }
      })
      .catch(err => console.error('Geo-IP fetch failed:', err));

    getAllPricingTiersDynamic(countryCode).then(tiers => {
      if (tiers && tiers.length > 0) {
        // dynamic pricing active
      }
    });
  }, [countryCode]);

  const pricingTiers = getPricingTiersFromConfig(pricingConfig, countryCode);

  const features = [
    {
      icon: <Printer className="h-5 w-5" />,
      title: "8K Ultra-Print Ready",
      description: "Generate professional-grade prints up to 800% original resolution. Perfect for massive fine-art prints and high-DPI publishing workflows.",
      accent: "orange",
    },
    {
      icon: <ScanFace className="h-5 w-5" />,
      title: "AI Portrait & Face Restoration",
      description: "Intelligent face enhancement reconstructs micro-details like hair, skin texture, and eye reflections with realistic precision.",
      accent: "violet",
    },
    {
      icon: <Cloud className="h-5 w-5" />,
      title: "Instant Cloud Processing",
      description: "Fast, secure cloud-based upscaling powered by our massive GPU cluster. Your images are processed in seconds.",
      accent: "orange",
    },
    {
      icon: <Banknote className="h-5 w-5" />,
      title: "Multi-Currency Dynamic Pricing",
      description: "Pay in your local currency. We automatically adjust rates for USD, PKR, and INR for global accessibility.",
      accent: "violet",
    },
  ];

  return (
    <div className="w-full">
      {/* ───────────────── HERO SECTION ───────────────── */}
      <section className="pt-12 pb-24 px-4 sm:px-8 max-w-7xl mx-auto relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
          {/* Left: Copy */}
          <div className="lg:w-5/12 flex flex-col gap-6 items-start">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-500/10 dark:bg-cyan-500/10 border border-orange-500/25 dark:border-cyan-500/30 text-xs font-bold text-orange-600 dark:text-cyan-400 shadow-sm">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Next-Gen Neural Upscaling 2.0</span>
            </div>

            <h1 className="text-4xl sm:text-6xl font-black leading-tight tracking-tight text-slate-900 dark:text-slate-100">
              Turn Low-Res Photos into{" "}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-orange-500 via-amber-500 to-orange-500 dark:from-cyan-400 dark:to-violet-400">
                8K Masterpieces
              </span>
            </h1>

            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400 leading-relaxed max-w-md">
              Instantly enhance, denoise, and upscale your images up to 8000px using proprietary deep learning models with zero compression loss.
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
              <Link href="/studio">
                <Button
                  className="w-full sm:w-auto px-8 py-4 h-14 rounded-2xl text-base font-extrabold shadow-lg bg-gradient-to-r from-orange-500 via-amber-500 to-orange-500 dark:from-cyan-600 dark:to-cyan-500 hover:opacity-95 text-white shadow-orange-500/25 dark:shadow-cyan-500/30 btn-interactive flex items-center justify-center gap-2"
                >
                  <span>Upscale Photos Now</span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>

              <Link href="/pricing">
                <Button
                  variant="outline"
                  className="w-full sm:w-auto px-6 h-14 rounded-2xl text-base font-bold border-slate-200 dark:border-white/10 bg-white/80 dark:bg-slate-900/60 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200"
                >
                  View Pricing
                </Button>
              </Link>
            </div>
          </div>

          {/* Right: Interactive Comparison Slider */}
          <div className="lg:w-7/12 w-full relative">
            <div className="w-full aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl relative border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-950">
              <ReactCompareSlider
                handle={
                  <div className="w-1 h-full bg-white/90 shadow-[0_0_20px_rgba(255,255,255,0.9)] backdrop-blur-md relative cursor-col-resize group flex items-center justify-center">
                    <div className="w-8 h-12 bg-white rounded-full shadow-xl flex items-center justify-center group-hover:scale-110 transition-transform border border-slate-200/30">
                      <svg className="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path d="M8 9l4-4 4 4m0 6l-4 4-4-4" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                      </svg>
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
                className="w-full h-full"
              />
              {/* Before / After Labels */}
              <div className="absolute top-4 left-4 bg-slate-900/80 dark:bg-slate-950/80 backdrop-blur-md text-white text-xs font-bold px-3 py-1 rounded-full z-10 border border-white/10 shadow-md">
                Before
              </div>
              <div className="absolute top-4 right-4 bg-orange-500/90 dark:bg-cyan-500/90 backdrop-blur-md text-white text-xs font-bold px-3 py-1 rounded-full z-10 border border-white/20 shadow-md">
                8K Enhanced
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ───────────────── FEATURES & UPLOAD SECTION ───────────────── */}
      <section id="features" className="py-24 px-4 sm:px-8 max-w-7xl mx-auto relative z-10 border-t border-slate-200/80 dark:border-white/10">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/25 text-violet-600 dark:text-violet-400 text-xs font-bold">
            Features & Capabilities
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
            Unlock the Future of Imaging
          </h2>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400">
            Professional AI super-resolution pipeline tuned for photographs, illustrations, and print graphics.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* Left: 2×2 Feature Card Grid */}
          <div className="lg:w-5/12 grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
            {features.map((feat, i) => (
              <div
                key={i}
                className="rounded-3xl p-6 border border-slate-200/90 dark:border-white/10 bg-white/80 dark:bg-slate-900/60 backdrop-blur-md flex flex-col gap-3 shadow-sm hover:border-orange-500/40 dark:hover:border-cyan-500/40 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
                    feat.accent === "orange"
                      ? "bg-orange-500/10 border border-orange-500/20 text-orange-600 dark:text-cyan-400"
                      : "bg-violet-500/10 border border-violet-500/20 text-violet-600 dark:text-violet-400"
                  } group-hover:scale-110 transition-transform`}>
                    {feat.icon}
                  </div>
                  <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">{feat.title}</h3>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{feat.description}</p>
              </div>
            ))}
          </div>

          {/* Right: Upload Prompt / CTA Zone */}
          <div className="lg:w-7/12 w-full rounded-3xl border-2 border-dashed border-slate-300 dark:border-slate-700 bg-white/80 dark:bg-slate-950/60 backdrop-blur-md p-8 sm:p-10 flex flex-col items-center justify-center gap-6 text-center shadow-card dark:shadow-card-dark hover:border-orange-500/50 dark:hover:border-cyan-500/50 transition-colors">
            <div className="w-14 h-14 bg-orange-500/10 dark:bg-slate-900 rounded-3xl shadow-md flex items-center justify-center text-orange-600 dark:text-cyan-400 border border-orange-500/20 dark:border-slate-800">
              <Sparkles className="h-7 w-7" />
            </div>

            <div>
              <h3 className="text-xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
                Drag &amp; Drop Photos or Click to Upload
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Select your resolution tier to see instant localized rates
              </p>
            </div>

            {/* Tier Selector Pills */}
            <div className="flex items-center gap-2.5">
              {pricingTiers.map((tier) => (
                <button
                  key={tier.tier}
                  onClick={() => setSelectedTier(tier.tier)}
                  className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all ${
                    selectedTier === tier.tier
                      ? "bg-orange-500/15 dark:bg-cyan-500/20 text-orange-600 dark:text-cyan-300 border border-orange-500/40 dark:border-cyan-500/40 shadow-sm"
                      : "bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:border-slate-300"
                  }`}
                >
                  {tier.tier === "web" ? "Web (~2K)" : tier.tier === "4k" ? "4K Ultra HD" : "8K Print"}
                </button>
              ))}
            </div>

            {/* Localized Price Display */}
            <div className="flex flex-col gap-1 p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-white/10 w-full max-w-sm">
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Dynamic Regional Price</span>
              <div className="flex items-center justify-center gap-1.5 font-mono">
                <span className="text-2xl font-black text-slate-900 dark:text-white">
                  {pricingTiers.find(t => t.tier === selectedTier)?.formattedPrice || pricingTiers[0].formattedPrice}
                </span>
                <span className="text-xs text-slate-500">/ image</span>
              </div>
            </div>

            <Link href={`/studio?tier=${selectedTier}`}>
              <Button className="px-8 py-3.5 h-12 rounded-2xl font-bold bg-gradient-to-r from-orange-500 via-amber-500 to-orange-500 dark:from-cyan-600 dark:to-cyan-500 hover:opacity-95 text-white shadow-lg shadow-orange-500/20 dark:shadow-cyan-500/30 btn-interactive flex items-center gap-2">
                Launch Studio Workspace <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ───────────────── CUSTOMER REVIEWS ───────────────── */}
      <section className="py-24 px-4 sm:px-8 max-w-7xl mx-auto relative z-10 border-t border-slate-200/80 dark:border-white/10">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-2">
          <Badge variant="outline" className="mb-2 border-violet-500/30 text-violet-600 dark:text-violet-400 bg-violet-500/10 px-4 py-1 rounded-full text-xs font-bold">
            Wall of Love
          </Badge>
          <h2 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
            Loved by Creators Worldwide
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              name: "Sarah Jenkins",
              role: "Commercial Photographer",
              content: "The 8K upscales are breathtaking. I blew up a cropped 12MP shot to a 40-inch gallery print and the fine texture fidelity is flawless.",
              rating: 5
            },
            {
              name: "Alex Rivera",
              role: "Creative Director",
              content: "We use PixelRes AI across our branding agency. The face restoration is subtle and natural without that weird waxy AI look.",
              rating: 5
            },
            {
              name: "David Chen",
              role: "E-Commerce Founder",
              content: "Pay-as-you-go pricing without sneaky monthly subscriptions is a game changer for our seasonal catalog batches.",
              rating: 5
            }
          ].map((review, i) => (
            <div key={i} className="p-7 rounded-3xl bg-white/80 dark:bg-slate-900/60 border border-slate-200/90 dark:border-white/10 backdrop-blur-md shadow-sm space-y-4">
              <div className="flex text-amber-500 gap-1">
                {[...Array(review.rating)].map((_, j) => (
                  <Star key={j} className="h-4 w-4 fill-amber-500" />
                ))}
              </div>
              <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed">&ldquo;{review.content}&rdquo;</p>
              <div className="border-t border-slate-100 dark:border-white/10 pt-4 flex items-center justify-between">
                <div>
                  <div className="font-bold text-xs text-slate-900 dark:text-slate-200">{review.name}</div>
                  <div className="text-[11px] text-slate-500">{review.role}</div>
                </div>
                <Badge variant="outline" className="text-[10px] text-emerald-600 dark:text-emerald-400 border-emerald-500/20 bg-emerald-500/10">
                  Verified Order
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
