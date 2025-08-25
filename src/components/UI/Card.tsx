import React from 'react'

interface CardProps {
  children: React.ReactNode
  className?: string
  hover?: boolean
  padding?: 'sm' | 'md' | 'lg'
}

export default function Card({ 
  children, 
  className = '', 
  hover = false,
  padding = 'md'
}: CardProps) {
  const paddingClasses = {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8'
  }

  return (
    <div 
      className={`bg-white rounded-xl shadow-sm border border-gray-100 ${paddingClasses[padding]} ${
        hover ? 'hover:shadow-md transition-all duration-200' : ''
      } ${className}`}
    >
      {children}
    </div>
  )
}