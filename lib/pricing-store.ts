import fs from 'fs';
import path from 'path';
import { createAdminClient } from '@/lib/supabase/admin';

export interface PricingSetting {
  id: 'web' | '4k' | '8k';
  usd_price: number;
  pkr_price: number;
  inr_price: number;
}

const DEFAULT_PRICING: PricingSetting[] = [
  { id: 'web', usd_price: 1.99, pkr_price: 499, inr_price: 149 },
  { id: '4k', usd_price: 4.99, pkr_price: 1299, inr_price: 399 },
  { id: '8k', usd_price: 9.99, pkr_price: 2499, inr_price: 799 },
];

const LOCAL_STORAGE_FILE = path.join(process.cwd(), 'data', 'pricing_settings.json');

// Read current pricing settings
export async function getPricingSettings(): Promise<PricingSetting[]> {
  try {
    // 1. Try Supabase
    const adminClient = createAdminClient();
    const { data, error } = await adminClient
      .from('pricing_settings')
      .select('*')
      .order('id');

    if (!error && data && data.length > 0) {
      return data as PricingSetting[];
    }
  } catch (e) {
    // Supabase query failed or table missing
  }

  // 2. Try Local File Storage
  try {
    if (fs.existsSync(LOCAL_STORAGE_FILE)) {
      const raw = fs.readFileSync(LOCAL_STORAGE_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    // File read error
  }

  // 3. Fallback to default
  return DEFAULT_PRICING;
}

// Save pricing settings
export async function savePricingSettings(tiers: PricingSetting[]): Promise<{ success: boolean; savedToDb: boolean; error?: string }> {
  let savedToDb = false;

  // 1. Always persist to local file store
  try {
    const dir = path.dirname(LOCAL_STORAGE_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(LOCAL_STORAGE_FILE, JSON.stringify(tiers, null, 2), 'utf-8');
  } catch (err: any) {
    console.error('Failed to write pricing to local file:', err);
  }

  // 2. Try to sync to Supabase table
  try {
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

      if (!error) {
        savedToDb = true;
      }
    }
  } catch (err: any) {
    console.warn('Supabase pricing_settings table not available yet, using local store:', err.message);
  }

  return { success: true, savedToDb };
}
