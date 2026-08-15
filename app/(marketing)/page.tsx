export const dynamic = 'force-dynamic';

import { headers } from "next/headers";
import { MarketingClient } from "./MarketingClient";
import Link from "next/link";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function MarketingPage() {
  const headersList = headers();
  // We still pass the edge country code, but MarketingClient will also have a fallback
  const countryCode = headersList.get('x-user-country') || 'US';

  return (
    <div className="min-h-screen bg-[#090A0F] text-slate-50 selection:bg-cyan-900/50 selection:text-cyan-50 font-sans overflow-hidden">
      {/* Background Gradients */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-cyan-900/20 blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-violet-900/20 blur-[120px]" />
        <div className="absolute inset-0 bg-[url('https://res.cloudinary.com/dzvy8pbbm/image/upload/v1709668478/grid-pattern_q5m9i2.svg')] bg-repeat opacity-[0.03]" />
      </div>

      {/* Navigation */}
      <nav className="relative z-10 border-b border-slate-800/40 bg-[#090A0F]/60 backdrop-blur-2xl sticky top-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-cyan-500 to-violet-600 p-[1px] shadow-lg shadow-cyan-500/20">
              <div className="h-full w-full bg-[#090A0F] rounded-[7px] flex items-center justify-center">
                <Sparkles className="h-4 w-4 text-cyan-400" />
              </div>
            </div>
            <span className="font-bold text-xl tracking-tight text-slate-100">
              PixelRes <span className="text-cyan-400">AI</span>
            </span>
          </div>

          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-400">
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
              <Button className="bg-slate-100 text-slate-950 hover:bg-slate-300 font-semibold h-9 px-4 rounded-full shadow-lg shadow-white/10 transition-all hover:scale-105">
                Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      <main className="relative z-10">
        <MarketingClient initialCountryCode={countryCode} />
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/60 bg-[#090A0F]/80 backdrop-blur-md py-12 px-4 sm:px-8 relative z-10">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6 text-sm text-slate-500">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-md bg-gradient-to-br from-cyan-500 to-violet-600 flex items-center justify-center text-white font-bold text-xs shadow-lg shadow-cyan-900/50">
              P
            </div>
            <span className="font-semibold text-slate-400">PixelRes AI &copy; 2026</span>
          </div>
          <div className="flex items-center gap-6">
            <Link href="/dashboard" className="hover:text-cyan-400 transition-colors">Client Portal</Link>
            <Link href="/admin" className="hover:text-violet-400 transition-colors">Admin Command</Link>
            <a href="#" className="hover:text-slate-400 transition-colors">API Docs</a>
            <a href="#" className="hover:text-slate-400 transition-colors">Privacy Policy</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
