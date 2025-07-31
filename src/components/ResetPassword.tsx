'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter, useSearchParams } from 'next/navigation'

export default function ResetPassword() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [isValidToken, setIsValidToken] = useState(false)
  const [isCheckingToken, setIsCheckingToken] = useState(true)
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    checkResetToken()
  }, [])

  const checkResetToken = async () => {
    try {
      // Get the access token and refresh token from URL parameters
      const accessToken = searchParams.get('access_token')
      const refreshToken = searchParams.get('refresh_token')
      const type = searchParams.get('type')

      // Check if this is a password recovery flow
      if (type === 'recovery' && accessToken && refreshToken) {
        // Set the session with the tokens from the URL
        const { data, error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        })

        if (error) {
          console.error('Error setting session:', error)
          setError('Invalid or expired reset link. Please request a new password reset.')
        } else if (data.session) {
          setIsValidToken(true)
        } else {
          setError('Invalid or expired reset link. Please request a new password reset.')
        }
      } else {
        // Fallback: check if user is already authenticated
        const { data: { session } } = await supabase.auth.getSession()
        if (session?.user) {
          setIsValidToken(true)
        } else {
          setError('Invalid or expired reset link. Please request a new password reset.')
        }
      }
    } catch (error) {
      console.error('Error validating reset link:', error)
      setError('Error validating reset link. Please try again.')
    } finally {
      setIsCheckingToken(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    // Validate passwords match
    if (password !== confirmPassword) {
      setError('Passwords do not match')
      setLoading(false)
      return
    }

    // Validate password strength
    if (password.length < 6) {
      setError('Password must be at least 6 characters long')
      setLoading(false)
      return
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: password
      })

      if (error) {
        setError(error.message)
      } else {
        setSuccess('Password updated successfully! Redirecting to login...')
        
        // Sign out the user after password update
        await supabase.auth.signOut()
        
        // Redirect to login page after a short delay
        setTimeout(() => {
          router.push('/auth')
        }, 2000)
      }
    } catch (error) {
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  if (isCheckingToken) {
    return (
      <div className="space-y-5">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-white">Validating reset link...</p>
        </div>
      </div>
    )
  }

  if (!isValidToken) {
    return (
      <div className="space-y-5">
        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-danger-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-white text-lg">⚠️</span>
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">Invalid Reset Link</h3>
          <p className="text-dark-textSecondary text-sm">The reset link is invalid or has expired.</p>
        </div>

        {error && (
          <div className="text-danger-500 text-sm bg-danger-500/10 border border-danger-500/20 rounded-xl p-3 backdrop-blur-sm">
            {error}
          </div>
        )}

        <button
          onClick={() => {
            // Clear the reset parameter and go back to login
            router.replace('/auth')
          }}
          className="w-full bg-gradient-to-r from-primary-500 to-primary-600 text-white py-3 px-4 rounded-xl hover:from-primary-600 hover:to-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-dark-card transition-all duration-300 font-medium shadow-lg hover:shadow-xl hover:shadow-primary-500/25"
        >
          Back to Login
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <div className="text-center mb-6">
        <div className="w-12 h-12 bg-success-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-white text-lg">🔐</span>
        </div>
        <h3 className="text-lg font-semibold text-white mb-2">Set New Password</h3>
        <p className="text-dark-textSecondary text-sm">Enter your new password below</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="new-password" className="block text-sm font-medium text-white mb-2">
            New Password
          </label>
          <input
            id="new-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full px-4 py-3 border border-dark-border/50 rounded-xl bg-dark-input/80 backdrop-blur-sm text-white placeholder-dark-textSecondary focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 shadow-inner"
            placeholder="Enter new password"
          />
        </div>

        <div>
          <label htmlFor="confirm-password" className="block text-sm font-medium text-white mb-2">
            Confirm Password
          </label>
          <input
            id="confirm-password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            className="w-full px-4 py-3 border border-dark-border/50 rounded-xl bg-dark-input/80 backdrop-blur-sm text-white placeholder-dark-textSecondary focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 shadow-inner"
            placeholder="Confirm new password"
          />
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
          className="w-full bg-gradient-to-r from-success-500 to-success-600 text-white py-3 px-4 rounded-xl hover:from-success-600 hover:to-success-700 focus:outline-none focus:ring-2 focus:ring-success-500 focus:ring-offset-2 focus:ring-offset-dark-card transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-lg hover:shadow-xl hover:shadow-success-500/25"
        >
          {loading ? 'Updating Password...' : 'Update Password'}
        </button>
      </form>
    </div>
  )
} 