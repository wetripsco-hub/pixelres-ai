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

const PRICING_DATA: Record<CurrencyCode, Record<ResolutionTier, number>> = {
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
  // Default to USD for all other countries
  return 'USD';
}

export function formatPrice(price: number, currency: CurrencyCode): string {
  if (currency === 'USD') return `$${price.toFixed(2)}`;
  if (currency === 'PKR') return `Rs. ${price.toLocaleString()}`;
  if (currency === 'INR') return `₹${price.toLocaleString()}`;
  return `${price} ${currency}`;
}

export function getPricingForTier(tier: ResolutionTier, countryCode: string = 'US'): PricingInfo {
  const currency = getCurrencyForCountry(countryCode);
  const price = PRICING_DATA[currency][tier];

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
