import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  try {
    const cookieStore = cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co",
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-anon-key",
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
          set(name: string, value: string, options: CookieOptions) {
            try { cookieStore.set({ name, value, ...options }); } catch {}
          },
          remove(name: string, options: CookieOptions) {
            try { cookieStore.set({ name, value: "", ...options }); } catch {}
          },
        },
      }
    );

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const orderId = body.orderId;
    const userId = session.user.id;
    const userEmail = session.user.email;

    const adminClient = createAdminClient();

    // Ensure profiles record exists to satisfy FK constraint
    const { data: profile } = await adminClient
      .from("profiles")
      .select("id")
      .eq("id", userId)
      .maybeSingle();

    if (!profile) {
      await adminClient.from("profiles").upsert({
        id: userId,
        email: userEmail || null,
      });
    }

    // 1. If specific orderId supplied, claim it
    if (orderId) {
      await adminClient
        .from("orders")
        .update({ user_id: userId, guest_email: userEmail || null })
        .eq("id", orderId)
        .is("user_id", null);
    }

    // 2. Claim all unlinked orders matching user's email
    if (userEmail) {
      await adminClient
        .from("orders")
        .update({ user_id: userId })
        .eq("guest_email", userEmail)
        .is("user_id", null);
    }

    // 3. Fetch fresh orders list
    let query = adminClient
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });

    if (userEmail) {
      query = query.or(`user_id.eq.${userId},guest_email.eq.${userEmail}`);
    } else {
      query = query.eq("user_id", userId);
    }

    const { data: orders, error } = await query;
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, orders: orders || [] });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
