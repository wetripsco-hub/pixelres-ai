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
    { name: "Dashboard", href: "/dashboard" },
    { name: "Login", href: "/login" },
  ];

  const flagEmoji = getFlagEmoji(countryCode);
  const currency = getCurrency(countryCode);

  return (
    <header className="relative z-50 w-full border-b border-slate-200/80 dark:border-white/10 bg-white/80 dark:bg-slate-950/70 backdrop-blur-xl transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-3.5 flex justify-between items-center">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-orange-500 via-amber-500 to-orange-500 dark:from-cyan-500 dark:to-violet-600 p-[1px] shadow-md shadow-orange-500/20 dark:shadow-cyan-500/20 group-hover:shadow-orange-500/40 dark:group-hover:shadow-cyan-500/40 transition-all">
            <div className="h-full w-full bg-white dark:bg-[#07090E] rounded-[11px] flex items-center justify-center">
              <Sparkles className="h-4 w-4 text-orange-500 dark:text-cyan-400 group-hover:scale-110 transition-transform" />
            </div>
          </div>
          <span className="text-xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
            PixelRes <span className="bg-gradient-to-r from-orange-500 to-amber-500 dark:from-cyan-500 dark:to-violet-500 bg-clip-text text-transparent">AI</span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-semibold">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className={`transition-colors ${
                pathname === link.href
                  ? "text-orange-600 dark:text-cyan-400 font-bold"
                  : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              {link.name}
            </Link>
          ))}

          <div className="flex items-center gap-3 pl-3 border-l border-slate-200 dark:border-white/10">
            {/* Theme Toggle */}
            <ThemeToggle />

            {/* Currency Pill */}
            <div className="group relative flex items-center justify-center px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-white/10 cursor-help transition-colors text-xs font-mono font-semibold text-slate-700 dark:text-slate-300">
              <span className="mr-1.5 text-sm leading-none">{flagEmoji}</span>
              <span>{currency}</span>
            </div>

            <Link href="/studio">
              <Button className="px-5 py-2 rounded-xl font-bold text-xs shadow-md bg-gradient-to-r from-orange-500 via-amber-500 to-orange-500 dark:from-cyan-600 dark:to-cyan-500 hover:opacity-95 text-white shadow-orange-500/20 dark:shadow-cyan-500/20 btn-interactive transition-all">
                Launch Studio
              </Button>
            </Link>
          </div>
        </nav>

        {/* Mobile Menu Toggle */}
        <div className="md:hidden flex items-center gap-2">
          <ThemeToggle />

          <div className="px-2 py-1 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-xs font-mono font-semibold">
            <span className="mr-1">{flagEmoji}</span>
            <span>{currency}</span>
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
                  ? "bg-orange-500/10 text-orange-600 dark:bg-cyan-500/10 dark:text-cyan-400"
                  : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900"
              }`}
            >
              {link.name}
            </Link>
          ))}
          <div className="h-px w-full bg-slate-200 dark:bg-white/10 my-1" />
          <Link href="/studio" onClick={() => setIsMobileMenuOpen(false)} className="block mt-1">
            <Button className="w-full bg-gradient-to-r from-orange-500 via-amber-500 to-orange-500 dark:from-cyan-600 dark:to-cyan-500 hover:opacity-95 text-white font-bold rounded-xl h-11 shadow-lg shadow-orange-500/20 dark:shadow-cyan-500/25 btn-interactive">
              Launch Studio
            </Button>
          </Link>
        </div>
      )}
    </header>
  );
}
