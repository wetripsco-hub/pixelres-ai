"use server"

import { createAdminClient } from "@/lib/supabase/admin"
import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

// Verify if the current session has admin rights
async function isAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return false;

  // Check against env var
  if (process.env.ADMIN_EMAIL && user.email === process.env.ADMIN_EMAIL) {
    return true;
  }

  // Or check role in profiles table
  const adminClient = createAdminClient()
  const { data: profile } = await adminClient
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  return profile?.role === 'admin'
}

export async function generateDownloadUrl(filePath: string) {
  if (!(await isAdmin())) {
    throw new Error("Unauthorized")
  }

  const adminClient = createAdminClient()

  // Generate a signed URL valid for 60 seconds
  const { data, error } = await adminClient.storage
    .from('raw-uploads')
    .createSignedUrl(filePath, 60)

  if (error) {
    throw new Error(`Failed to generate download URL: ${error.message}`)
  }

  return data.signedUrl
}

// Update order status manually
export async function updateOrderStatus(orderId: string, status: 'pending' | 'processing' | 'failed') {
  if (!(await isAdmin())) {
    throw new Error("Unauthorized")
  }

  const adminClient = createAdminClient()
  const { error } = await adminClient
    .from('orders')
    .update({ status })
    .eq('id', orderId)

  if (error) {
    throw new Error(`Failed to update status: ${error.message}`)
  }

  revalidatePath('/admin')
  return { success: true }
}

export async function completeOrder(orderId: string, fileDataUrl: string, fileName: string) {
  if (!(await isAdmin())) {
    throw new Error("Unauthorized")
  }

  const adminClient = createAdminClient()

  // For a real production app handling large files,
  // you'd generate a signed upload URL for the client to upload directly.
  // Since we have a 5MB/4MB Vercel serverless limit, we'll try direct upload if it's small,
  // but let's implement the Signed Upload URL method instead.

  throw new Error("Use generateUploadUrl instead for large files")
}

export async function generateUploadUrl(orderId: string, userId: string, fileExt: string) {
  if (!(await isAdmin())) {
    throw new Error("Unauthorized")
  }

  const adminClient = createAdminClient()
  // Path pattern: deliverables/[user_id]/[order_id]_upscaled.[ext]
  const uid = userId || 'guest'
  const filePath = `deliverables/${uid}/${orderId}_upscaled.${fileExt}`

  // createSignedUploadUrl is available in supabase-js
  const { data, error } = await adminClient.storage
    .from('upscaled-outputs')
    .createSignedUploadUrl(filePath)

  if (error) {
    throw new Error(`Failed to generate upload URL: ${error.message}`)
  }

  return {
    signedUrl: data.signedUrl,
    token: data.token,
    filePath,
    path: data.path
  }
}

export async function finalizeOrder(orderId: string, filePath: string) {
  if (!(await isAdmin())) {
    throw new Error("Unauthorized")
  }

  const adminClient = createAdminClient()

  const { error } = await adminClient
    .from('orders')
    .update({
      status: 'completed',
      upscaled_image_url: filePath,
      completed_at: new Date().toISOString()
    })
    .eq('id', orderId)

  if (error) {
    throw new Error(`Failed to finalize order: ${error.message}`)
  }

  revalidatePath('/admin')
  return { success: true }
}
