'use client';

import { useState } from 'react';
import Image from 'next/image';
import api from '@/lib/api';

export default function Feedback({ onBack }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [appFeedback, setAppFeedback] = useState('');
  const [serviceFeedback, setServiceFeedback] = useState('');
  const [qualityFeedback, setQualityFeedback] = useState('');
  const [otherFeedback, setOtherFeedback] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await api.post('/feedback', {
        name: name || null,
        email: email || null,
        appFeedback: appFeedback || null,
        serviceFeedback: serviceFeedback || null,
        qualityFeedback: qualityFeedback || null,
        otherFeedback: otherFeedback || null
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
          <h1 className="text-2xl font-bold text-stone-900 mb-4">Share Your Feedback</h1>
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
                <label className="block text-sm font-medium text-stone-700 mb-1">The app</label>
                <textarea
                  value={appFeedback}
                  onChange={(e) => setAppFeedback(e.target.value)}
                  placeholder="Anything about booking, browsing services, or using the site..."
                  rows={2}
                  className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Our services</label>
                <textarea
                  value={serviceFeedback}
                  onChange={(e) => setServiceFeedback(e.target.value)}
                  placeholder="Thoughts on the range or pricing of what we offer..."
                  rows={2}
                  className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Quality of work</label>
                <textarea
                  value={qualityFeedback}
                  onChange={(e) => setQualityFeedback(e.target.value)}
                  placeholder="How was a job carried out..."
                  rows={2}
                  className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Anything else</label>
                <textarea
                  value={otherFeedback}
                  onChange={(e) => setOtherFeedback(e.target.value)}
                  placeholder="Anything else you'd like us to know..."
                  rows={2}
                  className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              {error && <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm">{error}</div>}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-brand-600 text-white py-2 rounded-lg font-semibold hover:bg-brand-700 disabled:opacity-50 transition"
              >
                {loading ? 'Sending...' : 'Send Feedback'}
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
