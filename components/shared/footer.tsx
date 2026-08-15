import Link from "next/link";
import { Twitter, Github, Linkedin } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-slate-800/60 bg-[#090A0F]/80 backdrop-blur-md py-12 px-4 sm:px-8 relative z-10 w-full mt-auto">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
        <div className="md:col-span-1 space-y-4">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-md bg-gradient-to-br from-cyan-500 to-violet-600 flex items-center justify-center text-white font-bold text-xs shadow-lg shadow-cyan-900/50">
              P
            </div>
            <span className="font-bold text-lg text-slate-100">PixelRes AI</span>
          </div>
          <p className="text-sm text-slate-400">
            State-of-the-art AI upscaling infrastructure. Transform low-res images into 8K masterpieces.
          </p>
        </div>

        <div>
          <h4 className="font-semibold text-slate-100 mb-4">Product</h4>
          <ul className="space-y-2 text-sm text-slate-400">
            <li><Link href="/studio" className="hover:text-cyan-400 transition-colors">Studio</Link></li>
            <li><Link href="/pricing" className="hover:text-cyan-400 transition-colors">Pricing</Link></li>
            <li><Link href="/#features" className="hover:text-cyan-400 transition-colors">Features</Link></li>
            <li><Link href="/api-docs" className="hover:text-cyan-400 transition-colors">API</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold text-slate-100 mb-4">Resources</h4>
          <ul className="space-y-2 text-sm text-slate-400">
            <li><Link href="#" className="hover:text-cyan-400 transition-colors">Documentation</Link></li>
            <li><Link href="#" className="hover:text-cyan-400 transition-colors">Help Center</Link></li>
            <li><Link href="#" className="hover:text-cyan-400 transition-colors">Community</Link></li>
            <li><Link href="#" className="hover:text-cyan-400 transition-colors">Blog</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold text-slate-100 mb-4">Company</h4>
          <ul className="space-y-2 text-sm text-slate-400">
            <li><Link href="#" className="hover:text-cyan-400 transition-colors">About Us</Link></li>
            <li><Link href="#" className="hover:text-cyan-400 transition-colors">Privacy Policy</Link></li>
            <li><Link href="#" className="hover:text-cyan-400 transition-colors">Terms of Service</Link></li>
            <li><Link href="#" className="hover:text-cyan-400 transition-colors">Contact</Link></li>
          </ul>
        </div>
      </div>

      <div className="max-w-7xl mx-auto pt-8 border-t border-slate-800/60 flex flex-col md:flex-row items-center justify-between gap-4">
        <p className="text-xs text-slate-500">
          &copy; {new Date().getFullYear()} PixelRes AI Inc. All rights reserved.
        </p>
        <div className="flex gap-4">
          <a href="#" className="text-slate-500 hover:text-cyan-400 transition-colors"><Twitter className="h-4 w-4" /></a>
          <a href="#" className="text-slate-500 hover:text-cyan-400 transition-colors"><Github className="h-4 w-4" /></a>
          <a href="#" className="text-slate-500 hover:text-cyan-400 transition-colors"><Linkedin className="h-4 w-4" /></a>
        </div>
      </div>
    </footer>
  );
}
