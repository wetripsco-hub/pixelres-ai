"use client";

import React, { useState, useEffect } from "react";
import { ReactCompareSlider, ReactCompareSliderImage } from "react-compare-slider";
import { Zap, Layers, Cpu, ArrowRight, Globe, Star, Sparkles, Printer, ScanFace, Cloud, Banknote } from "lucide-react";
import { ResolutionTier, getAllPricingTiers, PricingInfo } from "@/lib/pricing";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";

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
    if (tier) {
      window.location.href = `/studio?tier=${tier}`;
    } else {
      window.location.href = '/studio';
    }
  };

  const features = [
    {
      icon: <Printer className="h-5 w-5" />,
      title: "8K Ultra-Print Ready",
      description: "Generate professional-grade prints up to 800% original resolution. Perfect for massive fine-art prints and high-DPI publishing workflows.",
      accent: "cyan",
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
      accent: "cyan",
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
      <section className="pt-12 pb-24 px-6 max-w-7xl mx-auto relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
          {/* Left: Copy */}
          <div className="lg:w-5/12 flex flex-col gap-6 items-start">
            <h1 className="text-5xl lg:text-6xl font-extrabold leading-tight tracking-tight">
              <span className="text-slate-100">Turn Low-Res</span>
              <br />
              <span className="text-slate-100">Photos into </span>
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-violet-400">
                8K Masterpieces
              </span>
            </h1>
            <p className="text-lg text-slate-400 leading-relaxed max-w-md">
              Instantly enhance and upscale your images using advanced AI technology for professional-quality results.
            </p>
            <Link href="/studio">
              <button
                className="mt-4 px-8 py-4 rounded-full text-lg font-medium shadow-lg bg-gradient-to-r from-cyan-400 to-violet-500 text-white hover:opacity-90 transition-all hover:scale-105 shadow-[0_0_30px_rgba(6,182,212,0.3)]"
              >
                Upscale Your Photos Now
              </button>
            </Link>
          </div>

          {/* Right: Interactive Comparison Slider */}
          <div className="lg:w-7/12 w-full relative">
            <div className="w-full aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl relative border border-slate-800 bg-slate-950">
              <ReactCompareSlider
                handle={
                  <div className="w-1 h-full bg-white/90 shadow-[0_0_20px_rgba(255,255,255,0.9)] backdrop-blur-md relative cursor-col-resize group flex items-center justify-center">
                    <div className="w-8 h-12 bg-white rounded-full shadow-xl flex items-center justify-center group-hover:scale-110 transition-transform border border-slate-200/30">
                      <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
              <div className="absolute top-4 left-4 bg-slate-950/70 backdrop-blur-md text-white text-xs px-3 py-1 rounded-full z-10 border border-slate-700/50">
                Before
              </div>
              <div className="absolute top-4 right-4 bg-cyan-500/20 backdrop-blur-md text-cyan-300 text-xs px-3 py-1 rounded-full z-10 border border-cyan-500/40 shadow-[0_0_12px_rgba(6,182,212,0.4)]">
                After
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ───────────────── FEATURES & UPLOAD SECTION ───────────────── */}
      <section id="features" className="py-24 px-6 max-w-7xl mx-auto relative z-10">
        <h2 className="text-xl font-bold text-slate-100 mb-8">Unlock the Future of Imaging</h2>

        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* Left: 2×2 Feature Card Grid */}
          <div className="lg:w-5/12 flex flex-col gap-4">
            <div className="flex gap-4">
              {features.slice(0, 2).map((feat, i) => (
                <div
                  key={i}
                  className="rounded-2xl p-6 border border-slate-800 bg-slate-900/60 backdrop-blur-md flex flex-col gap-3 w-full hover:border-cyan-500/40 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-md flex items-center justify-center ${
                      feat.accent === "cyan"
                        ? "bg-cyan-950/80 border border-cyan-500/30 text-cyan-400"
                        : "bg-violet-950/80 border border-violet-500/30 text-violet-400"
                    } group-hover:scale-110 transition-transform`}>
                      {feat.icon}
                    </div>
                    <h3 className="font-semibold text-slate-100 text-sm">{feat.title}</h3>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">{feat.description}</p>
                </div>
              ))}
            </div>
            <div className="flex gap-4">
              {features.slice(2, 4).map((feat, i) => (
                <div
                  key={i}
                  className="rounded-2xl p-6 border border-slate-800 bg-slate-900/60 backdrop-blur-md flex flex-col gap-3 w-full hover:border-violet-500/40 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-md flex items-center justify-center ${
                      feat.accent === "cyan"
                        ? "bg-cyan-950/80 border border-cyan-500/30 text-cyan-400"
                        : "bg-violet-950/80 border border-violet-500/30 text-violet-400"
                    } group-hover:scale-110 transition-transform`}>
                      {feat.icon}
                    </div>
                    <h3 className="font-semibold text-slate-100 text-sm">{feat.title}</h3>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">{feat.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Upload Prompt / CTA Zone */}
          <div className="lg:w-7/12 w-full rounded-2xl border-2 border-dashed border-slate-700 bg-slate-950/60 backdrop-blur-md p-8 flex flex-col items-center justify-center gap-6 text-center hover:border-cyan-500/40 transition-colors">
            <div className="w-12 h-12 bg-slate-900 rounded-full shadow-md flex items-center justify-center text-cyan-400 border border-slate-800">
              <Sparkles className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-semibold text-slate-100">
              Drag &amp; Drop Photos or Click to Upload
            </h3>

            {/* Tier Selector Pills */}
            <div className="flex items-center gap-3">
              {pricingTiers.map((tier) => (
                <button
                  key={tier.tier}
                  onClick={() => setSelectedTier(tier.tier)}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                    selectedTier === tier.tier
                      ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-[0_0_10px_rgba(6,182,212,0.3)]"
                      : "bg-slate-800/80 text-slate-400 border border-slate-700 hover:border-slate-600"
                  }`}
                >
                  {tier.tier === "web" ? "Web" : tier.tier.toUpperCase()}
                </button>
              ))}
            </div>

            {/* Localized Price Display */}
            <div className="flex flex-col gap-1 mt-4">
              <span className="text-xs text-slate-500">Localized Pricing Calculator</span>
              <div className="flex items-center gap-2 justify-center">
                <span className="font-semibold text-slate-100">
                  Starting from {pricingTiers.find(t => t.tier === selectedTier)?.formattedPrice || pricingTiers[0].formattedPrice}
                  {" "}({pricingTiers[0].currency})
                </span>
              </div>
            </div>

            <Link href={`/studio?tier=${selectedTier}`} className="mt-2">
              <Button className="px-8 py-3 rounded-full font-medium bg-gradient-to-r from-cyan-400 to-violet-500 text-white hover:opacity-90 transition-all hover:scale-105 shadow-[0_0_20px_rgba(6,182,212,0.3)]">
                Launch Studio <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ───────────────── CUSTOMER REVIEWS ───────────────── */}
      <section className="py-24 px-6 max-w-7xl mx-auto relative z-10 border-t border-slate-800/60">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <Badge variant="outline" className="mb-4 border-violet-500/30 text-violet-400 bg-violet-500/10 px-4 py-1.5 rounded-full backdrop-blur-md">
            Wall of Love
          </Badge>
          <h2 className="text-4xl sm:text-5xl font-extrabold text-slate-100 tracking-tight">
            Loved by Creators Worldwide
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              name: "Sarah Jenkins",
              role: "Digital Artist",
              text: "PixelRes AI completely changed my workflow. I can now upscale my midjourney generations to print-ready 8K without losing any details.",
            },
            {
              name: "David Chen",
              role: "Photographer",
              text: "The face restoration feature is magic. It saved an entire batch of blurry wedding photos that I thought were completely ruined.",
            },
            {
              name: "Emma Rodriguez",
              role: "Creative Director",
              text: "Fast, reliable, and the pricing is incredibly fair. The API integration was seamless for our agency's needs.",
            },
          ].map((review, i) => (
            <div
              key={i}
              className="p-8 rounded-2xl bg-slate-900/40 border border-slate-800/80 backdrop-blur-md hover:bg-slate-900/60 hover:border-slate-700 transition-colors"
            >
              <div className="flex text-amber-400 mb-4">
                {[...Array(5)].map((_, j) => (
                  <Star key={j} className="h-4 w-4 fill-current" />
                ))}
              </div>
              <p className="text-slate-300 italic mb-6">&quot;{review.text}&quot;</p>
              <div>
                <div className="font-bold text-slate-100">{review.name}</div>
                <div className="text-sm text-slate-500">{review.role}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ───────────────── BOTTOM CTA ───────────────── */}
      <section className="py-24 px-6 max-w-4xl mx-auto text-center relative z-10 border-t border-slate-800/60">
        <h2 className="text-4xl sm:text-5xl font-extrabold text-slate-100 tracking-tight mb-8">
          Ready for your masterpiece?
        </h2>
        <Link href="/studio">
          <Button className="h-14 px-10 text-lg font-semibold bg-gradient-to-r from-cyan-400 to-violet-500 hover:opacity-90 text-white rounded-full transition-all hover:scale-105 shadow-[0_0_30px_rgba(6,182,212,0.4)]">
            Launch Studio
          </Button>
        </Link>
      </section>
    </div>
  );
}
