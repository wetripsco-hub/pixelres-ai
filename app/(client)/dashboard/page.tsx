import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { DashboardClient } from "./DashboardClient";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams?: { order_id?: string; payment?: string };
}) {
  const supabase = await createClient();

  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    redirect("/login");
  }

  const adminClient = createAdminClient();
  const userId = session.user.id;
  const userEmail = session.user.email;

  // 1. Auto-link guest order on payment success / returning with order_id
  if (searchParams?.order_id) {
    await adminClient
      .from("orders")
      .update({ user_id: userId, guest_email: userEmail || null })
      .eq("id", searchParams.order_id)
      .is("user_id", null);
  }

  // 2. Auto-link any unlinked guest orders matching user's email or with empty email
  if (userEmail) {
    await adminClient
      .from("orders")
      .update({ user_id: userId, guest_email: userEmail })
      .or(`guest_email.eq.${userEmail},guest_email.is.null`)
      .is("user_id", null);
  }

  // 3. Fetch ALL orders (pending, processing, completed, failed) for user or email
  let orderQuery = adminClient
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false });

  if (userEmail) {
    orderQuery = orderQuery.or(`user_id.eq.${userId},guest_email.eq.${userEmail}`);
  } else {
    orderQuery = orderQuery.eq("user_id", userId);
  }

  const { data: orders } = await orderQuery;

  const headersList = headers();
  const countryCode = headersList.get("x-user-country") || "US";

  return (
    <DashboardClient
      countryCode={countryCode}
      initialOrders={orders || []}
      user={{
        id: userId,
        email: userEmail || "",
      }}
    />
  );
}
