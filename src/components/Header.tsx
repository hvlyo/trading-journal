'use client'

import { useAuth } from '@/contexts/AuthContext'
import { usePathname } from 'next/navigation'
import { useState } from 'react'

export default function Header() {
  const { user } = useAuth()
  const pathname = usePathname()
  const [searchQuery, setSearchQuery] = useState('')

  const getPageTitle = () => {
    try {
      switch (pathname) {
        case '/dashboard':
          return 'Dashboard'
        case '/new-trade':
          return 'Add New Trade'
        case '/journal':
          return 'Trade Journal'
        case '/analytics':
          return 'Analytics'
        case '/settings':
          return 'Settings'
        default:
          return 'Dashboard'
      }
    } catch (error) {
      console.error('Error getting page title:', error)
      return 'Dashboard'
    }
  }

  // Don't show search bar on new-trade page
  const showSearchBar = pathname !== '/new-trade'

  return (
    <header className="bg-dark-card border-b border-dark-border px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Left Section */}
        <div className="flex items-center space-x-6">
          <h1 className="text-2xl font-bold text-white">
            {getPageTitle()}
          </h1>
          
          {/* Search Bar - only show on non-new-trade pages */}
          {showSearchBar && (
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-dark-textSecondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search trades..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="block w-64 pl-10 pr-3 py-2 border border-dark-border rounded-xl bg-dark-input text-white placeholder-dark-textSecondary focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
              />
            </div>
          )}
        </div>

        {/* Right Section */}
        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <button className="relative p-2 text-dark-textSecondary hover:text-white hover:bg-dark-border rounded-xl transition-colors">
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM10.5 3.75a6 6 0 0 1 6 6v3.75l2.25 2.25V9.75a8.25 8.25 0 0 0-16.5 0v3.75l2.25-2.25V9.75a6 6 0 0 1 6-6z" />
            </svg>
            <span className="absolute top-1 right-1 block h-2 w-2 rounded-full bg-danger-500"></span>
          </button>

          {/* User Profile */}
          {user && (
            <div className="flex items-center space-x-3">
              <div className="text-right">
                <p className="text-sm font-medium text-white">
                  {user.email || 'User'}
                </p>
                <p className="text-xs text-dark-textSecondary">
                  Active Trader
                </p>
              </div>
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-warning-500 rounded-full flex items-center justify-center">
                <span className="text-white font-medium text-sm">
                  {user.email?.charAt(0).toUpperCase() || 'U'}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
} 