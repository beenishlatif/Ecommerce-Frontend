import { useEffect, useState } from 'react';
import { Users } from 'lucide-react';
import { adminApi } from '../../api/endpoints.js';
import LoadingScreen from '../../components/LoadingScreen.jsx';
import EmptyState from '../../components/EmptyState.jsx';

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    adminApi.customers().then((res) => setCustomers(res.data?.data || [])).catch((err) => setError(err.message)).finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-display font-semibold text-charcoal-800 mb-6">Customers</h1>
      {loading ? <LoadingScreen /> : error ? (
        <EmptyState icon={Users} title="Couldn't load customers" description={error} />
      ) : customers.length === 0 ? (
        <EmptyState icon={Users} title="No customers yet" />
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="text-left text-charcoal-400 border-b border-charcoal-800/10">
              <th className="p-4">Name</th><th className="p-4">Email</th><th className="p-4">Joined</th>
            </tr></thead>
            <tbody>
              {customers.map((c) => (
                <tr key={c._id} className="border-b border-charcoal-800/5 last:border-0">
                  <td className="p-4 font-medium text-charcoal-800">{c.name}</td>
                  <td className="p-4 text-charcoal-500">{c.email}</td>
                  <td className="p-4 text-charcoal-500">{new Date(c.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
