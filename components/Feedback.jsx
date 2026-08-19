'use client';

import { useState } from 'react';
import Image from 'next/image';
import api from '@/lib/api';

const REASONS = [
  { value: 'app', label: 'The app', field: 'appFeedback', placeholder: 'Anything about booking, browsing services, or using the site...' },
  { value: 'services', label: 'Our services', field: 'serviceFeedback', placeholder: 'Thoughts on the range or pricing of what we offer...' },
  { value: 'quality', label: 'Quality of work', field: 'qualityFeedback', placeholder: 'How was a job carried out...' },
  { value: 'other', label: 'Something else', field: 'otherFeedback', placeholder: "Anything else you'd like us to know..." },
];

export default function Feedback({ onBack }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [reason, setReason] = useState('app');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const selectedReason = REASONS.find(r => r.value === reason);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await api.post('/feedback', {
        name: name || null,
        email: email || null,
        appFeedback: null,
        serviceFeedback: null,
        qualityFeedback: null,
        otherFeedback: null,
        [selectedReason.field]: message
      });
      setSubmitted(true);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to submit feedback');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen px-4 py-10 relative overflow-hidden">
      <Image src="/garden-mist-bg.png" alt="" fill className="object-cover -z-10 grayscale" sizes="100vw" />
      <div className="absolute inset-0 bg-stone-50/70" />
      <div className="relative z-10 max-w-2xl mx-auto">
        <div className="bg-white p-8 sm:p-10 rounded-lg shadow-lg">
          <h1 className="text-2xl font-bold text-stone-900 mb-4">Share your feedback</h1>
          <p className="text-stone-600 mb-8">
            We're always trying to improve, and we'd love to hear what you think. Whether it's
            something about the app itself, the services we offer, the quality of the work, or
            anything else on your mind, let us know below - every message goes straight to the team.
          </p>

          {submitted ? (
            <div className="bg-brand-50 text-brand-800 p-4 rounded-lg text-sm">
              Thanks for taking the time to share this with us!
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Name (optional)</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Email (optional)</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">What's this about?</label>
                <select
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                >
                  {REASONS.map(r => (
                    <option key={r.value} value={r.value}>{r.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Your feedback</label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={selectedReason.placeholder}
                  rows={4}
                  required
                  className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              {error && <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm">{error}</div>}

              <button
                type="submit"
                disabled={loading}
                className="w-full sm:w-auto sm:px-8 bg-brand-600 text-white py-2 rounded-lg font-semibold hover:bg-brand-700 disabled:opacity-50 transition"
              >
                {loading ? 'Sending...' : 'Send feedback'}
              </button>
            </form>
          )}
        </div>

        {onBack && (
          <div className="text-center mt-6">
            <button onClick={onBack} className="text-brand-700 hover:text-brand-800 font-medium">
              ← Back
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
