'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import Spinner from './Spinner';

const FILTER_LABELS = { pending: 'Pending tasks', confirmed: 'Confirmed tasks', completed: 'Completed tasks' };
const FILTER_MATCH = {
  pending: (status) => status === 'pending' || status === 'quoted',
  confirmed: (status) => status === 'confirmed' || status === 'review',
  completed: (status) => status === 'completed',
};

export default function JobHistory({ onNavigate, filterStatus }) {
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
    const labels = { pending: 'Pending review', quoted: 'Quote received', confirmed: 'Confirmed', review: 'Final checks', completed: 'Completed', cancelled: 'Cancelled' };
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
  const activeJobs = jobs
    .filter(j => j.status !== 'cancelled')
    .filter(j => !filterStatus || FILTER_MATCH[filterStatus]?.(j.status));
  const cancelledJobs = filterStatus ? [] : jobs.filter(j => j.status === 'cancelled');

  const JobCard = ({ job }) => {
    const cost = getCost(job);
    return (
      <div
        onClick={() => onNavigate(`job-detail-${job.id}`)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onNavigate(`job-detail-${job.id}`); } }}
        className="bg-white p-5 rounded-lg border border-stone-200 hover:shadow-lg transition cursor-pointer"
      >
        <div className="flex justify-between items-start mb-3">
          <div>
            <h3 className="text-lg font-bold text-stone-900">{job.serviceName || job.customRequest}</h3>
            {job.createdAt && (
              <div className="text-xs text-stone-400">Requested on {new Date(job.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
            )}
            {job.recurrence && (
              <div className="text-sm text-accent-700">🔁 Repeats {recurrenceLabel(job.recurrence)}</div>
            )}
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${job.status === 'review' ? 'bg-accent-100 text-accent-800' : job.status === 'cancelled' ? 'bg-stone-200 text-stone-600' : 'bg-brand-100 text-brand-800'}`}>
            {getStatusLabel(job.status)}
          </span>
        </div>
        {job.crewName && <div className="text-sm text-stone-600">Team member: {job.crewName}</div>}
        {job.timeWindow && <div className="text-sm text-stone-600">Time: {job.timeWindow}</div>}
        {job.extras && job.extras.length > 0 && (
          <div className="text-sm text-stone-600">Extras: {job.extras.map(e => e.name).join(', ')}</div>
        )}
        {cost && (
          <div className="text-base font-bold text-stone-900 mt-1">
            {cost.label}: {cost.from && <span className="text-[13px] font-medium align-baseline">From </span>}£{Number(cost.value).toFixed(2)}
          </div>
        )}
        {job.status === 'completed' && !job.review && (
          <button
            onClick={(e) => { e.stopPropagation(); onNavigate(`review-${job.id}`); }}
            className="mt-3 w-full sm:w-auto sm:px-8 bg-brand-600 text-white py-2 rounded-lg font-semibold hover:bg-brand-700"
          >
            Leave a review
          </button>
        )}
        {job.status === 'completed' && job.service && (
          <button
            onClick={(e) => bookAgain(e, job)}
            className="mt-2 w-full sm:w-auto sm:px-8 bg-white border border-brand-600 text-brand-700 py-2 rounded-lg font-semibold hover:bg-brand-50"
          >
            Book again
          </button>
        )}
      </div>
    );
  };

  return (
    <div className="container max-w-4xl py-10 mx-auto px-4">
      <button
        type="button"
        onClick={() => onNavigate('browse-services')}
        className="flex items-center gap-1 text-stone-600 hover:text-stone-900 font-medium mb-5 transition"
      >
        <span className="text-lg">←</span> Back to services
      </button>

      <div className="flex justify-between items-center gap-3 mb-6">
        <h1 className="text-3xl font-bold text-stone-900">{filterStatus ? FILTER_LABELS[filterStatus] : 'Current tasks'}</h1>
        {filterStatus && (
          <button
            type="button"
            onClick={() => onNavigate('job-history')}
            className="text-sm font-medium text-brand-700 hover:text-brand-800"
          >
            View all
          </button>
        )}
      </div>

      {!loading && jobs.length > 0 && (
        <div className="grid grid-cols-3 gap-3 mb-8">
          <button type="button" onClick={() => onNavigate('job-history-pending')} className={`bg-white p-4 rounded-lg border text-center transition ${filterStatus === 'pending' ? 'border-brand-500 ring-1 ring-brand-500' : 'border-stone-200 hover:shadow-lg hover:border-brand-300'}`}>
            <div className="text-2xl font-bold text-stone-900">{pendingCount}</div>
            <div className="text-sm text-stone-600">Pending</div>
          </button>
          <button type="button" onClick={() => onNavigate('job-history-confirmed')} className={`bg-white p-4 rounded-lg border text-center transition ${filterStatus === 'confirmed' ? 'border-brand-500 ring-1 ring-brand-500' : 'border-stone-200 hover:shadow-lg hover:border-brand-300'}`}>
            <div className="text-2xl font-bold text-stone-900">{confirmedCount}</div>
            <div className="text-sm text-stone-600">Confirmed</div>
          </button>
          <button type="button" onClick={() => onNavigate('job-history-completed')} className={`bg-white p-4 rounded-lg border text-center transition ${filterStatus === 'completed' ? 'border-brand-500 ring-1 ring-brand-500' : 'border-stone-200 hover:shadow-lg hover:border-brand-300'}`}>
            <div className="text-2xl font-bold text-stone-900">{completedCount}</div>
            <div className="text-sm text-stone-600">Completed</div>
          </button>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-8"><Spinner /></div>
      ) : jobs.length === 0 ? (
        <div className="bg-stone-100 p-10 rounded-lg text-center">
          <p className="text-stone-600 mb-4">You haven't booked any services yet.</p>
          <button onClick={() => onNavigate('browse-services')} className="bg-brand-600 text-white px-6 py-2 rounded-lg hover:bg-brand-700 transition">
            Browse services
          </button>
        </div>
      ) : activeJobs.length === 0 ? (
        <div className="bg-stone-100 p-10 rounded-lg text-center">
          <p className="text-stone-600">No {filterStatus} tasks right now.</p>
        </div>
      ) : (
        <div className="space-y-8">
          <div className="space-y-5">
            {activeJobs.map(job => <JobCard key={job.id} job={job} />)}
          </div>

          {cancelledJobs.length > 0 && (
            <div>
              <h2 className="text-lg font-bold text-stone-500 mb-4">Cancelled</h2>
              <div className="space-y-5">
                {cancelledJobs.map(job => <JobCard key={job.id} job={job} />)}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
