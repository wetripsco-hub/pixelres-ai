"use server"

import { createAdminClient } from "@/lib/supabase/admin"
import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { cookies } from "next/headers"

// Verify if the current session has admin rights via DB, Env, or PIN
export async function isAdmin() {
  const cookieStore = cookies()
  const pinCookie = cookieStore.get('admin_pin_access')?.value

  if (pinCookie === 'true') {
    return true;
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return false;

  const adminEmails = (process.env.ADMIN_EMAILS || process.env.ADMIN_EMAIL || 'wetrips.co@gmail.com')
    .split(',')
    .map(e => e.trim().toLowerCase());

  if (user.email && adminEmails.includes(user.email.toLowerCase())) {
    return true;
  }

  const adminClient = createAdminClient()
  const { data: profile } = await adminClient
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  return profile?.role === 'admin'
}

export async function verifyPin(pin: string) {
  const correctPin = process.env.ADMIN_PIN || '1234'
  if (pin === correctPin) {
    const cookieStore = cookies()
    cookieStore.set('admin_pin_access', 'true', { maxAge: 60 * 60 * 24, httpOnly: true, path: '/' })
    revalidatePath('/admin')
    return { success: true }
  }
  return { success: false, error: 'Invalid PIN' }
}

export async function generateDownloadUrl(filePath: string) {
  if (!(await isAdmin())) {
    throw new Error("Unauthorized")
  }

  const adminClient = createAdminClient()

  const { data, error } = await adminClient.storage
    .from('raw-uploads')
    .createSignedUrl(filePath, 60)

  if (error) {
    throw new Error(`Failed to generate download URL: ${error.message}`)
  }

  return data.signedUrl
}

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

export async function generateUploadUrl(orderId: string, userId: string, fileExt: string) {
  if (!(await isAdmin())) {
    throw new Error("Unauthorized")
  }

  const adminClient = createAdminClient()
  const uid = userId || 'guest'
  const filePath = `deliverables/${uid}/${orderId}_upscaled.${fileExt}`

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

export async function uploadDeliverable(orderId: string, userId: string | null, formData: FormData) {
  if (!(await isAdmin())) {
    throw new Error("Unauthorized")
  }

  const file = formData.get("file") as File | null
  if (!file) throw new Error("No file provided")

  const adminClient = createAdminClient()
  const fileExt = file.name.split('.').pop() || 'jpg'
  const uid = userId || 'guest'
  const filePath = `deliverables/${uid}/${orderId}_upscaled.${fileExt}`

  const { data: buckets } = await adminClient.storage.listBuckets()
  if (!buckets?.some(b => b.name === 'upscaled-outputs')) {
    await adminClient.storage.createBucket('upscaled-outputs', { public: true })
  }

  const arrayBuffer = await file.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)

  const { data, error } = await adminClient.storage
    .from('upscaled-outputs')
    .upload(filePath, buffer, {
      contentType: file.type || 'image/jpeg',
      upsert: true,
    })

  if (error) {
    throw new Error(`Failed to upload deliverable: ${error.message}`)
  }

  await finalizeOrder(orderId, data.path)
  return { success: true, filePath: data.path }
}

export async function generateThumbnailUrl(filePath: string) {
  if (!(await isAdmin())) {
    throw new Error("Unauthorized")
  }

  const adminClient = createAdminClient()

  const { data, error } = await adminClient.storage
    .from('raw-uploads')
    .createSignedUrl(filePath, 120, {
      transform: {
        width: 80,
        height: 80,
        resize: 'cover',
      },
    })

  if (error) {
    // Fallback to full-size signed URL if transforms not available
    const { data: fallback, error: fallbackErr } = await adminClient.storage
      .from('raw-uploads')
      .createSignedUrl(filePath, 120)

    if (fallbackErr) {
      throw new Error(`Failed to generate thumbnail: ${fallbackErr.message}`)
    }
    return fallback.signedUrl
  }

  return data.signedUrl
}
