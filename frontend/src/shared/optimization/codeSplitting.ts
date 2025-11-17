/** Code Splitting Optimization */
export const lazyLoadComponents = {
  Dashboard: () => import('@/pages/Dashboard'),
  Payment: () => import('@/pages/Payment'),
  Settings: () => import('@/pages/Settings')
};

