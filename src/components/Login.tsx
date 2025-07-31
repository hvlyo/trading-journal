'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [resetEmail, setResetEmail] = useState('')
  const [resetLoading, setResetLoading] = useState(false)
  const [resetError, setResetError] = useState('')
  const [resetSuccess, setResetSuccess] = useState('')
  const [showResetForm, setShowResetForm] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        setError(error.message)
      } else {
        setSuccess('Login successful!')
        router.push('/dashboard')
      }
    } catch (error) {
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setResetLoading(true)
    setResetError('')
    setResetSuccess('')

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
        redirectTo: `${window.location.origin}/auth?reset=true`,
      })

      if (error) {
        setResetError(error.message)
      } else {
        setResetSuccess('Password reset link sent to your email!')
        setResetEmail('')
      }
    } catch (error) {
      setResetError('An unexpected error occurred')
    } finally {
      setResetLoading(false)
    }
  }

  const handleBackToLogin = () => {
    setShowResetForm(false)
    setResetEmail('')
    setResetError('')
    setResetSuccess('')
  }

  if (showResetForm) {
    return (
      <div className="space-y-5">
        <div className="flex items-center mb-6">
          <button
            onClick={handleBackToLogin}
            className="text-primary-400 hover:text-primary-300 font-medium transition-colors duration-200 hover:underline flex items-center"
          >
            <span className="mr-2">←</span>
            Back to Sign In
          </button>
        </div>
        
        <div className="text-center mb-6">
          <h3 className="text-lg font-semibold text-white mb-2">Reset Password</h3>
          <p className="text-dark-textSecondary text-sm">Enter your email to receive a reset link</p>
        </div>

        <form onSubmit={handleResetPassword} className="space-y-5">
          <div>
            <label htmlFor="reset-email" className="block text-sm font-medium text-white mb-2">
              Email
            </label>
            <input
              id="reset-email"
              type="email"
              value={resetEmail}
              onChange={(e) => setResetEmail(e.target.value)}
              required
              className="w-full px-4 py-3 border border-dark-border/50 rounded-xl bg-dark-input/80 backdrop-blur-sm text-white placeholder-dark-textSecondary focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 shadow-inner"
              placeholder="Enter your email"
            />
          </div>

          {resetError && (
            <div className="text-danger-500 text-sm bg-danger-500/10 border border-danger-500/20 rounded-xl p-3 backdrop-blur-sm">
              {resetError}
            </div>
          )}

          {resetSuccess && (
            <div className="text-success-500 text-sm bg-success-500/10 border border-success-500/20 rounded-xl p-3 backdrop-blur-sm">
              {resetSuccess}
            </div>
          )}

          <button
            type="submit"
            disabled={resetLoading}
            className="w-full bg-gradient-to-r from-primary-500 to-primary-600 text-white py-3 px-4 rounded-xl hover:from-primary-600 hover:to-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-dark-card transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-lg hover:shadow-xl hover:shadow-primary-500/25"
          >
            {resetLoading ? 'Sending...' : 'Send Reset Link'}
          </button>
        </form>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-white mb-2">
          Email
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full px-4 py-3 border border-dark-border/50 rounded-xl bg-dark-input/80 backdrop-blur-sm text-white placeholder-dark-textSecondary focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 shadow-inner"
          placeholder="Enter your email"
        />
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-white mb-2">
          Password
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="w-full px-4 py-3 border border-dark-border/50 rounded-xl bg-dark-input/80 backdrop-blur-sm text-white placeholder-dark-textSecondary focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 shadow-inner"
          placeholder="Enter your password"
        />
      </div>

      <div className="text-right">
        <button
          type="button"
          onClick={() => setShowResetForm(true)}
          className="text-primary-400 hover:text-primary-300 text-sm font-medium transition-colors duration-200 hover:underline"
        >
          Forgot Password?
        </button>
      </div>

      {error && (
        <div className="text-danger-500 text-sm bg-danger-500/10 border border-danger-500/20 rounded-xl p-3 backdrop-blur-sm">
          {error}
        </div>
      )}

      {success && (
        <div className="text-success-500 text-sm bg-success-500/10 border border-success-500/20 rounded-xl p-3 backdrop-blur-sm">
          {success}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-gradient-to-r from-primary-500 to-primary-600 text-white py-3 px-4 rounded-xl hover:from-primary-600 hover:to-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-dark-card transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-lg hover:shadow-xl hover:shadow-primary-500/25"
      >
        {loading ? 'Signing in...' : 'Sign In'}
      </button>
    </form>
  )
} 