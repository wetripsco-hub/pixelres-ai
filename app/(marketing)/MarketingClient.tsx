"use client";

import React, { useState } from "react";
import { ReactCompareSlider, ReactCompareSliderImage } from "react-compare-slider";
import { UploadCloud, CheckCircle2, Zap, Layers, Cpu } from "lucide-react";
import { ResolutionTier, getAllPricingTiers, PricingInfo } from "@/lib/pricing";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

interface MarketingClientProps {
  countryCode: string;
}

export function MarketingClient({ countryCode }: MarketingClientProps) {
  const router = useRouter();
  const [selectedTier, setSelectedTier] = useState<ResolutionTier>("4k");
  const pricingTiers = getAllPricingTiers(countryCode);
  const activePricing = pricingTiers.find((t) => t.tier === selectedTier) || pricingTiers[1];

  const handleUploadClick = () => {
    // Navigate to dashboard and pass the selected tier
    router.push(`/dashboard?tier=${selectedTier}`);
  };

  return (
    <div className="w-full">
      {/* Before/After Section */}
      <section id="demo" className="py-20 px-4 sm:px-8 max-w-7xl mx-auto flex flex-col items-center">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <Badge variant="outline" className="mb-3 border-cyan-500/50 text-cyan-400">See the Difference</Badge>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-100">
            Uncover Hidden Details
          </h2>
          <p className="mt-4 text-slate-400">
            Drag the slider to see how our AI reconstructs lost pixels and removes compression artifacts.
          </p>
        </div>

        <div className="w-full max-w-4xl rounded-2xl overflow-hidden shadow-2xl shadow-cyan-900/20 border border-slate-800">
          <ReactCompareSlider
            itemOne={<ReactCompareSliderImage src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2000&auto=format&fit=crop&blur=10" alt="Low Resolution Original" />}
            itemTwo={<ReactCompareSliderImage src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=100&w=2000&auto=format&fit=crop" alt="8K Enhanced Output" />}
            className="w-full aspect-[16/9]"
          />
          <div className="bg-slate-900/80 backdrop-blur-sm p-4 flex justify-between items-center text-xs font-mono text-slate-300">
             <span>ORIGINAL (LOW RES)</span>
             <span className="text-cyan-400 font-bold">PIXELRES AI (8K)</span>
          </div>
        </div>
      </section>

      {/* Resolution Selector & Pricing */}
      <section id="upload" className="py-20 px-4 sm:px-8 max-w-5xl mx-auto border-t border-slate-800/60">
         <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

            {/* Left: Selector */}
            <div className="space-y-6">
               <Badge variant="outline" className="mb-2 border-violet-500/50 text-violet-400">Get Started</Badge>
               <h2 className="text-3xl font-extrabold text-slate-100">Choose Your Enhancement Target</h2>
               <p className="text-slate-400">Select the output resolution that best fits your needs, from social media posts to massive fine-art prints.</p>

               <div className="space-y-4 mt-8">
                 {pricingTiers.map((tier) => (
                   <div
                     key={tier.tier}
                     onClick={() => setSelectedTier(tier.tier)}
                     className={`p-4 rounded-xl border cursor-pointer transition-all duration-200 flex items-center justify-between ${
                       selectedTier === tier.tier
                         ? 'border-cyan-500 bg-cyan-950/30 shadow-[0_0_15px_rgba(6,182,212,0.15)]'
                         : 'border-slate-800 bg-slate-900/40 hover:border-slate-600'
                     }`}
                   >
                     <div>
                        <h4 className="font-semibold text-slate-200 flex items-center gap-2">
                          {tier.label}
                          {selectedTier === tier.tier && <CheckCircle2 className="h-4 w-4 text-cyan-400" />}
                        </h4>
                        <p className="text-xs text-slate-400 mt-1">{tier.description}</p>
                     </div>
                     <div className="text-right">
                        <span className="font-mono text-cyan-400 font-bold">{tier.formattedPrice}</span>
                        <p className="text-[10px] text-slate-500 uppercase mt-0.5">per image</p>
                     </div>
                   </div>
                 ))}
               </div>
            </div>

            {/* Right: Upload Trigger Card */}
            <Card className="bg-slate-900/60 border-slate-700 relative overflow-hidden group">
               <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-violet-500/5 z-0"></div>
               <CardHeader className="relative z-10 text-center pb-2">
                 <div className="mx-auto h-16 w-16 rounded-full bg-slate-800/80 flex items-center justify-center border border-slate-700 mb-4 group-hover:border-cyan-500/50 group-hover:scale-110 transition-all duration-300">
                    <UploadCloud className="h-8 w-8 text-slate-300 group-hover:text-cyan-400 transition-colors" />
                 </div>
                 <CardTitle className="text-xl">Upload Your Image</CardTitle>
                 <CardDescription className="mt-2">
                   Ready to enhance to <strong className="text-slate-200">{activePricing.label}</strong>
                 </CardDescription>
               </CardHeader>
               <CardContent className="relative z-10 text-center">
                 <div className="bg-slate-950/50 py-3 px-4 rounded-lg border border-slate-800/80 inline-block mt-4 mb-2">
                    <span className="text-sm text-slate-400">Total Cost: </span>
                    <span className="text-lg font-bold text-white">{activePricing.formattedPrice}</span>
                 </div>
                 <p className="text-xs text-slate-500 mt-2">JPEG, PNG, WEBP (Max 10MB)</p>
               </CardContent>
               <CardFooter className="relative z-10 pt-4">
                 <Button onClick={handleUploadClick} className="w-full bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 text-white shadow-lg shadow-cyan-900/50 h-12 text-md font-medium">
                   Select Image & Enhance
                 </Button>
               </CardFooter>
            </Card>

         </div>
      </section>

      {/* Feature Grid */}
      <section id="features" className="py-20 px-4 sm:px-8 max-w-7xl mx-auto border-t border-slate-800/60">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <Badge variant="outline" className="mb-3 border-violet-500/50 text-violet-400">Engineered for Perfection</Badge>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-100">
            Enterprise-Grade Image Super-Resolution
          </h2>
          <p className="mt-4 text-slate-400">
            Powered by multi-stage generative adversarial networks trained on over 500 million high-fidelity images.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="bg-slate-900/60 border-slate-800 hover:border-cyan-500/40 transition-all group">
            <CardHeader>
              <div className="h-12 w-12 rounded-xl bg-cyan-950/60 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mb-4 group-hover:scale-110 transition-transform">
                <Zap className="h-6 w-6" />
              </div>
              <CardTitle>Instant 8K Upscaling</CardTitle>
              <CardDescription>
                Scale images up to 800% original dimensions (up to 8K resolution) without introducing blur or jagged edges.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-slate-900/60 border-slate-800 hover:border-violet-500/40 transition-all group">
            <CardHeader>
              <div className="h-12 w-12 rounded-xl bg-violet-950/60 border border-violet-500/30 flex items-center justify-center text-violet-400 mb-4 group-hover:scale-110 transition-transform">
                <Layers className="h-6 w-6" />
              </div>
              <CardTitle>Face & Detail Restoration</CardTitle>
              <CardDescription>
                Specialized neural models reconstruct micro-details like hair, skin texture, and eye reflections with realistic precision.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-slate-900/60 border-slate-800 hover:border-cyan-500/40 transition-all group">
            <CardHeader>
              <div className="h-12 w-12 rounded-xl bg-cyan-950/60 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mb-4 group-hover:scale-110 transition-transform">
                <Cpu className="h-6 w-6" />
              </div>
              <CardTitle>Batch Processing API</CardTitle>
              <CardDescription>
                Integrate PixelRes AI directly into your workflow or app using our lightning-fast REST & GraphQL endpoints.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* Credit & Subscription Pricing */}
      <section id="pricing" className="py-20 px-4 sm:px-8 max-w-7xl mx-auto border-t border-slate-800/60">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <Badge variant="outline" className="mb-3 border-cyan-500/50 text-cyan-400">Transparent Pricing</Badge>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-100">
            Pay As You Go or Upgrade for Unlimited
          </h2>
          <p className="mt-4 text-slate-400">
            Choose the perfect credit package or enterprise tier for your creative needs.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Starter Tier */}
          <Card className="bg-slate-900/50 border-slate-800 flex flex-col justify-between">
            <CardHeader>
              <Badge variant="secondary" className="w-fit mb-2">Starter Pack</Badge>
              <CardTitle className="text-2xl">50 Credits</CardTitle>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-4xl font-extrabold text-white">$9</span>
                <span className="text-slate-400 text-sm">/ one-time</span>
              </div>
              <CardDescription className="mt-2">Ideal for casual creators & single projects.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-slate-300">
              <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-cyan-400" /> Up to 4K Upscaling</div>
              <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-cyan-400" /> Standard Processing Speed</div>
              <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-cyan-400" /> Web Portal Access</div>
            </CardContent>
            <CardFooter>
              <Link href="/dashboard" className="w-full">
                <Button variant="outline" className="w-full border-slate-700">Buy 50 Credits</Button>
              </Link>
            </CardFooter>
          </Card>

          {/* Pro Tier (Featured) */}
          <Card className="bg-slate-900/90 border-cyan-500/50 relative flex flex-col justify-between shadow-[0_0_30px_rgba(6,182,212,0.15)]">
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-cyan-500 to-violet-600 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
              Most Popular
            </div>
            <CardHeader>
              <Badge variant="outline" className="w-fit mb-2 border-cyan-500/50 text-cyan-400">Pro Package</Badge>
              <CardTitle className="text-2xl">300 Credits</CardTitle>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-4xl font-extrabold text-cyan-400">$29</span>
                <span className="text-slate-400 text-sm">/ one-time</span>
              </div>
              <CardDescription className="mt-2">Perfect for photographers & digital agencies.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-slate-300">
              <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-cyan-400" /> Ultra 8K Upscaling Engine</div>
              <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-cyan-400" /> Priority GPU Queue</div>
              <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-cyan-400" /> Face & Texture Restoration</div>
              <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-cyan-400" /> Batch Upload Support</div>
            </CardContent>
            <CardFooter>
              <Link href="/dashboard" className="w-full">
                <Button className="w-full bg-cyan-600 hover:bg-cyan-500 text-white">Get Pro Credits</Button>
              </Link>
            </CardFooter>
          </Card>

          {/* Enterprise Tier */}
          <Card className="bg-slate-900/50 border-slate-800 flex flex-col justify-between">
            <CardHeader>
              <Badge variant="outline" className="w-fit mb-2 border-violet-500/50 text-violet-400">Agency Suite</Badge>
              <CardTitle className="text-2xl">1,500 Credits</CardTitle>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-4xl font-extrabold text-white">$99</span>
                <span className="text-slate-400 text-sm">/ one-time</span>
              </div>
              <CardDescription className="mt-2">Designed for high-volume automated pipelines.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-slate-300">
              <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-cyan-400" /> All Pro Features Included</div>
              <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-cyan-400" /> Dedicated REST API Key</div>
              <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-cyan-400" /> Commercial Usage License</div>
              <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-cyan-400" /> 24/7 Dedicated Support</div>
            </CardContent>
            <CardFooter>
              <Link href="/dashboard" className="w-full">
                <Button variant="outline" className="w-full border-slate-700">Get Agency Credits</Button>
              </Link>
            </CardFooter>
          </Card>
        </div>
      </section>
    </div>
  );
}
