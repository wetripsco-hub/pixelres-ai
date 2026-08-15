import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"

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
    <html lang="en" className={`dark ${inter.className} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-[#080c14] text-slate-100">{children}</body>
    </html>
  )
}
