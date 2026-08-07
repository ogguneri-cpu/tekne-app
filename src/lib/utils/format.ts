const CURRENCY_SYMBOLS: Record<string, string> = {
  'TRY': 'TL',
  'TL': 'TL',
  'USD': '$',
  'EUR': '€',
  'GBP': '£'
};

export const formatPrice = (amount?: number, currency: string = 'TL') => {
  if (amount === undefined || amount === null || isNaN(amount) || amount === 0) return '—';
  
  const formatted = amount.toLocaleString('tr-TR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  });

  const upperCurrency = currency.toUpperCase();
  const symbol = CURRENCY_SYMBOLS[upperCurrency] || currency;

  if (upperCurrency === 'TRY' || upperCurrency === 'TL') {
    return `${formatted} ${symbol}`;
  }
  return `${symbol}${formatted}`;
};
