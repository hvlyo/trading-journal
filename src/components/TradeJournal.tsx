'use client'

import { useState, useMemo, useEffect } from 'react'

interface TradeEntry {
  id: string
  asset: string
  type: 'LONG' | 'SHORT'
  strategy: string
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH'
  entryPrice: number
  exitPrice: number | null
  pnl: number
  pnlType: 'REALIZED' | 'UNREALIZED'
  openTime: string
  closeTime: string | null
  notes: string
  screenshot?: string | null
  leverage: number
  quantity: number
}

interface TradeJournalProps {
  trades: TradeEntry[]
  onExport?: (data: TradeEntry[]) => void
}

const STRATEGIES = [
  'Breakout',
  'Scalp',
  'Swing',
  'Trend Following',
  'Reversal',
  'FOMO',
  'Daily Plan',
  'News Trade',
  'Arbitrage',
  'Grid Trading'
]

const ASSETS = [
  'BTC/USDT',
  'ETH/USDT',
  'SOL/USDT',
  'ADA/USDT',
  'DOT/USDT',
  'LINK/USDT',
  'MATIC/USDT',
  'AVAX/USDT',
  'DOGE/USDT',
  'SHIB/USDT'
]

const RISK_LEVELS = [
  { value: 'LOW', label: 'Low Risk', color: 'bg-green-100 text-green-800' },
  { value: 'MEDIUM', label: 'Medium Risk', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'HIGH', label: 'High Risk', color: 'bg-red-100 text-red-800' }
]

