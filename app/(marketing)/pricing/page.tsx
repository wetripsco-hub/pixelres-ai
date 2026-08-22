export const dynamic = 'force-dynamic';

import { headers } from "next/headers";
import { PricingClient } from "./PricingClient";
import { getGlobalPricing } from "@/lib/pricing";

export default async function PricingPage() {
  const headersList = headers();
  const countryCode = headersList.get('x-user-country') || 'US';
  const initialPricing = await getGlobalPricing();

  return (
    <>
      {/* Background Gradients */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-cyan-900/20 blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-violet-900/20 blur-[120px]" />
        <div className="absolute inset-0 bg-[url('https://res.cloudinary.com/dzvy8pbbm/image/upload/v1709668478/grid-pattern_q5m9i2.svg')] bg-repeat opacity-[0.03]" />
      </div>

      <main className="relative z-10 pt-24 pb-32">
        <PricingClient initialCountryCode={countryCode} initialPricing={initialPricing} />
      </main>
    </>
  );
}
