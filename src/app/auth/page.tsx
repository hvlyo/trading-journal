'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState, Suspense } from 'react'
import SignUp from '@/components/SignUp'
import Login from '@/components/Login'
import ResetPassword from '@/components/ResetPassword'

function AuthContent() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isLogin, setIsLogin] = useState(true)
  const [isResetMode, setIsResetMode] = useState(false)

  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard')
    }
  }, [user, loading, router])

  useEffect(() => {
    // Check if user is returning from password reset email
    const resetParam = searchParams.get('reset')
    if (resetParam === 'true') {
      setIsResetMode(true)
    }
  }, [searchParams])

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center">
        <div className="bg-dark-card border border-dark-border rounded-2xl shadow-card-dark p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-white">Loading...</p>
        </div>
      </div>
    )
  }

  if (user) {
    return null
  }

  return (
    <div className="min-h-screen bg-dark-bg flex items-center justify-center p-4 relative">
      {/* Background gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary-500/10 via-transparent to-secondary-500/10"></div>
      
      {/* Semi-transparent backdrop */}
      <div className="absolute inset-0 bg-black/20 backdrop-blur-sm"></div>
      
      {/* Main container with enhanced styling */}
      <div className="relative z-10 bg-dark-card/95 backdrop-blur-md border border-dark-border/50 rounded-3xl shadow-2xl overflow-hidden w-full max-w-md">
        {/* Subtle gradient overlay on the card */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none"></div>
        
        <div className="relative p-8">
          {/* Header with improved spacing */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-white mb-2">
              {isResetMode ? 'Reset Password' : (isLogin ? 'Welcome Back' : 'Welcome, Trader!')}
            </h1>
            <p className="text-dark-textSecondary text-sm">
              {isResetMode 
                ? 'Set your new password to continue' 
                : (isLogin ? 'Sign in to your account' : 'Join us and start trading')
              }
            </p>
          </div>
          
          {/* Password Reset Section */}
          {isResetMode ? (
            <div className="bg-gradient-to-br from-success-500/10 to-success-600/5 backdrop-blur-sm rounded-2xl p-6 border border-success-500/20">
              <ResetPassword />
            </div>
          ) : (
            /* Separate Login and Signup sections */
            <div className="relative">
              {/* Login Section */}
              <div className={`transition-all duration-500 ease-in-out ${isLogin ? 'opacity-100 scale-100 relative' : 'opacity-0 scale-95 absolute inset-0 pointer-events-none'}`}>
                <div className="bg-gradient-to-br from-primary-500/10 to-primary-600/5 backdrop-blur-sm rounded-2xl p-6 border border-primary-500/20">
                  <div className="flex items-center mb-6">
                    <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center mr-4">
                      <span className="text-white text-lg">🔐</span>
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold text-white">Sign In</h2>
                      <p className="text-dark-textSecondary text-sm">Access your trading dashboard</p>
                    </div>
                  </div>
                  <Login />
                </div>
              </div>
              
              {/* Signup Section */}
              <div className={`transition-all duration-500 ease-in-out ${!isLogin ? 'opacity-100 scale-100 relative' : 'opacity-0 scale-95 absolute inset-0 pointer-events-none'}`}>
                <div className="bg-gradient-to-br from-secondary-500/10 to-secondary-600/5 backdrop-blur-sm rounded-2xl p-6 border border-secondary-500/20">
                  <SignUp />
                </div>
              </div>
            </div>
          )}
          
          {/* Toggle buttons at the bottom - only show when not in reset mode */}
          {!isResetMode && (
            <div className="mt-8 text-center">
              <p className="text-dark-textSecondary text-sm mb-4">
                {isLogin ? "Don't have an account?" : "Already have an account?"}
              </p>
              <button
                onClick={() => setIsLogin(!isLogin)}
                className="text-primary-400 hover:text-primary-300 font-medium transition-all duration-200 hover:underline hover:bg-primary-500/10 hover:px-4 hover:py-2 hover:rounded-lg"
              >
                {isLogin ? 'Create new account' : 'Sign in instead'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function AuthPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-dark-bg flex items-center justify-center">
        <div className="bg-dark-card border border-dark-border rounded-2xl shadow-card-dark p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-white">Loading...</p>
        </div>
      </div>
    }>
      <AuthContent />
    </Suspense>
  )
} 