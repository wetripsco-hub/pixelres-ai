"use client";

import React from "react";
import { ReactCompareSlider, ReactCompareSliderImage } from "react-compare-slider";
import { Zap, Layers, Cpu, ArrowRight, ImageIcon, Sparkles, Globe, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { motion } from "framer-motion";
import Link from "next/link";

export function MarketingClient() {
  return (
    <div className="w-full text-slate-50">
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
          <Link href="/studio" className="w-full sm:w-auto">
            <Button
              className="w-full h-14 px-10 text-lg font-semibold bg-cyan-600 hover:bg-cyan-500 text-white rounded-full transition-all hover:scale-105 shadow-[0_0_30px_rgba(6,182,212,0.4)]"
            >
              <ImageIcon className="mr-2 h-5 w-5" />
              Try Studio Free
            </Button>
          </Link>
          <Link href="/pricing" className="w-full sm:w-auto">
            <Button
              variant="outline"
              className="w-full h-14 px-10 text-lg font-medium rounded-full border-slate-700 bg-slate-900/50 hover:bg-slate-800 hover:text-white backdrop-blur-sm transition-all hover:scale-105"
            >
              View Pricing
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
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

      {/* Customer Reviews Section */}
      <section className="py-24 px-4 sm:px-8 max-w-7xl mx-auto relative z-10 border-t border-slate-800/60">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <Badge variant="outline" className="mb-4 border-violet-500/30 text-violet-400 bg-violet-500/10 px-4 py-1.5 rounded-full backdrop-blur-md">Wall of Love</Badge>
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
            }
          ].map((review, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="p-8 rounded-[2rem] bg-slate-900/40 border border-slate-800/80 backdrop-blur-md hover:bg-slate-900/60 transition-colors"
            >
              <div className="flex text-amber-400 mb-4">
                {[...Array(5)].map((_, j) => <Star key={j} className="h-4 w-4 fill-current" />)}
              </div>
              <p className="text-slate-300 italic mb-6">"{review.text}"</p>
              <div>
                <div className="font-bold text-slate-100">{review.name}</div>
                <div className="text-sm text-slate-500">{review.role}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="py-24 px-4 sm:px-8 max-w-4xl mx-auto text-center relative z-10 border-t border-slate-800/60">
         <h2 className="text-4xl sm:text-5xl font-extrabold text-slate-100 tracking-tight mb-8">
           Ready for your masterpiece?
         </h2>
         <Link href="/studio">
           <Button className="h-14 px-10 text-lg font-semibold bg-cyan-600 hover:bg-cyan-500 text-white rounded-full transition-all hover:scale-105 shadow-[0_0_30px_rgba(6,182,212,0.4)]">
             Launch Studio
           </Button>
         </Link>
      </section>
    </div>
  );
}
