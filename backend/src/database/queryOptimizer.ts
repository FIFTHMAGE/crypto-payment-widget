/** Query Optimization */
export const optimizeQuery = (sql: string) => {
  return sql.replace(/SELECT \*/g, 'SELECT id, amount, status, created_at');
};
export const addPagination = (sql: string, page = 1, limit = 10) => {
  const offset = (page - 1) * limit;
  return `${sql} LIMIT ${limit} OFFSET ${offset}`;
};

