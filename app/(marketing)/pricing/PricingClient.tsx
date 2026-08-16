"use client";

import React, { useState, useEffect } from "react";
import { CheckCircle2, HelpCircle, Loader2 } from "lucide-react";
import { getAllPricingTiersDynamic, PricingInfo } from "@/lib/pricing";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import Link from "next/link";

export function PricingClient({ initialCountryCode }: { initialCountryCode: string }) {
  const [countryCode, setCountryCode] = useState(initialCountryCode);
  const [pricingTiers, setPricingTiers] = useState<PricingInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 1. Fetch Geo-IP
    fetch('https://ipapi.co/json/')
      .then(res => res.json())
      .then(data => {
        if (data && data.country_code) {
          setCountryCode(data.country_code);
        }
      })
      .catch(err => console.error('Geo-IP fetch failed:', err))
      .finally(() => {
        // We do this here to ensure it uses the final countryCode, but also has a fallback
      });
  }, []);

  useEffect(() => {
    // 2. Fetch dynamic pricing from Supabase whenever countryCode changes
    let isMounted = true;
    setIsLoading(true);
    getAllPricingTiersDynamic(countryCode).then(tiers => {
      if (isMounted) {
        setPricingTiers(tiers);
        setIsLoading(false);
      }
    });
    return () => { isMounted = false };
  }, [countryCode]);

  const faqs = [
    {
      q: "How does the Pay-As-You-Go pricing work?",
      a: "You only pay for what you use. When you upload an image, you select the target resolution and pay a flat fee for that single upscale. There are no monthly subscriptions or hidden fees."
    },
    {
      q: "What file types are supported?",
      a: "We currently support JPG, PNG, and WEBP formats up to 25MB in size. For best results, we recommend uploading the highest quality original you have available."
    },
    {
      q: "How long does processing take?",
      a: "Standard processing typically takes 15-30 seconds depending on the original image size and the target resolution. 8K upscales may take up to a minute."
    },
    {
      q: "Can I use the images commercially?",
      a: "Yes! All upscaled images are 100% yours. We do not claim any copyright over your original or enhanced images, and you are free to use them commercially."
    }
  ];

  return (
    <div className="px-4 sm:px-8 max-w-7xl mx-auto">
      <div className="text-center max-w-3xl mx-auto mb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900/80 border border-cyan-500/30 backdrop-blur-md text-sm text-cyan-100 mb-6 shadow-[0_0_15px_rgba(6,182,212,0.15)]"
        >
          Simple, Transparent Pricing
        </motion.div>
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-5xl sm:text-6xl font-extrabold text-slate-100 tracking-tight"
        >
          Pay only for what you upscale.
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-6 text-xl text-slate-400"
        >
          No monthly subscriptions. Just select your target resolution and pay a flat fee per image. Prices are localized to your region.
        </motion.p>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="h-10 w-10 animate-spin text-cyan-500 mb-4" />
          <p className="text-slate-400">Loading dynamic pricing...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-32">
          {pricingTiers.map((tier, i) => (
            <motion.div
              key={tier.tier}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + (i * 0.1) }}
            >
              <Card
                className={`bg-slate-900/50 border-slate-800/80 flex flex-col justify-between h-full backdrop-blur-md transition-all hover:border-slate-600 rounded-[1.5rem] ${tier.tier === '4k' ? 'ring-1 ring-cyan-500/50 shadow-[0_0_30px_rgba(6,182,212,0.15)] relative transform md:-translate-y-4' : ''}`}
              >
                {tier.tier === '4k' && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-cyan-500 to-violet-600 text-white text-xs font-bold px-4 py-1 rounded-full uppercase tracking-wider shadow-lg">
                    Most Popular
                  </div>
                )}
                <CardHeader className="p-8">
                  <Badge variant="outline" className={`w-fit mb-6 ${tier.tier === '4k' ? 'border-cyan-500/50 text-cyan-400 bg-cyan-500/10' : 'border-slate-700 text-slate-400 bg-slate-800/50'}`}>
                    {tier.tier.toUpperCase()} Target
                  </Badge>
                  <CardTitle className="text-3xl font-bold">{tier.label}</CardTitle>
                  <div className="mt-6 flex items-baseline gap-1">
                    <span className={`text-5xl font-extrabold ${tier.tier === '4k' ? 'text-cyan-400' : 'text-white'}`}>{tier.formattedPrice}</span>
                    <span className="text-slate-400 text-sm font-medium">/ image</span>
                  </div>
                  <CardDescription className="mt-4 text-base">{tier.description}</CardDescription>
                </CardHeader>
                <CardContent className="px-8 space-y-4 text-sm text-slate-300">
                  <div className="flex items-center gap-3"><CheckCircle2 className="h-5 w-5 text-cyan-500" /> High Priority Processing</div>
                  <div className="flex items-center gap-3"><CheckCircle2 className="h-5 w-5 text-cyan-500" /> Face & Texture Restoration</div>
                  <div className="flex items-center gap-3"><CheckCircle2 className="h-5 w-5 text-cyan-500" /> Secure Cloud Storage</div>
                </CardContent>
                <CardFooter className="p-8 mt-4 border-t border-slate-800/50">
                  <Link href={`/studio?tier=${tier.tier}`} className="w-full">
                    <Button
                      className={`w-full h-14 rounded-xl text-base font-semibold transition-all ${tier.tier === '4k' ? 'bg-cyan-600 hover:bg-cyan-500 text-white hover:shadow-[0_0_20px_rgba(6,182,212,0.4)]' : 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-700'}`}
                    >
                      Start Enhancing
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* FAQ Section */}
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-slate-100 flex items-center justify-center gap-3">
            <HelpCircle className="h-8 w-8 text-violet-400" />
            Frequently Asked Questions
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 backdrop-blur-sm"
            >
              <h4 className="text-lg font-semibold text-slate-200 mb-3">{faq.q}</h4>
              <p className="text-slate-400 text-sm leading-relaxed">{faq.a}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
