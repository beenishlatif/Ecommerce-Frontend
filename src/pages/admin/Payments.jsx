import { useEffect, useState } from 'react';
import { CreditCard } from 'lucide-react';
import { adminApi } from '../../api/endpoints.js';
import LoadingScreen from '../../components/LoadingScreen.jsx';
import EmptyState from '../../components/EmptyState.jsx';

export default function Payments() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    adminApi.payments.list().then((res) => setPayments(res.data?.data || [])).catch((err) => setError(err.message)).finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-display font-semibold text-charcoal-800 mb-6">Payments</h1>
      {loading ? <LoadingScreen /> : error ? (
        <EmptyState icon={CreditCard} title="Couldn't load payments" description={error} />
      ) : payments.length === 0 ? (
        <EmptyState icon={CreditCard} title="No payments yet" />
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="text-left text-charcoal-400 border-b border-charcoal-800/10">
              <th className="p-4">Order</th><th className="p-4">Customer</th><th className="p-4">Method</th><th className="p-4">Amount</th><th className="p-4">Status</th>
            </tr></thead>
            <tbody>
              {payments.map((p) => (
                <tr key={p._id} className="border-b border-charcoal-800/5 last:border-0">
                  <td className="p-4 font-medium text-charcoal-800">{p.order?.orderNumber}</td>
                  <td className="p-4 text-charcoal-500">{p.user?.name}</td>
                  <td className="p-4 text-charcoal-500 uppercase text-xs">{p.method}</td>
                  <td className="p-4 text-charcoal-500">Rs. {p.amount}</td>
                  <td className="p-4 text-charcoal-500 capitalize">{p.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
