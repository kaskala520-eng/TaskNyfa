/**
 * Standard ISO 4217 Currency helper functions & Precision manager.
 * Supports different decimal levels (e.g. 0 for JPY/IQD, 3 for KWD, 2 for USD/EUR).
 */

// ISO 4217 Decimal Precision Rules
export function getDecimalPrecision(currencyCode: string): number {
  const code = currencyCode?.toUpperCase() || 'USD';
  
  // Zero-decimal currencies
  if (['IQD', 'JPY', 'KRW', 'YER', 'VND', 'IDR', 'CLP'].includes(code)) {
    return 0;
  }
  
  // Three-decimal currencies
  if (['KWD', 'BHD', 'OMR', 'JOD', 'LYD', 'TND'].includes(code)) {
    return 3;
  }
  
  // Default is 2 decimal places for standard currencies (USD, EUR, GBP, SAR, AED, EGP, etc.)
  return 2;
}

/**
 * Formats a monetary value dynamically according to its ISO 4217 decimal precision.
 */
export function formatCurrencyValue(amount: number, currencyCode: string): string {
  const decimals = getDecimalPrecision(currencyCode);
  
  // Handle edge cases
  if (amount === null || amount === undefined || isNaN(amount)) {
    return (0).toFixed(decimals);
  }

  return amount.toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

/**
 * Fetches real-time exchange rates from a reliable, free, CORS-enabled public API.
 * Falls back to stable baseline rates if the network or API is offline.
 */
export async function fetchLiveExchangeRates(): Promise<Record<string, number>> {
  try {
    const res = await fetch('https://open.er-api.com/v6/latest/USD');
    if (!res.ok) throw new Error('Failed to fetch from open.er-api.com');
    const data = await res.json();
    if (data && data.rates) {
      console.log('Live exchange rates updated successfully from API:', data.rates);
      return data.rates;
    }
    throw new Error('Invalid data format received');
  } catch (error) {
    console.warn('Could not fetch live rates, using high-fidelity local fallback rates. Error:', error);
    // Secure high-fidelity fallback rates matching standard values
    return {
      USD: 1.0,
      EUR: 0.92,
      GBP: 0.79,
      IQD: 1310,
      SAR: 3.75,
      AED: 3.67,
      EGP: 48.5,
      JOD: 0.709,
      TRY: 33.0,
      LYD: 4.85,
      MAD: 10.0,
      DZD: 134.5,
      TND: 3.12,
      KWD: 0.307,
      QAR: 3.64,
      OMR: 0.385,
      BHD: 0.376,
      YER: 250.0,
      CNY: 7.25,
      JPY: 155.0,
      KRW: 1380.0,
      INR: 83.5,
      IDR: 16200.0,
      MYR: 4.70,
      SGD: 1.35,
      THB: 36.2,
      PHP: 58.5,
      PKR: 278.0,
      VND: 25400.0
    };
  }
}

/**
 * Recalculates country rates relative to a base point value (e.g. 1 Point = 1000 IQD).
 */
export function calculateCountryRates(rates: Record<string, number>, basePointsIqd: number = 1000): Record<string, number> {
  const iqdRate = rates['IQD'] || 1310;
  const pointValueInUsd = basePointsIqd / iqdRate; // e.g. 1000 / 1310 = ~0.7633 USD per point
  
  const calculatedRates: Record<string, number> = {};
  
  Object.keys(rates).forEach(code => {
    // Value of 1 point in currency code = pointValueInUsd * rate of code per USD
    calculatedRates[code] = pointValueInUsd * rates[code];
  });
  
  return calculatedRates;
}
