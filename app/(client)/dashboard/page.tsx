import { DashboardClient } from "./DashboardClient";
import { headers } from "next/headers";

export default function DashboardPage() {
  const headersList = headers();
  const countryCode = headersList.get('x-user-country') || 'US';

  return <DashboardClient countryCode={countryCode} />;
}
