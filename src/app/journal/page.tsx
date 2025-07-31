'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import Sidebar from '@/components/Sidebar'
import Header from '@/components/Header'
import { tradeAPI, Trade } from '@/lib/supabase'

// Dynamically import TradeJournal with SSR disabled
const TradeJournal = dynamic(() => import('@/components/TradeJournal'), {
  ssr: false,
  loading: () => (
            <div className="bg-dark-card border border-dark-border rounded-2xl shadow-card-dark p-6">
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    </div>
  )
})

// Interface for TradeJournal component
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

// Function to convert database Trade to TradeEntry
const convertTradeToTradeEntry = (trade: Trade): TradeEntry => {
  return {
    id: trade.id || '',
    asset: trade.asset,
    type: trade.type,
    strategy: 'Swing', // Default strategy since it's not stored in database
    riskLevel: 'MEDIUM', // Default risk level since it's not stored in database
    entryPrice: trade.openPrice,
    exitPrice: trade.closePrice,
    pnl: trade.pnl,
    pnlType: trade.pnlType,
    openTime: trade.openTime,
    closeTime: trade.closeTime,
    notes: trade.notes,
    screenshot: null, // Not stored in database
    leverage: trade.leverage,
    quantity: trade.quantity
  }
}

export default function JournalPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [trades, setTrades] = useState<TradeEntry[]>([])
  const [tradesLoading, setTradesLoading] = useState(true)

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth')
    }
  }, [user, loading, router])

  // Fetch trades when user is available
  useEffect(() => {
    const fetchTrades = async () => {
      if (!user) return
      
      try {
        setTradesLoading(true)
        const fetchedTrades = await tradeAPI.getTrades(user.id)
        console.log('Fetched trades:', fetchedTrades)
        
        // Convert database trades to TradeEntry format
        const convertedTrades = (fetchedTrades || []).map(convertTradeToTradeEntry)
        console.log('Converted trades:', convertedTrades)
        setTrades(convertedTrades)
      } catch (error) {
        console.error('Error fetching trades:', error)
        setTrades([])
      } finally {
        setTradesLoading(false)
      }
    }

    fetchTrades()
  }, [user])

  if (loading) {
    return (
      <div className="flex h-screen bg-dark-bg">
        <Sidebar />
        <div className="flex-1 flex flex-col ml-64">
          <Header />
          <main className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
              <p className="mt-4 text-dark-textSecondary">Loading...</p>
            </div>
          </main>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  const handleExport = (data: TradeEntry[]) => {
    console.log('Exporting trade data:', data)
    // Here you could implement custom export logic
    // For now, it will use the default JSON export
  }

  return (
    <div className="flex h-screen bg-dark-bg">
      <Sidebar />
      
      <div className="flex-1 flex flex-col ml-64">
        <Header />
        
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto">
            {tradesLoading ? (
              <div className="bg-dark-card border border-dark-border rounded-2xl shadow-card-dark p-6">
                <div className="flex items-center justify-center h-64">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                </div>
              </div>
            ) : (
              <TradeJournal 
                trades={trades} 
                onExport={handleExport}
              />
            )}
          </div>
        </main>
      </div>
    </div>
  )
} 