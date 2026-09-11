import { Link, useNavigate } from 'react-router-dom';
import { Minus, Plus, Trash2, ShoppingBag } from 'lucide-react';
import { useCart } from '../context/CartContext.jsx';
import PageHeader from '../components/PageHeader.jsx';
import EmptyState from '../components/EmptyState.jsx';

export default function Cart() {
  const { items, updateQuantity, removeItem, subtotal } = useCart();
  const navigate = useNavigate();

  const handleCheckout = () => {
    navigate('/checkout');
  };

  return (
    <div>
      <PageHeader title="Your Cart" subtitle={`${items.length} item${items.length !== 1 ? 's' : ''} in your cart`} />
      <div className="section-padding">
        {items.length === 0 ? (
          <EmptyState
            icon={ShoppingBag}
            title="Your cart is empty"
            description="Looks like you haven't added anything yet."
            action={
              <Link to="/shop" className="btn-primary">
                Start Shopping
              </Link>
            }
          />
        ) : (
          <div className="grid md:grid-cols-[1fr_320px] gap-10">
            <div className="space-y-4">
              {items.map((item) => (
                <div key={item.productId} className="card flex items-center gap-4 p-4">
                  <div className="h-20 w-20 rounded-lg bg-gradient-to-br from-blush-100 to-lilac-100 overflow-hidden shrink-0">
                    {item.image && <img src={item.image} alt={item.name} className="h-full w-full object-cover" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-charcoal-800 truncate">{item.name}</p>
                    <p className="text-sm text-blush-500 font-semibold">Rs. {item.price}</p>
                  </div>
                  <div className="flex items-center border border-charcoal-800/10 rounded-full">
                    <button className="p-2" onClick={() => updateQuantity(item.productId, item.quantity - 1)}>
                      <Minus className="h-3.5 w-3.5" />
                    </button>
                    <span className="w-6 text-center text-sm">{item.quantity}</span>
                    <button className="p-2" onClick={() => updateQuantity(item.productId, item.quantity + 1)}>
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <button onClick={() => removeItem(item.productId)} className="text-charcoal-300 hover:text-blush-500">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>

            <div className="card p-6 h-fit">
              <h3 className="font-semibold text-charcoal-800 mb-4">Order Summary</h3>
              <div className="flex justify-between text-sm text-charcoal-500 mb-2">
                <span>Subtotal</span>
                <span>Rs. {subtotal.toFixed(2)}</span>
              </div>
              <p className="text-xs text-charcoal-400 mb-4">Shipping & discounts calculated at checkout.</p>
              <button className="btn-primary w-full" onClick={handleCheckout}>
                Proceed to Checkout
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}