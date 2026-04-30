/**
 * Format coins to display with exactly 2 decimal places
 * @param coins - The coin amount (can be number or string)
 * @returns Formatted string with 2 decimal places and thousand separators
 * @example formatCoins(1234.56) => "1,234.56"
 * @example formatCoins(100) => "100.00"
 */
export function formatCoins(coins: number | string | null | undefined): string {
  const num = typeof coins === 'string' ? parseFloat(coins) : (coins ?? 0);
  return num.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

/**
 * Format coins for display without decimal places (for backward compatibility)
 * @param coins - The coin amount
 * @returns Formatted string without decimals
 */
export function formatCoinsInt(coins: number | string | null | undefined): string {
  const num = typeof coins === 'string' ? parseFloat(coins) : (coins ?? 0);
  return Math.floor(num).toLocaleString('en-US');
}
