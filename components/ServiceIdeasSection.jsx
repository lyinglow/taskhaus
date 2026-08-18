'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';

export default function ServiceIdeasSection() {
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

  if (loading || ideas.length === 0) return null;

  return (
    <section className="mb-14">
      <h2 className="text-2xl font-bold text-stone-900 mb-1">Vote for a service ({ideas.length})</h2>
      <p className="text-stone-600 text-sm mb-5">
        These aren't services we offer yet - tell us you're interested and it helps us decide what to add next.
      </p>
      <div className="space-y-3">
        {ideas.map((idea) => (
          <div key={idea.id} className="bg-white flex flex-col items-start sm:flex-row sm:justify-between sm:items-center gap-3 border border-stone-200 rounded-lg p-4">
            <div>
              <div className="font-semibold text-stone-900">{idea.name}</div>
              {idea.description && <div className="text-sm text-stone-600 mt-0.5">{idea.description}</div>}
              <div className="text-xs text-stone-400 mt-1">{idea.interestCount} interested</div>
            </div>
            <button
              type="button"
              onClick={() => toggleInterest(idea)}
              disabled={togglingId === idea.id}
              className={`self-end sm:self-auto px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap transition disabled:opacity-50 ${
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
    </section>
  );
}
