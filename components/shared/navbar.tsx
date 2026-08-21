"use client";

import Link from "next/link";
import { Sparkles, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "./theme-toggle";

function getFlagEmoji(countryCode: string) {
  if (!countryCode || countryCode.length !== 2) return "🌐";
  const codePoints = countryCode
    .toUpperCase()
    .split("")
    .map((char) => 127397 + char.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
}

function getCurrency(countryCode: string) {
  const map: Record<string, string> = {
    US: "USD",
    GB: "GBP",
    EU: "EUR",
    IN: "INR",
    PK: "PKR",
    CA: "CAD",
    AU: "AUD",
  };
  return map[countryCode.toUpperCase()] || "USD";
}

export function Navbar({ countryCode = "US" }: { countryCode?: string }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const navLinks = [
    { name: "Features", href: "/#features" },
    { name: "Pricing", href: "/pricing" },
    { name: "Login", href: "/login" },
  ];

  const flagEmoji = getFlagEmoji(countryCode);
  const currency = getCurrency(countryCode);

  return (
    <header className="relative z-50 w-full border-b border-slate-200/80 dark:border-white/10 bg-white/70 dark:bg-slate-950/70 backdrop-blur-xl transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-cyan-500 to-violet-600 p-[1px] shadow-md shadow-cyan-500/20 group-hover:shadow-cyan-500/40 transition-all">
            <div className="h-full w-full bg-white dark:bg-[#07090E] rounded-[11px] flex items-center justify-center">
              <Sparkles className="h-4 w-4 text-cyan-600 dark:text-cyan-400 group-hover:scale-110 transition-transform" />
            </div>
          </div>
          <span className="text-xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
            PixelRes <span className="bg-gradient-to-r from-cyan-500 to-violet-500 bg-clip-text text-transparent">AI</span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-semibold">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className={`transition-colors ${
                pathname === link.href
                  ? "text-cyan-600 dark:text-cyan-400"
                  : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              {link.name}
            </Link>
          ))}

          <div className="flex items-center gap-3 pl-2 border-l border-slate-200 dark:border-white/10">
            {/* Theme Toggle */}
            <ThemeToggle />

            {/* Currency Pill */}
            <div className="group relative flex items-center justify-center p-2 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-white/10 cursor-help transition-colors">
              <span className="text-base leading-none">{flagEmoji}</span>
              <div className="absolute top-full mt-2 w-max px-2.5 py-1 bg-slate-900 dark:bg-slate-800 text-white text-[11px] font-mono rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-xl border border-white/10">
                {currency}
              </div>
            </div>

            <Link href="/studio">
              <Button className="px-5 py-2 rounded-xl font-bold text-xs shadow-md bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 text-white shadow-cyan-500/20 hover:shadow-cyan-500/30 transition-all">
                Launch Studio
              </Button>
            </Link>
          </div>
        </nav>

        {/* Mobile Menu Toggle */}
        <div className="md:hidden flex items-center gap-2.5">
          <ThemeToggle />

          <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-white/10">
            <span className="text-base leading-none">{flagEmoji}</span>
          </div>

          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white focus:outline-none p-2 rounded-xl border border-slate-200 dark:border-white/10"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-white/95 dark:bg-[#07090E]/95 backdrop-blur-2xl border-b border-slate-200 dark:border-white/10 shadow-2xl py-4 px-6 flex flex-col gap-3">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              onClick={() => setIsMobileMenuOpen(false)}
              className={`block px-4 py-2.5 rounded-xl text-sm font-semibold ${
                pathname === link.href
                  ? "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400"
                  : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900"
              }`}
            >
              {link.name}
            </Link>
          ))}
          <div className="h-px w-full bg-slate-200 dark:bg-white/10 my-1" />
          <Link href="/studio" onClick={() => setIsMobileMenuOpen(false)} className="block mt-1">
            <Button className="w-full bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 text-white font-bold rounded-xl h-11 shadow-lg shadow-cyan-500/25">
              Launch Studio
            </Button>
          </Link>
        </div>
      )}
    </header>
  );
}
