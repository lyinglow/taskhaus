import { useState, useEffect } from 'react';
import api from '../api';

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

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!ledger) {
    return <div>Failed to load ledger</div>;
  }

  return (
    <div className="space-y-8">
      <section>
        <h2 className="text-xl font-bold text-gray-900 mb-4">Crew Earnings Summary</h2>
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Crew Member</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Jobs Completed</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Total Earned</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {ledger.summary && ledger.summary.length > 0 ? (
                ledger.summary.map(row => (
                  <tr key={row.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{row.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{row.jobs_completed || 0}</td>
                    <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                      ${(row.earned || 0).toFixed(2)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3" className="px-6 py-4 text-center text-gray-600">
                    No earnings yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2 className="text-xl font-bold text-gray-900 mb-4">Transaction History</h2>
        <div className="space-y-3">
          {ledger.detailed && ledger.detailed.length > 0 ? (
            ledger.detailed.map(payment => (
              <div key={payment.id} className="bg-white p-4 rounded-lg border border-gray-200">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-semibold text-gray-900">{payment.crew_name}</div>
                    <div className="text-sm text-gray-600">Job #{payment.job_id} • {payment.service_name}</div>
                    <div className="text-sm text-gray-600">
                      {new Date(payment.created_at).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-gray-900">${payment.amount.toFixed(2)}</div>
                    <div className={`text-xs font-semibold mt-1 ${
                      payment.status === 'completed'
                        ? 'text-green-700'
                        : 'text-yellow-700'
                    }`}>
                      {payment.status === 'completed' ? '✓ Paid' : 'Pending'}
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-600">
              No transactions yet
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
