import { headers } from "next/headers";
import { MarketingClient } from "./MarketingClient";
import Link from "next/link";
import { ArrowRight, ImageIcon, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function MarketingPage() {
  const headersList = headers();
  const countryCode = headersList.get('x-user-country') || 'US';

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 selection:bg-cyan-900/50 selection:text-cyan-50 font-sans overflow-hidden">
      {/* Background Gradients */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-cyan-900/20 blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-violet-900/20 blur-[120px]" />
      </div>

      {/* Navigation */}
      <nav className="relative z-10 border-b border-slate-800/60 bg-slate-950/50 backdrop-blur-md sticky top-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-cyan-500 to-violet-600 p-[1px]">
              <div className="h-full w-full bg-slate-950 rounded-[7px] flex items-center justify-center">
                <Sparkles className="h-4 w-4 text-cyan-400" />
              </div>
            </div>
            <span className="font-bold text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-slate-100 to-slate-400">
              PixelRes AI
            </span>
          </div>

          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
            <a href="#demo" className="hover:text-cyan-400 transition-colors">See the Magic</a>
            <a href="#features" className="hover:text-cyan-400 transition-colors">Features</a>
            <a href="#pricing" className="hover:text-cyan-400 transition-colors">Pricing</a>
            <a href="/api-docs" className="hover:text-cyan-400 transition-colors">API</a>
          </div>

          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm font-medium text-slate-300 hover:text-white hidden sm:block">
              Log in
            </Link>
            <Link href="/dashboard">
              <Button className="bg-slate-100 text-slate-950 hover:bg-slate-300 font-semibold h-9 px-4 rounded-full">
                Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      <main className="relative z-10">
        {/* Hero Section */}
        <section className="pt-32 pb-20 px-4 sm:px-8 max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-sm text-slate-300 mb-8 animate-fade-in">
            <span className="flex h-2 w-2 rounded-full bg-cyan-500 animate-pulse"></span>
            PixelRes Model v2.4 is now live
          </div>

          <h1 className="text-5xl sm:text-7xl font-extrabold tracking-tight mb-8 leading-[1.1]">
            <span className="text-slate-100">Breathe life into your </span>
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-blue-500 to-violet-600 animate-gradient-x">
              low-res images.
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            State-of-the-art AI upscaling. Transform blurry, compressed photos into stunning 4K and 8K masterpieces in seconds. No complex software required.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a href="#upload">
              <Button className="w-full sm:w-auto h-12 px-8 text-base font-semibold bg-cyan-600 hover:bg-cyan-500 text-white rounded-full transition-all hover:scale-105 hover:shadow-[0_0_20px_rgba(6,182,212,0.4)]">
                <ImageIcon className="mr-2 h-5 w-5" />
                Upscale an Image Free
              </Button>
            </a>
            <a href="#demo">
              <Button variant="outline" className="w-full sm:w-auto h-12 px-8 text-base font-medium rounded-full border-slate-700 bg-slate-900/50 hover:bg-slate-800 hover:text-white">
                View Interactive Demo
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </a>
          </div>

          <p className="mt-6 text-sm text-slate-500">No credit card required for your first 3 images.</p>
        </section>

        <MarketingClient countryCode={countryCode} />

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-slate-950 py-12 px-4 sm:px-8 relative z-10">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6 text-sm text-slate-500">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-md bg-cyan-500 flex items-center justify-center text-slate-950 font-bold text-xs">
              P
            </div>
            <span className="font-semibold text-slate-300">PixelRes AI &copy; 2026</span>
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
  );
}
