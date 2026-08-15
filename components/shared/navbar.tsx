"use client";

import Link from "next/link";
import { Sparkles, Menu, X, Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";

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
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const navLinks = [
    { name: "Features", href: "/#features" },
    { name: "Pricing", href: "/pricing" },
    { name: "Login", href: "/login" },
  ];

  const flagEmoji = getFlagEmoji(countryCode);
  const currency = getCurrency(countryCode);

  return (
    <header className="relative z-50 w-full">
      <div className="max-w-7xl mx-auto px-6 py-6 flex justify-between items-center">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-md bg-cyan-100 dark:bg-cyan-950/80 border border-cyan-500/30 flex items-center justify-center shadow-lg shadow-cyan-500/20 group-hover:shadow-cyan-500/40 transition-all">
            <Sparkles className="h-4 w-4 text-cyan-600 dark:text-cyan-400 group-hover:scale-110 transition-transform" />
          </div>
          <span className="text-xl font-semibold text-slate-900 dark:text-slate-100 tracking-tight">
            PixelRes <span className="text-cyan-600 dark:text-cyan-400">AI</span>
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
                  ? "text-cyan-600 dark:text-cyan-400"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
              }`}
            >
              {link.name}
            </Link>
          ))}

          <div className="flex items-center gap-4">
            {mounted && (
              <button
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="p-2 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors focus:outline-none"
                aria-label="Toggle theme"
              >
                {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </button>
            )}

            <div className="group relative flex items-center justify-center p-2 rounded-md bg-slate-200 dark:bg-slate-800 cursor-help transition-colors">
              <span className="text-lg leading-none">{flagEmoji}</span>
              <div className="absolute top-full mt-2 w-max px-2 py-1 bg-slate-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                {currency}
              </div>
            </div>

            <Link href="/studio">
              <button className="px-6 py-2.5 rounded-full font-medium shadow-md bg-gradient-to-r from-cyan-500 to-violet-500 dark:from-cyan-400 dark:to-violet-500 text-white hover:opacity-90 transition-opacity">
                Get Started
              </button>
            </Link>
          </div>
        </nav>

        {/* Mobile Menu Toggle */}
        <div className="md:hidden flex items-center gap-4">
          {mounted && (
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="p-2 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors focus:outline-none"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
          )}

          <div className="group relative flex items-center justify-center p-2 rounded-md bg-slate-200 dark:bg-slate-800 cursor-help transition-colors">
            <span className="text-lg leading-none">{flagEmoji}</span>
          </div>

          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white focus:outline-none p-2"
          >
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-slate-100/95 dark:bg-[#090A0F]/95 backdrop-blur-3xl border-b border-slate-200 dark:border-slate-800/60 shadow-2xl py-4 px-6 flex flex-col gap-4">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              onClick={() => setIsMobileMenuOpen(false)}
              className={`block px-4 py-2 rounded-lg text-sm font-medium ${
                pathname === link.href
                  ? "bg-cyan-100 dark:bg-cyan-500/10 text-cyan-600 dark:text-cyan-400"
                  : "text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              {link.name}
            </Link>
          ))}
          <div className="h-px w-full bg-slate-200 dark:bg-slate-800/60 my-2" />
          <Link href="/studio" onClick={() => setIsMobileMenuOpen(false)} className="block mt-2">
            <Button className="w-full bg-gradient-to-r from-cyan-500 to-violet-500 dark:from-cyan-400 dark:to-violet-500 hover:opacity-90 text-white font-semibold rounded-full h-12 shadow-[0_0_20px_rgba(6,182,212,0.3)]">
              Get Started
            </Button>
          </Link>
        </div>
      )}
    </header>
  );
}
