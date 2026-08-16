import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { DashboardClient } from "./DashboardClient";

export default async function DashboardPage() {
  const supabase = await createClient();

  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    redirect("/login");
  }

  // Fetch orders for this user
  const { data: orders } = await supabase
    .from("orders")
    .select("*")
    .eq("user_id", session.user.id)
    .order("created_at", { ascending: false });

  const headersList = headers();
  const countryCode = headersList.get("x-user-country") || "US";

  return (
    <DashboardClient
      countryCode={countryCode}
      initialOrders={orders || []}
      user={{
        id: session.user.id,
        email: session.user.email || "",
      }}
    />
  );
}
