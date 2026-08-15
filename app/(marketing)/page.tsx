"use client"

import React, { useState } from "react"
import Link from "next/link"
import {
  Sparkles,
  Zap,
  Shield,
  Layers,
  Sliders,
  CheckCircle2,
  ArrowRight,
  Download,
  Image as ImageIcon,
  Star,
  Users,
  Cpu,
  BarChart3,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"

export default function MarketingPage() {
  const [sliderPosition, setSliderPosition] = useState(50)
  const [activeTab, setActiveTab] = useState<"standard" | "ultra" | "batch">("ultra")

  return (
    <div className="min-h-screen bg-[#080c14] text-slate-100 relative overflow-hidden bg-grid-pattern">
      {/* Background Decorative Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-tr from-cyan-500/15 via-violet-500/10 to-transparent blur-[120px] pointer-events-none rounded-full" />
      <div className="absolute top-[800px] right-0 w-[500px] h-[500px] bg-cyan-600/10 blur-[150px] pointer-events-none rounded-full" />

      {/* Navigation Header */}
      <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/70 backdrop-blur-xl">
        <div className="container max-w-7xl mx-auto flex h-16 items-center justify-between px-4 sm:px-8">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-cyan-500 to-violet-600 font-bold text-white shadow-lg shadow-cyan-500/30">
              <Sparkles className="h-5 w-5" />
            </div>
            <span className="text-xl font-extrabold tracking-wider bg-gradient-to-r from-white via-slate-200 to-cyan-400 bg-clip-text text-transparent">
              PixelRes <span className="text-cyan-400 font-black">AI</span>
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
            <a href="#features" className="hover:text-cyan-400 transition-colors">Features</a>
            <a href="#preview" className="hover:text-cyan-400 transition-colors">Live Demo</a>
            <a href="#pricing" className="hover:text-cyan-400 transition-colors">Pricing</a>
            <Link href="/admin" className="hover:text-violet-400 transition-colors flex items-center gap-1">
              <Shield className="h-3.5 w-3.5" /> Admin Hub
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            <Link href="/dashboard">
              <Button variant="outline" size="sm" className="hidden sm:inline-flex border-slate-700 hover:border-slate-600">
                Sign In
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button variant="glow" size="sm" className="gap-2">
                Go to Dashboard <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-20 pb-16 px-4 sm:px-8 max-w-7xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-cyan-500/30 bg-cyan-950/40 text-cyan-300 text-xs font-semibold mb-6 backdrop-blur-md glow-cyan">
          <Zap className="h-3.5 w-3.5 text-cyan-400" /> Powered by Next-Gen Neural Super-Resolution 4.0
        </div>

        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight max-w-5xl mx-auto leading-tight sm:leading-none">
          Transform Low-Res Images into{" "}
          <span className="bg-gradient-to-r from-cyan-400 via-teal-300 to-violet-400 bg-clip-text text-transparent">
            8K Ultra-Sharp Masterpieces
          </span>
        </h1>

        <p className="mt-6 text-lg sm:text-xl text-slate-400 max-w-3xl mx-auto font-normal leading-relaxed">
          PixelRes AI utilizes proprietary deep neural networks to upscale, denoise, and restore pixelated photos instantly. Retain ultra-fine texture details with zero artifacts.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/dashboard">
            <Button variant="glow" size="lg" className="w-full sm:w-auto text-base px-8 py-6 rounded-xl">
              Upscale Your First Image Free <Sparkles className="ml-2 h-5 w-5" />
            </Button>
          </Link>
          <a href="#preview">
            <Button variant="outline" size="lg" className="w-full sm:w-auto text-base px-8 py-6 rounded-xl border-slate-700 bg-slate-900/60">
              Watch Interactive Demo
            </Button>
          </a>
        </div>

        {/* Live Interactive Before / After Slider */}
        <div id="preview" className="mt-16 max-w-5xl mx-auto rounded-2xl border border-slate-800 bg-slate-900/80 p-3 sm:p-4 shadow-2xl backdrop-blur-xl glow-cyan">
          <div className="flex items-center justify-between mb-3 px-2">
            <div className="flex items-center gap-2">
              <Badge variant="glow">Live Interactive Comparison</Badge>
              <span className="text-xs text-slate-400 hidden sm:inline">Drag slider to compare original vs 8K PixelRes enhanced output</span>
            </div>
            <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
              <span>Original (720p)</span>
              <span className="text-cyan-400 font-bold">vs</span>
              <span className="text-cyan-300 font-bold">PixelRes 8K Enhanced</span>
            </div>
          </div>

          <div className="relative h-[320px] sm:h-[480px] w-full rounded-xl overflow-hidden select-none border border-slate-800 bg-slate-950">
            {/* "After" Image (Full Width background) */}
            <div
              className="absolute inset-0 bg-cover bg-center flex items-center justify-center"
              style={{
                backgroundImage: "url('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1600&auto=format&fit=crop')",
              }}
            >
              <div className="absolute top-4 right-4 bg-slate-950/80 backdrop-blur-md px-3 py-1 rounded-md text-xs font-bold text-cyan-300 border border-cyan-500/40">
                8K Enhanced Output
              </div>
            </div>

            {/* "Before" Image (Clipped overlay with blur/pixelation visual simulation) */}
            <div
              className="absolute inset-0 bg-cover bg-center overflow-hidden border-r-2 border-cyan-400 shadow-2xl"
              style={{
                width: `${sliderPosition}%`,
                backgroundImage: "url('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=600&auto=format&fit=crop')",
                filter: "blur(3px) contrast(85%)",
              }}
            >
              <div className="absolute top-4 left-4 bg-slate-950/80 backdrop-blur-md px-3 py-1 rounded-md text-xs font-bold text-slate-300 border border-slate-700">
                Original Input (Blurry)
              </div>
            </div>

            {/* Slider Handle */}
            <div
              className="absolute top-0 bottom-0 w-1 bg-cyan-400 cursor-ew-resize"
              style={{ left: `${sliderPosition}%` }}
            >
              <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 h-10 w-10 rounded-full bg-slate-950 border-2 border-cyan-400 flex items-center justify-center shadow-[0_0_15px_rgba(6,182,212,0.8)]">
                <Sliders className="h-5 w-5 text-cyan-400" />
              </div>
            </div>
          </div>

          <div className="mt-4 px-2 flex items-center gap-4">
            <span className="text-xs text-slate-400 font-mono">0% Original</span>
            <Slider
              value={[sliderPosition]}
              onValueChange={(val) => setSliderPosition(val[0])}
              max={100}
              step={1}
              className="flex-1"
            />
            <span className="text-xs text-cyan-400 font-mono font-bold">100% 8K AI</span>
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section id="features" className="py-20 px-4 sm:px-8 max-w-7xl mx-auto border-t border-slate-800/60">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <Badge variant="violet" className="mb-3">Engineered for Perfection</Badge>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-100">
            Enterprise-Grade Image Super-Resolution
          </h2>
          <p className="mt-4 text-slate-400">
            Powered by multi-stage generative adversarial networks trained on over 500 million high-fidelity images.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="bg-slate-900/60 border-slate-800 hover:border-cyan-500/40 transition-all group">
            <CardHeader>
              <div className="h-12 w-12 rounded-xl bg-cyan-950/60 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mb-4 group-hover:scale-110 transition-transform">
                <Zap className="h-6 w-6" />
              </div>
              <CardTitle>Instant 8K Upscaling</CardTitle>
              <CardDescription>
                Scale images up to 800% original dimensions (up to 8K resolution) without introducing blur or jagged edges.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-slate-900/60 border-slate-800 hover:border-violet-500/40 transition-all group">
            <CardHeader>
              <div className="h-12 w-12 rounded-xl bg-violet-950/60 border border-violet-500/30 flex items-center justify-center text-violet-400 mb-4 group-hover:scale-110 transition-transform">
                <Layers className="h-6 w-6" />
              </div>
              <CardTitle>Face & Detail Restoration</CardTitle>
              <CardDescription>
                Specialized neural models reconstruct micro-details like hair, skin texture, and eye reflections with realistic precision.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-slate-900/60 border-slate-800 hover:border-cyan-500/40 transition-all group">
            <CardHeader>
              <div className="h-12 w-12 rounded-xl bg-cyan-950/60 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mb-4 group-hover:scale-110 transition-transform">
                <Cpu className="h-6 w-6" />
              </div>
              <CardTitle>Batch Processing API</CardTitle>
              <CardDescription>
                Integrate PixelRes AI directly into your workflow or app using our lightning-fast REST & GraphQL endpoints.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* Credit & Subscription Pricing */}
      <section id="pricing" className="py-20 px-4 sm:px-8 max-w-7xl mx-auto border-t border-slate-800/60">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <Badge variant="glow" className="mb-3">Transparent Pricing</Badge>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-100">
            Pay As You Go or Upgrade for Unlimited
          </h2>
          <p className="mt-4 text-slate-400">
            Choose the perfect credit package or enterprise tier for your creative needs.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Starter Tier */}
          <Card className="bg-slate-900/50 border-slate-800 flex flex-col justify-between">
            <CardHeader>
              <Badge variant="secondary" className="w-fit mb-2">Starter Pack</Badge>
              <CardTitle className="text-2xl">50 Credits</CardTitle>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-4xl font-extrabold text-white">$9</span>
                <span className="text-slate-400 text-sm">/ one-time</span>
              </div>
              <CardDescription className="mt-2">Ideal for casual creators & single projects.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-slate-300">
              <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-cyan-400" /> Up to 4K Upscaling</div>
              <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-cyan-400" /> Standard Processing Speed</div>
              <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-cyan-400" /> Web Portal Access</div>
            </CardContent>
            <CardFooter>
              <Link href="/dashboard" className="w-full">
                <Button variant="outline" className="w-full border-slate-700">Buy 50 Credits</Button>
              </Link>
            </CardFooter>
          </Card>

          {/* Pro Tier (Featured) */}
          <Card className="bg-slate-900/90 border-cyan-500/50 relative glow-cyan flex flex-col justify-between">
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-cyan-500 to-violet-600 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
              Most Popular
            </div>
            <CardHeader>
              <Badge variant="glow" className="w-fit mb-2">Pro Package</Badge>
              <CardTitle className="text-2xl">300 Credits</CardTitle>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-4xl font-extrabold text-cyan-400">$29</span>
                <span className="text-slate-400 text-sm">/ one-time</span>
              </div>
              <CardDescription className="mt-2">Perfect for photographers & digital agencies.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-slate-300">
              <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-cyan-400" /> Ultra 8K Upscaling Engine</div>
              <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-cyan-400" /> Priority GPU Queue</div>
              <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-cyan-400" /> Face & Texture Restoration</div>
              <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-cyan-400" /> Batch Upload Support</div>
            </CardContent>
            <CardFooter>
              <Link href="/dashboard" className="w-full">
                <Button variant="glow" className="w-full">Get Pro Credits</Button>
              </Link>
            </CardFooter>
          </Card>

          {/* Enterprise Tier */}
          <Card className="bg-slate-900/50 border-slate-800 flex flex-col justify-between">
            <CardHeader>
              <Badge variant="violet" className="w-fit mb-2">Agency Suite</Badge>
              <CardTitle className="text-2xl">1,500 Credits</CardTitle>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-4xl font-extrabold text-white">$99</span>
                <span className="text-slate-400 text-sm">/ one-time</span>
              </div>
              <CardDescription className="mt-2">Designed for high-volume automated pipelines.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-slate-300">
              <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-cyan-400" /> All Pro Features Included</div>
              <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-cyan-400" /> Dedicated REST API Key</div>
              <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-cyan-400" /> Commercial Usage License</div>
              <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-cyan-400" /> 24/7 Dedicated Support</div>
            </CardContent>
            <CardFooter>
              <Link href="/dashboard" className="w-full">
                <Button variant="outline" className="w-full border-slate-700">Get Agency Credits</Button>
              </Link>
            </CardFooter>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-slate-950 py-12 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6 text-sm text-slate-500">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-md bg-cyan-500 flex items-center justify-center text-slate-950 font-bold text-xs">
              P
            </div>
            <span className="font-semibold text-slate-300">PixelRes AI © 2026</span>
          </div>
          <div className="flex items-center gap-6">
            <Link href="/dashboard" className="hover:text-cyan-400 transition-colors">Client Portal</Link>
            <Link href="/admin" className="hover:text-violet-400 transition-colors">Admin Command</Link>
            <a href="#" className="hover:text-slate-300 transition-colors">API Docs</a>
            <a href="#" className="hover:text-slate-300 transition-colors">Privacy Policy</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
