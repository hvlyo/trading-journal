'use client'

import { ReactNode } from 'react'

interface MetricCardProps {
  title: string
  value: string
  change?: string
  changeType?: 'positive' | 'negative' | 'neutral'
  icon?: ReactNode
  gradient?: string
  className?: string
}

export default function MetricCard({ 
  title, 
  value, 
  change, 
  changeType = 'neutral',
  icon,
  gradient = 'from-primary-500 to-primary-600',
  className = ''
}: MetricCardProps) {
  const getChangeColor = () => {
    switch (changeType) {
      case 'positive':
        return 'text-success-500'
      case 'negative':
        return 'text-danger-500'
      default:
        return 'text-dark-textSecondary'
    }
  }

  const getChangeIcon = () => {
    switch (changeType) {
      case 'positive':
        return '↗'
      case 'negative':
        return '↘'
      default:
        return '→'
    }
  }

  return (
    <div className={`bg-dark-card border border-dark-border rounded-2xl p-6 shadow-card-dark hover:shadow-hover-dark transition-all duration-300 hover:scale-105 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-dark-textSecondary mb-2">
            {title}
          </p>
          <div className="flex items-baseline space-x-2">
            <p className="text-3xl font-bold text-white">
              {value}
            </p>
            {change && (
              <div className={`flex items-center space-x-1 text-sm font-medium ${getChangeColor()}`}>
                <span>{getChangeIcon()}</span>
                <span>{change}</span>
              </div>
            )}
          </div>
        </div>
        {icon && (
          <div className={`w-12 h-12 bg-gradient-to-br ${gradient} rounded-xl flex items-center justify-center shadow-lg`}>
            {icon}
          </div>
        )}
      </div>
    </div>
  )
} 