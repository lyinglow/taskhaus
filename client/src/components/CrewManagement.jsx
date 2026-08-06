import { useState } from 'react';
import api from '../api';

export default function CrewManagement({ crew, onCrewUpdated }) {
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [skills, setSkills] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAdd = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await api.post('/admin/crew', {
        name,
        age: age ? parseInt(age) : null,
        skills
      });

      setName('');
      setAge('');
      setSkills('');
      onCrewUpdated();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add crew member');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid gap-8 md:grid-cols-2">
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-4">Add New Crew Member</h2>
        <form onSubmit={handleAdd} className="space-y-4 bg-white p-6 rounded-lg shadow">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Age</label>
            <input
              type="number"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              min="12"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Skills (optional)</label>
            <textarea
              value={skills}
              onChange={(e) => setSkills(e.target.value)}
              placeholder="e.g., Lawn mowing, painting, organization"
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {error && <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm">{error}</div>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Adding...' : 'Add Crew Member'}
          </button>
        </form>
      </div>

      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-4">Crew ({crew.length})</h2>
        <div className="space-y-3">
          {crew.map(member => (
            <div key={member.id} className="bg-white p-4 rounded-lg border border-gray-200">
              <div className="font-semibold text-gray-900">{member.name}</div>
              <div className="text-sm text-gray-600 mt-1">Age: {member.age || 'N/A'}</div>
              <div className="text-sm text-gray-600">Completed jobs: {member.completed_jobs || 0}</div>
              {member.skills && (
                <div className="text-sm text-gray-600 mt-1">
                  <strong>Skills:</strong> {member.skills}
                </div>
              )}
              <div className={`mt-2 inline-block px-2 py-1 rounded text-xs font-semibold ${
                member.is_available
                  ? 'bg-green-100 text-green-800'
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {member.is_available ? 'Available' : 'Unavailable'}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
