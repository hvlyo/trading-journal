'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function TestPage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth')
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-white">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-dark-bg p-8">
              <div className="max-w-md mx-auto bg-dark-card border border-dark-border rounded-2xl shadow-card-dark p-6">
        <h1 className="text-2xl font-bold text-white mb-4">Test Page</h1>
        <p className="text-dark-textSecondary">This is a test page for development purposes.</p>
      </div>
    </div>
  )
} 