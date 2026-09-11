import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { userApi } from '../api/endpoints.js';
import PageHeader from '../components/PageHeader.jsx';
import LoadingScreen from '../components/LoadingScreen.jsx';
import EmptyState from '../components/EmptyState.jsx';

export default function Wishlist() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    userApi
      .wishlist()
      .then((res) => setItems(res.data?.data || []))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <PageHeader title="Your Wishlist" />
      <div className="section-padding">
        {loading ? (
          <LoadingScreen />
        ) : error ? (
          <EmptyState icon={Heart} title="Sign in to see your wishlist" description={error} />
        ) : items.length === 0 ? (
          <EmptyState icon={Heart} title="Your wishlist is empty" description="Save items you love for later." />
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {items.map((p) => (
              <Link key={p._id} to={`/product/${p.slug}`} className="card overflow-hidden">
                <div className="aspect-square bg-gradient-to-br from-blush-100 to-lilac-100">
                  {p.images?.[0] && <img src={p.images[0]} alt={p.name} className="h-full w-full object-cover" />}
                </div>
                <div className="p-4">
                  <p className="text-sm font-medium truncate">{p.name}</p>
                  <p className="text-sm text-blush-500 font-semibold">Rs. {p.price}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
