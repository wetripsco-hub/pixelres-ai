"use client"

import React, { useState } from "react"
import Link from "next/link"
import {
  Shield,
  Cpu,
  Activity,
  Server,
  Users,
  Clock,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Search,
  Filter,
  Play,
  Pause,
  Zap,
  Sparkles,
  ArrowLeft,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"

interface QueueOrder {
  id: string
  client: string
  filename: string
  resolution: string
  gpuNode: string
  status: "processing" | "queued" | "completed" | "failed"
  eta: string
}

export default function AdminPage() {
  const [queuePaused, setQueuePaused] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")

  const [queue, setQueue] = useState<QueueOrder[]>([
    {
      id: "JOB-8821",
      client: "studio_alpha@agency.com",
      filename: "fashion_shoot_04.raw",
      resolution: "8K (8192x5460)",
      gpuNode: "GPU-Cluster-A01 (NVIDIA A100)",
      status: "processing",
      eta: "12s",
    },
    {
      id: "JOB-8822",
      client: "user_9421@gmail.com",
      filename: "portrait_hdr.png",
      resolution: "4K (4096x2160)",
      gpuNode: "GPU-Cluster-A02 (NVIDIA A100)",
      status: "processing",
      eta: "24s",
    },
    {
      id: "JOB-8823",
      client: "design_lead@company.io",
      filename: "arch_render_ext.jpg",
      resolution: "8K (8192x8192)",
      gpuNode: "Pending Allocation",
      status: "queued",
      eta: "45s",
    },
    {
      id: "JOB-8820",
      client: "vfx_creator@media.com",
      filename: "cinematic_frame_104.png",
      resolution: "4K (3840x2160)",
      gpuNode: "GPU-Cluster-A01 (NVIDIA A100)",
      status: "completed",
      eta: "Done",
    },
  ])

  const filteredQueue = queue.filter(
    (item) =>
      item.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.filename.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-[#080c14] text-slate-100 flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-slate-800 bg-slate-950/80 backdrop-blur-xl">
        <div className="container max-w-7xl mx-auto flex h-16 items-center justify-between px-4 sm:px-8">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-tr from-violet-600 to-cyan-500 font-bold text-white shadow-md">
                <Shield className="h-4 w-4" />
              </div>
              <span className="text-lg font-extrabold text-white tracking-wide">
                PixelRes <span className="text-violet-400">Admin</span>
              </span>
            </Link>
            <Badge variant="violet" className="hidden sm:inline-flex">
              Cluster Status: Operational
            </Badge>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/dashboard">
              <Button size="sm" variant="outline" className="border-slate-800 text-slate-300">
                <ArrowLeft className="h-4 w-4 mr-1" /> Client Portal
              </Button>
            </Link>
            <Button
              size="sm"
              variant={queuePaused ? "destructive" : "secondary"}
              onClick={() => setQueuePaused(!queuePaused)}
              className="gap-2"
            >
              {queuePaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
              {queuePaused ? "Resume Queue" : "Pause Queue"}
            </Button>
          </div>
        </div>
      </header>

      {/* Admin Content */}
      <main className="flex-1 container max-w-7xl mx-auto p-4 sm:p-8 space-y-8">
        {/* System Health Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-slate-900/60 border-slate-800">
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center justify-between text-xs text-slate-400">
                <span>GPU Cluster Load</span>
                <Cpu className="h-4 w-4 text-cyan-400" />
              </CardDescription>
              <CardTitle className="text-2xl font-bold text-slate-100">84.2%</CardTitle>
            </CardHeader>
            <CardContent>
              <Progress value={84} className="h-2" />
              <p className="text-[11px] text-slate-400 mt-2">16 / 20 NVIDIA A100 Nodes Active</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/60 border-slate-800">
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center justify-between text-xs text-slate-400">
                <span>Jobs in Queue</span>
                <Activity className="h-4 w-4 text-violet-400" />
              </CardDescription>
              <CardTitle className="text-2xl font-bold text-slate-100">14 Orders</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-[11px] text-slate-400 mt-1">Average Processing Time: 18.4s</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/60 border-slate-800">
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center justify-between text-xs text-slate-400">
                <span>Daily Processed 8K</span>
                <Zap className="h-4 w-4 text-cyan-400" />
              </CardDescription>
              <CardTitle className="text-2xl font-bold text-slate-100">3,492 Renders</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-[11px] text-emerald-400 mt-1">↑ 18.5% compared to yesterday</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/60 border-slate-800">
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center justify-between text-xs text-slate-400">
                <span>System Error Rate</span>
                <AlertTriangle className="h-4 w-4 text-amber-400" />
              </CardDescription>
              <CardTitle className="text-2xl font-bold text-emerald-400">0.02%</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-[11px] text-slate-400 mt-1">All Node Checks Passing Clean</p>
            </CardContent>
          </Card>
        </div>

        {/* Order Processing Queue Management */}
        <Card className="bg-slate-900/70 border-slate-800">
          <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2 text-xl">
                <Server className="h-5 w-5 text-violet-400" /> AI Order Processing Command
              </CardTitle>
              <CardDescription>
                Live control feed of incoming upscale requests across neural rendering nodes.
              </CardDescription>
            </div>

            <div className="flex items-center gap-3">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <Input
                  placeholder="Search job ID, client..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 bg-slate-950/80 border-slate-800"
                />
              </div>
            </div>
          </CardHeader>

          <CardContent className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-950/80 text-xs font-semibold text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="p-3.5">Job ID</th>
                  <th className="p-3.5">Client Email</th>
                  <th className="p-3.5">Target Resolution</th>
                  <th className="p-3.5">Allocated Node</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5">ETA</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono text-xs">
                {filteredQueue.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-3.5 font-bold text-cyan-300">{item.id}</td>
                    <td className="p-3.5 font-sans text-slate-200">{item.client}</td>
                    <td className="p-3.5">{item.resolution}</td>
                    <td className="p-3.5 text-slate-400">{item.gpuNode}</td>
                    <td className="p-3.5 font-sans">
                      {item.status === "processing" && (
                        <Badge variant="glow" className="gap-1">
                          <RefreshCw className="h-3 w-3 animate-spin text-cyan-400" /> Processing
                        </Badge>
                      )}
                      {item.status === "queued" && (
                        <Badge variant="secondary" className="gap-1">
                          <Clock className="h-3 w-3 text-slate-400" /> Queued
                        </Badge>
                      )}
                      {item.status === "completed" && (
                        <Badge variant="outline" className="gap-1 border-emerald-500/40 text-emerald-300">
                          <CheckCircle2 className="h-3 w-3 text-emerald-400" /> Completed
                        </Badge>
                      )}
                    </td>
                    <td className="p-3.5">{item.eta}</td>
                    <td className="p-3.5 text-right font-sans">
                      <Button size="sm" variant="ghost" className="h-7 text-xs hover:text-cyan-400">
                        Inspect Log
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
