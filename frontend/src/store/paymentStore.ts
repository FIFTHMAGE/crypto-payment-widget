import { create } from 'zustand';

interface PaymentStore {
  payments: any[];
  addPayment: (payment: any) => void;
}

export const usePaymentStore = create<PaymentStore>((set) => ({
  payments: [],
  addPayment: (payment) => set((state) => ({ payments: [...state.payments, payment] })),
}));
