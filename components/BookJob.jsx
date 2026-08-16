'use client';

import { useState } from 'react';
import api from '@/lib/api';

export default function BookJob({ onNavigate }) {
  const selectedServiceId = typeof window !== 'undefined' ? localStorage.getItem('selectedServiceId') : null;
  const selectedServiceName = typeof window !== 'undefined' ? localStorage.getItem('selectedServiceName') : null;
  const selectedServiceLongDescription = typeof window !== 'undefined' ? localStorage.getItem('selectedServiceLongDescription') : null;
  const selectedServicePrice = typeof window !== 'undefined' ? localStorage.getItem('selectedServicePrice') : null;
  const selectedServiceSeason = typeof window !== 'undefined' ? localStorage.getItem('selectedServiceSeason') : null;
  const availableExtras = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('selectedServiceExtras') || '[]') : [];
  const [notes, setNotes] = useState('');
  const [recurrence, setRecurrence] = useState('none');
  const [selectedExtraIds, setSelectedExtraIds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const toggleExtra = (extraId) => {
    setSelectedExtraIds((prev) => prev.includes(extraId) ? prev.filter(id => id !== extraId) : [...prev, extraId]);
  };

  const extrasTotal = availableExtras
    .filter(extra => selectedExtraIds.includes(extra.id))
    .reduce((sum, extra) => sum + extra.price, 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await api.post('/jobs', {
        serviceId: parseInt(selectedServiceId),
        customRequest: notes || null,
        recurrence: recurrence !== 'none' ? recurrence : null,
        extraIds: selectedExtraIds
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
        <div className="bg-brand-50 p-8 rounded-lg border border-brand-200">
          <div className="text-4xl mb-4">✓</div>
          <h2 className="text-2xl font-bold text-brand-700 mb-2">Request Submitted!</h2>
          <p className="text-stone-600 mb-4">We'll review your request and send you a confirmation soon.</p>
          <p className="text-sm text-stone-500">Redirecting to dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-2xl py-10 mx-auto px-4">
      <button
        type="button"
        onClick={() => onNavigate('browse-services')}
        className="flex items-center gap-1 text-stone-600 hover:text-stone-900 font-medium mb-5 transition"
      >
        <span className="text-lg">←</span> Back to services
      </button>

      <div className="bg-white p-8 sm:p-10 rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold text-stone-900 mb-2">{selectedServiceName}</h1>
        {selectedServiceLongDescription && (
          <p className="text-stone-600 mb-3">{selectedServiceLongDescription}</p>
        )}
        {selectedServicePrice && (
          <p className="text-lg font-bold text-brand-700 mb-2">
            <span className="text-[13px] font-medium align-baseline">From </span>£{(Number(selectedServicePrice) + extrasTotal).toFixed(2)}
          </p>
        )}
        {selectedServiceSeason && (
          <p className="text-xs text-stone-500 mb-3">📅 {selectedServiceSeason}</p>
        )}
        <p className="text-stone-600 mb-7">Complete your booking request</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {availableExtras.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2">Add extras</label>
              <div className="space-y-2">
                {availableExtras.map((extra) => (
                  <label key={extra.id} className="flex items-center justify-between gap-2 text-sm text-stone-700 border border-stone-200 rounded-lg px-3 py-2">
                    <span className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={selectedExtraIds.includes(extra.id)}
                        onChange={() => toggleExtra(extra.id)}
                        className="rounded border-stone-300 text-brand-600 focus:ring-brand-500"
                      />
                      {extra.name}
                    </span>
                    <span className="text-stone-500">+£{extra.price.toFixed(2)}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-stone-700 mb-2">Additional details (optional)</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Tell us any specific details or requirements..."
              rows={4}
              className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700 mb-2">Repeat this booking?</label>
            <select
              value={recurrence}
              onChange={(e) => setRecurrence(e.target.value)}
              className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="none">One-off (just this once)</option>
              <option value="weekly">Weekly</option>
              <option value="biweekly">Every 2 weeks</option>
              <option value="monthly">Monthly</option>
            </select>
            {recurrence !== 'none' && (
              <p className="text-xs text-stone-500 mt-1">Once this booking is completed, we'll automatically schedule the next one for you.</p>
            )}
          </div>

          {error && <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm">{error}</div>}

          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => onNavigate('browse-services')}
              className="flex-1 sm:flex-none sm:px-6 bg-accent-600 text-white py-2 rounded-lg font-semibold hover:bg-accent-700 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 sm:flex-none sm:px-6 bg-brand-600 text-white py-2 rounded-lg font-semibold hover:bg-brand-700 disabled:opacity-50 transition"
            >
              {loading ? 'Submitting...' : 'Submit request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
