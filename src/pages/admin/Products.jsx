import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Pencil, Trash2, Package } from 'lucide-react';
import { adminApi } from '../../api/endpoints.js';
import LoadingScreen from '../../components/LoadingScreen.jsx';
import EmptyState from '../../components/EmptyState.jsx';

export default function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = () => {
    setLoading(true);
    adminApi.products
      .list()
      .then((res) => setProducts(res.data?.data || []))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleDelete = async (id) => {
    if (!confirm('Delete this product?')) return;
    await adminApi.products.remove(id).catch((err) => alert(err.message));
    load();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-display font-semibold text-charcoal-800">Products</h1>
        <Link to="/admin/products/new" className="btn-primary !py-2.5">
          <Plus className="h-4 w-4" /> Add Product
        </Link>
      </div>

      {loading ? (
        <LoadingScreen />
      ) : error ? (
        <EmptyState icon={Package} title="Couldn't load products" description={error} />
      ) : products.length === 0 ? (
        <EmptyState icon={Package} title="No products yet" description="Add your first product to get started." />
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-charcoal-400 border-b border-charcoal-800/10">
                <th className="p-4">Name</th>
                <th className="p-4">SKU</th>
                <th className="p-4">Price</th>
                <th className="p-4">Stock</th>
                <th className="p-4">Status</th>
                <th className="p-4"></th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p._id} className="border-b border-charcoal-800/5 last:border-0">
                  <td className="p-4 font-medium text-charcoal-800">{p.name}</td>
                  <td className="p-4 text-charcoal-500">{p.sku}</td>
                  <td className="p-4 text-charcoal-500">Rs. {p.price}</td>
                  <td className="p-4 text-charcoal-500">{p.stock}</td>
                  <td className="p-4 text-charcoal-500 capitalize">{p.status}</td>
                  <td className="p-4 flex gap-3">
                    <Link to={`/admin/products/${p._id}/edit`} className="text-lilac-500 hover:text-lilac-700">
                      <Pencil className="h-4 w-4" />
                    </Link>
                    <button onClick={() => handleDelete(p._id)} className="text-blush-500 hover:text-blush-700">
                      <Trash2 className="h-4 w-4" />
                    </button>
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
