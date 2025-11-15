import React from 'react'

interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export const Checkbox: React.FC<CheckboxProps> = ({
  label,
  error,
  className = '',
  id,
  ...props
}) => {
  const checkboxId = id || label?.toLowerCase().replace(/\s+/g, '-')

  return (
    <div className="flex items-start">
      <input
        type="checkbox"
        id={checkboxId}
        className={`
          mt-1 h-4 w-4 rounded border-gray-300 text-primary-600
          focus:ring-2 focus:ring-primary-500
          disabled:cursor-not-allowed disabled:opacity-50
          ${error ? 'border-red-500' : ''}
          ${className}
        `}
        {...props}
      />
      {label && (
        <label
          htmlFor={checkboxId}
          className="ml-2 block text-sm text-gray-700 cursor-pointer"
        >
          {label}
          {error && <span className="block text-xs text-red-600 mt-1">{error}</span>}
        </label>
      )}
    </div>
  )
}

