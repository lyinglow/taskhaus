'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';

export default function Ledger() {
  const [ledger, setLedger] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLedger();
  }, []);

  const fetchLedger = async () => {
    try {
      const response = await api.get('/admin/ledger');
      setLedger(response.data);
    } catch (err) {
      console.error('Failed to fetch ledger:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="space-y-8">
      <section>
        <h2 className="text-xl font-bold text-gray-900 mb-4">Team Member Earnings</h2>
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Team Member</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Services</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Earned</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {ledger?.summary?.map(row => (
                <tr key={row.id}>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{row.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{row.jobs_completed}</td>
                  <td className="px-6 py-4 text-sm font-semibold text-gray-900">${(row.earned || 0).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2 className="text-xl font-bold text-gray-900 mb-4">Transactions</h2>
        <div className="space-y-3">
          {ledger?.detailed?.map(payment => (
            <div key={payment.id} className="bg-white p-4 rounded-lg border border-gray-200">
              <div className="flex justify-between">
                <div><div className="font-semibold text-gray-900">{payment.crewName}</div><div className="text-sm text-gray-600">{payment.serviceName}</div></div>
                <div className="text-right"><div className="text-lg font-bold text-gray-900">${payment.amount.toFixed(2)}</div></div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
