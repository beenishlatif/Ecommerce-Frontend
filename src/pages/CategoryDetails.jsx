import { useEffect, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { X, SlidersHorizontal, FolderTree } from 'lucide-react';
import { categoryApi, productApi } from '../api/endpoints.js';
import LoadingScreen from '../components/LoadingScreen.jsx';
import EmptyState from '../components/EmptyState.jsx';

const SORT_OPTIONS = [
  { value: '', label: 'Sort by: Featured' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'newest', label: 'Newest First' },
  { value: 'name_asc', label: 'Name: A to Z' },
  { value: 'rating_desc', label: 'Top Rated' },
];

const COLOR_OPTIONS = [
  'Black', 'White', 'Red', 'Blue', 'Green', 'Yellow', 'Pink', 'Beige',
  'Brown', 'Grey', 'Gold', 'Silver', 'Purple', 'Orange', 'Navy', 'Maroon',
];

const SIZE_OPTIONS = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

const PRICE_MIN = 0;
const PRICE_MAX = 100000;

// ---- Category tree helpers (for the "Shop by Category" sidebar nav) ----
function buildTree(categories) {
  const map = new Map();
  categories.forEach((c) => map.set(c._id, { ...c, children: [] }));
  const roots = [];
  categories.forEach((c) => {
    const parentId = c.parent?._id || c.parent || null;
    const node = map.get(c._id);
    if (parentId && map.has(parentId)) map.get(parentId).children.push(node);
    else roots.push(node);
  });
  return roots;
}

function CategoryNavNode({ node, activeSlug, depth }) {
  const isActive = node.slug === activeSlug;
  return (
    <div>
      <Link
        to={`/categories/${node.slug}`}
        style={{ paddingLeft: depth * 14 }}
        className={`block py-1.5 text-sm rounded-lg transition-colors ${
          isActive ? 'text-blush-500 font-semibold' : 'text-charcoal-600 hover:text-blush-500'
        }`}
      >
        {node.name}
      </Link>
      {node.children?.length > 0 && (
        <div>
          {node.children.map((child) => (
            <CategoryNavNode key={child._id} node={child} activeSlug={activeSlug} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

// ---- Dual-thumb price slider, one compact line ----
function PriceRangeSlider({ min, max, value, onChange }) {
  const [lo, hi] = value;
  const pct = (v) => ((v - min) / (max - min)) * 100;

  return (
    <div>
      <style>{`
        .price-range-thumb { -webkit-appearance: none; appearance: none; background: transparent; pointer-events: none; }
        .price-range-thumb::-webkit-slider-thumb {
          -webkit-appearance: none; pointer-events: auto; height: 16px; width: 16px; border-radius: 9999px;
          background: #292524; border: 2px solid #fff; box-shadow: 0 1px 3px rgba(0,0,0,0.3); cursor: pointer; margin-top: -1px;
        }
        .price-range-thumb::-moz-range-thumb {
          pointer-events: auto; height: 16px; width: 16px; border-radius: 9999px;
          background: #292524; border: 2px solid #fff; box-shadow: 0 1px 3px rgba(0,0,0,0.3); cursor: pointer;
        }
        .price-range-thumb::-webkit-slider-runnable-track { -webkit-appearance: none; height: 0; }
      `}</style>
      <div className="flex items-center justify-between text-xs text-charcoal-500 mb-3">
        <span>Rs. {lo.toLocaleString()}</span>
        <span>Rs. {hi.toLocaleString()}</span>
      </div>
      <div className="relative h-4">
        <div className="absolute top-1/2 -translate-y-1/2 h-1 w-full rounded-full bg-charcoal-800/10" />
        <div
          className="absolute top-1/2 -translate-y-1/2 h-1 rounded-full bg-charcoal-800"
          style={{ left: `${pct(lo)}%`, right: `${100 - pct(hi)}%` }}
        />
        <input
          type="range"
          min={min}
          max={max}
          step={500}
          value={lo}
          onChange={(e) => onChange([Math.min(Number(e.target.value), hi - 500), hi])}
          className="price-range-thumb absolute inset-0 w-full h-4"
        />
        <input
          type="range"
          min={min}
          max={max}
          step={500}
          value={hi}
          onChange={(e) => onChange([lo, Math.max(Number(e.target.value), lo + 500)])}
          className="price-range-thumb absolute inset-0 w-full h-4"
        />
      </div>
    </div>
  );
}

function ProductCard({ product }) {
  const onSale = product.compareAtPrice > product.price;
  return (
    <Link to={`/product/${product.slug}`} className="group block">
      <div className="relative aspect-square overflow-hidden rounded-2xl bg-cream-100 shadow-sm">
        {product.images?.[0] ? (
          <img
            src={product.images[0]}
            alt={product.name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.06]"
          />
        ) : (
          <div className="h-full w-full bg-blush-100" />
        )}
        {onSale && (
          <span className="absolute top-3 left-3 rounded-full bg-blush-500 px-3 py-1 text-[10px] font-semibold tracking-wide text-cream-50 shadow-sm">
            Sale!
          </span>
        )}
      </div>
      <div className="pt-3.5">
        <p className="text-sm text-charcoal-800 truncate group-hover:text-blush-500 transition-colors">{product.name}</p>
        <div className="flex items-baseline gap-2 mt-1">
          {onSale && <p className="text-xs text-charcoal-400 line-through">Rs. {product.compareAtPrice}</p>}
          <p className="text-sm font-semibold text-charcoal-800">Rs. {product.price}</p>
        </div>
      </div>
    </Link>
  );
}

export default function CategoryDetails() {
  const { slug } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const [category, setCategory] = useState(null);
  const [allCategories, setAllCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filtersOpen, setFiltersOpen] = useState(false);

  const [draftPrice, setDraftPrice] = useState([PRICE_MIN, PRICE_MAX]);
  const [draftColors, setDraftColors] = useState([]);
  const [draftSizes, setDraftSizes] = useState([]);
  const [draftFeatured, setDraftFeatured] = useState(false);
  const [draftOnSale, setDraftOnSale] = useState(false);
  const [draftInStock, setDraftInStock] = useState(false);

  const sort = searchParams.get('sort') || '';

  // Full category tree, fetched once, used for the sidebar nav.
  useEffect(() => {
    categoryApi
      .list()
      .then((res) => setAllCategories(res.data?.data || []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    categoryApi
      .bySlug(slug)
      .then((res) => {
        if (!mounted) return;
        setCategory(res.data.data);
        return productApi.list({ category: res.data.data._id, ...Object.fromEntries(searchParams) });
      })
      .then((res) => mounted && res && setProducts(res.data?.data || []))
      .catch((err) => mounted && setError(err.message))
      .finally(() => mounted && setLoading(false));
    return () => {
      mounted = false;
    };
  }, [slug, searchParams]);

  // Keep the draft filter UI in sync whenever the URL changes (e.g. back/forward, clear all).
  useEffect(() => {
    setDraftPrice([
      Number(searchParams.get('minPrice')) || PRICE_MIN,
      Number(searchParams.get('maxPrice')) || PRICE_MAX,
    ]);
    setDraftColors(searchParams.get('colors')?.split(',').filter(Boolean) || []);
    setDraftSizes(searchParams.get('sizes')?.split(',').filter(Boolean) || []);
    setDraftFeatured(searchParams.get('featured') === 'true');
    setDraftOnSale(searchParams.get('onSale') === 'true');
    setDraftInStock(searchParams.get('inStock') === 'true');
  }, [searchParams]);

  const handleSortChange = (value) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set('sort', value);
    else next.delete('sort');
    setSearchParams(next);
  };

  const toggleFromList = (list, setList, value) => {
    setList(list.includes(value) ? list.filter((v) => v !== value) : [...list, value]);
  };

  const applyFilters = () => {
    const next = new URLSearchParams(searchParams);

    if (draftPrice[0] > PRICE_MIN) next.set('minPrice', draftPrice[0]);
    else next.delete('minPrice');

    if (draftPrice[1] < PRICE_MAX) next.set('maxPrice', draftPrice[1]);
    else next.delete('maxPrice');

    if (draftColors.length > 0) next.set('colors', draftColors.join(','));
    else next.delete('colors');

    if (draftSizes.length > 0) next.set('sizes', draftSizes.join(','));
    else next.delete('sizes');

    if (draftFeatured) next.set('featured', 'true');
    else next.delete('featured');

    if (draftOnSale) next.set('onSale', 'true');
    else next.delete('onSale');

    if (draftInStock) next.set('inStock', 'true');
    else next.delete('inStock');

    setSearchParams(next);
    setFiltersOpen(false);
  };

  const clearFilters = () => {
    setDraftPrice([PRICE_MIN, PRICE_MAX]);
    setDraftColors([]);
    setDraftSizes([]);
    setDraftFeatured(false);
    setDraftOnSale(false);
    setDraftInStock(false);
    const next = new URLSearchParams();
    if (sort) next.set('sort', sort);
    setSearchParams(next);
  };

  const categoryTree = buildTree(allCategories);

  const FiltersPanel = (
    <aside className="space-y-8">
      <div>
        <h3 className="text-xs font-semibold uppercase tracking-wide text-charcoal-400 mb-3">Shop by Category</h3>
        <div className="space-y-0.5">
          {categoryTree.map((node) => (
            <CategoryNavNode key={node._id} node={node} activeSlug={slug} depth={0} />
          ))}
        </div>
      </div>

      <div className="h-px bg-charcoal-800/10" />

      <div className="flex items-center justify-between">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-charcoal-400">Filters</h3>
        <button onClick={clearFilters} className="text-xs text-blush-500 hover:text-blush-600">
          Clear all
        </button>
      </div>

      <div>
        <h3 className="text-xs font-semibold uppercase tracking-wide text-charcoal-400 mb-3">Price</h3>
        <PriceRangeSlider min={PRICE_MIN} max={PRICE_MAX} value={draftPrice} onChange={setDraftPrice} />
      </div>

      <div>
        <h3 className="text-xs font-semibold uppercase tracking-wide text-charcoal-400 mb-3">Color</h3>
        <div className="flex flex-wrap gap-2">
          {COLOR_OPTIONS.map((color) => {
            const selected = draftColors.includes(color);
            return (
              <button
                key={color}
                type="button"
                onClick={() => toggleFromList(draftColors, setDraftColors, color)}
                className={`rounded-full border px-3.5 py-1.5 text-xs transition-colors ${
                  selected
                    ? 'bg-charcoal-800 text-cream-50 border-charcoal-800'
                    : 'border-charcoal-800/15 text-charcoal-600 hover:border-charcoal-800/40'
                }`}
              >
                {color}
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <h3 className="text-xs font-semibold uppercase tracking-wide text-charcoal-400 mb-3">Size</h3>
        <div className="flex flex-wrap gap-2">
          {SIZE_OPTIONS.map((size) => {
            const selected = draftSizes.includes(size);
            return (
              <button
                key={size}
                type="button"
                onClick={() => toggleFromList(draftSizes, setDraftSizes, size)}
                className={`h-9 min-w-[2.25rem] rounded-lg border px-2.5 text-xs font-medium transition-colors ${
                  selected
                    ? 'bg-charcoal-800 text-cream-50 border-charcoal-800'
                    : 'border-charcoal-800/15 text-charcoal-600 hover:border-charcoal-800/40'
                }`}
              >
                {size}
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-3">
        <label className="flex items-center gap-2.5 text-sm text-charcoal-600 cursor-pointer">
          <input type="checkbox" checked={draftFeatured} onChange={(e) => setDraftFeatured(e.target.checked)} className="accent-charcoal-800" />
          Featured
        </label>
        <label className="flex items-center gap-2.5 text-sm text-charcoal-600 cursor-pointer">
          <input type="checkbox" checked={draftOnSale} onChange={(e) => setDraftOnSale(e.target.checked)} className="accent-charcoal-800" />
          On Sale
        </label>
        <label className="flex items-center gap-2.5 text-sm text-charcoal-600 cursor-pointer">
          <input type="checkbox" checked={draftInStock} onChange={(e) => setDraftInStock(e.target.checked)} className="accent-charcoal-800" />
          In Stock Only
        </label>
      </div>

      <button onClick={applyFilters} className="btn-primary w-full !rounded-xl">
        Apply Filters
      </button>
    </aside>
  );

  if (loading && !category) return <LoadingScreen />;
  if (error || !category) return <EmptyState title="Category not found" description={error} />;

  return (
    <div>
      <div className="mx-auto max-w-7xl px-6 lg:px-10 pt-8 pb-2">
        <div className="flex items-center gap-1.5 text-xs text-charcoal-400 mb-3">
          <Link to="/" className="hover:text-blush-500">Home</Link>
          <span>/</span>
          <Link to="/categories" className="hover:text-blush-500">Categories</Link>
          <span>/</span>
          <span className="text-charcoal-600">{category.name}</span>
        </div>
        <h1 className="font-serif text-2xl sm:text-3xl text-charcoal-800">{category.name}</h1>
        {category.description && <p className="text-charcoal-400 text-sm mt-1.5 max-w-xl">{category.description}</p>}
      </div>

      <div className="mx-auto max-w-7xl px-6 lg:px-10 py-8 grid md:grid-cols-[280px_1fr] gap-10">
        <div className="hidden md:block">{FiltersPanel}</div>

        {filtersOpen && (
          <div className="fixed inset-0 z-50 md:hidden">
            <div className="absolute inset-0 bg-charcoal-800/50" onClick={() => setFiltersOpen(false)} />
            <div className="absolute inset-y-0 left-0 w-[85%] max-w-sm bg-cream-50 p-6 overflow-y-auto">
              <button onClick={() => setFiltersOpen(false)} className="mb-4 text-charcoal-500">
                <X size={18} />
              </button>
              {FiltersPanel}
            </div>
          </div>
        )}

        <div>
          <div className="flex items-center justify-between mb-6 gap-3">
            <button
              onClick={() => setFiltersOpen(true)}
              className="md:hidden inline-flex items-center gap-1.5 text-sm text-charcoal-600 rounded-full border border-charcoal-800/10 px-4 py-2"
            >
              <SlidersHorizontal size={13} /> Filters
            </button>
            <p className="text-xs text-charcoal-400 hidden sm:block">
              {products.length} product{products.length !== 1 ? 's' : ''}
            </p>
            <select value={sort} onChange={(e) => handleSortChange(e.target.value)} className="input-field !w-auto ml-auto text-sm">
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {products.length === 0 ? (
            <EmptyState icon={FolderTree} title="No products in this category yet" />
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7">
              {products.map((p) => (
                <ProductCard key={p._id} product={p} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}