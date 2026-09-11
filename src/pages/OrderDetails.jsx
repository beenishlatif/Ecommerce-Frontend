import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { orderApi } from '../api/endpoints.js';
import PageHeader from '../components/PageHeader.jsx';
import LoadingScreen from '../components/LoadingScreen.jsx';
import EmptyState from '../components/EmptyState.jsx';

export default function OrderDetails() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    orderApi
      .byId(id)
      .then((res) => setOrder(res.data.data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <LoadingScreen />;
  if (error || !order) return <EmptyState title="Order not found" description={error} />;

  return (
    <div>
      <PageHeader title={`Order ${order.orderNumber}`} subtitle={`Status: ${order.status}`} />
      <div className="section-padding max-w-2xl mx-auto space-y-6">
        <div className="card p-6 space-y-3">
          {order.items.map((item, i) => (
            <div key={i} className="flex justify-between text-sm">
              <span>{item.name} × {item.quantity}</span>
              <span>Rs. {item.price * item.quantity}</span>
            </div>
          ))}
          <div className="border-t border-charcoal-800/10 pt-3 flex justify-between font-semibold">
            <span>Total</span><span>Rs. {order.total}</span>
          </div>
        </div>
        <div className="card p-6 text-sm text-charcoal-600">
          <p className="font-semibold text-charcoal-800 mb-2">Shipping Address</p>
          <p>{order.shippingAddress?.fullName}</p>
          <p>{order.shippingAddress?.line1}, {order.shippingAddress?.city}, {order.shippingAddress?.country}</p>
          <p>{order.shippingAddress?.phone}</p>
        </div>
      </div>
    </div>
  );
}
