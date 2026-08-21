import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      orderId,
      userId,
      customerEmail,
      filePath,
      targetResolution,
      enhancementType,
      currency,
      amountPaid,
    } = body;

    if (!orderId || !filePath || !targetResolution || !currency || amountPaid === undefined) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    let authenticatedUserId: string | null = null;
    let safeCustomerEmail: string | null = customerEmail || null;

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
      const { data: { user } } = await supabase.auth.getUser();
      authenticatedUserId = user?.id || null;
      if (user?.email && !safeCustomerEmail) {
        safeCustomerEmail = user.email;
      }
    } catch {
      // Guest checkout — authenticatedUserId stays null
    }

    // Determine target user ID (never insert string "guest")
    let safeUserId: string | null = authenticatedUserId || (userId && userId !== "guest" ? userId : null);

    // Create admin client with SUPABASE_SERVICE_ROLE_KEY to bypass RLS
    const supabaseAdmin = createAdminClient();

    // Ensure profiles row exists if user_id is provided, preventing foreign key constraint violations
    if (safeUserId) {
      const { data: profile } = await supabaseAdmin
        .from("profiles")
        .select("id")
        .eq("id", safeUserId)
        .maybeSingle();

      if (!profile) {
        const { error: profileError } = await supabaseAdmin.from("profiles").upsert({
          id: safeUserId,
          email: safeCustomerEmail || null,
        });

        if (profileError) {
          console.warn("[Orders Create] Profile creation failed, setting user_id to null:", profileError.message);
          safeUserId = null;
        }
      }
    }

    // Perform strict upsert into orders table
    const { error: upsertError } = await supabaseAdmin.from("orders").upsert({
      id: orderId,
      user_id: safeUserId,
      guest_email: safeCustomerEmail,
      original_image_url: filePath,
      target_resolution: targetResolution,
      enhancement_type: enhancementType || "general",
      currency: currency || "USD",
      amount_paid: amountPaid || 0,
      status: "processing", // mark as processing upon checkout/success
      created_at: new Date().toISOString(),
    });

    if (upsertError) {
      console.error("CRITICAL DB INSERT ERROR:", upsertError);

      // If user_id FK error happens anyway, retry with user_id = null
      if (upsertError.message.includes("foreign key") || upsertError.code === "23503") {
        const { error: retryError } = await supabaseAdmin.from("orders").upsert({
          id: orderId,
          user_id: null,
          guest_email: safeCustomerEmail,
          original_image_url: filePath,
          target_resolution: targetResolution,
          enhancement_type: enhancementType || "general",
          currency: currency || "USD",
          amount_paid: amountPaid || 0,
          status: "processing",
          created_at: new Date().toISOString(),
        });

        if (!retryError) {
          return NextResponse.json({ success: true, orderId });
        }
      }

      return NextResponse.json({ error: upsertError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, orderId });
  } catch (err: any) {
    console.error("Error creating order:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
