'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import Spinner from './Spinner';

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

  if (loading) return <div className="flex justify-center py-8"><Spinner /></div>;

  return (
    <div className="space-y-10">
      <section>
        <h2 className="text-xl font-bold text-stone-900 mb-4">Team Member Earnings</h2>
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-stone-50">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-stone-700">Team Member</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-stone-700">Services</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-stone-700">Earned</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-200">
              {ledger?.summary?.map(row => (
                <tr key={row.id}>
                  <td className="px-6 py-4 text-sm font-medium text-stone-900">{row.name}</td>
                  <td className="px-6 py-4 text-sm text-stone-600">{row.jobs_completed}</td>
                  <td className="px-6 py-4 text-sm font-semibold text-stone-900">£{(row.earned || 0).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2 className="text-xl font-bold text-stone-900 mb-4">Transactions</h2>
        <div className="space-y-3">
          {ledger?.detailed?.map(payment => (
            <div key={payment.id} className="bg-white p-5 rounded-lg border border-stone-200">
              <div className="flex justify-between">
                <div><div className="font-semibold text-stone-900">{payment.crewName}</div><div className="text-sm text-stone-600">{payment.serviceName}</div></div>
                <div className="text-right"><div className="text-lg font-bold text-stone-900">£{payment.amount.toFixed(2)}</div></div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
