'use client';

import { useState } from 'react';
import Image from 'next/image';
import api from '@/lib/api';

export default function ResetPassword({ token, onDone }) {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      await api.post('/auth/reset-password', { token, password });
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden">
      <Image src="/garden-mist-bg.png" alt="" fill priority className="object-cover -z-10 grayscale" sizes="100vw" />
      <div className="absolute inset-0 bg-stone-50/50" />
      <div className="relative z-10 bg-white p-8 sm:p-10 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold text-stone-900 mb-2">Choose a new password</h2>

        {success ? (
          <>
            <p className="text-stone-600 mb-8">Your password has been reset.</p>
            <button
              onClick={onDone}
              className="w-full bg-brand-600 text-white py-2 rounded-lg font-semibold hover:bg-brand-700 transition"
            >
              Continue to login
            </button>
          </>
        ) : (
          <>
            <p className="text-stone-600 mb-8">Enter a new password for your account.</p>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">New password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                  required
                  minLength={6}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Confirm password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                  required
                  minLength={6}
                />
              </div>

              {error && <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm">{error}</div>}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-brand-600 text-white py-2 rounded-lg font-semibold hover:bg-brand-700 disabled:opacity-50 transition"
              >
                {loading ? 'Resetting...' : 'Reset password'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
