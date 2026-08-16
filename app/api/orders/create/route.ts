import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { orderId, userId, customerEmail, filePath, targetResolution, enhancementType, currency, amountPaid } = body;

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { data, error } = await supabaseAdmin.from('orders').insert([
      {
        id: orderId,
        user_id: userId || null,
        guest_email: customerEmail || null,
        original_image_url: filePath,
        target_resolution: targetResolution,
        enhancement_type: enhancementType,
        currency: currency || 'USD',
        amount_paid: amountPaid || 0,
        status: 'pending'
      }
    ]);

    if (error) {
      console.error('Supabase DB Insert Error:', error);
      return NextResponse.json({ success: true, warning: error.message });
    }

    return NextResponse.json({ success: true, data });
  } catch (err: any) {
    console.error('Order creation error:', err);
    return NextResponse.json({ success: true, error: err.message });
  }
}
