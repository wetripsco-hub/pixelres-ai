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

    // Determine the real authenticated user (if any)
    let authenticatedUserId: string | null = null;
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
    } catch {
      // Guest checkout — authenticatedUserId stays null
    }

    // NEVER insert the string "guest" — always use null to prevent FK constraint errors
    const safeUserId = authenticatedUserId || (userId && userId !== "guest" ? userId : null);

    // Use admin client (SERVICE_ROLE_KEY) to completely bypass RLS
    const adminClient = createAdminClient();

    const { error: insertError } = await adminClient.from("orders").insert({
      id: orderId,
      user_id: safeUserId,
      guest_email: customerEmail || null,
      original_image_url: filePath,
      target_resolution: targetResolution,
      enhancement_type: enhancementType || "general",
      currency,
      amount_paid: amountPaid,
      status: "pending",
    });

    if (insertError) {
      console.error("Order insert error:", insertError);
      // Return success anyway so checkout is never blocked by non-fatal DB issues
      return NextResponse.json({
        success: true,
        orderId,
        warning: insertError.message,
      });
    }

    return NextResponse.json({ success: true, orderId });
  } catch (err: any) {
    console.error("Error creating order:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
