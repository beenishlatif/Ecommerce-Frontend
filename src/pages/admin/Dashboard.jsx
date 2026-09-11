import { useEffect, useState } from 'react';
import { Package, ShoppingCart, Users, DollarSign, AlertTriangle } from 'lucide-react';
import { adminApi } from '../../api/endpoints.js';
import LoadingScreen from '../../components/LoadingScreen.jsx';
import EmptyState from '../../components/EmptyState.jsx';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    adminApi
      .dashboard()
      .then((res) => setStats(res.data.data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingScreen />;
  if (error) return <EmptyState title="Couldn't load dashboard" description={error} />;

  const cards = [
    { label: 'Total Orders', value: stats.totalOrders, icon: ShoppingCart },
    { label: 'Total Products', value: stats.totalProducts, icon: Package },
    { label: 'Total Customers', value: stats.totalCustomers, icon: Users },
    { label: 'Total Revenue', value: `Rs. ${stats.totalRevenue}`, icon: DollarSign },
  ];

  return (
    <div>
      <h1 className="text-2xl font-display font-semibold text-charcoal-800 mb-6">Dashboard</h1>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {cards.map((c) => (
          <div key={c.label} className="card p-5">
            <c.icon className="h-5 w-5 text-lilac-500 mb-3" />
            <p className="text-2xl font-semibold text-charcoal-800">{c.value}</p>
            <p className="text-xs text-charcoal-400">{c.label}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="card p-6">
          <h3 className="font-semibold text-charcoal-800 mb-4">Orders by Status</h3>
          {stats.ordersByStatus.length === 0 ? (
            <p className="text-sm text-charcoal-400">No orders yet.</p>
          ) : (
            <div className="space-y-2">
              {stats.ordersByStatus.map((s) => (
                <div key={s._id} className="flex justify-between text-sm">
                  <span className="text-charcoal-500">{s._id}</span>
                  <span className="font-medium text-charcoal-800">{s.count}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card p-6">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="h-4 w-4 text-peach-500" />
            <h3 className="font-semibold text-charcoal-800">Low Stock Products</h3>
          </div>
          {stats.lowStockProducts.length === 0 ? (
            <p className="text-sm text-charcoal-400">All products are well stocked.</p>
          ) : (
            <div className="space-y-2">
              {stats.lowStockProducts.map((p) => (
                <div key={p._id} className="flex justify-between text-sm">
                  <span className="text-charcoal-500">{p.name}</span>
                  <span className="font-medium text-blush-600">{p.stock} left</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
