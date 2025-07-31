'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Sidebar from '@/components/Sidebar'
import Header from '@/components/Header'
import TradeForm from '@/components/TradeForm'

export default function AddTradePage() {
  const { user } = useAuth()
  const router = useRouter()
  const [formData, setFormData] = useState({
    asset: '',
    type: 'LONG',
    leverage: 1,
    quantity: '',
    openPrice: '',
    closePrice: '',
    openTime: '',
    closeTime: '',
    notes: '',
    strategy: '',
    riskLevel: 'MEDIUM'
  })

  useEffect(() => {
    if (!user) {
      router.push('/auth')
    }
  }, [user, router])

  if (!user) {
    return null
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Basic validation
    if (!formData.asset || !formData.openPrice || !formData.quantity || !formData.openTime) {
      alert('Please fill in all required fields: Asset, Open Price, Quantity, and Open Time')
      return
    }
    
    // Handle form submission
    console.log('Trade data:', formData)
    alert('Trade added successfully!')
    router.push('/dashboard')
  }

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  return (
    <div className="flex h-screen bg-dark-bg">
      <Sidebar />
      
      <div className="flex-1 flex flex-col ml-64">
        <Header />
        
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-4xl mx-auto">
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-white mb-2">Add New Trade</h1>
              <p className="text-dark-textSecondary">Log your latest trading activity</p>
            </div>
            
            <TradeForm />
          </div>
        </main>
      </div>
    </div>
  )
} 