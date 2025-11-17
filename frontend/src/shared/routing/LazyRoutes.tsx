/**
 * @title LazyRoutes
 * @description Centralized routing with lazy loading
 */

import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Spinner } from '../ui/Spinner';

const Dashboard = lazy(() => import('@/pages/Dashboard'));
const Payment = lazy(() => import('@/pages/Payment'));
const Escrow = lazy(() => import('@/pages/Escrow'));
const Subscription = lazy(() => import('@/pages/Subscription'));
const Milestone = lazy(() => import('@/pages/Milestone'));
const History = lazy(() => import('@/pages/History'));
const Settings = lazy(() => import('@/pages/Settings'));

const LoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center">
    <Spinner size="lg" />
  </div>
);

export const LazyRoutes = () => (
  <Suspense fallback={<LoadingFallback />}>
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/payment" element={<Payment />} />
      <Route path="/escrow" element={<Escrow />} />
      <Route path="/subscription" element={<Subscription />} />
      <Route path="/milestone" element={<Milestone />} />
      <Route path="/history" element={<History />} />
      <Route path="/settings" element={<Settings />} />
    </Routes>
  </Suspense>
);

