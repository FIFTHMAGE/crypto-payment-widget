import { formatUnits, parseUnits } from 'viem'

export function formatEther(value: bigint | string, decimals = 4): string {
  const formatted = formatUnits(BigInt(value), 18)
  const num = parseFloat(formatted)
  return num.toFixed(decimals)
}

export function formatCurrency(
  amount: string | number,
  currency = 'USD',
  decimals = 2
): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(num)
}

export function formatNumber(value: number | string, decimals = 2): string {
  const num = typeof value === 'string' ? parseFloat(value) : value
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(num)
}

export function formatPercentage(value: number, decimals = 2): string {
  return `${(value * 100).toFixed(decimals)}%`
}

export function parseEtherSafe(value: string): bigint | null {
  try {
    return parseUnits(value, 18)
  } catch {
    return null
  }
}

