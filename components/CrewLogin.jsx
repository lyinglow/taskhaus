'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import api from '@/lib/api';

export default function CrewLogin({ onLogin, onCancel }) {
  const [crew, setCrew] = useState([]);
  const [crewMemberId, setCrewMemberId] = useState('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get('/crew/list').then(res => setCrew(res.data)).catch(() => {});
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await api.post('/crew/login', { crewMemberId, pin });
      onLogin(response.data.token, response.data.crewMemberId, response.data.name);
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
        <h2 className="text-2xl font-bold text-stone-900 mb-2">Team login</h2>
        <p className="text-stone-600 mb-8">Select your name and enter your PIN</p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">Your name</label>
            <select
              value={crewMemberId}
              onChange={(e) => setCrewMemberId(e.target.value)}
              className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
              required
            >
              <option value="">Select your name...</option>
              {crew.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">PIN</label>
            <input
              type="password"
              inputMode="numeric"
              maxLength={4}
              value={pin}
              onChange={(e) => setPin(e.target.value)}
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
