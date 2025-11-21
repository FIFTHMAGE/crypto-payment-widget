/**
 * Number utilities - Number formatting and manipulation
 * @module utils
 */

export class NumberUtil {
  static formatCurrency(amount: number, currency: string = 'USD', locale: string = 'en-US'): string {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
    }).format(amount);
  }

  static formatPercentage(value: number, decimals: number = 2): string {
    return `${(value * 100).toFixed(decimals)}%`;
  }

  static formatCompact(num: number, locale: string = 'en-US'): string {
    return new Intl.NumberFormat(locale, {
      notation: 'compact',
      compactDisplay: 'short',
    }).format(num);
  }

  static round(num: number, decimals: number = 2): number {
    return Math.round(num * Math.pow(10, decimals)) / Math.pow(10, decimals);
  }

  static clamp(num: number, min: number, max: number): number {
    return Math.min(Math.max(num, min), max);
  }

  static randomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  static isInRange(num: number, min: number, max: number, inclusive: boolean = true): boolean {
    return inclusive ? num >= min && num <= max : num > min && num < max;
  }

  static percentage(value: number, total: number): number {
    return total === 0 ? 0 : (value / total) * 100;
  }
}

