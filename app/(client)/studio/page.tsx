import { headers } from "next/headers";
import { Suspense } from "react";
import { StudioImageUploader } from "@/components/studio/ImageUploader";
import { Sparkles, ArrowLeft, Shield, User } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function StudioPage({
  searchParams,
}: {
  searchParams: { tier?: string };
}) {
  const headersList = headers();
  const countryCode = headersList.get("x-user-country") || "US";
  const initialTier = searchParams.tier || "4k";

  return (
    <div className="min-h-screen bg-[#07090E] text-slate-50 font-sans flex flex-col relative overflow-hidden selection:bg-cyan-900/50">
      {/* Background Ambient Lighting */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-15%] left-[-10%] w-[50%] h-[50%] rounded-full bg-cyan-600/15 blur-[140px]" />
        <div className="absolute bottom-[-15%] right-[-10%] w-[50%] h-[50%] rounded-full bg-violet-600/15 blur-[140px]" />
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff08_1px,transparent_1px)] [background-size:24px_24px] opacity-35" />
      </div>

      {/* Header Bar */}
      <header className="border-b border-white/10 bg-slate-950/70 backdrop-blur-xl sticky top-0 z-50">
        <div className="container max-w-7xl mx-auto px-4 sm:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-cyan-500 to-violet-600 p-[1px] shadow-lg shadow-cyan-500/20 group-hover:shadow-cyan-500/40 transition-all">
              <div className="h-full w-full bg-[#07090E] rounded-[10px] flex items-center justify-center">
                <Sparkles className="h-4 w-4 text-cyan-400" />
              </div>
            </div>
            <span className="font-extrabold text-lg tracking-tight text-slate-100">
              PixelRes <span className="bg-gradient-to-r from-cyan-400 to-violet-400 bg-clip-text text-transparent">Studio</span>
            </span>
          </Link>

          <div className="flex items-center gap-3">
            <Link href="/dashboard">
              <Button size="sm" variant="ghost" className="text-slate-400 hover:text-slate-100 text-xs font-semibold">
                My Dashboard
              </Button>
            </Link>
            <Link href="/admin">
              <Button size="sm" variant="outline" className="border-white/10 bg-slate-900/60 hover:bg-slate-800 text-slate-300 hover:text-white rounded-xl text-xs font-semibold flex items-center gap-1.5">
                <Shield className="h-3.5 w-3.5 text-violet-400" />
                Admin
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Studio Body */}
      <main className="flex-1 relative z-10 max-w-7xl mx-auto px-4 sm:px-8 pt-10 pb-20 w-full">
        <div className="text-center max-w-2xl mx-auto mb-10 space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-slate-900/80 border border-violet-500/30 backdrop-blur-md text-xs font-semibold text-violet-300 shadow-[0_0_15px_rgba(139,92,246,0.15)]">
            <Sparkles className="h-3.5 w-3.5 text-violet-400" />
            AI Super-Resolution Engine
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-slate-100">
            Upscale Images to <span className="bg-gradient-to-r from-cyan-400 to-violet-400 bg-clip-text text-transparent">8K Clarity</span>
          </h1>
          <p className="text-sm sm:text-base text-slate-400">
            Upload your photo, art, or render. Our neural pipeline restores fine textures and details up to 8000px fidelity.
          </p>
        </div>

        <Suspense
          fallback={
            <div className="p-16 text-center text-slate-400 flex flex-col items-center justify-center gap-3">
              <div className="h-8 w-8 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin" />
              <span className="text-sm font-medium">Initializing neural studio…</span>
            </div>
          }
        >
          <StudioImageUploader
            countryCode={countryCode}
            initialTier={initialTier}
          />
        </Suspense>
      </main>
    </div>
  );
}
