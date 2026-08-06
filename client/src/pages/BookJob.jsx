import { useState } from 'react';
import api from '../api';

export default function BookJob({ onNavigate }) {
  const selectedServiceId = localStorage.getItem('selectedServiceId');
  const selectedServiceName = localStorage.getItem('selectedServiceName');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const payload = {
        serviceId: parseInt(selectedServiceId)
      };

      if (notes) {
        payload.customRequest = notes;
      }

      const response = await api.post('/jobs', payload);

      setSuccess(true);
      setTimeout(() => {
        onNavigate('parent-dashboard');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create job');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="container py-12 max-w-2xl text-center">
        <div className="bg-green-50 p-8 rounded-lg border border-green-200">
          <div className="text-4xl mb-4">✓</div>
          <h2 className="text-2xl font-bold text-green-700 mb-2">Request Submitted!</h2>
          <p className="text-gray-600 mb-4">We'll review your request and send you a confirmation soon.</p>
          <p className="text-sm text-gray-500">Redirecting to dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8 max-w-2xl">
      <div className="bg-white p-8 rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">{selectedServiceName}</h1>
        <p className="text-gray-600 mb-6">Complete your booking request</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Additional Details (optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Tell us any specific details or requirements..."
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <p className="text-sm text-gray-700">
              <strong>Next step:</strong> You'll receive a confirmation email once we've reviewed and assigned a crew member to your job.
            </p>
          </div>

          {error && <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm">{error}</div>}

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 transition"
            >
              {loading ? 'Submitting...' : 'Submit Request'}
            </button>
            <button
              type="button"
              onClick={() => onNavigate('browse-services')}
              className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg font-semibold hover:bg-gray-300 transition"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
