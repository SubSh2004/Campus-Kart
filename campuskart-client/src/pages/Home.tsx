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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      {/* Organization Welcome Banner */}
      {user.isLoggedIn && organizationName && (
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white dark:from-indigo-700 dark:to-purple-700">
          <div className="container mx-auto px-4 py-4">
            <div className="text-center">
              <h2 className="text-2xl font-bold">
                Welcome to CampusZon of {organizationName}
              </h2>
              <p className="text-indigo-100 text-sm mt-1">
                Buy and sell items within your campus community
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b dark:border-gray-700 transition-colors duration-300">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">CampusZon</h1>
              <p className="text-gray-600 dark:text-gray-300 mt-1">
                {user.isLoggedIn && organizationName 
                  ? `Marketplace for ${organizationName}` 
                  : 'Buy and sell items on campus'}
              </p>
            </div>
            <div className="flex items-center gap-4">
              {/* Theme Toggle Button */}
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                aria-label="Toggle theme"
              >
                {theme === 'light' ? (
                  <svg className="w-5 h-5 text-gray-700 dark:text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5 text-gray-700 dark:text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                )}
              </button>
              
              {/* Notifications - Only show when logged in */}
              {user.isLoggedIn && <Notifications />}
              
              {user.isLoggedIn ? (
                <>
                  <span className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Welcome, {user.username}!</span>
                  <Link
                    to="/chat"
                    className={`${theme === 'dark' ? 'text-gray-300 hover:text-indigo-400' : 'text-gray-700 hover:text-indigo-600'} font-medium transition flex items-center gap-1`}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    Chat
                  </Link>
                  <Link
                    to="/profile"
                    className={`${theme === 'dark' ? 'text-gray-300 hover:text-indigo-400' : 'text-gray-700 hover:text-indigo-600'} font-medium transition flex items-center gap-1`}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Profile
                  </Link>
                  <Link
                    to="/add-item"
                    className="bg-indigo-600 dark:bg-indigo-500 text-white px-6 py-2 rounded-md hover:bg-indigo-700 dark:hover:bg-indigo-600 transition font-medium"
                  >
                    + Add Item
                  </Link>
                  <button
                    onClick={logout}
                    className={`${theme === 'dark' ? 'text-gray-300 hover:text-red-400' : 'text-gray-700 hover:text-red-600'} font-medium transition`}
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="text-gray-700 hover:text-indigo-600 font-medium"
                  >
                    Login
                  </Link>
                  <Link
                    to="/signup"
                    className="bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700 transition font-medium"
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Search Bar */}
        <div className="mb-8">
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <input
                type="text"
                placeholder="Search for items (e.g., laptop, books, furniture)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-5 py-3 pl-12 pr-4 text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition shadow-sm"
              />
              <svg
                className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500"
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
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="mb-6">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
            {searchQuery ? `Search Results for "${searchQuery}"` : 'Available Items'}
          </h2>
          {user.isLoggedIn && organizationName ? (
            <p className="text-gray-600 dark:text-gray-300 mt-1">
              Showing items from <span className="font-semibold text-indigo-600 dark:text-indigo-400">{organizationName}</span> students
            </p>
          ) : (
            <p className="text-gray-600 dark:text-gray-300 mt-1">Login to browse items from your campus</p>
          )}
        </div>
        
        <ProductsList searchQuery={searchQuery} />
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-800 border-t dark:border-gray-700 mt-12 transition-colors duration-300">
        <div className="container mx-auto px-4 py-6 text-center text-gray-600 dark:text-gray-300">
          <p>&copy; 2025 CampusZon. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
