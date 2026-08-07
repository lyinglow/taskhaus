'use client';

import { useState } from 'react';
import Image from 'next/image';
import api from '@/lib/api';

export default function Login({ isAdmin = false, onLogin, onSwitchPage, onCancel }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const endpoint = isAdmin ? '/admin/login' : '/auth/login';
      const payload = isAdmin ? { password } : { email, password };
      const response = await api.post(endpoint, payload);

      onLogin(response.data.token, isAdmin ? 999 : response.data.customerId, isAdmin ? 'Admin' : response.data.name, isAdmin);
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden">
      <Image src="/garden-mist-bg.png" alt="" fill priority className="object-cover -z-10 grayscale" sizes="100vw" />
      <div className="absolute inset-0 bg-stone-50/50" />
      <div className="relative z-10 bg-white p-8 sm:p-10 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold text-stone-900 mb-2">
          {isAdmin ? 'Admin Login' : 'Customer Login'}
        </h2>
        <p className="text-stone-600 mb-8">Sign in to your account</p>

        <form onSubmit={handleSubmit} className="space-y-5">
          {!isAdmin && (
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                required
              />
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">
              {isAdmin ? 'Admin Password' : 'Password'}
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
              required
            />
          </div>

          {error && <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm">{error}</div>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-brand-600 text-white py-2 rounded-lg font-semibold hover:bg-brand-700 disabled:opacity-50 transition"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        {!isAdmin && (
          <div className="mt-6 text-center">
            <p className="text-stone-600 text-sm">
              Don't have an account?{' '}
              <button
                onClick={onSwitchPage}
                className="text-brand-700 hover:text-brand-800 font-medium"
              >
                Sign up
              </button>
            </p>
          </div>
        )}

        <div className="mt-5 text-center">
          <button
            type="button"
            onClick={onCancel}
            className="text-stone-500 hover:text-stone-700 text-sm font-medium"
          >
            Cancel login
          </button>
        </div>
      </div>
    </div>
  );
}
