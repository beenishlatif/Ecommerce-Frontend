import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ClipboardList } from 'lucide-react';
import { orderApi } from '../api/endpoints.js';
import PageHeader from '../components/PageHeader.jsx';
import LoadingScreen from '../components/LoadingScreen.jsx';
import EmptyState from '../components/EmptyState.jsx';

const statusColor = {
  Pending: 'bg-peach-100 text-peach-700',
  Confirmed: 'bg-lilac-100 text-lilac-700',
  Processing: 'bg-lilac-100 text-lilac-700',
  Shipped: 'bg-blush-100 text-blush-700',
  Delivered: 'bg-green-100 text-green-700',
  Cancelled: 'bg-red-100 text-red-700',
};

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    orderApi
      .mine()
      .then((res) => setOrders(res.data?.data || []))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <PageHeader title="Order History" />
      <div className="section-padding">
        {loading ? (
          <LoadingScreen />
        ) : error ? (
          <EmptyState icon={ClipboardList} title="Couldn't load orders" description={error} />
        ) : orders.length === 0 ? (
          <EmptyState icon={ClipboardList} title="No orders yet" description="Your past orders will show up here." />
        ) : (
          <div className="space-y-4 max-w-2xl mx-auto">
            {orders.map((order) => (
              <Link key={order._id} to={`/orders/${order._id}`} className="card p-5 flex justify-between items-center">
                <div>
                  <p className="font-medium text-charcoal-800">{order.orderNumber}</p>
                  <p className="text-xs text-charcoal-400">{new Date(order.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-charcoal-800">Rs. {order.total}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${statusColor[order.status] || ''}`}>
                    {order.status}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
