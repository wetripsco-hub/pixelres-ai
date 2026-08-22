import { createClient } from '@supabase/supabase-js';

export * from './pricing-types';
import { 
  PricingConfig, 
  DEFAULT_PRICING, 
  PricingInfo, 
  getPricingTiersFromConfig 
} from './pricing-types';

// ── Central Dynamic Pricing Fetcher ────────────────────────────────

export async function getGlobalPricing(): Promise<PricingConfig> {
  // 1. Client-Side (Browser Environment)
  if (typeof window !== 'undefined') {
    try {
      const res = await fetch('/api/admin/pricing', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        if (data && Array.isArray(data.tiers) && data.tiers.length > 0) {
          const config: PricingConfig = JSON.parse(JSON.stringify(DEFAULT_PRICING));
          for (const s of data.tiers) {
            if (s.id === 'web' || s.id === '4k' || s.id === '8k') {
              config[s.id as 'web' | '4k' | '8k'] = {
                usd: Number(s.usd_price),
                pkr: Number(s.pkr_price),
                inr: Number(s.inr_price),
              };
            }
          }
          return config;
        }
      }
    } catch {
      // Fallback
    }
  }

  // 2. Server-side: Fetch directly from Supabase
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (supabaseUrl && supabaseAnonKey && !supabaseUrl.includes('placeholder')) {
      const supabase = createClient(supabaseUrl, supabaseAnonKey);

      // Try app_settings table
      const { data: appData } = await supabase
        .from('app_settings')
        .select('value')
        .eq('key', 'pricing_config')
        .single();

      if (appData?.value?.web && appData?.value?.['4k'] && appData?.value?.['8k']) {
        return appData.value as PricingConfig;
      }

      // Try pricing_settings table
      const { data: pricingData } = await supabase
        .from('pricing_settings')
        .select('*');

      if (pricingData && pricingData.length > 0) {
        const config: PricingConfig = JSON.parse(JSON.stringify(DEFAULT_PRICING));
        for (const row of pricingData) {
          if (row.id === 'web' || row.id === '4k' || row.id === '8k') {
            config[row.id as 'web' | '4k' | '8k'] = {
              usd: Number(row.usd_price),
              pkr: Number(row.pkr_price),
              inr: Number(row.inr_price),
            };
          }
        }
        return config;
      }
    }
  } catch {
    // Fallback to default
  }

  return DEFAULT_PRICING;
}

// Dynamic tiers fetcher
export async function getAllPricingTiersDynamic(countryCode: string = 'US'): Promise<PricingInfo[]> {
  const config = await getGlobalPricing();
  return getPricingTiersFromConfig(config, countryCode);
}
