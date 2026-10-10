import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { DashboardClient } from "./DashboardClient";
import { GuestSuccessClient } from "./GuestSuccessClient";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams?: { order_id?: string; payment?: string };
}) {
  const supabase = await createClient();
  // getUser() verifies the token with Supabase; getSession() only trusts the cookie.
  const { data: { user } } = await supabase.auth.getUser();

  const adminClient = createAdminClient();
  const headersList = headers();
  const countryCode = headersList.get("x-user-country") || "US";

  // ── Guest user arriving after checkout (no session) ──
  // Show a lightweight guest success page instead of redirecting to /login
  if (!user) {
    // If they have payment=success + order_id, show success confirmation
    if (searchParams?.payment === "success" && searchParams?.order_id) {
      const { data: order } = await adminClient
        .from("orders")
        .select("id, status, target_resolution, enhancement_type, currency, amount_paid, created_at, guest_email")
        .eq("id", searchParams.order_id)
        .maybeSingle();

      return (
        <GuestSuccessClient
          order={order}
          countryCode={countryCode}
        />
      );
    }

    // No payment context — redirect to login
    redirect("/login");
  }

  // ── Authenticated user flow ──
  const userId = user.id;
  const userEmail = user.email;

  // 1. Link the order they just paid for. The order id is an unguessable UUID, so only
  //    its buyer knows it; it can only be linked if it has no owner and the email matches (or is empty).
  if (searchParams?.order_id) {
    await adminClient
      .from("orders")
      .update({ user_id: userId, guest_email: userEmail || null })
      .eq("id", searchParams.order_id)
      .is("user_id", null)
      .or(userEmail ? `guest_email.is.null,guest_email.eq.${userEmail}` : "guest_email.is.null");
  }

  // 2. Link earlier guest orders ONLY when the email matches exactly.
  //    (The old code also grabbed every order with an empty email, handing other
  //    customers' orders to whoever logged in first.)
  if (userEmail) {
    await adminClient
      .from("orders")
      .update({ user_id: userId })
      .eq("guest_email", userEmail)
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
