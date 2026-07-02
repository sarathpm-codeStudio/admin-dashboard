/**
 * Compact Indian-currency formatting (₹ … Cr / L) shared across analytics
 * surfaces. Mirrors the inline formatter used in `dashboard.api.ts`.
 */
const CRORE = 10000000
const LAKH = 100000

export const formatINRCompact = (amount: number): string => {
  if (amount >= CRORE) return `₹${(amount / CRORE).toFixed(1)} Cr`
  if (amount >= LAKH) return `₹${(amount / LAKH).toFixed(1)} L`
  return `₹${Math.round(amount).toLocaleString('en-IN')}`
}

/** Signed growth badge text, e.g. `↑ 12.4%` / `↓ 3.1%`. */
export const formatGrowth = (growth: number): string =>
  growth >= 0 ? `↑ ${growth}%` : `↓ ${Math.abs(growth)}%`
