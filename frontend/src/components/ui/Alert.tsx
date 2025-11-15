import React from 'react'

interface AlertProps {
  children: React.ReactNode
  variant?: 'success' | 'error' | 'warning' | 'info'
  title?: string
  onClose?: () => void
  className?: string
}

export const Alert: React.FC<AlertProps> = ({
  children,
  variant = 'info',
  title,
  onClose,
  className = '',
}) => {
  const variantConfig = {
    success: {
      bg: 'bg-green-50',
      border: 'border-green-200',
      text: 'text-green-800',
      icon: '✓',
    },
    error: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      text: 'text-red-800',
      icon: '✕',
    },
    warning: {
      bg: 'bg-yellow-50',
      border: 'border-yellow-200',
      text: 'text-yellow-800',
      icon: '⚠',
    },
    info: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      text: 'text-blue-800',
      icon: 'i',
    },
  }

  const config = variantConfig[variant]

  return (
    <div
      className={`flex items-start gap-3 p-4 border rounded-lg ${config.bg} ${config.border} ${className}`}
    >
      <span className={`text-xl font-bold ${config.text}`}>{config.icon}</span>
      <div className="flex-1">
        {title && (
          <h4 className={`font-semibold ${config.text} mb-1`}>{title}</h4>
        )}
        <div className={`text-sm ${config.text}`}>{children}</div>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className={`${config.text} hover:opacity-70 transition-opacity`}
        >
          ✕
        </button>
      )}
    </div>
  )
}

