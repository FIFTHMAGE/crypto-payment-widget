import React, { useEffect } from 'react'
import { useUIStore } from '../../store'

export const Toast: React.FC = () => {
  const { toasts, removeToast } = useUIStore()

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map((toast) => (
        <ToastItem
          key={toast.id}
          {...toast}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </div>
  )
}

interface ToastItemProps {
  id: string
  message: string
  type: 'success' | 'error' | 'info' | 'warning'
  onClose: () => void
}

const ToastItem: React.FC<ToastItemProps> = ({
  message,
  type,
  onClose,
}) => {
  const bgColors = {
    success: 'bg-green-50 border-green-500 text-green-800',
    error: 'bg-red-50 border-red-500 text-red-800',
    info: 'bg-blue-50 border-blue-500 text-blue-800',
    warning: 'bg-yellow-50 border-yellow-500 text-yellow-800',
  }

  const icons = {
    success: '✓',
    error: '✕',
    info: 'i',
    warning: '⚠',
  }

  return (
    <div
      className={`flex items-center gap-3 min-w-[300px] max-w-md p-4 border-l-4 rounded-lg shadow-lg ${bgColors[type]} animate-slide-in`}
    >
      <span className="text-xl font-bold">{icons[type]}</span>
      <p className="flex-1 text-sm font-medium">{message}</p>
      <button
        onClick={onClose}
        className="text-gray-500 hover:text-gray-700 transition-colors"
      >
        ✕
      </button>
    </div>
  )
}

