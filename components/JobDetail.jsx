'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import api from '@/lib/api';

export default function JobDetail({ jobId, onNavigate }) {
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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
    const labels = { pending: 'Pending Review', quoted: 'Quote Received', confirmed: 'Confirmed', completed: 'Completed' };
    return labels[status] || status;
  };

  const getCost = (job) => {
    if (job.finalPrice) return { label: 'Price', value: job.finalPrice, from: false };
    if (job.quotedPrice) return { label: 'Quote', value: job.quotedPrice, from: false };
    if (job.service?.price) return { label: 'Cost', value: job.service.price, from: true };
    return null;
  };

  if (loading) return <div className="container py-8">Loading...</div>;
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
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-brand-100 text-brand-800 whitespace-nowrap">
              {getStatusLabel(job.status)}
            </span>
          </div>
          <div className="text-sm text-stone-500 mb-6">Service #{job.id}</div>

          {job.service?.longDescription || job.service?.description ? (
            <p className="text-stone-600 mb-6">{job.service.longDescription || job.service.description}</p>
          ) : null}

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
