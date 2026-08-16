import { DashboardClient } from "./DashboardClient";
import { headers } from "next/headers";
import { Suspense } from "react";

export default function DashboardPage() {
  const headersList = headers();
  const countryCode = headersList.get('x-user-country') || 'US';

  return <DashboardClient countryCode={countryCode} />;
}
