import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ClipboardList } from 'lucide-react';
import { adminApi } from '../../api/endpoints.js';
import LoadingScreen from '../../components/LoadingScreen.jsx';
import EmptyState from '../../components/EmptyState.jsx';

const statuses = ['Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = () => {
    setLoading(true);
    adminApi.orders
      .list({ search: search || undefined, status: statusFilter || undefined })
      .then((res) => setOrders(res.data?.data || []))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(load, [search, statusFilter]);

  const handleStatusChange = async (id, status) => {
    await adminApi.orders.updateStatus(id, status).catch((err) => alert(err.message));
    load();
  };

  return (
    <div>
      <h1 className="text-2xl font-display font-semibold text-charcoal-800 mb-6">Orders</h1>
      <div className="flex gap-3 mb-5">
        <input className="input-field !w-64" placeholder="Search by order #" value={search} onChange={(e) => setSearch(e.target.value)} />
        <select className="input-field !w-48" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">All Statuses</option>
          {statuses.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {loading ? (
        <LoadingScreen />
      ) : error ? (
        <EmptyState icon={ClipboardList} title="Couldn't load orders" description={error} />
      ) : orders.length === 0 ? (
        <EmptyState icon={ClipboardList} title="No orders found" />
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-charcoal-400 border-b border-charcoal-800/10">
                <th className="p-4">Order #</th>
                <th className="p-4">Customer</th>
                <th className="p-4">Total</th>
                <th className="p-4">Status</th>
                <th className="p-4"></th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o._id} className="border-b border-charcoal-800/5 last:border-0">
                  <td className="p-4 font-medium text-charcoal-800">{o.orderNumber}</td>
                  <td className="p-4 text-charcoal-500">{o.user?.name || '—'}</td>
                  <td className="p-4 text-charcoal-500">Rs. {o.total}</td>
                  <td className="p-4">
                    <select className="input-field !py-1.5 !text-xs" value={o.status} onChange={(e) => handleStatusChange(o._id, e.target.value)}>
                      {statuses.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </td>
                  <td className="p-4">
                    <Link to={`/admin/orders/${o._id}`} className="text-lilac-500 text-xs font-medium">View</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
