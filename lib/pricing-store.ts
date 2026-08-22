import fs from 'fs';
import path from 'path';
import { createAdminClient } from '@/lib/supabase/admin';
import { PricingConfig, DEFAULT_PRICING } from './pricing-types';

export interface PricingSetting {
  id: 'web' | '4k' | '8k';
  usd_price: number;
  pkr_price: number;
  inr_price: number;
}

export const DEFAULT_PRICING_SETTINGS: PricingSetting[] = [
  { id: 'web', usd_price: 1.99, pkr_price: 300, inr_price: 149 },
  { id: '4k', usd_price: 4.99, pkr_price: 1299, inr_price: 399 },
  { id: '8k', usd_price: 9.99, pkr_price: 2499, inr_price: 799 },
];

const LOCAL_STORAGE_FILE = path.join(process.cwd(), 'data', 'pricing_settings.json');

// Converts PricingSetting[] array to PricingConfig object
export function settingsToConfig(settings: PricingSetting[]): PricingConfig {
  const config: PricingConfig = JSON.parse(JSON.stringify(DEFAULT_PRICING));
  for (const s of settings) {
    if (s.id === 'web' || s.id === '4k' || s.id === '8k') {
      config[s.id] = {
        usd: Number(s.usd_price),
        pkr: Number(s.pkr_price),
        inr: Number(s.inr_price),
      };
    }
  }
  return config;
}

// Converts PricingConfig object to PricingSetting[] array
export function configToSettings(config: PricingConfig): PricingSetting[] {
  return [
    { id: 'web', usd_price: config.web.usd, pkr_price: config.web.pkr, inr_price: config.web.inr },
    { id: '4k', usd_price: config['4k'].usd, pkr_price: config['4k'].pkr, inr_price: config['4k'].inr },
    { id: '8k', usd_price: config['8k'].usd, pkr_price: config['8k'].pkr, inr_price: config['8k'].inr },
  ];
}

// Read current pricing settings (checks Supabase app_settings, pricing_settings, and local store)
export async function getPricingSettings(): Promise<PricingSetting[]> {
  const adminClient = createAdminClient();

  // 1. Try Supabase app_settings (key: pricing_config)
  try {
    const { data: appData, error: appError } = await adminClient
      .from('app_settings')
      .select('value')
      .eq('key', 'pricing_config')
      .single();

    if (!appError && appData?.value) {
      if (Array.isArray(appData.value)) {
        return appData.value as PricingSetting[];
      } else if (appData.value.web && appData.value['4k'] && appData.value['8k']) {
        return configToSettings(appData.value as PricingConfig);
      }
    }
  } catch (e) {
    // app_settings not available
  }

  // 2. Try Supabase pricing_settings table
  try {
    const { data, error } = await adminClient
      .from('pricing_settings')
      .select('*')
      .order('id');

    if (!error && data && data.length > 0) {
      return data as PricingSetting[];
    }
  } catch (e) {
    // pricing_settings not available
  }

  // 3. Try Local File Storage
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

  // 4. Fallback to default
  return DEFAULT_PRICING_SETTINGS;
}

// Save pricing settings to all stores
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

  const adminClient = createAdminClient();
  const config = settingsToConfig(tiers);

  // 2. Try saving to Supabase app_settings (key: pricing_config)
  try {
    const { error: appErr } = await adminClient
      .from('app_settings')
      .upsert({
        key: 'pricing_config',
        value: config,
        updated_at: new Date().toISOString()
      }, { onConflict: 'key' });

    if (!appErr) {
      savedToDb = true;
    }
  } catch (e) {
    // app_settings not created yet
  }

  // 3. Try saving to Supabase pricing_settings table
  try {
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
    // pricing_settings table not available
  }

  return { success: true, savedToDb };
}
