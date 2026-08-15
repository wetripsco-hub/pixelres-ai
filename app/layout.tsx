import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "PixelRes AI - 8K Neural Image Super-Resolution & Upscaling Platform",
  description:
    "Transform low-resolution photos into ultra-sharp 8K masterpieces using proprietary deep neural super-resolution models. Denoise, restore faces, and upscale instantly.",
  keywords: ["AI Image Upscaler", "Super Resolution", "Photo Restoration", "8K Image Upscaling", "PixelRes AI"],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning className={`${inter.className} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-900 dark:bg-[#080c14] dark:text-slate-100 transition-colors duration-300">
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          disableTransitionOnChange={false}
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
