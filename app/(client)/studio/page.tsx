import { headers } from "next/headers";
import { Suspense } from "react";
import { StudioImageUploader } from "@/components/studio/ImageUploader";
import { Sparkles } from "lucide-react";

export default function StudioPage({
  searchParams,
}: {
  searchParams: { tier?: string };
}) {
  const headersList = headers();
  const countryCode = headersList.get("x-user-country") || "US";
  const initialTier = searchParams.tier || "4k";

  return (
    <div className="min-h-screen bg-[#090A0F] text-slate-50 font-sans p-4 sm:p-8 relative overflow-hidden">
      {/* Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-cyan-900/10 blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-violet-900/10 blur-[120px]" />
        <div className="absolute inset-0 bg-[url('https://res.cloudinary.com/dzvy8pbbm/image/upload/v1709668478/grid-pattern_q5m9i2.svg')] bg-repeat opacity-[0.02]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto pt-12 pb-24">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900/80 border border-violet-500/30 backdrop-blur-md text-sm text-violet-300 mb-6 shadow-[0_0_15px_rgba(139,92,246,0.15)]">
            <Sparkles className="h-4 w-4 text-violet-400" />
            PixelRes Studio
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-4">
            Create Your Masterpiece
          </h1>
          <p className="text-lg text-slate-400">
            Upload your image below. Our AI will enhance the details and scale
            it to your desired resolution.
          </p>
        </div>

        <Suspense
          fallback={
            <div className="p-12 text-center text-slate-400">
              Loading uploader…
            </div>
          }
        >
          <StudioImageUploader
            countryCode={countryCode}
            initialTier={initialTier}
          />
        </Suspense>
      </div>
    </div>
  );
}
