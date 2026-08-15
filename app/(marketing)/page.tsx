export const dynamic = 'force-dynamic';

import { headers } from "next/headers";
import { MarketingClient } from "./MarketingClient";

export default function MarketingPage() {
  const headersList = headers();
  const countryCode = headersList.get('x-user-country') || 'US';

  return (
    <div className="min-h-screen bg-[#090A0F] text-slate-50 selection:bg-cyan-900/50 selection:text-cyan-50 font-sans overflow-hidden relative">
      {/* Background Effects — geometric cross-hatch + radial flares */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        {/* Geometric pattern overlay */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              'linear-gradient(45deg, transparent 48%, rgba(6,182,212,0.5) 50%, transparent 52%), linear-gradient(-45deg, transparent 48%, rgba(139,92,246,0.4) 50%, transparent 52%)',
            backgroundSize: '150px 150px',
          }}
        />
        {/* Radial glow: top-left cyan */}
        <div className="absolute top-[10%] left-[-100px] w-[400px] h-[400px] rounded-full bg-[radial-gradient(circle,rgba(6,182,212,0.2)_0%,transparent_70%)]" />
        {/* Radial glow: top-right violet */}
        <div className="absolute top-[30%] right-[-150px] w-[400px] h-[400px] rounded-full bg-[radial-gradient(circle,rgba(139,92,246,0.2)_0%,transparent_70%)]" />
      </div>

      <main className="relative z-10">
        <MarketingClient initialCountryCode={countryCode} />
      </main>
    </div>
  );
}
