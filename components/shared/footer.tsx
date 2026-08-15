import Link from "next/link";
import { Shield, Beaker, ThumbsUp } from "lucide-react";

export function Footer() {
  return (
    <footer className="w-full border-t border-slate-800/60 bg-[#090A0F]/80 backdrop-blur-md mt-auto relative z-10">
      <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col md:flex-row justify-between items-center gap-6">
        {/* Left: Copyright & Links */}
        <div className="flex flex-col md:flex-row items-center gap-4 text-sm text-slate-500">
          <span>&copy; {new Date().getFullYear()} PixelRes AI</span>
          <div className="hidden md:block w-1 h-1 bg-slate-700 rounded-full" />
          <Link href="#" className="hover:text-slate-200 transition-colors">
            Privacy Policy
          </Link>
          <div className="hidden md:block w-1 h-1 bg-slate-700 rounded-full" />
          <Link href="#" className="hover:text-slate-200 transition-colors">
            Terms of Service
          </Link>
          <div className="hidden md:block w-1 h-1 bg-slate-700 rounded-full" />
          <Link href="#" className="hover:text-slate-200 transition-colors">
            Contact
          </Link>
        </div>

        {/* Right: Trust Badges */}
        <div className="flex flex-wrap justify-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900/80 border border-slate-800 text-xs font-medium text-slate-400">
            <Shield className="w-3.5 h-3.5 text-emerald-400" />
            Secure Payment
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900/80 border border-slate-800 text-xs font-medium text-slate-400">
            <Beaker className="w-3.5 h-3.5 text-cyan-400" />
            AI Powered
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900/80 border border-slate-800 text-xs font-medium text-slate-400">
            <ThumbsUp className="w-3.5 h-3.5 text-amber-400" />
            Satisfaction Guaranteed
          </div>
        </div>
      </div>
    </footer>
  );
}
