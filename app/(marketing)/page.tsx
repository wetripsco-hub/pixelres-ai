export const dynamic = 'force-dynamic';

import { headers } from "next/headers";
import { MarketingClient } from "./MarketingClient";

export default function MarketingPage() {
  const headersList = headers();
  // We still pass the edge country code, but MarketingClient will also have a fallback
  const countryCode = headersList.get('x-user-country') || 'US';

  return (
    <div className="min-h-screen bg-[#090A0F] text-slate-50 selection:bg-cyan-900/50 selection:text-cyan-50 font-sans overflow-hidden">
      {/* Background Gradients */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-cyan-900/20 blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-violet-900/20 blur-[120px]" />
        <div className="absolute inset-0 bg-[url('https://res.cloudinary.com/dzvy8pbbm/image/upload/v1709668478/grid-pattern_q5m9i2.svg')] bg-repeat opacity-[0.03]" />
      </div>
      <main className="relative z-10">
        <MarketingClient initialCountryCode={countryCode} />
      </main>
    </div>
  );
}
