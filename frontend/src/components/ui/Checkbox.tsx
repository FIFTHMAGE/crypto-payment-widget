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
      <div className="flex items-center h-5">
        <input
          type="checkbox"
          id={checkboxId}
          className={`
            h-4 w-4 rounded border-gray-300 dark:border-gray-600 text-primary-600 
            focus:ring-2 focus:ring-primary-500 focus:ring-offset-0 dark:bg-gray-700
            disabled:cursor-not-allowed disabled:opacity-50
            transition-colors duration-200
            ${error ? 'border-red-500' : ''}
            ${className}
          `}
          {...props}
        />
      </div>
      {label && (
        <label
          htmlFor={checkboxId}
          className="ml-2 block text-sm text-gray-700 dark:text-gray-300 cursor-pointer select-none"
        >
          {label}
          {error && <span className="block text-xs text-red-600 dark:text-red-400 mt-1">{error}</span>}
        </label>
      )}
    </div>
  )
}


