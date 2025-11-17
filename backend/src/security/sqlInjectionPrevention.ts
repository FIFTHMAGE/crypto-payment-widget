/** SQL Injection Prevention */
export const sanitizeSQL = (input: string) => input.replace(/['";\\]/g, '');
export const parameterizedQuery = (sql: string, params: any[]) => ({ sql, params });

