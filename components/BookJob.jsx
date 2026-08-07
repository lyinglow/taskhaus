'use client';

import { useState } from 'react';
import api from '@/lib/api';

export default function BookJob({ onNavigate }) {
  const selectedServiceId = typeof window !== 'undefined' ? localStorage.getItem('selectedServiceId') : null;
  const selectedServiceName = typeof window !== 'undefined' ? localStorage.getItem('selectedServiceName') : null;
  const selectedServiceLongDescription = typeof window !== 'undefined' ? localStorage.getItem('selectedServiceLongDescription') : null;
  const selectedServicePrice = typeof window !== 'undefined' ? localStorage.getItem('selectedServicePrice') : null;
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await api.post('/jobs', {
        serviceId: parseInt(selectedServiceId),
        customRequest: notes || null
      });

      setSuccess(true);
      setTimeout(() => {
        onNavigate('job-history');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create job');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="container max-w-2xl py-12 mx-auto px-4 text-center">
        <div className="bg-green-50 p-8 rounded-lg border border-green-200">
          <div className="text-4xl mb-4">✓</div>
          <h2 className="text-2xl font-bold text-green-700 mb-2">Request Submitted!</h2>
          <p className="text-gray-600 mb-4">We'll review your request and send you a confirmation soon.</p>
          <p className="text-sm text-gray-500">Redirecting to dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-2xl py-8 mx-auto px-4">
      <button
        type="button"
        onClick={() => onNavigate('browse-services')}
        className="flex items-center gap-1 text-gray-600 hover:text-gray-900 font-medium mb-4 transition"
      >
        <span className="text-lg">←</span> Back to Services
      </button>

      <div className="bg-white p-8 rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">{selectedServiceName}</h1>
        {selectedServiceLongDescription && (
          <p className="text-gray-600 mb-2">{selectedServiceLongDescription}</p>
        )}
        {selectedServicePrice && (
          <p className="text-xl font-bold text-green-600 mb-4">£{Number(selectedServicePrice).toFixed(2)}</p>
        )}
        <p className="text-gray-600 mb-6">Complete your booking request</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Additional Details (optional)</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Tell us any specific details or requirements..."
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {error && <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm">{error}</div>}

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 transition"
            >
              {loading ? 'Submitting...' : 'Submit Request'}
            </button>
            <button
              type="button"
              onClick={() => onNavigate('browse-services')}
              className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg font-semibold hover:bg-gray-300 transition"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