export default function TradeJournal({ trades, onExport }: TradeJournalProps) {
  const [isClient, setIsClient] = useState(false)
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table')
  const [sortBy, setSortBy] = useState<'openTime' | 'closeTime' | 'pnl' | 'asset'>('openTime')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStrategies, setSelectedStrategies] = useState<string[]>([])
  const [selectedRiskLevels, setSelectedRiskLevels] = useState<string[]>([])
  const [selectedAssets, setSelectedAssets] = useState<string[]>([])

  // Ensure client-side rendering to prevent hydration mismatches
  useEffect(() => {
    setIsClient(true)
  }, [])

  // Safety check for trades array
  const safeTrades = trades || []

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      if (isNaN(date.getTime())) {
        return 'Invalid Date'
      }
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    } catch (error) {
      return 'Invalid Date'
    }
  }

  const getPLColor = (pnl: number) => {
    if (pnl > 0) return 'text-green-400'
    if (pnl < 0) return 'text-red-400'
    return 'text-white'
  }

  const getTypeColor = (type: string) => {
    return type === 'LONG' ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'
  }

  const getRiskColor = (risk: string) => {
    const riskLevel = RISK_LEVELS.find(r => r.value === risk)
    return riskLevel?.color || 'bg-gray-100 text-gray-800'
  }

  // Filter and sort trades
  const filteredAndSortedTrades = useMemo(() => {
    // Safety check for trades array
    if (!safeTrades || safeTrades.length === 0) {
      return []
    }

    let filtered = safeTrades.filter(trade => {
      // Safety check for trade object
      if (!trade || typeof trade !== 'object') {
        return false
      }

      // Search filter with null checks
      const searchMatch = searchTerm === '' || 
        (trade.asset && trade.asset.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (trade.notes && trade.notes.toLowerCase().includes(searchTerm.toLowerCase()))

      // Strategy filter (default to 'Swing' since strategy field is not in Trade interface)
      const strategyMatch = selectedStrategies.length === 0 || 
        selectedStrategies.includes('Swing')

      // Risk level filter
      const riskMatch = selectedRiskLevels.length === 0 || 
        (trade.riskLevel && selectedRiskLevels.includes(trade.riskLevel))

      // Asset filter
      const assetMatch = selectedAssets.length === 0 || 
        (trade.asset && selectedAssets.includes(trade.asset))

      return searchMatch && strategyMatch && riskMatch && assetMatch
    })

    // Sort trades with safety checks
    filtered.sort((a, b) => {
      let aValue: any
      let bValue: any

      switch (sortBy) {
        case 'openTime':
          aValue = a.openTime ? new Date(a.openTime).getTime() : 0
          bValue = b.openTime ? new Date(b.openTime).getTime() : 0
          break
        case 'closeTime':
          // Handle null closeTime values safely
          aValue = a.closeTime ? new Date(a.closeTime).getTime() : 0
          bValue = b.closeTime ? new Date(b.closeTime).getTime() : 0
          break
        case 'pnl':
          aValue = a.pnl || 0
          bValue = b.pnl || 0
          break
        case 'asset':
          aValue = a.asset || ''
          bValue = b.asset || ''
          break
        default:
          aValue = a.openTime ? new Date(a.openTime).getTime() : 0
          bValue = b.openTime ? new Date(b.openTime).getTime() : 0
      }

      // Handle NaN values
      if (isNaN(aValue)) aValue = 0
      if (isNaN(bValue)) bValue = 0

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })

    return filtered
  }, [safeTrades, searchTerm, selectedStrategies, selectedRiskLevels, selectedAssets, sortBy, sortOrder])

  const handleStrategyToggle = (strategy: string) => {
    setSelectedStrategies(prev => 
      prev.includes(strategy) 
        ? prev.filter(s => s !== strategy)
        : [...prev, strategy]
    )
  }

  const handleRiskLevelToggle = (risk: string) => {
    setSelectedRiskLevels(prev => 
      prev.includes(risk) 
        ? prev.filter(r => r !== risk)
        : [...prev, risk]
    )
  }

  const handleAssetToggle = (asset: string) => {
    setSelectedAssets(prev => 
      prev.includes(asset) 
        ? prev.filter(a => a !== asset)
        : [...prev, asset]
    )
  }

  const clearFilters = () => {
    setSearchTerm('')
    setSelectedStrategies([])
    setSelectedRiskLevels([])
    setSelectedAssets([])
  }

  const exportData = () => {
    if (onExport) {
      onExport(filteredAndSortedTrades)
    } else {
      const dataStr = JSON.stringify(filteredAndSortedTrades, null, 2)
      const dataBlob = new Blob([dataStr], { type: 'application/json' })
      const url = URL.createObjectURL(dataBlob)
      const link = document.createElement('a')
      link.href = url
      link.download = 'trade-journal.json'
      link.click()
      URL.revokeObjectURL(url)
    }
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Trade Journal
          </h1>
          <p className="text-dark-textSecondary">
            Review and analyze your trading history
          </p>
        </div>
        
        {/* Export Button */}
        <button
          onClick={exportData}
          className="px-6 py-3 bg-primary-500 text-white rounded-xl hover:bg-primary-600 transition-all duration-200 shadow-lg hover:shadow-glow-dark"
        >
          Export Data
        </button>
      </div>

      {/* Filters */}
      <div className="bg-dark-card border border-dark-border rounded-2xl shadow-card-dark p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Filters</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Search
            </label>
            <input
              type="text"
              placeholder="Search trades..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-dark-border rounded-lg bg-dark-input text-white placeholder-dark-textSecondary focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          {/* Asset Filter */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Asset
            </label>
            <select
              value={selectedAssets.length === 0 ? '' : selectedAssets[0]}
              onChange={(e) => handleAssetToggle(e.target.value)}
              className="w-full px-4 py-2 border border-dark-border rounded-lg bg-dark-input text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="">All Assets</option>
              {ASSETS.map(asset => (
                <option key={asset} value={asset}>{asset}</option>
              ))}
            </select>
          </div>

          {/* Type Filter */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Type
            </label>
            <select
              value={selectedStrategies.length === 0 ? '' : selectedStrategies[0]}
              onChange={(e) => handleStrategyToggle(e.target.value)}
              className="w-full px-4 py-2 border border-dark-border rounded-lg bg-dark-input text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="">All Types</option>
              <option value="LONG">Long</option>
              <option value="SHORT">Short</option>
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Status
            </label>
            <select
              value={selectedRiskLevels.length === 0 ? '' : selectedRiskLevels[0]}
              onChange={(e) => handleRiskLevelToggle(e.target.value)}
              className="w-full px-4 py-2 border border-dark-border rounded-lg bg-dark-input text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="">All Status</option>
              <option value="OPEN">Open</option>
              <option value="CLOSED">Closed</option>
            </select>
          </div>
        </div>

        {/* Clear Filters */}
        <div className="mt-4 flex justify-end">
          <button
            onClick={clearFilters}
            className="px-4 py-2 text-dark-textSecondary hover:text-white transition-colors"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Sort Controls */}
      <div className="bg-dark-card border border-dark-border rounded-2xl shadow-card-dark p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">Sort Options</h2>
          
          <div className="flex items-center space-x-4">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-4 py-2 border border-dark-border rounded-lg bg-dark-input text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="openTime">Open Time</option>
              <option value="closeTime">Close Time</option>
              <option value="asset">Asset</option>
              <option value="pnl">PnL</option>
              <option value="leverage">Leverage</option>
            </select>
            
            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="p-2 text-dark-textSecondary hover:text-white transition-colors"
            >
              {sortOrder === 'asc' ? '↑' : '↓'}
            </button>
          </div>
        </div>
      </div>

      {/* Results Summary */}
      <div className="bg-dark-card border border-dark-border rounded-2xl shadow-card-dark p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">
            Results ({filteredAndSortedTrades.length} trades)
          </h2>
          
          <div className="text-dark-textSecondary">
            Total PnL: <span className={`font-medium ${getPLColor(filteredAndSortedTrades.reduce((sum, trade) => sum + trade.pnl, 0))}`}>
              {formatCurrency(filteredAndSortedTrades.reduce((sum, trade) => sum + trade.pnl, 0))}
            </span>
          </div>
        </div>
      </div>

      {/* Trades Table */}
      <div className="bg-dark-card border border-dark-border rounded-2xl shadow-card-dark overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-dark-border">
            <thead className="bg-dark-border">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-dark-textSecondary uppercase tracking-wider">
                  Asset
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-dark-textSecondary uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-dark-textSecondary uppercase tracking-wider">
                  Leverage
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-dark-textSecondary uppercase tracking-wider">
                  Quantity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-dark-textSecondary uppercase tracking-wider">
                  Open Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-dark-textSecondary uppercase tracking-wider">
                  Close Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-dark-textSecondary uppercase tracking-wider">
                  PnL
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-dark-textSecondary uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-dark-textSecondary uppercase tracking-wider">
                  Open Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-dark-textSecondary uppercase tracking-wider">
                  Close Time
                </th>
              </tr>
            </thead>
            <tbody className="bg-dark-card divide-y divide-dark-border">
              {filteredAndSortedTrades.map((trade) => (
                <tr key={trade.id} className="hover:bg-dark-border transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                    {trade.asset}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getTypeColor(trade.type)}`}>
                      {trade.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                    {trade.leverage}x
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                    {trade.quantity}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                    ${trade.entryPrice}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                    ${trade.exitPrice || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`font-medium ${getPLColor(trade.pnl)}`}>
                      {formatCurrency(trade.pnl)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      trade.closeTime ? 'bg-warning-500/20 text-warning-400 border border-warning-500/30' : 'bg-dark-textSecondary/20 text-dark-textSecondary border border-dark-textSecondary/30'
                    }`}>
                      {trade.closeTime ? 'Closed' : 'Open'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-dark-textSecondary">
                    {formatDate(trade.openTime)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-dark-textSecondary">
                    {trade.closeTime ? formatDate(trade.closeTime) : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* No Results */}
      {filteredAndSortedTrades.length === 0 && (
        <div className="bg-dark-card border border-dark-border rounded-2xl shadow-card-dark p-8 text-center">
          <svg className="mx-auto h-12 w-12 text-dark-textSecondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-white">No trades found</h3>
          <p className="mt-1 text-sm text-dark-textSecondary">
            Try adjusting your filters or add some trades to get started.
          </p>
        </div>
      )}
    </div>
  )
} 