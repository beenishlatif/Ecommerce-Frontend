import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search as SearchIcon } from 'lucide-react';
import { productApi } from '../api/endpoints.js';
import PageHeader from '../components/PageHeader.jsx';
import LoadingScreen from '../components/LoadingScreen.jsx';
import EmptyState from '../components/EmptyState.jsx';

export default function Search() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    setSearched(true);
    try {
      const res = await productApi.list({ search: query });
      setResults(res.data?.data || []);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <PageHeader title="Search Products" />
      <div className="section-padding">
        <form onSubmit={handleSearch} className="max-w-lg mx-auto flex gap-2 mb-10">
          <input className="input-field" placeholder="Search for products…" value={query} onChange={(e) => setQuery(e.target.value)} />
          <button type="submit" className="btn-primary !px-5"><SearchIcon className="h-4 w-4" /></button>
        </form>

        {loading ? (
          <LoadingScreen />
        ) : searched && results.length === 0 ? (
          <EmptyState icon={SearchIcon} title="No results found" description={`We couldn't find anything for "${query}".`} />
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {results.map((p) => (
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
