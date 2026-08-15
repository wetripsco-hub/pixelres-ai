import { Navbar } from "@/components/shared/navbar";
import { Footer } from "@/components/shared/footer";
import { headers } from "next/headers";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const headersList = headers();
  const countryCode = headersList.get("x-user-country") || "US";

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-[#090A0F] transition-colors duration-300">
      <Navbar countryCode={countryCode} />
      <div className="flex-1">
        {children}
      </div>
      <Footer />
    </div>
  );
}
