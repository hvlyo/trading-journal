'use client'

import { useState, useEffect } from 'react'

interface CapitalData {
  date: string
  capital: number
}

interface CapitalChartProps {
  data: CapitalData[]
  width?: number
  height?: number
}

export default function CapitalChart({ data, width = 800, height = 400 }: CapitalChartProps) {
  const [isInitialized, setIsInitialized] = useState(false)

  useEffect(() => {
    setIsInitialized(true)
  }, [])

  // Early return for loading state
  if (!isInitialized || data.length === 0) {
    return (
      <div className="bg-dark-card rounded-lg shadow-card-dark p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
        </div>
      </div>
    )
  }

  // Sort data by date
  const sortedData = [...data].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  
  // Early return for empty data
  if (!sortedData || sortedData.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <svg className="mx-auto h-12 w-12 text-dark-textSecondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2zm0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-white">No data available</h3>
          <p className="mt-1 text-sm text-dark-textSecondary">Start trading to see your capital growth chart.</p>
        </div>
      </div>
    )
  }

  // Calculate dynamic padding based on capital values and chart size
  const maxCapitalValue = Math.max(...sortedData.map(d => d.capital))
  const capitalMagnitude = Math.floor(Math.log10(maxCapitalValue)) + 1
  
  // Adjust left padding based on number magnitude for better Y-axis label visibility
  let leftPadding = 80
  if (capitalMagnitude >= 6) { // $1,000,000+
    leftPadding = 100
  } else if (capitalMagnitude >= 5) { // $100,000+
    leftPadding = 90
  } else if (capitalMagnitude >= 4) { // $10,000+
    leftPadding = 85
  }
  
  // Adjust right padding based on chart width for better responsiveness
  let rightPadding = 80
  if (width < 600) {
    rightPadding = 60
  } else if (width > 1000) {
    rightPadding = 100
  }
  
  const padding = { 
    top: 60, 
    right: rightPadding, 
    bottom: 80, 
    left: leftPadding 
  }
  const chartWidth = width - padding.left - padding.right
  const chartHeight = height - padding.top - padding.bottom
  
  // Calculate scales - use actual capital values with safety checks
  const minCapital = Math.min(...sortedData.map(d => d.capital))
  const maxCapital = Math.max(...sortedData.map(d => d.capital))
  const capitalRange = maxCapital - minCapital
  
  // Safety check for zero range to prevent division by zero
  let finalMinCapital = minCapital
  let finalMaxCapital = maxCapital
  let finalCapitalRange = capitalRange
  
  if (capitalRange === 0) {
    // Instead of showing "no variation", let's create a small range to show the chart
    finalMinCapital = minCapital - 10
    finalMaxCapital = maxCapital + 10
    finalCapitalRange = finalMaxCapital - finalMinCapital
  }
  
  // Add padding to the range for better visualization with safety check
  const paddedMin = Math.max(0, finalMinCapital - finalCapitalRange * 0.15)
  const paddedMax = finalMaxCapital + finalCapitalRange * 0.15
  const paddedRange = paddedMax - paddedMin
  
  // Safety check for padded range
  if (paddedRange <= 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <svg className="mx-auto h-12 w-12 text-dark-textSecondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2zm0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-white">Invalid data range</h3>
          <p className="mt-1 text-sm text-dark-textSecondary">Unable to display chart due to data issues.</p>
        </div>
      </div>
    )
  }
  
  // Safety check for array access
  if (!sortedData[0] || !sortedData[sortedData.length - 1]) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <svg className="mx-auto h-12 w-12 text-dark-textSecondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2zm0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-white">No data available</h3>
          <p className="mt-1 text-sm text-dark-textSecondary">Start trading to see your capital growth chart.</p>
        </div>
      </div>
    )
  }
  
  const minDate = new Date(sortedData[0].date).getTime()
  const maxDate = new Date(sortedData[sortedData.length - 1].date).getTime()
  const dateRange = maxDate - minDate

  // Safety check for date range to prevent division by zero
  if (dateRange === 0 || isNaN(dateRange)) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <svg className="mx-auto h-12 w-12 text-dark-textSecondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2zm0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-white">Insufficient data</h3>
          <p className="mt-1 text-sm text-dark-textSecondary">Need at least 2 data points to display chart.</p>
        </div>
      </div>
    )
  }

  // Determine trend direction for color with safety checks
  const firstCapital = sortedData[0]?.capital || 0
  const lastCapital = sortedData[sortedData.length - 1]?.capital || 0
  const isTrendingUp = lastCapital > firstCapital
  const lineColor = isTrendingUp ? '#10b981' : '#ef4444' // Green for up, red for down

  // Generate points for the line with validation
  const points = sortedData.map((point, index) => {
    // Safety check for date parsing
    const pointDate = new Date(point.date)
    if (isNaN(pointDate.getTime())) {
      return null
    }
    
    const x = padding.left + (pointDate.getTime() - minDate) / dateRange * chartWidth
    const y = height - padding.bottom - ((point.capital - paddedMin) / paddedRange * chartHeight)
    
    // Validate coordinates to prevent NaN
    if (isNaN(x) || isNaN(y) || !isFinite(x) || !isFinite(y)) {
      return null
    }
    
    return `${x},${y}`
  }).filter(point => point !== null).join(' ')

  // Generate Y-axis labels with better spacing and safety checks
  const yLabels = []
  const numYLabels = 6
  for (let i = 0; i <= numYLabels; i++) {
    const value = paddedMin + (paddedRange * i) / numYLabels
    const y = height - padding.bottom - (i / numYLabels * chartHeight)
    
    // Safety check for coordinate
    if (!isNaN(y) && isFinite(y)) {
      yLabels.push({ value, y })
    }
  }

  // Generate X-axis labels with safety check
  const xLabels = []
  const numXLabels = Math.min(8, sortedData.length)
  for (let i = 0; i < numXLabels; i++) {
    const index = Math.floor((i * (sortedData.length - 1)) / (numXLabels - 1))
    const point = sortedData[index]
    if (point) { // Safety check
      const x = padding.left + (index / (sortedData.length - 1)) * chartWidth
      // Additional safety check for coordinate
      if (!isNaN(x) && isFinite(x)) {
        xLabels.push({ date: point.date, x })
      }
    }
  }

  const formatCurrency = (amount: number) => {
    // Handle large numbers with K, M, B suffixes for better readability
    if (amount >= 1000000000) {
      return `$${(amount / 1000000000).toFixed(1)}B`
    } else if (amount >= 1000000) {
      return `$${(amount / 1000000).toFixed(1)}M`
    } else if (amount >= 1000) {
      return `$${(amount / 1000).toFixed(1)}K`
    } else {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(amount)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    })
  }

  return (
    <div className="relative w-full h-full min-h-[400px]">
      <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`} className="w-full h-full" preserveAspectRatio="xMidYMid meet">
        {/* Grid lines with reduced opacity - only in chart area */}
        <defs>
          <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-dark-border" opacity="0.3"/>
          </pattern>
        </defs>
        <rect 
          x={padding.left} 
          y={padding.top} 
          width={chartWidth} 
          height={chartHeight} 
          fill="url(#grid)" 
        />
        
        {/* Y-axis - drawn after grid to appear on top */}
        <line
          x1={padding.left}
          y1={padding.top}
          x2={padding.left}
          y2={height - padding.bottom}
          stroke="currentColor"
          strokeWidth="2"
          className="text-dark-border"
        />
        
        {/* X-axis - drawn after grid to appear on top */}
        <line
          x1={padding.left}
          y1={height - padding.bottom}
          x2={width - padding.right}
          y2={height - padding.bottom}
          stroke="currentColor"
          strokeWidth="2"
          className="text-dark-border"
        />
        
        {/* Y-axis labels */}
        {yLabels.map((label, index) => (
          <g key={index}>
            <line
              x1={padding.left - 5}
              y1={label.y}
              x2={padding.left}
              y2={label.y}
              stroke="currentColor"
              strokeWidth="1"
              className="text-dark-border"
            />
            <text
              x={padding.left - 8}
              y={label.y + 4}
              textAnchor="end"
              className="text-xs fill-current"
              style={{ fill: '#a1a1aa' }}
              fontSize={capitalMagnitude >= 6 ? '10px' : '12px'}
            >
              {formatCurrency(label.value)}
            </text>
          </g>
        ))}
        
        {/* X-axis labels */}
        {xLabels.map((label, index) => (
          <g key={index}>
            <line
              x1={label.x}
              y1={height - padding.bottom}
              x2={label.x}
              y2={height - padding.bottom + 5}
              stroke="currentColor"
              strokeWidth="1"
              className="text-dark-border"
            />
            <text
              x={label.x}
              y={height - padding.bottom + 20}
              textAnchor="middle"
              className="text-xs fill-current"
              style={{ fill: '#a1a1aa' }}
            >
              {formatDate(label.date)}
            </text>
          </g>
        ))}
        
        {/* Data line with animation */}
        {points && points.trim() !== '' && (
          <polyline
            points={points}
            fill="none"
            stroke={lineColor}
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`transition-all duration-1000 ${isTrendingUp ? 'animate-pulse-soft' : ''}`}
            style={{
              filter: isTrendingUp ? 'drop-shadow(0 0 8px rgba(34, 197, 94, 0.3))' : 'drop-shadow(0 0 8px rgba(239, 68, 68, 0.3))'
            }}
          />
        )}
        
        {/* Data points */}
        {sortedData.map((point, index) => {
          // Safety check for date parsing
          const pointDate = new Date(point.date)
          if (isNaN(pointDate.getTime())) {
            return null
          }
          
          const x = padding.left + (pointDate.getTime() - minDate) / dateRange * chartWidth
          const y = height - padding.bottom - ((point.capital - paddedMin) / paddedRange * chartHeight)
          
          // Validate coordinates to prevent NaN in SVG attributes
          if (isNaN(x) || isNaN(y) || !isFinite(x) || !isFinite(y)) {
            return null
          }
          
          return (
            <circle
              key={index}
              cx={x}
              cy={y}
              r="4"
              fill={isTrendingUp ? '#22c55e' : '#ef4444'}
              className="transition-all duration-300 hover:r-6"
            />
          )
        }).filter(Boolean)}
      </svg>
      
      {/* Current capital indicator with trend indicator and safety checks */}
      {sortedData.length > 0 && (
        <div className="absolute top-2 right-2 bg-dark-card border border-dark-border rounded-xl px-3 py-2 shadow-card-dark max-w-[200px]">
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${isTrendingUp ? 'bg-success-500' : 'bg-danger-500'}`}></div>
            <div className="text-sm font-medium text-white truncate">
              Current: {formatCurrency(sortedData[sortedData.length - 1]?.capital || 0)}
            </div>
          </div>
          <div className={`text-xs ${isTrendingUp ? 'text-green-400' : 'text-red-400'}`}>
            {isTrendingUp ? '↗ Trending Up' : '↘ Trending Down'}
          </div>
        </div>
      )}
    </div>
  )
} 