"use client"

import React, { useState } from "react"
import Link from "next/link"
import {
  Upload,
  Sparkles,
  CreditCard,
  History,
  CheckCircle2,
  Clock,
  Download,
  Zap,
  Sliders,
  RefreshCw,
  Image as ImageIcon,
  ArrowUpRight,
  Shield,
  LogOut,
  ChevronRight,
  AlertCircle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Slider } from "@/components/ui/slider"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

interface Order {
  id: string
  name: string
  scale: string
  mode: string
  status: "completed" | "processing" | "queued"
  date: string
  credits: number
  previewUrl: string
}

export default function DashboardPage() {
  const [credits, setCredits] = useState(140)
  const [isProcessing, setIsProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [scaleFactor, setScaleFactor] = useState<number>(4)
  const [selectedFile, setSelectedFile] = useState<string | null>(null)
  const [checkoutLoading, setCheckoutLoading] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const [orders, setOrders] = useState<Order[]>([
    {
      id: "ORD-9401",
      name: "cyberpunk_portrait_hd.png",
      scale: "4x (4096px)",
      mode: "Face + SuperRes",
      status: "completed",
      date: "2026-08-15 13:42",
      credits: 5,
      previewUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=400&auto=format&fit=crop",
    },
    {
      id: "ORD-9398",
      name: "nature_landscape_raw.jpg",
      scale: "8x (8192px)",
      mode: "Ultra Denoise",
      status: "completed",
      date: "2026-08-14 18:12",
      credits: 10,
      previewUrl: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=400&auto=format&fit=crop",
    },
    {
      id: "ORD-9382",
      name: "product_macro_shot.png",
      scale: "2x (2048px)",
      mode: "Standard Upscale",
      status: "completed",
      date: "2026-08-12 09:30",
      credits: 2,
      previewUrl: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=400&auto=format&fit=crop",
    },
  ])

  // Handle Mock Image Processing Simulation
  const handleStartUpscale = () => {
    if (credits < scaleFactor) {
      alert("Insufficient credits! Please top up your credit balance.")
      return
    }

    setIsProcessing(true)
    setProgress(0)

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          setIsProcessing(false)
          setCredits((c) => c - scaleFactor)

          const newOrder: Order = {
            id: `ORD-${Math.floor(1000 + Math.random() * 9000)}`,
            name: selectedFile || "ai_upscaled_image.png",
            scale: `${scaleFactor}x (${scaleFactor * 1024}px)`,
            mode: "Deep SuperRes 4.0",
            status: "completed",
            date: new Date().toISOString().replace("T", " ").substring(0, 16),
            credits: scaleFactor,
            previewUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=400&auto=format&fit=crop",
          }
          setOrders((prevOrders) => [newOrder, ...prevOrders])
          return 100
        }
        return prev + 20
      })
    }, 400)
  }

  // Handle Stripe Checkout Endpoint Call
  const handlePurchasePlan = async (creditsAmount: number, priceId: string) => {
    try {
      setCheckoutLoading(true)
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priceId, credits: creditsAmount }),
      })
      const data = await response.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        alert(`Checkout Session initialized! Mock URL: ${data.mockSessionUrl || 'Success'}`)
        setCredits((prev) => prev + creditsAmount)
        setIsDialogOpen(false)
      }
    } catch (err) {
      console.error(err)
      alert("Failed to initiate checkout")
    } finally {
      setCheckoutLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#080c14] text-slate-100 flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-slate-800 bg-slate-950/80 backdrop-blur-xl">
        <div className="container max-w-7xl mx-auto flex h-16 items-center justify-between px-4 sm:px-8">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-tr from-cyan-500 to-violet-600 font-bold text-white shadow-md">
                <Sparkles className="h-4 w-4" />
              </div>
              <span className="text-lg font-extrabold text-white tracking-wide">
                PixelRes <span className="text-cyan-400">AI</span>
              </span>
            </Link>
            <Badge variant="outline" className="hidden sm:inline-flex border-slate-800 text-slate-400">
              Client Portal
            </Badge>
          </div>

          <div className="flex items-center gap-4">
            {/* Credit Status Widget */}
            <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl">
              <Zap className="h-4 w-4 text-cyan-400 fill-cyan-400" />
              <span className="text-sm font-bold text-slate-100">{credits}</span>
              <span className="text-xs text-slate-400">Credits</span>
              
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" variant="glow" className="h-7 px-2.5 text-xs ml-1">
                    + Buy Credits
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <CreditCard className="h-5 w-5 text-cyan-400" /> Top Up Credit Balance
                    </DialogTitle>
                    <DialogDescription>
                      Select a credit bundle below. Payment processed securely via Stripe.
                    </DialogDescription>
                  </DialogHeader>

                  <div className="grid grid-cols-1 gap-3 py-4">
                    <div
                      onClick={() => handlePurchasePlan(50, "price_starter")}
                      className="p-4 rounded-xl border border-slate-800 bg-slate-900/80 hover:border-cyan-500/50 cursor-pointer flex items-center justify-between transition-all"
                    >
                      <div>
                        <div className="font-bold text-slate-100">50 Credits Bundle</div>
                        <div className="text-xs text-slate-400">$9.00 USD (18¢ / credit)</div>
                      </div>
                      <Button size="sm" variant="outline" disabled={checkoutLoading}>
                        Select
                      </Button>
                    </div>

                    <div
                      onClick={() => handlePurchasePlan(300, "price_pro")}
                      className="p-4 rounded-xl border border-cyan-500/40 bg-cyan-950/20 hover:border-cyan-400 cursor-pointer flex items-center justify-between transition-all relative overflow-hidden"
                    >
                      <div className="absolute top-0 right-0 bg-cyan-500 text-slate-950 font-extrabold text-[10px] px-2 py-0.5 rounded-bl-lg uppercase">
                        Best Value
                      </div>
                      <div>
                        <div className="font-bold text-cyan-300">300 Credits Bundle</div>
                        <div className="text-xs text-slate-300">$29.00 USD (9.6¢ / credit)</div>
                      </div>
                      <Button size="sm" variant="glow" disabled={checkoutLoading}>
                        Select
                      </Button>
                    </div>

                    <div
                      onClick={() => handlePurchasePlan(1500, "price_agency")}
                      className="p-4 rounded-xl border border-slate-800 bg-slate-900/80 hover:border-violet-500/50 cursor-pointer flex items-center justify-between transition-all"
                    >
                      <div>
                        <div className="font-bold text-slate-100">1,500 Credits Pack</div>
                        <div className="text-xs text-slate-400">$99.00 USD (6.6¢ / credit)</div>
                      </div>
                      <Button size="sm" variant="outline" disabled={checkoutLoading}>
                        Select
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <Link href="/admin">
              <Button size="sm" variant="ghost" className="text-slate-400 hover:text-slate-200">
                <Shield className="h-4 w-4 mr-1 text-violet-400" /> Admin
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Workspace */}
      <main className="flex-1 container max-w-7xl mx-auto p-4 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Upscale Workspace */}
        <div className="lg:col-span-7 space-y-6">
          <Card className="bg-slate-900/70 border-slate-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-cyan-400" /> New Enhancement Order
              </CardTitle>
              <CardDescription>
                Upload a photo to upscale up to 8K resolution using AI super-resolution algorithms.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Drag & Drop Zone */}
              <div
                onClick={() => setSelectedFile("custom_photo_render.png")}
                className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
                  selectedFile
                    ? "border-cyan-500 bg-cyan-950/20"
                    : "border-slate-800 bg-slate-950/60 hover:border-slate-700"
                }`}
              >
                <div className="flex flex-col items-center justify-center space-y-3">
                  <div className="h-12 w-12 rounded-full bg-slate-900 flex items-center justify-center text-cyan-400 border border-slate-800">
                    <Upload className="h-6 w-6" />
                  </div>
                  <div>
                    <span className="font-semibold text-slate-200">
                      {selectedFile ? selectedFile : "Click to select or drag and drop an image"}
                    </span>
                    <p className="text-xs text-slate-500 mt-1">
                      PNG, JPG, WEBP, or RAW up to 50MB
                    </p>
                  </div>
                </div>
              </div>

              {/* Resolution Scale Selector */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <label className="font-semibold text-slate-200">Upscale Magnification</label>
                  <span className="text-cyan-400 font-bold font-mono">{scaleFactor}x Target Resolution</span>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {[2, 4, 8].map((factor) => (
                    <button
                      key={factor}
                      type="button"
                      onClick={() => setScaleFactor(factor)}
                      className={`py-3 rounded-xl border text-sm font-bold transition-all ${
                        scaleFactor === factor
                          ? "border-cyan-500 bg-cyan-950/40 text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.3)]"
                          : "border-slate-800 bg-slate-950/40 text-slate-400 hover:border-slate-700"
                      }`}
                    >
                      {factor}x Scale ({factor} Credits)
                    </button>
                  ))}
                </div>
              </div>

              {/* Processing Mode Tabs */}
              <Tabs defaultValue="face" className="w-full">
                <TabsList className="grid grid-cols-3 w-full">
                  <TabsTrigger value="face">Face Restoration</TabsTrigger>
                  <TabsTrigger value="denoise">Ultra Denoise</TabsTrigger>
                  <TabsTrigger value="creative">Creative Refine</TabsTrigger>
                </TabsList>
                <TabsContent value="face" className="text-xs text-slate-400 pt-2">
                  Enhance portrait skin textures, eyes, and facial structures using CodeFormer AI weights.
                </TabsContent>
                <TabsContent value="denoise" className="text-xs text-slate-400 pt-2">
                  Eliminate ISO noise and JPEG compression artifacts while retaining sharp edges.
                </TabsContent>
                <TabsContent value="creative" className="text-xs text-slate-400 pt-2">
                  Inject generative details into low-resolution digital artwork and CGI renders.
                </TabsContent>
              </Tabs>

              {/* Processing Progress Bar */}
              {isProcessing && (
                <div className="space-y-2 pt-2">
                  <div className="flex items-center justify-between text-xs text-slate-300">
                    <span className="flex items-center gap-1.5">
                      <RefreshCw className="h-3.5 w-3.5 animate-spin text-cyan-400" />
                      Running Neural Super-Resolution Model...
                    </span>
                    <span className="font-mono font-bold text-cyan-400">{progress}%</span>
                  </div>
                  <Progress value={progress} />
                </div>
              )}
            </CardContent>

            <CardFooter className="flex items-center justify-between border-t border-slate-800 pt-4">
              <div className="text-xs text-slate-400 flex items-center gap-1">
                <span>Cost:</span>
                <span className="font-bold text-cyan-300 font-mono">{scaleFactor} Credits</span>
              </div>

              <Button
                variant="glow"
                disabled={isProcessing}
                onClick={handleStartUpscale}
                className="gap-2"
              >
                {isProcessing ? "Processing AI Job..." : "Start 8K AI Upscale"}
                <Sparkles className="h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        </div>

        {/* Right Column: Order History & Recent Downloads */}
        <div className="lg:col-span-5 space-y-6">
          <Card className="bg-slate-900/70 border-slate-800 h-full flex flex-col">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between text-lg">
                <span className="flex items-center gap-2">
                  <History className="h-5 w-5 text-cyan-400" /> Order History
                </span>
                <Badge variant="outline" className="text-xs border-slate-700">
                  {orders.length} Jobs Total
                </Badge>
              </CardTitle>
              <CardDescription>
                Track status and download your upscaled high-resolution renders.
              </CardDescription>
            </CardHeader>

            <CardContent className="flex-1 space-y-4 overflow-y-auto max-h-[520px] pr-1">
              {orders.map((order) => (
                <div
                  key={order.id}
                  className="p-3.5 rounded-xl border border-slate-800 bg-slate-950/60 hover:border-slate-700/80 transition-all flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-lg bg-slate-900 border border-slate-800 overflow-hidden relative flex-shrink-0">
                      <img
                        src={order.previewUrl}
                        alt="Order preview"
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div>
                      <div className="font-semibold text-sm text-slate-100 flex items-center gap-2">
                        {order.name}
                      </div>
                      <div className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                        <span className="text-cyan-400 font-mono">{order.scale}</span>
                        <span>•</span>
                        <span>{order.date}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge variant="glow" className="text-[10px] px-2 py-0.5">
                      <CheckCircle2 className="h-3 w-3 mr-1 text-cyan-400" /> Done
                    </Badge>
                    <Button size="icon" variant="ghost" className="h-8 w-8 text-slate-300 hover:text-white">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
