"use client";

import Link from "next/link";
import { Sparkles, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { usePathname } from "next/navigation";

export function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Studio", href: "/studio" },
    { name: "Pricing", href: "/pricing" },
    { name: "Dashboard", href: "/dashboard" },
  ];

  return (
    <nav className="relative z-50 border-b border-slate-800/40 bg-[#090A0F]/60 backdrop-blur-2xl sticky top-0 w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-cyan-500 to-violet-600 p-[1px] shadow-lg shadow-cyan-500/20 group-hover:shadow-cyan-500/40 transition-all">
            <div className="h-full w-full bg-[#090A0F] rounded-[7px] flex items-center justify-center">
              <Sparkles className="h-4 w-4 text-cyan-400 group-hover:scale-110 transition-transform" />
            </div>
          </div>
          <span className="font-bold text-xl tracking-tight text-slate-100">
            PixelRes <span className="text-cyan-400">AI</span>
          </span>
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-8 text-sm font-medium">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className={`transition-colors ${pathname === link.href ? "text-cyan-400" : "text-slate-400 hover:text-cyan-300"}`}
            >
              {link.name}
            </Link>
          ))}
          <Link href="/admin" className={`transition-colors ${pathname === '/admin' ? "text-violet-400" : "text-slate-400 hover:text-violet-300"}`}>
             Admin
          </Link>
        </div>

        {/* Desktop CTA */}
        <div className="hidden md:flex items-center gap-4">
          <Link href="/login" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">
            Sign In
          </Link>
          <Link href="/studio">
            <Button className="bg-slate-100 text-slate-950 hover:bg-white font-semibold h-9 px-5 rounded-full shadow-lg shadow-white/10 transition-all hover:scale-105">
              Launch Studio
            </Button>
          </Link>
        </div>

        {/* Mobile Menu Toggle */}
        <div className="md:hidden flex items-center">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="text-slate-300 hover:text-white focus:outline-none p-2"
          >
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-16 left-0 w-full bg-[#090A0F]/95 backdrop-blur-3xl border-b border-slate-800/60 shadow-2xl py-4 px-4 flex flex-col gap-4">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              onClick={() => setIsMobileMenuOpen(false)}
              className={`block px-4 py-2 rounded-lg text-sm font-medium ${pathname === link.href ? "bg-cyan-500/10 text-cyan-400" : "text-slate-300 hover:bg-slate-800/50 hover:text-white"}`}
            >
              {link.name}
            </Link>
          ))}
          <Link
            href="/admin"
            onClick={() => setIsMobileMenuOpen(false)}
            className={`block px-4 py-2 rounded-lg text-sm font-medium ${pathname === '/admin' ? "bg-violet-500/10 text-violet-400" : "text-slate-300 hover:bg-slate-800/50 hover:text-white"}`}
          >
            Admin
          </Link>
          <div className="h-px w-full bg-slate-800/60 my-2"></div>
          <Link href="/login" onClick={() => setIsMobileMenuOpen(false)} className="block px-4 py-2 text-sm font-medium text-slate-300 hover:text-white">
            Sign In
          </Link>
          <Link href="/studio" onClick={() => setIsMobileMenuOpen(false)} className="block mt-2">
            <Button className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-semibold rounded-xl h-12 shadow-[0_0_20px_rgba(6,182,212,0.3)]">
              Launch Studio
            </Button>
          </Link>
        </div>
      )}
    </nav>
  );
}
