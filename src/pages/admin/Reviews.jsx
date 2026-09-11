import { useEffect, useState } from 'react';
import { Star } from 'lucide-react';
import { adminApi } from '../../api/endpoints.js';
import LoadingScreen from '../../components/LoadingScreen.jsx';
import EmptyState from '../../components/EmptyState.jsx';

export default function Reviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = () => {
    setLoading(true);
    adminApi.reviews.list().then((res) => setReviews(res.data?.data || [])).catch((err) => setError(err.message)).finally(() => setLoading(false));
  };
  useEffect(load, []);

  const handleModerate = async (id, status) => {
    await adminApi.reviews.moderate(id, status).catch((err) => alert(err.message));
    load();
  };

  return (
    <div>
      <h1 className="text-2xl font-display font-semibold text-charcoal-800 mb-6">Reviews</h1>
      {loading ? <LoadingScreen /> : error ? (
        <EmptyState icon={Star} title="Couldn't load reviews" description={error} />
      ) : reviews.length === 0 ? (
        <EmptyState icon={Star} title="No reviews yet" />
      ) : (
        <div className="space-y-3">
          {reviews.map((r) => (
            <div key={r._id} className="card p-4 flex justify-between items-center">
              <div>
                <p className="font-medium text-charcoal-800">{r.product?.name} — {r.rating}★</p>
                <p className="text-sm text-charcoal-500">{r.comment}</p>
                <p className="text-xs text-charcoal-400">by {r.user?.name} · {r.status}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => handleModerate(r._id, 'approved')} className="btn-secondary !py-1.5 !px-3 text-xs">Approve</button>
                <button onClick={() => handleModerate(r._id, 'rejected')} className="btn-secondary !py-1.5 !px-3 text-xs">Reject</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
