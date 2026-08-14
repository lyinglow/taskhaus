'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import api from '@/lib/api';
import Spinner from './Spinner';

export default function JobDetail({ jobId, onNavigate }) {
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    fetchJob();
  }, [jobId]);

  const fetchJob = async () => {
    try {
      const response = await api.get(`/jobs/${jobId}`);
      setJob(response.data);
    } catch (err) {
      setError('Failed to load task');
    } finally {
      setLoading(false);
    }
  };

  const getStatusLabel = (status) => {
    const labels = { pending: 'Pending Review', quoted: 'Quote Received', confirmed: 'Confirmed', review: 'Final Checks', completed: 'Completed', cancelled: 'Cancelled' };
    return labels[status] || status;
  };

  const handleCancel = async () => {
    if (!confirm('Cancel this request?')) return;
    setCancelling(true);
    try {
      await api.patch(`/jobs/${job.id}`, { status: 'cancelled' });
      setJob((prev) => ({ ...prev, status: 'cancelled' }));
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to cancel request');
    } finally {
      setCancelling(false);
    }
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

  if (loading) return <div className="container py-8 flex justify-center"><Spinner /></div>;
  if (error || !job) return <div className="container py-8">{error || 'Task not found'}</div>;

  const cost = getCost(job);

  return (
    <div className="min-h-screen px-4 py-10 relative overflow-hidden">
      <Image src="/garden-mist-bg.png" alt="" fill className="object-cover -z-10 grayscale" sizes="100vw" />
      <div className="absolute inset-0 bg-stone-50/70" />
      <div className="relative z-10 max-w-2xl mx-auto">
        <button
          type="button"
          onClick={() => onNavigate('job-history')}
          className="flex items-center gap-1 text-stone-600 hover:text-stone-900 font-medium mb-5 transition"
        >
          <span className="text-lg">←</span> Back to Current Tasks
        </button>

        <div className="bg-white p-8 sm:p-10 rounded-lg shadow-lg">
          <div className="flex justify-between items-start gap-3 mb-2">
            <h1 className="text-2xl font-bold text-stone-900">{job.serviceName || 'Custom Request'}</h1>
            <span className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${job.status === 'review' ? 'bg-accent-100 text-accent-800' : job.status === 'cancelled' ? 'bg-stone-200 text-stone-600' : 'bg-brand-100 text-brand-800'}`}>
              {getStatusLabel(job.status)}
            </span>
          </div>
          {job.recurrence && (
            <div className="text-sm text-accent-700 mb-4">🔁 Repeats {recurrenceLabel(job.recurrence)}</div>
          )}

          {job.service?.longDescription || job.service?.description ? (
            <p className="text-stone-600 mb-6">{job.service.longDescription || job.service.description}</p>
          ) : null}

          {(job.photoBeforeUrl || job.photoAfterUrl) && (
            <div className="grid grid-cols-2 gap-3 mb-6">
              {job.photoBeforeUrl && (
                <div>
                  <div className="text-sm font-medium text-stone-500 mb-1">Before</div>
                  <img src={job.photoBeforeUrl} alt="Before" className="w-full aspect-square object-cover rounded-lg border border-stone-200" />
                </div>
              )}
              {job.photoAfterUrl && (
                <div>
                  <div className="text-sm font-medium text-stone-500 mb-1">After</div>
                  <img src={job.photoAfterUrl} alt="After" className="w-full aspect-square object-cover rounded-lg border border-stone-200" />
                </div>
              )}
            </div>
          )}

          <div className="space-y-4 mb-6">
            {job.crewName && (
              <div>
                <div className="text-sm font-medium text-stone-500">Team Member</div>
                <div className="text-stone-900">{job.crewName}</div>
              </div>
            )}
            {job.timeWindow && (
              <div>
                <div className="text-sm font-medium text-stone-500">Time</div>
                <div className="text-stone-900">{job.timeWindow}</div>
              </div>
            )}
            {job.customRequest && (
              <div>
                <div className="text-sm font-medium text-stone-500">Your Notes</div>
                <div className="text-stone-900">{job.customRequest}</div>
              </div>
            )}
            {cost && (
              <div>
                <div className="text-sm font-medium text-stone-500">{cost.label}</div>
                <div className="text-xl font-bold text-brand-700">
                  {cost.from && <span className="text-[13px] font-medium align-baseline">From </span>}£{Number(cost.value).toFixed(2)}
                </div>
              </div>
            )}
          </div>

          {(job.status === 'pending' || job.status === 'quoted') && (
            <button
              onClick={handleCancel}
              disabled={cancelling}
              className="w-full bg-white border border-accent-600 text-accent-700 py-2 rounded-lg font-semibold hover:bg-accent-50 disabled:opacity-50 transition"
            >
              {cancelling ? 'Cancelling...' : 'Cancel Request'}
            </button>
          )}

          {job.status === 'completed' && !job.review && (
            <button
              onClick={() => onNavigate(`review-${job.id}`)}
              className="w-full bg-brand-600 text-white py-2 rounded-lg font-semibold hover:bg-brand-700 transition"
            >
              Leave a Review
            </button>
          )}

          {job.review && (
            <div className="mt-2 bg-stone-50 p-4 rounded-lg">
              <div className="text-yellow-500 font-semibold">★ {job.review.rating}/5</div>
              {job.review.comment && <div className="text-sm text-stone-600 mt-1">{job.review.comment}</div>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
