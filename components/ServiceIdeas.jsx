'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import api from '@/lib/api';
import Spinner from './Spinner';

export default function ServiceIdeas({ onBack }) {
  const [ideas, setIdeas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [togglingId, setTogglingId] = useState(null);

  useEffect(() => {
    fetchIdeas();
  }, []);

  const fetchIdeas = async () => {
    try {
      const response = await api.get('/service-ideas');
      setIdeas(response.data);
    } catch (err) {
      console.error('Failed to fetch service ideas:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleInterest = async (idea) => {
    setTogglingId(idea.id);
    try {
      const response = await api.post(`/service-ideas/${idea.id}/interest`);
      setIdeas(prev => prev.map(i => i.id === idea.id ? {
        ...i,
        isInterested: response.data.isInterested,
        interestCount: i.interestCount + (response.data.isInterested ? 1 : -1)
      } : i));
    } catch (err) {
      console.error('Failed to update interest:', err);
    } finally {
      setTogglingId(null);
    }
  };

  return (
    <div className="min-h-screen px-4 py-10 relative overflow-hidden">
      <Image src="/garden-mist-bg.png" alt="" fill className="object-cover -z-10 grayscale" sizes="100vw" />
      <div className="absolute inset-0 bg-stone-50/70" />
      <div className="relative z-10 max-w-2xl mx-auto">
        <div className="bg-white p-8 sm:p-10 rounded-lg shadow-lg">
          <h1 className="text-2xl font-bold text-stone-900 mb-4">Possible services</h1>
          <p className="text-stone-600 mb-8">
            These aren't services we offer yet - just ideas we're considering. Tell us you're
            interested and it helps us decide what to add next.
          </p>

          {loading ? (
            <div className="flex justify-center py-8"><Spinner /></div>
          ) : ideas.length === 0 ? (
            <p className="text-stone-600">Nothing here at the moment - check back soon.</p>
          ) : (
            <div className="space-y-3">
              {ideas.map((idea) => (
                <div key={idea.id} className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 border border-stone-200 rounded-lg p-4">
                  <div>
                    <div className="font-semibold text-stone-900">{idea.name}</div>
                    {idea.description && <div className="text-sm text-stone-600 mt-0.5">{idea.description}</div>}
                    <div className="text-xs text-stone-400 mt-1">{idea.interestCount} interested</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => toggleInterest(idea)}
                    disabled={togglingId === idea.id}
                    className={`w-full sm:w-auto px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap transition disabled:opacity-50 ${
                      idea.isInterested
                        ? 'bg-brand-600 text-white hover:bg-brand-700'
                        : 'bg-white border border-brand-600 text-brand-700 hover:bg-brand-50'
                    }`}
                  >
                    {idea.isInterested ? "I'm interested ✓" : "I'm interested"}
                  </button>
                </div>
              ))}
            </div>
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
