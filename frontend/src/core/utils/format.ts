import { formatEther, formatUnits, parseEther, parseUnits } from 'viem'

export function formatAddress(
  address: string,
  length: 'short' | 'medium' | 'long' = 'short'
): string {
  if (!address) return ''

  const lengths = {
    short: { start: 6, end: 4 },
    medium: { start: 10, end: 8 },
    long: { start: 16, end: 12 },
  }

  const { start, end } = lengths[length]
  return `${address.slice(0, start)}...${address.slice(-end)}`
}

export function formatAmount(
  amount: string | bigint,
  decimals = 18,
  displayDecimals = 4
): string {
  try {
    const formatted =
      typeof amount === 'bigint'
        ? formatUnits(amount, decimals)
        : formatUnits(BigInt(amount), decimals)

    const num = parseFloat(formatted)
    return num.toFixed(displayDecimals)
  } catch {
    return '0.0000'
  }
}

export function formatCurrency(amount: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

export function formatNumber(
  value: number,
  options?: Intl.NumberFormatOptions
): string {
  return new Intl.NumberFormat('en-US', options).format(value)
}

export function formatDate(
  date: Date | number,
  format: 'short' | 'long' | 'relative' = 'short'
): string {
  const d = typeof date === 'number' ? new Date(date) : date

  if (format === 'relative') {
    return formatRelativeTime(d)
  }

  const options: Intl.DateTimeFormatOptions =
    format === 'long'
      ? {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }
      : {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        }

  return new Intl.DateTimeFormat('en-US', options).format(d)
}

export function formatRelativeTime(date: Date): string {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffSec = Math.floor(diffMs / 1000)
  const diffMin = Math.floor(diffSec / 60)
  const diffHour = Math.floor(diffMin / 60)
  const diffDay = Math.floor(diffHour / 24)

  if (diffSec < 60) return 'just now'
  if (diffMin < 60) return `${diffMin}m ago`
  if (diffHour < 24) return `${diffHour}h ago`
  if (diffDay < 7) return `${diffDay}d ago`

  return formatDate(date, 'short')
}

export function parseAmountToWei(amount: string): bigint {
  return parseEther(amount)
}

export function parseAmountToUnits(amount: string, decimals: number): bigint {
  return parseUnits(amount, decimals)
}

