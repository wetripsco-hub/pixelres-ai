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
    { name: "Features", href: "/#features" },
    { name: "Pricing", href: "/pricing" },
    { name: "Login", href: "/login" },
  ];

  return (
    <header className="relative z-50 w-full">
      <div className="max-w-7xl mx-auto px-6 py-6 flex justify-between items-center">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-md bg-cyan-950/80 border border-cyan-500/30 flex items-center justify-center shadow-lg shadow-cyan-500/20 group-hover:shadow-cyan-500/40 transition-all">
            <Sparkles className="h-4 w-4 text-cyan-400 group-hover:scale-110 transition-transform" />
          </div>
          <span className="text-xl font-semibold text-slate-100 tracking-tight">
            PixelRes <span className="text-cyan-400">AI</span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className={`transition-colors ${
                pathname === link.href
                  ? "text-cyan-400"
                  : "text-slate-400 hover:text-slate-100"
              }`}
            >
              {link.name}
            </Link>
          ))}
          <Link href="/studio">
            <button className="px-6 py-2.5 rounded-full font-medium shadow-md bg-gradient-to-r from-cyan-400 to-violet-500 text-white hover:opacity-90 transition-opacity">
              Get Started
            </button>
          </Link>
        </nav>

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
        <div className="md:hidden absolute top-full left-0 w-full bg-[#090A0F]/95 backdrop-blur-3xl border-b border-slate-800/60 shadow-2xl py-4 px-6 flex flex-col gap-4">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              onClick={() => setIsMobileMenuOpen(false)}
              className={`block px-4 py-2 rounded-lg text-sm font-medium ${
                pathname === link.href
                  ? "bg-cyan-500/10 text-cyan-400"
                  : "text-slate-300 hover:bg-slate-800/50 hover:text-white"
              }`}
            >
              {link.name}
            </Link>
          ))}
          <div className="h-px w-full bg-slate-800/60 my-2" />
          <Link href="/studio" onClick={() => setIsMobileMenuOpen(false)} className="block mt-2">
            <Button className="w-full bg-gradient-to-r from-cyan-400 to-violet-500 hover:opacity-90 text-white font-semibold rounded-full h-12 shadow-[0_0_20px_rgba(6,182,212,0.3)]">
              Get Started
            </Button>
          </Link>
        </div>
      )}
    </header>
  );
}
