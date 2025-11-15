import React from 'react'

interface DividerProps {
  className?: string
  orientation?: 'horizontal' | 'vertical'
  text?: string
}

export const Divider: React.FC<DividerProps> = ({
  className = '',
  orientation = 'horizontal',
  text,
}) => {
  if (text) {
    return (
      <div className={`relative flex items-center ${className}`}>
        <div className="flex-grow border-t border-gray-300" />
        <span className="flex-shrink mx-4 text-sm text-gray-500">{text}</span>
        <div className="flex-grow border-t border-gray-300" />
      </div>
    )
  }

  if (orientation === 'vertical') {
    return <div className={`border-l border-gray-300 h-full ${className}`} />
  }

  return <div className={`border-t border-gray-300 w-full ${className}`} />
}

