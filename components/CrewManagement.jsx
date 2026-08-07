'use client';

import { useState } from 'react';
import api from '@/lib/api';

export default function CrewManagement({ crew, onCrewUpdated }) {
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [skills, setSkills] = useState('');
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});

  const handleAdd = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/admin/crew', { name, age: age ? parseInt(age) : null, skills });
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

  const startEditing = (member) => {
    setEditingId(member.id);
    setEditData({ name: member.name, age: member.age || '', skills: member.skills || '' });
  };

  const handleUpdate = async (memberId) => {
    setLoading(true);
    try {
      await api.patch(`/admin/crew/${memberId}`, {
        name: editData.name,
        age: editData.age ? parseInt(editData.age) : null,
        skills: editData.skills,
      });
      setEditingId(null);
      setEditData({});
      onCrewUpdated();
    } catch (err) {
      console.error('Failed to update crew member:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid gap-8 md:grid-cols-2">
      <div>
        <h2 className="text-xl font-bold text-stone-900 mb-4">Add Team Member</h2>
        <form onSubmit={handleAdd} className="space-y-4 bg-white p-6 rounded-lg shadow">
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" required className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500" />
          <input type="number" value={age} onChange={(e) => setAge(e.target.value)} placeholder="Age" className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500" />
          <textarea value={skills} onChange={(e) => setSkills(e.target.value)} placeholder="Skills" rows={3} className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500" />
          <button type="submit" disabled={loading} className="w-full bg-brand-600 text-white py-2 rounded-lg font-semibold hover:bg-brand-700 disabled:opacity-50">
            {loading ? 'Adding...' : 'Add Team Member'}
          </button>
        </form>
      </div>

      <div>
        <h2 className="text-xl font-bold text-stone-900 mb-4">Team Members ({crew.length})</h2>
        <div className="space-y-3">
          {crew.map(member => (
            <div key={member.id} className="bg-white p-4 rounded-lg border border-stone-200">
              {editingId === member.id ? (
                <div className="space-y-3">
                  <input
                    type="text"
                    value={editData.name}
                    onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                  <input
                    type="number"
                    value={editData.age}
                    onChange={(e) => setEditData({ ...editData, age: e.target.value })}
                    placeholder="Age"
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                  <textarea
                    value={editData.skills}
                    onChange={(e) => setEditData({ ...editData, skills: e.target.value })}
                    placeholder="Skills"
                    rows={2}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleUpdate(member.id)}
                      disabled={loading}
                      className="flex-1 bg-brand-700 text-white py-1 rounded text-sm font-semibold hover:bg-brand-800 disabled:opacity-50"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="flex-1 bg-stone-300 text-stone-700 py-1 rounded text-sm font-semibold hover:bg-stone-400"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="font-semibold text-stone-900">{member.name}</div>
                  <div className="text-sm text-stone-600">Age: {member.age || 'N/A'} • Services: {member.completedJobs || 0}</div>
                  {member.skills && <div className="text-sm text-stone-600 mt-1">{member.skills}</div>}
                  <button
                    onClick={() => startEditing(member)}
                    className="w-full bg-brand-600 text-white py-1 rounded text-sm font-semibold hover:bg-brand-700 mt-3"
                  >
                    Edit
                  </button>
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
