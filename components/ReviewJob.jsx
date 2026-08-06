'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';

export default function ReviewJob({ jobId, onNavigate }) {
  const [job, setJob] = useState(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetchJob();
  }, [jobId]);

  const fetchJob = async () => {
    try {
      const response = await api.get(`/api/jobs/${jobId}`);
      setJob(response.data);
    } catch (err) {
      setError('Failed to load job');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      await api.post('/api/reviews', { jobId, rating: parseInt(rating), comment });
      setSuccess(true);
      setTimeout(() => onNavigate('job-history'), 2000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="container py-8">Loading...</div>;
  if (!job) return <div className="container py-8">Job not found</div>;

  if (success) {
    return (
      <div className="container max-w-2xl py-12 mx-auto px-4 text-center">
        <div className="bg-green-50 p-8 rounded-lg">
          <div className="text-4xl mb-4">✓</div>
          <h2 className="text-2xl font-bold text-green-700">Thank You!</h2>
          <p className="text-gray-600">Your review has been submitted.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-2xl py-8 mx-auto px-4">
      <div className="bg-white p-8 rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Leave a Review</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-4">How would you rate this service?</label>
            <div className="flex gap-4 text-4xl">
              {[1, 2, 3, 4, 5].map(star => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className={`cursor-pointer transition ${star <= rating ? 'text-yellow-400' : 'text-gray-300'}`}
                >
                  ★
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Comments (optional)</label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Tell us what you thought..."
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {error && <div className="bg-red-50 text-red-700 p-3 rounded-lg">{error}</div>}

          <div className="flex gap-4">
            <button type="submit" disabled={submitting} className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50">
              {submitting ? 'Submitting...' : 'Submit Review'}
            </button>
            <button type="button" onClick={() => onNavigate('job-history')} className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg font-semibold hover:bg-gray-300">
              Back
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
