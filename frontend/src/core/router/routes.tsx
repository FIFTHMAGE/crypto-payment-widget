import { lazy } from 'react'

// Lazy load pages for code splitting
const HomePage = lazy(() => import('../../App'))

export const routes = [
  {
    path: '/',
    element: HomePage,
    name: 'Home',
  },
]

export const getRoutePath = (name: string): string => {
  const route = routes.find((r) => r.name === name)
  return route?.path || '/'
}

