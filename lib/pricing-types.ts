export type ResolutionTier = 'web' | '4k' | '8k';
export type CurrencyCode = 'USD' | 'PKR' | 'INR';

export interface PricingConfig {
  web: { usd: number; pkr: number; inr: number };
  '4k': { usd: number; pkr: number; inr: number };
  '8k': { usd: number; pkr: number; inr: number };
}

export interface PricingInfo {
  tier: ResolutionTier;
  label: string;
  description: string;
  price: number;
  formattedPrice: string;
  currency: CurrencyCode;
}

export const DEFAULT_PRICING: PricingConfig = {
  web: { usd: 1.99, pkr: 300, inr: 149 },
  '4k': { usd: 4.99, pkr: 1299, inr: 399 },
  '8k': { usd: 9.99, pkr: 2499, inr: 799 },
};

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

export function getCurrencyForCountry(countryCode: string): CurrencyCode {
  const upperCode = (countryCode || '').toUpperCase();
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

export function getPriceForTierAndCurrency(
  pricing: PricingConfig,
  tier: ResolutionTier,
  currency: CurrencyCode
): number {
  const tierConfig = pricing[tier] || DEFAULT_PRICING[tier];
  if (currency === 'PKR') return tierConfig.pkr;
  if (currency === 'INR') return tierConfig.inr;
  return tierConfig.usd;
}

export function getPricingTiersFromConfig(
  pricing: PricingConfig = DEFAULT_PRICING,
  countryCode: string = 'US'
): PricingInfo[] {
  const currency = getCurrencyForCountry(countryCode);
  const tiers: ResolutionTier[] = ['web', '4k', '8k'];

  return tiers.map((tier) => {
    const price = getPriceForTierAndCurrency(pricing, tier, currency);
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

export function getAllPricingTiers(countryCode: string = 'US'): PricingInfo[] {
  return getPricingTiersFromConfig(DEFAULT_PRICING, countryCode);
}
