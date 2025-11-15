import { create } from 'zustand'

type ToastType = 'success' | 'error' | 'info' | 'warning'

interface Toast {
  id: string
  message: string
  type: ToastType
  duration?: number
}

interface UIStore {
  toasts: Toast[]
  isModalOpen: boolean
  modalContent: React.ReactNode | null
  isSidebarOpen: boolean

  addToast: (message: string, type?: ToastType, duration?: number) => void
  removeToast: (id: string) => void
  openModal: (content: React.ReactNode) => void
  closeModal: () => void
  toggleSidebar: () => void
  setSidebarOpen: (open: boolean) => void
}

export const useUIStore = create<UIStore>((set, get) => ({
  toasts: [],
  isModalOpen: false,
  modalContent: null,
  isSidebarOpen: false,

  addToast: (message, type = 'info', duration = 5000) => {
    const id = Math.random().toString(36).substring(7)
    const toast: Toast = { id, message, type, duration }

    set((state) => ({
      toasts: [...state.toasts, toast],
    }))

    if (duration > 0) {
      setTimeout(() => {
        get().removeToast(id)
      }, duration)
    }
  },

  removeToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    })),

  openModal: (content) =>
    set({
      isModalOpen: true,
      modalContent: content,
    }),

  closeModal: () =>
    set({
      isModalOpen: false,
      modalContent: null,
    }),

  toggleSidebar: () =>
    set((state) => ({
      isSidebarOpen: !state.isSidebarOpen,
    })),

  setSidebarOpen: (open) => set({ isSidebarOpen: open }),
}))

