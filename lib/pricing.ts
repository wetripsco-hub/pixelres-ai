export type ResolutionTier = 'web' | '4k' | '8k';
export type CurrencyCode = 'USD' | 'PKR' | 'INR';

export interface PricingInfo {
  tier: ResolutionTier;
  label: string;
  description: string;
  price: number;
  formattedPrice: string;
  currency: CurrencyCode;
}

export const RESOLUTION_TIERS = {
  web: {
    id: 'web' as ResolutionTier,
    label: 'Web & Social',
    description: '~2000px',
  },
  '4k': {
    id: '4k' as ResolutionTier,
    label: '4K Ultra HD',
    description: '~4000px',
  },
  '8k': {
    id: '8k' as ResolutionTier,
    label: '8K Print-Ready',
    description: '~8000px, 300 DPI',
  },
};

// Fallback pricing used when Supabase or API is unreachable
const FALLBACK_PRICING_DATA: Record<CurrencyCode, Record<ResolutionTier, number>> = {
  USD: {
    web: 1.99,
    '4k': 4.99,
    '8k': 9.99,
  },
  PKR: {
    web: 499,
    '4k': 1299,
    '8k': 2499,
  },
  INR: {
    web: 149,
    '4k': 399,
    '8k': 799,
  },
};

export function getCurrencyForCountry(countryCode: string): CurrencyCode {
  const upperCode = countryCode.toUpperCase();
  if (upperCode === 'PK') return 'PKR';
  if (upperCode === 'IN') return 'INR';
  return 'USD';
}

export function formatPrice(price: number, currency: CurrencyCode): string {
  if (currency === 'USD') return `$${price.toFixed(2)}`;
  if (currency === 'PKR') return `Rs. ${price.toLocaleString()}`;
  if (currency === 'INR') return `₹${price.toLocaleString()}`;
  return `${price} ${currency}`;
}

// ── Synchronous (fallback / SSR initial values) ──────────────────────

export function getPricingForTier(tier: ResolutionTier, countryCode: string = 'US'): PricingInfo {
  const currency = getCurrencyForCountry(countryCode);
  const price = FALLBACK_PRICING_DATA[currency][tier];

  return {
    tier,
    label: RESOLUTION_TIERS[tier].label,
    description: RESOLUTION_TIERS[tier].description,
    price,
    formattedPrice: formatPrice(price, currency),
    currency,
  };
}

export function getAllPricingTiers(countryCode: string = 'US'): PricingInfo[] {
  return [
    getPricingForTier('web', countryCode),
    getPricingForTier('4k', countryCode),
    getPricingForTier('8k', countryCode),
  ];
}

// ── Dynamic Pricing Fetcher ────────────────────────────────────────

export async function fetchDynamicPricing(): Promise<Record<CurrencyCode, Record<ResolutionTier, number>>> {
  try {
    // Try internal /api/admin/pricing endpoint
    const baseUrl = typeof window !== 'undefined'
      ? window.location.origin
      : process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    const res = await fetch(`${baseUrl}/api/admin/pricing`, {
      cache: 'no-store',
    }).catch(() => null);

    if (res && res.ok) {
      const data = await res.json().catch(() => null);
      if (data && Array.isArray(data.tiers) && data.tiers.length > 0) {
        const result: Record<CurrencyCode, Record<ResolutionTier, number>> = {
          USD: { web: 0, '4k': 0, '8k': 0 },
          PKR: { web: 0, '4k': 0, '8k': 0 },
          INR: { web: 0, '4k': 0, '8k': 0 },
        };

        for (const row of data.tiers) {
          const tier = row.id as ResolutionTier;
          if (tier === 'web' || tier === '4k' || tier === '8k') {
            result.USD[tier] = Number(row.usd_price);
            result.PKR[tier] = Number(row.pkr_price);
            result.INR[tier] = Number(row.inr_price);
          }
        }

        if (result.USD.web > 0 || result.USD['4k'] > 0 || result.USD['8k'] > 0) {
          return result;
        }
      }
    }

    return FALLBACK_PRICING_DATA;
  } catch {
    return FALLBACK_PRICING_DATA;
  }
}

export async function getAllPricingTiersDynamic(countryCode: string = 'US'): Promise<PricingInfo[]> {
  const pricingData = await fetchDynamicPricing();
  const currency = getCurrencyForCountry(countryCode);

  const tiers: ResolutionTier[] = ['web', '4k', '8k'];
  return tiers.map((tier) => {
    const price = pricingData[currency][tier] || FALLBACK_PRICING_DATA[currency][tier];
    return {
      tier,
      label: RESOLUTION_TIERS[tier].label,
      description: RESOLUTION_TIERS[tier].description,
      price,
      formattedPrice: formatPrice(price, currency),
      currency,
    };
  });
}
