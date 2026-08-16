import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(req: Request) {
  try {
    const { bucket, path, expiresIn } = await req.json();

    if (!bucket || !path) {
      return NextResponse.json({ error: "Bucket and path are required." }, { status: 400 });
    }

    const adminClient = createAdminClient();
    const ttl = expiresIn || 300; // 5 mins default

    const { data, error } = await adminClient.storage
      .from(bucket)
      .createSignedUrl(path, ttl);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ signedUrl: data.signedUrl });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
