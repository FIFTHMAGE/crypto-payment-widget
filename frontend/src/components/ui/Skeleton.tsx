import React from 'react'

interface SkeletonProps {
  className?: string
  width?: string
  height?: string
  variant?: 'text' | 'rectangular' | 'circular'
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className = '',
  width,
  height,
  variant = 'text',
}) => {
  const variantClasses = {
    text: 'h-4 rounded',
    rectangular: 'rounded-lg',
    circular: 'rounded-full',
  }

  const style = {
    width,
    height: variant === 'text' ? '1rem' : height,
  }

  return (
    <div
      className={`animate-pulse bg-gray-200 ${variantClasses[variant]} ${className}`}
      style={style}
    />
  )
}

export const SkeletonCard: React.FC = () => {
  return (
    <div className="bg-white rounded-xl shadow-md p-6 space-y-4">
      <Skeleton variant="text" width="60%" height="1.5rem" />
      <Skeleton variant="text" width="100%" />
      <Skeleton variant="text" width="90%" />
      <div className="space-y-2 pt-4">
        <Skeleton variant="rectangular" width="100%" height="3rem" />
        <Skeleton variant="rectangular" width="100%" height="3rem" />
      </div>
    </div>
  )
}

