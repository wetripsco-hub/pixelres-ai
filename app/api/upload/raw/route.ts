import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

const MAX_BYTES = 25 * 1024 * 1024; // 25MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
// Path must be "<guest | user-uuid>/<order-uuid>.<ext>" exactly as the uploader builds it.
const PATH_RE = /^(guest|[0-9a-f-]{36})\/[0-9a-f-]{36}\.(jpe?g|png|webp)$/i;

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const path = formData.get("path") as string | null;

    if (!file || !path) {
      return NextResponse.json({ error: "File and path are required." }, { status: 400 });
    }
    if (!PATH_RE.test(path)) {
      return NextResponse.json({ error: "Invalid upload path." }, { status: 400 });
    }
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ error: "Only JPG, PNG or WebP images are allowed." }, { status: 400 });
    }
    if (file.size > MAX_BYTES) {
      return NextResponse.json({ error: "File is larger than 25MB." }, { status: 413 });
    }

    // A non-guest path must belong to the logged-in user.
    const prefix = path.split("/")[0];
    if (prefix !== "guest") {
      const supabase = await createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || user.id !== prefix) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    }

    const adminClient = createAdminClient();

    const { data: buckets } = await adminClient.storage.listBuckets();
    if (!buckets?.some((b) => b.name === "raw-uploads")) {
      await adminClient.storage.createBucket("raw-uploads", {
        public: false, // customer photos must never be public
        fileSizeLimit: MAX_BYTES,
      });
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    const { data, error } = await adminClient.storage
      .from("raw-uploads")
      .upload(path, buffer, {
        contentType: file.type,
        cacheControl: "3600",
        upsert: false, // never overwrite someone else's file
      });

    if (error) {
      console.error("Server raw upload error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, path: data.path });
  } catch (err: any) {
    console.error("Error in /api/upload/raw:", err);
    return NextResponse.json({ error: "Failed to upload file." }, { status: 500 });
  }
}
