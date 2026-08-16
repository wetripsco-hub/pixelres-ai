import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { id, user_id, original_image_url, target_resolution, enhancement_type, currency, amount_paid, customer_email } = body;

    if (!id || !original_image_url || !target_resolution || !currency || amount_paid === undefined) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    const adminClient = createAdminClient();

    // Ensure user_id is null if it's 'guest' or undefined to avoid foreign key violations
    const validUserId = (user_id === 'guest' || !user_id) ? null : user_id;

    const { error: insertError } = await adminClient.from('orders').insert({
      id,
      user_id: validUserId,
      guest_email: customer_email || null,
      original_image_url,
      target_resolution,
      enhancement_type,
      currency,
      amount_paid,
      status: 'pending'
    });

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Error creating order:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
