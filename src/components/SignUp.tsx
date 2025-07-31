'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function SignUp() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      })

      if (error) {
        setError(error.message)
      } else {
        setSuccess('Sign up successful! Please check your email to confirm your account.')
        setEmail('')
        setPassword('')
      }
    } catch (error) {
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
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
        className="w-full bg-gradient-to-r from-secondary-500 to-secondary-600 text-white py-3 px-4 rounded-xl hover:from-secondary-600 hover:to-secondary-700 focus:outline-none focus:ring-2 focus:ring-secondary-500 focus:ring-offset-2 focus:ring-offset-dark-card transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-lg hover:shadow-xl hover:shadow-secondary-500/25"
      >
        {loading ? 'Creating account...' : 'Create Account'}
      </button>
    </form>
  )
} 