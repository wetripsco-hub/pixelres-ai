export const dynamic = 'force-dynamic';

import { headers } from "next/headers";
import { MarketingClient } from "./MarketingClient";
import { getGlobalPricing } from "@/lib/pricing";

export default async function MarketingPage() {
  const headersList = headers();
  const countryCode = headersList.get('x-user-country') || 'US';
  const initialPricing = await getGlobalPricing();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#07090E] text-slate-900 dark:text-slate-50 selection:bg-orange-500/20 dark:selection:bg-cyan-500/30 font-sans overflow-hidden relative transition-colors duration-200">
      {/* Background Effects — subtle radial flares */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[10%] left-[-100px] w-[450px] h-[450px] rounded-full bg-orange-500/10 dark:bg-cyan-500/10 blur-[130px]" />
        <div className="absolute top-[30%] right-[-150px] w-[450px] h-[450px] rounded-full bg-amber-500/10 dark:bg-violet-500/10 blur-[130px]" />
        <div className="absolute inset-0 bg-[radial-gradient(#00000008_1px,transparent_1px)] dark:bg-[radial-gradient(#ffffff08_1px,transparent_1px)] [background-size:24px_24px] opacity-40" />
      </div>

      <main className="relative z-10">
        <MarketingClient initialCountryCode={countryCode} initialPricing={initialPricing} />
      </main>
    </div>
  );
}
