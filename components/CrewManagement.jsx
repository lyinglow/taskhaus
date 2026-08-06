'use client';

import { useState } from 'react';
import api from '@/lib/api';

export default function CrewManagement({ crew, onCrewUpdated }) {
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [skills, setSkills] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAdd = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/api/admin/crew', { name, age: age ? parseInt(age) : null, skills });
      setName('');
      setAge('');
      setSkills('');
      onCrewUpdated();
    } catch (err) {
      console.error('Failed to add crew:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid gap-8 md:grid-cols-2">
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-4">Add Crew Member</h2>
        <form onSubmit={handleAdd} className="space-y-4 bg-white p-6 rounded-lg shadow">
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" required className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
          <input type="number" value={age} onChange={(e) => setAge(e.target.value)} placeholder="Age" className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
          <textarea value={skills} onChange={(e) => setSkills(e.target.value)} placeholder="Skills" rows={3} className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
          <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50">
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
              <div className="text-sm text-gray-600">Age: {member.age || 'N/A'} • Jobs: {member.completedJobs || 0}</div>
              {member.skills && <div className="text-sm text-gray-600 mt-1">{member.skills}</div>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
