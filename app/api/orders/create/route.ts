import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { getGlobalPricing, getPriceForTierAndCurrency, ResolutionTier, CurrencyCode } from "@/lib/pricing";

const TIERS = ["web", "4k", "8k"];
const CURRENCIES = ["USD", "PKR", "INR"];
const ENHANCEMENTS = ["general", "face", "restore", "denoise"];
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { orderId, customerEmail, filePath, targetResolution, enhancementType, currency } = body;

    if (!orderId || !filePath || !targetResolution || !currency) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }
    if (!UUID_RE.test(orderId)) {
      return NextResponse.json({ error: "Invalid order id" }, { status: 400 });
    }
    if (!TIERS.includes(targetResolution) || !CURRENCIES.includes(currency)) {
      return NextResponse.json({ error: "Invalid tier or currency" }, { status: 400 });
    }
    if (customerEmail && !EMAIL_RE.test(customerEmail)) {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    }

    // The file must be the one uploaded for THIS order (path = "<owner>/<orderId>.<ext>").
    if (typeof filePath !== "string" || !filePath.includes(`/${orderId}.`)) {
      return NextResponse.json({ error: "File does not match order" }, { status: 400 });
    }

    // Identity comes from the session, never from the request body.
    let userId: string | null = null;
    let email: string | null = customerEmail || null;
    try {
      const supabase = await createClient();
      const { data: { user } } = await supabase.auth.getUser();
      userId = user?.id || null;
      if (user?.email) email = user.email;
    } catch {
      // guest checkout
    }

    // A path owned by a user must match the logged-in user.
    const owner = filePath.split("/")[0];
    if (owner !== "guest" && owner !== userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Price is computed on the server. The client-supplied amount is ignored.
    const pricing = await getGlobalPricing();
    const amount = getPriceForTierAndCurrency(pricing, targetResolution as ResolutionTier, currency as CurrencyCode);

    const admin = createAdminClient();

    if (userId) {
      const { data: profile } = await admin.from("profiles").select("id").eq("id", userId).maybeSingle();
      if (!profile) {
        const { error: profileError } = await admin.from("profiles").upsert({ id: userId, email });
        if (profileError) userId = null;
      }
    }

    // insert (not upsert): an existing order can never be overwritten by re-posting its id.
    // Status stays "pending" until the Stripe webhook confirms payment.
    const { error } = await admin.from("orders").insert({
      id: orderId,
      user_id: userId,
      guest_email: email,
      original_image_url: filePath,
      target_resolution: targetResolution,
      enhancement_type: ENHANCEMENTS.includes(enhancementType) ? enhancementType : "general",
      currency,
      amount_paid: amount,
      status: "pending",
    });

    if (error) {
      console.error("Order insert failed:", error);
      return NextResponse.json({ error: "Could not create order" }, { status: 500 });
    }

    return NextResponse.json({ success: true, orderId });
  } catch (err: any) {
    console.error("Error creating order:", err);
    return NextResponse.json({ error: "Could not create order" }, { status: 500 });
  }
}
