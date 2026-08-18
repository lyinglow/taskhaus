'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import Spinner from './Spinner';

export default function Dashboard({ onNavigate }) {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const response = await api.get('/jobs');
      setJobs(response.data);
    } catch (err) {
      console.error('Failed to fetch jobs:', err);
    } finally {
      setLoading(false);
    }
  };

  const pendingCount = jobs.filter(j => j.status === 'pending' || j.status === 'quoted').length;
  const confirmedCount = jobs.filter(j => j.status === 'confirmed' || j.status === 'review').length;
  const completedCount = jobs.filter(j => j.status === 'completed').length;

  return (
    <div className="container max-w-4xl py-10 mx-auto px-4">
      <h1 className="text-3xl font-bold text-stone-900 mb-2">Your dashboard</h1>
      <p className="text-stone-600 mb-8">
        From garden upkeep like grass cutting and hedge trimming to everyday help like bin
        duties and local errands, our team can lend a hand around your home. Book in a couple
        of taps, done by our supervised local team.
      </p>

      {loading ? (
        <div className="flex justify-center py-8"><Spinner /></div>
      ) : (
        <>
          {jobs.length > 0 && (
            <div className="grid grid-cols-3 gap-3 mb-10">
              <button type="button" onClick={() => onNavigate('job-history-pending')} className="bg-white p-4 rounded-lg border border-stone-200 text-center hover:shadow-lg hover:border-brand-300 transition">
                <div className="text-2xl font-bold text-stone-900">{pendingCount}</div>
                <div className="text-sm text-stone-600">Pending</div>
              </button>
              <button type="button" onClick={() => onNavigate('job-history-confirmed')} className="bg-white p-4 rounded-lg border border-stone-200 text-center hover:shadow-lg hover:border-brand-300 transition">
                <div className="text-2xl font-bold text-stone-900">{confirmedCount}</div>
                <div className="text-sm text-stone-600">Confirmed</div>
              </button>
              <button type="button" onClick={() => onNavigate('job-history-completed')} className="bg-white p-4 rounded-lg border border-stone-200 text-center hover:shadow-lg hover:border-brand-300 transition">
                <div className="text-2xl font-bold text-stone-900">{completedCount}</div>
                <div className="text-sm text-stone-600">Completed</div>
              </button>
            </div>
          )}

          <div className="bg-white p-6 rounded-lg border border-stone-200 text-center">
            <p className="text-stone-600 mb-4">Ready to book something, or see what's on offer?</p>
            <button
              type="button"
              onClick={() => onNavigate('browse-services')}
              className="px-8 py-2 bg-brand-600 text-white rounded-lg font-semibold hover:bg-brand-700 transition"
            >
              Browse services
            </button>
          </div>
        </>
      )}
    </div>
  );
}
