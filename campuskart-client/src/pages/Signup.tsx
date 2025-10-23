import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../hooks/useAuth';
import { getOrganizationName } from '../utils/domainMapper';

export default function Signup() {
  const [step, setStep] = useState(1); // 1: Email, 2: OTP, 3: Details
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [hostelName, setHostelName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [, setOtpSent] = useState(false);
  
  const { signup } = useAuth();
  
  const organizationName = email ? getOrganizationName(email) : '';

  // Step 1: Send OTP to email
  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!email) {
      setError('Email is required');
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post('/api/user/send-otp', { email });
      if (response.data.success) {
        setOtpSent(true);
        setStep(2);
        setError('');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!otp || otp.length !== 6) {
      setError('Please enter a valid 6-digit OTP');
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post('/api/user/verify-otp', { email, otp });
      if (response.data.success) {
        setStep(3);
        setError('');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid or expired OTP');
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Complete signup
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate password match
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    // Validate password length
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    const result = await signup({ username, email, password, phoneNumber, hostelName });
    
    if (!result.success) {
      setError(result.message);
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-100 dark:from-gray-900 dark:to-gray-800 px-4 py-8 transition-colors duration-300">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8 dark:border dark:border-gray-700">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Create Account</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-300">
            {step === 1 && 'Step 1: Verify your email'}
            {step === 2 && 'Step 2: Enter OTP'}
            {step === 3 && 'Step 3: Complete your profile'}
          </p>
          {organizationName && email.includes('@') && (
            <div className="mt-3 p-3 bg-purple-50 dark:bg-purple-900/30 border border-purple-200 dark:border-purple-700 rounded-md">
              <p className="text-sm font-semibold text-purple-700 dark:text-purple-400">
                Joining {organizationName}
              </p>
            </div>
          )}
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 rounded-md text-sm">
            {error}
          </div>
        )}

        {/* Step 1: Email Verification */}
        {step === 1 && (
          <form onSubmit={handleSendOTP} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition"
                placeholder="your.email@university.edu"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-purple-600 dark:bg-purple-500 text-white py-2 px-4 rounded-md hover:bg-purple-700 dark:hover:bg-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 dark:ring-offset-gray-800 transition disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {loading ? 'Sending OTP...' : 'Send OTP'}
            </button>
          </form>
        )}

        {/* Step 2: OTP Verification */}
        {step === 2 && (
          <form onSubmit={handleVerifyOTP} className="space-y-5">
            <div>
              <label htmlFor="otp" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Enter 6-Digit OTP
              </label>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                We've sent an OTP to <strong>{email}</strong>
              </p>
              <input
                id="otp"
                type="text"
                required
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition text-center text-2xl tracking-widest"
                placeholder="000000"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-purple-600 dark:bg-purple-500 text-white py-2 px-4 rounded-md hover:bg-purple-700 dark:hover:bg-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 dark:ring-offset-gray-800 transition disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {loading ? 'Verifying...' : 'Verify OTP'}
            </button>

            <button
              type="button"
              onClick={() => setStep(1)}
              className="w-full text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 text-sm font-medium"
            >
              ← Change Email
            </button>
          </form>
        )}

        {/* Step 3: Complete Profile */}
        {step === 3 && (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Username
              </label>
              <input
                id="username"
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition"
                placeholder="johndoe"
              />
            </div>

            <div>
              <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Phone Number
              </label>
              <input
                id="phoneNumber"
                type="tel"
                required
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition"
                placeholder="+91 1234567890"
              />
            </div>

            <div>
              <label htmlFor="hostelName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Hostel Name
              </label>
              <input
                id="hostelName"
                type="text"
                required
                value={hostelName}
                onChange={(e) => setHostelName(e.target.value)}
                className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition"
                placeholder="e.g., Hostel A, Block 5"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition"
                placeholder="••••••••"
                minLength={6}
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition"
                placeholder="••••••••"
                minLength={6}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-purple-600 dark:bg-purple-500 text-white py-2 px-4 rounded-md hover:bg-purple-700 dark:hover:bg-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 dark:ring-offset-gray-800 transition disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {loading ? 'Creating account...' : 'Sign Up'}
            </button>
          </form>
        )}

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Already have an account?{' '}
            <Link to="/login" className="text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
