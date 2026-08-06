import { useState, useEffect } from 'react';
import api from '../api';

export default function JobHistory({ onNavigate }) {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const response = await api.get('/jobs');
      setJobs(response.data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)));
    } catch (err) {
      console.error('Failed to fetch jobs:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-50 border-yellow-200';
      case 'quoted':
        return 'bg-yellow-50 border-yellow-200';
      case 'confirmed':
        return 'bg-blue-50 border-blue-200';
      case 'completed':
        return 'bg-green-50 border-green-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'pending':
        return 'Pending Review';
      case 'quoted':
        return 'Quote Received';
      case 'confirmed':
        return 'Confirmed';
      case 'completed':
        return 'Completed';
      default:
        return status;
    }
  };

  return (
    <div className="container py-8 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">My Jobs</h1>
      </div>

      {loading ? (
        <div className="text-center py-8">Loading jobs...</div>
      ) : jobs.length === 0 ? (
        <div className="bg-gray-50 p-8 rounded-lg text-center">
          <p className="text-gray-600 mb-4">You haven't booked any chores yet.</p>
          <button
            onClick={() => onNavigate('browse-services')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Browse Chores
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {jobs.map(job => (
            <div
              key={job.id}
              className={`p-4 rounded-lg border ${getStatusColor(job.status)}`}
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">
                    {job.service_name || job.custom_request || 'Custom Request'}
                  </h3>
                  <div className="text-sm text-gray-600 mt-1">
                    Job #{job.id} • {new Date(job.created_at).toLocaleDateString()}
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  job.status === 'pending' || job.status === 'quoted'
                    ? 'bg-yellow-200 text-yellow-800'
                    : job.status === 'confirmed'
                    ? 'bg-blue-200 text-blue-800'
                    : 'bg-green-200 text-green-800'
                }`}>
                  {getStatusLabel(job.status)}
                </span>
              </div>

              {job.crew_name && (
                <div className="text-sm text-gray-600 mb-2">Crew: {job.crew_name}</div>
              )}

              {job.time_window && (
                <div className="text-sm text-gray-600 mb-2">Time: {job.time_window}</div>
              )}

              {(job.final_price || job.quoted_price) && (
                <div className="text-lg font-bold text-gray-900 mb-3">
                  ${job.final_price || job.quoted_price}
                </div>
              )}

              {job.status === 'quoted' && job.quoted_price && (
                <div className="bg-white p-3 rounded mb-3 border border-yellow-100">
                  <p className="text-sm font-semibold text-gray-800">Quote Received</p>
                  <p className="text-sm text-gray-600">We've provided a quote. Please check your email to confirm.</p>
                </div>
              )}

              {job.status === 'completed' && (
                <button
                  onClick={() => onNavigate(`review-${job.id}`)}
                  className="w-full bg-green-600 text-white py-2 rounded-lg font-semibold hover:bg-green-700 transition mt-2"
                >
                  Leave a Review
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
