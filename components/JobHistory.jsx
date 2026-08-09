'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';

export default function JobHistory({ onNavigate }) {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const response = await api.get('/jobs');
      setJobs(response.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
    } catch (err) {
      console.error('Failed to fetch jobs:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusLabel = (status) => {
    const labels = { pending: 'Pending Review', quoted: 'Quote Received', confirmed: 'Confirmed', review: 'Final Checks', completed: 'Completed' };
    return labels[status] || status;
  };

  const getCost = (job) => {
    if (job.finalPrice) return { label: 'Price', value: job.finalPrice, from: false };
    if (job.quotedPrice) return { label: 'Quote', value: job.quotedPrice, from: false };
    if (job.service?.price) return { label: 'Cost', value: job.service.price, from: true };
    return null;
  };

  const recurrenceLabel = (recurrence) => {
    const labels = { weekly: 'Weekly', biweekly: 'Every 2 weeks', monthly: 'Monthly' };
    return labels[recurrence];
  };

  const bookAgain = (e, job) => {
    e.stopPropagation();
    if (!job.service) return;
    localStorage.setItem('selectedServiceId', job.service.id);
    localStorage.setItem('selectedServiceName', job.service.name);
    localStorage.setItem('selectedServiceDescription', job.service.description || '');
    localStorage.setItem('selectedServiceLongDescription', job.service.longDescription || job.service.description || '');
    localStorage.setItem('selectedServicePrice', job.service.price ?? '');
    onNavigate('book-job');
  };

  const pendingCount = jobs.filter(j => j.status === 'pending' || j.status === 'quoted').length;
  const confirmedCount = jobs.filter(j => j.status === 'confirmed' || j.status === 'review').length;
  const completedCount = jobs.filter(j => j.status === 'completed').length;

  return (
    <div className="container max-w-4xl py-10 mx-auto px-4">
      <h1 className="text-3xl font-bold text-stone-900 mb-6">Current Tasks</h1>

      {!loading && jobs.length > 0 && (
        <div className="grid grid-cols-3 gap-3 mb-8">
          <div className="bg-white p-4 rounded-lg border border-stone-200 text-center">
            <div className="text-2xl font-bold text-stone-900">{pendingCount}</div>
            <div className="text-sm text-stone-600">Pending</div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-stone-200 text-center">
            <div className="text-2xl font-bold text-stone-900">{confirmedCount}</div>
            <div className="text-sm text-stone-600">Confirmed</div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-stone-200 text-center">
            <div className="text-2xl font-bold text-stone-900">{completedCount}</div>
            <div className="text-sm text-stone-600">Completed</div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-center py-8">Loading jobs...</div>
      ) : jobs.length === 0 ? (
        <div className="bg-stone-100 p-10 rounded-lg text-center">
          <p className="text-stone-600 mb-4">You haven't booked any services yet.</p>
          <button onClick={() => onNavigate('browse-services')} className="bg-brand-600 text-white px-6 py-2 rounded-lg hover:bg-brand-700 transition">
            Browse Services
          </button>
        </div>
      ) : (
        <div className="space-y-5">
          {jobs.map(job => {
            const cost = getCost(job);
            return (
            <div
              key={job.id}
              onClick={() => onNavigate(`job-detail-${job.id}`)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onNavigate(`job-detail-${job.id}`); } }}
              className="bg-white p-5 rounded-lg border border-stone-200 hover:shadow-lg transition cursor-pointer"
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="text-lg font-bold text-stone-900">{job.serviceName || job.customRequest}</h3>
                  {job.recurrence && (
                    <div className="text-sm text-accent-700">🔁 Repeats {recurrenceLabel(job.recurrence)}</div>
                  )}
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${job.status === 'review' ? 'bg-accent-100 text-accent-800' : 'bg-brand-100 text-brand-800'}`}>
                  {getStatusLabel(job.status)}
                </span>
              </div>
              {job.crewName && <div className="text-sm text-stone-600">Team Member: {job.crewName}</div>}
              {job.timeWindow && <div className="text-sm text-stone-600">Time: {job.timeWindow}</div>}
              {cost && (
                <div className="text-base font-bold text-stone-900 mt-1">
                  {cost.label}: {cost.from && <span className="text-[13px] font-medium align-baseline">From </span>}£{Number(cost.value).toFixed(2)}
                </div>
              )}
              {job.status === 'completed' && !job.review && (
                <button
                  onClick={(e) => { e.stopPropagation(); onNavigate(`review-${job.id}`); }}
                  className="mt-3 w-full bg-brand-600 text-white py-2 rounded-lg font-semibold hover:bg-brand-700"
                >
                  Leave a Review
                </button>
              )}
              {job.status === 'completed' && job.service && (
                <button
                  onClick={(e) => bookAgain(e, job)}
                  className="mt-2 w-full bg-white border border-brand-600 text-brand-700 py-2 rounded-lg font-semibold hover:bg-brand-50"
                >
                  Book Again
                </button>
              )}
            </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
