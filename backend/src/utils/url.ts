/**
 * URL utilities - URL parsing and manipulation
 * @module utils
 */

export class UrlUtil {
  static parseQueryString(queryString: string): Record<string, string> {
    const params: Record<string, string> = {};
    const searchParams = new URLSearchParams(queryString);

    searchParams.forEach((value, key) => {
      params[key] = value;
    });

    return params;
  }

  static buildQueryString(params: Record<string, string | number | boolean>): string {
    const searchParams = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
      searchParams.append(key, String(value));
    });

    return searchParams.toString();
  }

  static joinPath(...parts: string[]): string {
    return parts
      .map((part, index) => {
        if (index === 0) {
          return part.trim().replace(/\/+$/, '');
        }
        return part.trim().replace(/(^\/+|\/+$)/g, '');
      })
      .filter((part) => part.length > 0)
      .join('/');
  }

  static isAbsoluteUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  static getDomain(url: string): string {
    try {
      const parsed = new URL(url);
      return parsed.hostname;
    } catch {
      return '';
    }
  }

  static addQueryParams(url: string, params: Record<string, string | number | boolean>): string {
    const separator = url.includes('?') ? '&' : '?';
    const queryString = this.buildQueryString(params);
    return queryString ? `${url}${separator}${queryString}` : url;
  }
}

