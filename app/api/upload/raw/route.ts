import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const path = formData.get("path") as string | null;

    if (!file || !path) {
      return NextResponse.json({ error: "File and path are required." }, { status: 400 });
    }

    const adminClient = createAdminClient();

    // Ensure bucket exists
    const { data: buckets } = await adminClient.storage.listBuckets();
    const rawBucketExists = buckets?.some((b) => b.name === "raw-uploads");

    if (!rawBucketExists) {
      await adminClient.storage.createBucket("raw-uploads", {
        public: true,
        fileSizeLimit: 26214400, // 25MB
      });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const { data, error } = await adminClient.storage
      .from("raw-uploads")
      .upload(path, buffer, {
        contentType: file.type || "image/jpeg",
        cacheControl: "3600",
        upsert: true,
      });

    if (error) {
      console.error("Server raw upload error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, path: data.path });
  } catch (err: any) {
    console.error("Error in /api/upload/raw:", err);
    return NextResponse.json({ error: err.message || "Failed to upload file." }, { status: 500 });
  }
}
