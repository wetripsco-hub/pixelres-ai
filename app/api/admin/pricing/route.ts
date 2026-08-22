import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { isAdmin } from '@/app/(admin)/admin/actions';
import { getPricingSettings, savePricingSettings, PricingSetting } from '@/lib/pricing-store';

// GET /api/admin/pricing — Fetch all pricing tiers
export async function GET() {
  try {
    const tiers = await getPricingSettings();
    return NextResponse.json({ tiers });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// Handler for both POST and PUT requests
async function handleUpdatePricing(req: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: 'Unauthorized: Admin privileges required' }, { status: 401 });
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

    const result = await savePricingSettings(tiers as PricingSetting[]);

    // Bust Next.js cache globally
    try {
      revalidatePath('/', 'layout');
      revalidatePath('/pricing');
      revalidatePath('/studio');
      revalidatePath('/dashboard');
      revalidatePath('/admin');
    } catch (e) {
      // Revalidation in route handler
    }

    return NextResponse.json({
      success: true,
      message: result.savedToDb
        ? "Pricing updated globally in database & store successfully!"
        : "Pricing saved and revalidated across all platform pages!",
      savedToDb: result.savedToDb,
    });
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
