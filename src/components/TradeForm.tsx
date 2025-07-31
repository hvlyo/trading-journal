'use client'

import { useState, useEffect } from 'react'
import Sidebar from './Sidebar'
import { tradeAPI, Trade } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'

interface TradeFormData {
  asset: string
  type: 'LONG' | 'SHORT'
  leverage: number
  quantity: string | number
  openPrice: string | number
  closePrice: string | number
  pnl: number
  pnlType: 'REALIZED' | 'UNREALIZED'
  openTime: string
  closeTime: string
  notes: string
}

export default function TradeForm() {
  const { user } = useAuth()
  const router = useRouter()
  const [formData, setFormData] = useState<TradeFormData>({
    asset: '',
    type: 'LONG',
    leverage: 10,
    quantity: 0,
    openPrice: 0,
    closePrice: 0,
    pnl: 0,
    pnlType: 'UNREALIZED',
    openTime: '',
    closeTime: '',
    notes: ''
  })

  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [isInitialized, setIsInitialized] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Initialize form with current date
  useEffect(() => {
    if (!isInitialized) {
      const now = new Date()
      const dateTimeString = now.toISOString().slice(0, 16)
      setFormData(prev => ({ ...prev, openTime: dateTimeString }))
      setIsInitialized(true)
    }
  }, [isInitialized])

  const handleInputChange = (field: keyof TradeFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleNumberInputChange = (field: 'quantity' | 'openPrice' | 'closePrice' | 'leverage', value: string) => {
    // Allow any decimal number with unlimited precision
    const numValue = value === '' ? 0 : parseFloat(value) || 0
    setFormData(prev => ({ ...prev, [field]: numValue }))
  }

  const handleAssetChange = (value: string) => {
    // Auto-capitalize the asset input
    const capitalizedValue = value.toUpperCase()
    setFormData(prev => ({ ...prev, asset: capitalizedValue }))
  }

  const handleLeverageChange = (value: string) => {
    // Allow any leverage value to be typed
    // Only allow numbers and empty string
    if (value === '' || /^\d+$/.test(value)) {
      const leverageValue = value === '' ? 1 : parseInt(value) || 1
      setFormData(prev => ({ ...prev, leverage: leverageValue }))
    }
  }

  const handleDecimalInputChange = (field: 'quantity' | 'openPrice' | 'closePrice', value: string) => {
    // Allow any decimal input with unlimited precision
    // Only allow numbers, decimal points, and empty string
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      // Store the raw string value to allow unlimited precision
      setFormData(prev => ({ 
        ...prev, 
        [field]: value === '' ? 0 : value
      }))
    }
  }

  const calculatePnL = () => {
    const openPrice = parseFloat(formData.openPrice as string) || 0
    const closePrice = parseFloat(formData.closePrice as string) || 0
    const quantity = parseFloat(formData.quantity as string) || 0
    
    if (openPrice > 0 && closePrice > 0 && quantity > 0) {
      let pnl = 0
      
      if (formData.type === 'LONG') {
        // For long positions: PnL = (Exit Price - Entry Price) × Quantity
        pnl = (closePrice - openPrice) * quantity
      } else {
        // For short positions: PnL = (Entry Price - Exit Price) × Quantity
        pnl = (openPrice - closePrice) * quantity
      }
      
      setFormData(prev => ({ ...prev, pnl: pnl }))
    }
  }

  // Auto-calculate PnL when relevant fields change
  useEffect(() => {
    calculatePnL()
  }, [formData.openPrice, formData.closePrice, formData.quantity, formData.type])

  const handleTradeTypeChange = (type: 'LONG' | 'SHORT') => {
    setFormData(prev => ({ ...prev, type }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!user) {
      alert('Please log in to save trades')
      return
    }

    // Basic validation
    if (!formData.asset || !formData.openPrice || !formData.quantity || !formData.openTime) {
      alert('Please fill in all required fields: Asset, Entry Price, Quantity, and Open Time')
      return
    }

    setIsSubmitting(true)

    try {
      const tradeData: Trade = {
        user_id: user.id,
        asset: formData.asset,
        type: formData.type,
        leverage: formData.leverage,
        quantity: parseFloat(formData.quantity as string) || 0,
        openPrice: parseFloat(formData.openPrice as string) || 0,
        closePrice: formData.closePrice ? parseFloat(formData.closePrice as string) : null,
        pnl: formData.pnl,
        pnlType: formData.pnlType,
        openTime: formData.openTime,
        closeTime: formData.closeTime || null,
        notes: formData.notes,
        selectedTags: selectedTags
      }

      const success = await tradeAPI.saveTrade(tradeData)
      
      if (success) {
        alert('Trade saved successfully!')
        router.push('/journal')
      } else {
        alert('Failed to save trade. Please try again.')
      }
    } catch (error) {
      console.error('Error saving trade:', error)
      alert('An error occurred while saving the trade. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isInitialized) {
    return (
      <div className="flex h-screen bg-dark-bg">
        <Sidebar />
        <div className="flex-1 flex flex-col ml-64">
          <main className="flex-1 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
          </main>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-dark-bg">
      <Sidebar />
      
      <div className="flex-1 flex flex-col ml-64">
        <main className="flex-1 p-6">
          <div className="max-w-4xl mx-auto">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Main Trade Form - Horizontal Layout */}
              <div className="bg-dark-card border border-dark-border rounded-2xl p-8 shadow-card-dark">
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                  {/* Asset Selection */}
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">Asset</label>
                    <input
                      type="text"
                      value={formData.asset}
                      onChange={(e) => handleAssetChange(e.target.value)}
                      placeholder="BTC/USDT"
                      className="w-full px-4 py-3 border border-dark-border rounded-xl bg-dark-input text-white placeholder-dark-textSecondary focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                    />
                  </div>

                  {/* Trade Type */}
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">Trade Type</label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => handleTradeTypeChange('LONG')}
                        className={`px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
                          formData.type === 'LONG'
                            ? 'bg-green-500 text-white'
                            : 'bg-dark-input text-dark-textSecondary hover:bg-dark-border'
                        }`}
                      >
                        Long
                      </button>
                      <button
                        type="button"
                        onClick={() => handleTradeTypeChange('SHORT')}
                        className={`px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
                          formData.type === 'SHORT'
                            ? 'bg-red-500 text-white'
                            : 'bg-dark-input text-dark-textSecondary hover:bg-dark-border'
                        }`}
                      >
                        Short
                      </button>
                    </div>
                  </div>

                  {/* Leverage */}
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">Leverage</label>
                    <input
                      type="text"
                      value={formData.leverage}
                      onChange={(e) => handleLeverageChange(e.target.value)}
                      placeholder="10x"
                      className="w-full px-4 py-3 border border-dark-border rounded-xl bg-dark-input text-white placeholder-dark-textSecondary focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                    />
                  </div>

                  {/* Entry Price */}
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">Entry Price (USDT)</label>
                    <input
                      type="text"
                      value={typeof formData.openPrice === 'string' ? formData.openPrice : (formData.openPrice || '')}
                      onChange={(e) => handleDecimalInputChange('openPrice', e.target.value)}
                      placeholder="0.00"
                      className="w-full px-4 py-3 border border-dark-border rounded-xl bg-dark-input text-white placeholder-dark-textSecondary focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                    />
                  </div>

                  {/* Quantity */}
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">Quantity</label>
                    <input
                      type="text"
                      value={typeof formData.quantity === 'string' ? formData.quantity : (formData.quantity || '')}
                      onChange={(e) => handleDecimalInputChange('quantity', e.target.value)}
                      placeholder="0.00"
                      className="w-full px-4 py-3 border border-dark-border rounded-xl bg-dark-input text-white placeholder-dark-textSecondary focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                    />
                  </div>

                  {/* Exit Price */}
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">Exit Price (Optional)</label>
                    <input
                      type="text"
                      value={typeof formData.closePrice === 'string' ? formData.closePrice : (formData.closePrice || '')}
                      onChange={(e) => handleDecimalInputChange('closePrice', e.target.value)}
                      placeholder="0.00"
                      className="w-full px-4 py-3 border border-dark-border rounded-xl bg-dark-input text-white placeholder-dark-textSecondary focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                    />
                  </div>
                </div>
              </div>

              {/* Additional Information */}
              <div className="bg-dark-card border border-dark-border rounded-2xl p-8 shadow-card-dark">
                <div className="grid grid-cols-1 gap-6">
                  {/* PnL */}
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">PnL (USDT)</label>
                    <input
                      type="text"
                      value={formData.pnl.toFixed(2)}
                      readOnly
                      placeholder="0.00"
                      className={`w-full px-4 py-3 border border-dark-border rounded-xl bg-dark-input placeholder-dark-textSecondary focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 cursor-not-allowed ${
                        formData.pnl > 0 ? 'text-green-400' : formData.pnl < 0 ? 'text-red-400' : 'text-white'
                      }`}
                    />
                  </div>

                  {/* Open Time */}
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">Open Time</label>
                    <input
                      type="datetime-local"
                      value={formData.openTime}
                      onChange={(e) => handleInputChange('openTime', e.target.value)}
                      className="w-full px-4 py-3 border border-dark-border rounded-xl bg-dark-input text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                    />
                  </div>

                  {/* Close Time */}
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">Close Time (Optional)</label>
                    <input
                      type="datetime-local"
                      value={formData.closeTime || ''}
                      onChange={(e) => handleInputChange('closeTime', e.target.value || null)}
                      className="w-full px-4 py-3 border border-dark-border rounded-xl bg-dark-input text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                    />
                  </div>
                </div>

                {/* Notes */}
                <div className="mt-6">
                  <label className="block text-sm font-medium text-white mb-2">Notes</label>
                  
                  {/* Quick Tags */}
                  <div className="mb-4">
                    <p className="text-xs text-dark-textSecondary mb-2">Quick Analysis Tags:</p>
                    <div className="flex flex-wrap gap-2">
                      {[
                        'Technical Analysis', 'Fundamental Analysis', 'News Driven', 'Breakout', 'Breakdown',
                        'Support Level', 'Resistance Level', 'Trend Following', 'Mean Reversion', 'Scalping',
                        'Swing Trading', 'Position Trading', 'Risk Management', 'Stop Loss', 'Take Profit',
                        'FOMO', 'FUD', 'Bullish', 'Bearish', 'Sideways', 'Volume Analysis', 'RSI', 'MACD',
                        'Moving Average', 'Fibonacci', 'Elliott Wave', 'Chart Pattern', 'Candlestick'
                      ]
                      .filter(tag => !selectedTags.includes(tag))
                      .map((tag) => (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => {
                            // Add to selected tags if not already selected
                            if (!selectedTags.includes(tag)) {
                              setSelectedTags(prev => [...prev, tag])
                            }
                          }}
                          className="px-3 py-1 text-xs bg-dark-input text-dark-textSecondary hover:bg-green-500 hover:text-white hover:border-green-500 rounded-lg transition-all duration-200 border border-dark-border"
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  {/* Selected Tags Container */}
                  {selectedTags.length > 0 && (
                    <div className="mb-4 p-4 border border-dark-border rounded-xl bg-dark-card">
                      <p className="text-xs text-dark-textSecondary mb-2">Selected Tags:</p>
                      <div className="flex flex-wrap gap-2">
                        {selectedTags.map((tag) => (
                          <button
                            key={tag}
                            type="button"
                            onClick={() => {
                              setSelectedTags(prev => prev.filter(t => t !== tag))
                            }}
                            className="px-3 py-1 text-xs bg-primary-500 text-white rounded-lg border border-primary-500 hover:bg-red-500 hover:border-red-500 transition-all duration-200"
                          >
                            {tag}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <textarea
                    value={formData.notes}
                    onChange={(e) => handleInputChange('notes', e.target.value)}
                    placeholder="Add your trading notes, analysis, or lessons learned..."
                    rows={3}
                    className="w-full px-4 py-3 border border-dark-border rounded-xl bg-dark-input text-white placeholder-dark-textSecondary focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 resize-none"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-center">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-12 py-4 bg-primary-500 text-white rounded-xl hover:bg-white hover:text-black focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-dark-card transition-all duration-200 shadow-lg hover:shadow-glow-dark font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Saving Trade...' : 'Save Trade'}
                </button>
              </div>
            </form>
          </div>
        </main>
      </div>
    </div>
  )
} 