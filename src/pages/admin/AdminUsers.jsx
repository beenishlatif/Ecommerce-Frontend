import { useEffect, useState } from 'react';
import { UserCog } from 'lucide-react';
import { adminApi } from '../../api/endpoints.js';
import LoadingScreen from '../../components/LoadingScreen.jsx';
import EmptyState from '../../components/EmptyState.jsx';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    adminApi.users().then((res) => setUsers(res.data?.data || [])).catch((err) => setError(err.message)).finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-display font-semibold text-charcoal-800 mb-6">Admin Users</h1>
      {loading ? <LoadingScreen /> : error ? (
        <EmptyState icon={UserCog} title="Couldn't load users" description={error} />
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="text-left text-charcoal-400 border-b border-charcoal-800/10">
              <th className="p-4">Name</th><th className="p-4">Email</th><th className="p-4">Active</th>
            </tr></thead>
            <tbody>
              {users.map((u) => (
                <tr key={u._id} className="border-b border-charcoal-800/5 last:border-0">
                  <td className="p-4 font-medium text-charcoal-800">{u.name}</td>
                  <td className="p-4 text-charcoal-500">{u.email}</td>
                  <td className="p-4 text-charcoal-500">{u.isActive ? 'Yes' : 'No'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
