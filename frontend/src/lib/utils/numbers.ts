export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

export function round(value: number, decimals: number = 2): number {
  return Math.round(value * Math.pow(10, decimals)) / Math.pow(10, decimals)
}

export function isNumeric(value: any): boolean {
  return !isNaN(parseFloat(value)) && isFinite(value)
}

export function generateRandomNumber(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1) + min)
}

export function percentage(value: number, total: number): number {
  if (total === 0) return 0
  return (value / total) * 100
}

