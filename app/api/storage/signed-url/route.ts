import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { isAdmin } from "@/app/(admin)/admin/actions";

const ALLOWED_BUCKETS = ["raw-uploads", "upscaled-outputs"] as const;

export async function POST(req: Request) {
  try {
    const { bucket, path, expiresIn } = await req.json();

    if (!bucket || !path || typeof path !== "string" || path.includes("..")) {
      return NextResponse.json({ error: "Bucket and path are required." }, { status: 400 });
    }
    if (!ALLOWED_BUCKETS.includes(bucket)) {
      return NextResponse.json({ error: "Invalid bucket." }, { status: 400 });
    }

    const adminClient = createAdminClient();

    // Only admins, or the logged-in owner of an order that references this file.
    if (!(await isAdmin())) {
      const supabase = await createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      const column = bucket === "raw-uploads" ? "original_image_url" : "upscaled_image_url";
      let query = adminClient.from("orders").select("id").eq(column, path);
      query = user.email
        ? query.or(`user_id.eq.${user.id},guest_email.eq.${user.email}`)
        : query.eq("user_id", user.id);
      const { data: owned } = await query.limit(1);
      if (!owned || owned.length === 0) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    }

    const ttl = Math.min(Math.max(Number(expiresIn) || 300, 30), 900); // 30s–15min

    const { data, error } = await adminClient.storage.from(bucket).createSignedUrl(path, ttl);
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ signedUrl: data.signedUrl });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
