import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useRecoilValue } from 'recoil';
import { userAtom } from '../store/user.atom';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../context/ThemeContext';
import { getOrganizationName } from '../utils/domainMapper';
import ProductsList from '../components/ProductsList';
import Notifications from '../components/Notifications';

export default function Home() {
  const user = useRecoilValue(userAtom);
  const { logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  
  const organizationName = user.email ? getOrganizationName(user.email) : '';

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-indigo-950 dark:to-purple-950 transition-colors duration-300">
      {/* Organization Welcome Banner with Animation */}
      {user.isLoggedIn && organizationName && (
        <div className="relative overflow-hidden bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white dark:from-indigo-700 dark:via-purple-700 dark:to-pink-700 animate-gradient-x">
          {/* Animated Background Shapes */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-10 -left-10 w-40 h-40 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute top-20 right-10 w-60 h-60 bg-purple-400/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
          </div>
          <div className="container mx-auto px-4 py-5 relative z-10">
            <div className="text-center">
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold animate-fade-in-up bg-clip-text text-transparent bg-gradient-to-r from-white to-indigo-100">
                ✨ Welcome to CampusZon of {organizationName} ✨
              </h2>
              <p className="text-indigo-100 text-xs sm:text-sm mt-2 animate-fade-in-up animation-delay-200">
                🛍️ Buy and sell items within your campus community
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Glassmorphism Header */}
      <header className="backdrop-blur-md bg-white/80 dark:bg-gray-800/80 shadow-lg border-b border-gray-200/50 dark:border-gray-700/50 transition-all duration-300 sticky top-0 z-50">
        <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4">
          {/* Mobile: Stack everything vertically */}
          <div className="flex flex-col gap-3 sm:gap-4">
            {/* Top Row: Logo and Quick Actions */}
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 dark:text-white truncate">CampusZon</h1>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 mt-0.5 truncate">
                  {user.isLoggedIn && organizationName 
                    ? `Marketplace for ${organizationName}` 
                    : 'Campus Marketplace'}
                </p>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
                {/* Theme Toggle Button */}
                <button
                  onClick={toggleTheme}
                  className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  aria-label="Toggle theme"
                >
                  {theme === 'light' ? (
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-700 dark:text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-700 dark:text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  )}
                </button>
                
                {/* Notifications - Only show when logged in */}
                {user.isLoggedIn && <Notifications />}
              </div>
            </div>
            
            {/* Bottom Row: Navigation (only when logged in) */}
            {user.isLoggedIn ? (
              <div className="flex items-center gap-2 overflow-x-auto pb-1 -mx-3 px-3 sm:mx-0 sm:px-0 scrollbar-hide">
                <span className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 whitespace-nowrap hidden sm:block">Welcome, {user.username}!</span>
                <Link
                  to="/chat"
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-gray-700 dark:text-gray-300 text-sm font-medium whitespace-nowrap"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  <span className="hidden sm:inline">Chat</span>
                </Link>
                <Link
                  to="/profile"
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-gray-700 dark:text-gray-300 text-sm font-medium whitespace-nowrap"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span className="hidden sm:inline">Profile</span>
                </Link>
                <Link
                  to="/add-item"
                  className="flex items-center gap-1 bg-indigo-600 dark:bg-indigo-500 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg hover:bg-indigo-700 dark:hover:bg-indigo-600 transition font-medium text-sm whitespace-nowrap"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Add Item
                </Link>
                <button
                  onClick={logout}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-100 dark:bg-red-900/30 hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors text-red-700 dark:text-red-400 text-sm font-medium whitespace-nowrap ml-auto"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-4 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-gray-700 dark:text-gray-300 text-sm font-medium"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="bg-indigo-600 text-white px-4 py-1.5 rounded-lg hover:bg-indigo-700 transition font-medium text-sm"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 md:py-8">
        {/* Enhanced Search Bar with Gradient Border */}
        <div className="mb-4 sm:mb-6 md:mb-8 animate-fade-in-up">
          <div className="max-w-2xl mx-auto">
            <div className="relative group">
              {/* Gradient Border Effect */}
              <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-xl blur opacity-30 group-hover:opacity-60 transition duration-500"></div>
              
              <div className="relative">
                <input
                  type="text"
                  placeholder="🔍 Search for items (laptop, books, furniture...)"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 sm:px-5 py-3 sm:py-4 pl-10 sm:pl-12 pr-10 text-sm sm:text-base text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 dark:focus:border-indigo-400 outline-none transition-all duration-300 shadow-lg font-medium placeholder:text-gray-400 dark:placeholder:text-gray-500"
                />
                <svg
                  className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-indigo-500 dark:text-indigo-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-indigo-600 dark:text-gray-500 dark:hover:text-indigo-400 p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all duration-200"
                    aria-label="Clear search"
                  >
                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="mb-4 sm:mb-6 animate-fade-in-up animation-delay-200">
          <h2 className="text-lg sm:text-xl md:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 dark:from-indigo-400 dark:via-purple-400 dark:to-pink-400 mb-2">
            {searchQuery ? `🔍 Results for "${searchQuery}"` : '🛍️ Available Items'}
          </h2>
          {user.isLoggedIn && organizationName ? (
            <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 mt-2 flex items-center gap-2">
              <span className="inline-block w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              Showing items from <span className="font-bold text-indigo-600 dark:text-indigo-400 px-2 py-0.5 bg-indigo-50 dark:bg-indigo-900/30 rounded-md">{organizationName}</span> students
            </p>
          ) : (
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-2">✨ Login to browse items from your campus</p>
          )}
        </div>
        
        <ProductsList searchQuery={searchQuery} />
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-800 border-t dark:border-gray-700 mt-8 sm:mt-12 transition-colors duration-300">
        <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 text-center text-xs sm:text-sm text-gray-600 dark:text-gray-300">
          <p>&copy; 2025 CampusZon. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
