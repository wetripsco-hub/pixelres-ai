import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { isAdmin } from '@/app/(admin)/admin/actions';

// GET /api/admin/pricing — Fetch all pricing tiers
export async function GET() {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const adminClient = createAdminClient();
    const { data, error } = await adminClient
      .from('pricing_settings')
      .select('*')
      .order('id');

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ tiers: data || [] });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// Handler for both POST and PUT requests
async function handleUpdatePricing(req: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json().catch(() => null);
    if (!body || !body.tiers || !Array.isArray(body.tiers)) {
      return NextResponse.json({ error: 'Invalid payload: expected { tiers: [...] }' }, { status: 400 });
    }

    const { tiers } = body;
    const validIds = ['web', '4k', '8k'];

    for (const tier of tiers) {
      if (!validIds.includes(tier.id)) {
        return NextResponse.json({ error: `Invalid tier id: ${tier.id}` }, { status: 400 });
      }
      if (typeof tier.usd_price !== 'number' || tier.usd_price < 0) {
        return NextResponse.json({ error: `Invalid USD price for ${tier.id}` }, { status: 400 });
      }
      if (typeof tier.pkr_price !== 'number' || tier.pkr_price < 0) {
        return NextResponse.json({ error: `Invalid PKR price for ${tier.id}` }, { status: 400 });
      }
      if (typeof tier.inr_price !== 'number' || tier.inr_price < 0) {
        return NextResponse.json({ error: `Invalid INR price for ${tier.id}` }, { status: 400 });
      }
    }

    const adminClient = createAdminClient();

    for (const tier of tiers) {
      const { error } = await adminClient
        .from('pricing_settings')
        .upsert(
          {
            id: tier.id,
            usd_price: tier.usd_price,
            pkr_price: tier.pkr_price,
            inr_price: tier.inr_price,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'id' }
        );

      if (error) {
        console.error(`Failed to update pricing tier ${tier.id}:`, error);
        return NextResponse.json({ error: `Failed to update ${tier.id}: ${error.message}` }, { status: 500 });
      }
    }

    return NextResponse.json({ success: true, message: "Pricing updated successfully" });
  } catch (err: any) {
    console.error("Pricing update exception:", err);
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}

// POST /api/admin/pricing
export async function POST(req: Request) {
  return handleUpdatePricing(req);
}

// PUT /api/admin/pricing
export async function PUT(req: Request) {
  return handleUpdatePricing(req);
}
