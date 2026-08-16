'use client';

import { useState } from 'react';
import api from '@/lib/api';

export default function CrewManagement({ crew, onCrewUpdated }) {
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [skills, setSkills] = useState('');
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});
  const [showAddForm, setShowAddForm] = useState(false);

  const handleAdd = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/admin/crew', { name, age: age ? parseInt(age) : null, skills, pin });
      setName('');
      setAge('');
      setSkills('');
      setPin('');
      setShowAddForm(false);
      onCrewUpdated();
    } catch (err) {
      console.error('Failed to add crew:', err);
    } finally {
      setLoading(false);
    }
  };

  const startEditing = (member) => {
    setEditingId(member.id);
    setEditData({ name: member.name, age: member.age || '', skills: member.skills || '', pin: '' });
  };

  const handleUpdate = async (memberId) => {
    setLoading(true);
    try {
      await api.patch(`/admin/crew/${memberId}`, {
        name: editData.name,
        age: editData.age ? parseInt(editData.age) : null,
        skills: editData.skills,
        pin: editData.pin || undefined,
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
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-stone-900">Team members ({crew.length})</h2>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-brand-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-brand-700"
        >
          {showAddForm ? 'Cancel' : '+ Add team member'}
        </button>
      </div>

      {showAddForm && (
        <form onSubmit={handleAdd} className="space-y-4 bg-white p-6 rounded-lg shadow mb-6">
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" required className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500" />
          <input type="number" value={age} onChange={(e) => setAge(e.target.value)} placeholder="Age" className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500" />
          <textarea value={skills} onChange={(e) => setSkills(e.target.value)} placeholder="Skills" rows={3} className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500" />
          <input type="text" inputMode="numeric" value={pin} onChange={(e) => setPin(e.target.value)} placeholder="4-digit PIN (for team login)" maxLength={4} className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500" />
          <button type="submit" disabled={loading} className="w-full sm:w-auto sm:px-8 bg-brand-600 text-white py-2 rounded-lg font-semibold hover:bg-brand-700 disabled:opacity-50">
            {loading ? 'Adding...' : 'Add team member'}
          </button>
        </form>
      )}

      <div className="space-y-3">
        {crew.map(member => (
            <div key={member.id} className="bg-white p-5 rounded-lg border border-stone-200">
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
                  <input
                    type="text"
                    inputMode="numeric"
                    value={editData.pin}
                    onChange={(e) => setEditData({ ...editData, pin: e.target.value })}
                    placeholder="New 4-digit PIN (leave blank to keep current)"
                    maxLength={4}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleUpdate(member.id)}
                      disabled={loading}
                      className="flex-1 sm:flex-none sm:px-6 bg-brand-700 text-white py-1 rounded text-sm font-semibold hover:bg-brand-800 disabled:opacity-50"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="flex-1 sm:flex-none sm:px-6 bg-accent-600 text-white py-1 rounded text-sm font-semibold hover:bg-accent-700"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex justify-between items-start gap-2">
                    <div className="font-semibold text-stone-900">{member.name}</div>
                    <span className={`text-xs font-medium px-2 py-1 rounded-full whitespace-nowrap ${member.hasPin ? 'bg-brand-50 text-brand-700' : 'bg-stone-100 text-stone-500'}`}>
                      {member.hasPin ? 'Login enabled' : 'No login'}
                    </span>
                  </div>
                  <div className="text-sm text-stone-600">Age: {member.age || 'N/A'} • Services: {member.completedJobs || 0}</div>
                  {member.skills && <div className="text-sm text-stone-600 mt-1">{member.skills}</div>}
                  <button
                    onClick={() => startEditing(member)}
                    className="w-full sm:w-auto sm:px-6 bg-brand-600 text-white py-1 rounded text-sm font-semibold hover:bg-brand-700 mt-3"
                  >
                    Edit
                  </button>
                </>
              )}
            </div>
        ))}
      </div>
    </div>
  );
}
