/**
 * Formats an amount stored in cents (öre) to a human-readable currency string.
 * E.g. 350000 → "3 500 kr" (SEK) or "3 500,00 kr" if `showDecimals` is true.
 */
export function formatMoney(
  amountCents: number,
  currency = 'SEK',
  showDecimals = false,
): string {
  const major = amountCents / 100;

  if (currency === 'SEK') {
    const formatted = showDecimals
      ? major.toFixed(2).replace('.', ',')
      : Math.round(major).toString();

    const withSpaces = formatted.replace(/\B(?=(\d{3})+(?!\d))/g, '\u00A0');
    return `${withSpaces} kr`;
  }

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: showDecimals ? 2 : 0,
  }).format(major);
}

/** Converts a major-unit number (e.g. 35.50) to cents (3550). */
export function toCents(amount: number): number {
  return Math.round(amount * 100);
}

/** Converts cents to major units. */
export function fromCents(cents: number): number {
  return cents / 100;
}
