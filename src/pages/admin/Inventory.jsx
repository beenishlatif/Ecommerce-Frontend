import { useEffect, useState } from 'react';
import { Boxes } from 'lucide-react';
import { adminApi } from '../../api/endpoints.js';
import LoadingScreen from '../../components/LoadingScreen.jsx';
import EmptyState from '../../components/EmptyState.jsx';

export default function Inventory() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    adminApi.products.list().then((res) => setProducts(res.data?.data || [])).catch((err) => setError(err.message)).finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-display font-semibold text-charcoal-800 mb-6">Inventory</h1>
      {loading ? <LoadingScreen /> : error ? (
        <EmptyState icon={Boxes} title="Couldn't load inventory" description={error} />
      ) : products.length === 0 ? (
        <EmptyState icon={Boxes} title="No products yet" />
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="text-left text-charcoal-400 border-b border-charcoal-800/10">
              <th className="p-4">Product</th><th className="p-4">SKU</th><th className="p-4">Stock</th><th className="p-4">Status</th>
            </tr></thead>
            <tbody>
              {products.map((p) => (
                <tr key={p._id} className="border-b border-charcoal-800/5 last:border-0">
                  <td className="p-4 font-medium text-charcoal-800">{p.name}</td>
                  <td className="p-4 text-charcoal-500">{p.sku}</td>
                  <td className={`p-4 font-medium ${p.stock <= 5 ? 'text-blush-600' : 'text-charcoal-500'}`}>{p.stock}</td>
                  <td className="p-4 text-charcoal-500 capitalize">{p.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
