import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { orderApi } from '../../api/endpoints.js';
import LoadingScreen from '../../components/LoadingScreen.jsx';
import EmptyState from '../../components/EmptyState.jsx';

// Admins can view full order details via the same authorized endpoint (role check server-side allows it).
export default function AdminOrderDetails() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    orderApi.byId(id).then((res) => setOrder(res.data.data)).catch((err) => setError(err.message)).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <LoadingScreen />;
  if (error || !order) return <EmptyState title="Order not found" description={error} />;

  return (
    <div>
      <h1 className="text-2xl font-display font-semibold text-charcoal-800 mb-6">Order {order.orderNumber}</h1>
      <div className="grid md:grid-cols-2 gap-6">
        <div className="card p-6 space-y-3">
          <h3 className="font-semibold text-charcoal-800 mb-2">Items</h3>
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
          <h3 className="font-semibold text-charcoal-800 mb-2">Shipping</h3>
          <p>{order.shippingAddress?.fullName}</p>
          <p>{order.shippingAddress?.line1}, {order.shippingAddress?.city}</p>
          <p>{order.shippingAddress?.phone}</p>
          <p className="mt-3"><strong>Payment:</strong> {order.paymentMethod}</p>
          <p><strong>Status:</strong> {order.status}</p>
        </div>
      </div>
    </div>
  );
}
