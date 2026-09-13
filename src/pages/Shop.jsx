import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  PackageSearch,
  Search,
  Grid2x2,
  Grid3x3,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
  Heart,
  X,
} from 'lucide-react';
import { productApi, categoryApi, userApi } from '../api/endpoints.js';
import EmptyState from '../components/EmptyState.jsx';

const SORT_OPTIONS = [
  { value: '', label: 'Featured' },
  { value: 'newest', label: 'Newest first' },
  { value: 'price_asc', label: 'Price: low to high' },
  { value: 'price_desc', label: 'Price: high to low' },
  { value: 'name_asc', label: 'Name: A to Z' },
  { value: 'rating_desc', label: 'Top rated' },
];

const COLUMN_OPTIONS = [
  { value: 2, label: 'Comfortable', icon: Grid2x2 },
  { value: 3, label: 'Compact', icon: Grid3x3 },
];

const GRID_CLASS = {
  2: 'grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3.5 sm:gap-5 lg:gap-6 xl:gap-7',
  3: 'grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 xl:grid-cols-7 gap-2.5 sm:gap-4 lg:gap-5',
};

/* ── Shared premium styling for this page (product cards, controls) ──
   Kept as a single scoped block rather than per-card, so it's not
   duplicated for every product in the grid. */
function ShopStyles() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@500;600;700&display=swap');

      /* ── Product card ── */
      .sp-card-img {
        position: relative;
        aspect-ratio: 3 / 4;
        overflow: hidden;
        background: #f5f2ee;
        border-radius: 10px;
      }
      .sp-card-img::after {
        content: '';
        position: absolute;
        inset: 0;
        border-radius: 10px;
        box-shadow: inset 0 0 0 1px rgba(26,26,26,0.06);
        pointer-events: none;
      }
      .sp-card-img img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: block;
        transition: transform 0.7s cubic-bezier(0.22, 1, 0.36, 1);
      }
      .sp-card:hover .sp-card-img img {
        transform: scale(1.045);
      }

      .sp-sale-tag {
        position: absolute;
        top: 8px;
        left: 8px;
        z-index: 2;
        font-size: 9px;
        font-weight: 600;
        letter-spacing: 0.06em;
        text-transform: uppercase;
        padding: 3px 8px;
        border-radius: 999px;
        background: #1a1a1a;
        color: #fff;
      }

      /* icon-only wishlist button — fills on hover/active, same
         language as the primary "add to cart" affordance elsewhere */
      .sp-wish-btn {
        position: absolute;
        top: 8px;
        right: 8px;
        z-index: 3;
        width: 30px;
        height: 30px;
        border-radius: 50%;
        border: none;
        background: rgba(255,255,255,0.92);
        backdrop-filter: blur(4px);
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        box-shadow: 0 2px 8px rgba(0,0,0,0.08);
        transition: transform 0.2s ease, background 0.2s ease;
      }
      .sp-wish-btn:hover { transform: scale(1.07); }
      .sp-wish-btn:active { transform: scale(0.94); }

      .sp-price {
        font-family: 'Cormorant Garamond', serif;
        font-weight: 600;
        letter-spacing: 0.01em;
        color: #1a1a1a;
      }
      .sp-price-original {
        font-family: 'Cormorant Garamond', serif;
        font-weight: 500;
        color: #a8a29a;
        text-decoration: line-through;
        text-decoration-color: rgba(168,162,154,0.6);
      }
      .sp-price-divider {
        width: 1px;
        height: 10px;
        background: rgba(26,26,26,0.16);
        flex-shrink: 0;
      }
      .sp-sale-caption {
        font-size: 8.5px;
        font-weight: 600;
        letter-spacing: 0.14em;
        text-transform: uppercase;
        color: #a3854f;
      }

      /* ── Sticky control bar niceties ── */
      .sp-search-input {
        transition: border-color 0.2s ease, box-shadow 0.2s ease;
      }
      .sp-search-input:focus {
        border-color: rgba(26,26,26,0.35);
        box-shadow: 0 0 0 3px rgba(214,140,150,0.12);
        outline: none;
      }
    `}</style>
  );
}

/* --- Skeleton card --- */
function SkeletonCard() {
  return (
    <div className="animate-pulse">
      <div className="aspect-[3/4] rounded-[10px] bg-charcoal-800/[0.06]" />
      <div className="mt-3 space-y-2">
        <div className="h-2 w-1/3 rounded-full bg-charcoal-800/[0.06]" />
        <div className="h-3 w-4/5 rounded-full bg-charcoal-800/[0.08]" />
        <div className="h-3 w-1/4 rounded-full bg-charcoal-800/[0.08]" />
      </div>
    </div>
  );
}

/* --- Product card --- */
function ProductCard({ product, wishlisted, onToggleWishlist }) {
  const onSale = product.compareAtPrice > product.price;
  const savedPct = onSale ? Math.round(100 - (product.price / product.compareAtPrice) * 100) : 0;

  return (
    <div className="sp-card group">
      <div className="sp-card-img">
        <Link to={`/product/${product.slug}`} className="block h-full w-full">
          {product.images?.[0] ? (
            <img src={product.images[0]} alt={product.name} />
          ) : (
            <div className="h-full w-full bg-blush-100" />
          )}
        </Link>

        {onSale && <span className="sp-sale-tag">−{savedPct}%</span>}

        <button
          type="button"
          onClick={() => onToggleWishlist(product._id)}
          aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
          className="sp-wish-btn"
        >
          <Heart
            size={13}
            strokeWidth={1.8}
            fill={wishlisted ? '#d9788a' : 'none'}
            className={wishlisted ? 'text-blush-500' : 'text-charcoal-600'}
          />
        </button>
      </div>

      <div className="pt-2.5 sm:pt-3.5 px-0.5">
        {product.category?.name && (
          <p className="text-[9px] sm:text-[10px] font-semibold uppercase tracking-[0.12em] text-blush-500/80 mb-1 truncate">
            {product.category.name}
          </p>
        )}
        <Link
          to={`/product/${product.slug}`}
          className="block font-display text-[13px] sm:text-[15px] leading-snug text-charcoal-800 line-clamp-2 hover:text-blush-500 transition-colors mb-1.5"
        >
          {product.name}
        </Link>

        {onSale && <p className="sp-sale-caption mb-0.5">Sale · {savedPct}% off</p>}

        <div className="flex items-baseline gap-1.5 sm:gap-2">
          <p className="sp-price text-[15px] sm:text-[17px]">
            Rs. {product.price.toLocaleString()}
          </p>
          {onSale && (
            <>
              <span className="sp-price-divider" />
              <p className="sp-price-original text-[12px] sm:text-[13px]">
                Rs. {product.compareAtPrice.toLocaleString()}
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Shop() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cols, setCols] = useState(2);
  const [searchInput, setSearchInput] = useState(searchParams.get('search') || '');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [wishlist, setWishlist] = useState(new Set());

  const [categories, setCategories] = useState([]);
  const [priceInputs, setPriceInputs] = useState({
    min: searchParams.get('minPrice') || '',
    max: searchParams.get('maxPrice') || '',
  });

  const sort = searchParams.get('sort') || '';
  const activeCategory = searchParams.get('category') || '';
  const minPrice = searchParams.get('minPrice') || '';
  const maxPrice = searchParams.get('maxPrice') || '';
  const page = Number(searchParams.get('page')) || 1;
  const activeFilterCount = [activeCategory, minPrice, maxPrice].filter(Boolean).length;

  useEffect(() => {
    categoryApi
      .list()
      .then((res) => setCategories(res.data?.data || []))
      .catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError('');
    productApi
      .list(Object.fromEntries(searchParams))
      .then((res) => {
        if (!mounted) return;
        setProducts(res.data?.data || []);
        setPagination(res.data?.pagination || { total: 0, page: 1, pages: 1 });
      })
      .catch((err) => mounted && setError(err.message))
      .finally(() => mounted && setLoading(false));
    return () => { mounted = false; };
  }, [searchParams]);

  useEffect(() => {
    if (filtersOpen) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = prev; };
    }
  }, [filtersOpen]);

  const updateParams = (updates) => {
    const next = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([key, value]) => {
      if (value === '' || value === null || value === undefined) next.delete(key);
      else next.set(key, value);
    });
    next.delete('page');
    setSearchParams(next);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    updateParams({ search: searchInput });
  };

  const applyPriceFilter = () => {
    updateParams({ minPrice: priceInputs.min, maxPrice: priceInputs.max });
    setFiltersOpen(false);
  };

  const clearFilters = () => {
    setPriceInputs({ min: '', max: '' });
    updateParams({ category: '', minPrice: '', maxPrice: '' });
    setFiltersOpen(false);
  };

  const toggleWishlist = (productId) => {
    setWishlist((prev) => {
      const next = new Set(prev);
      next.has(productId) ? next.delete(productId) : next.add(productId);
      return next;
    });
    userApi.toggleWishlist(productId).catch(() => {
      setWishlist((prev) => {
        const next = new Set(prev);
        next.has(productId) ? next.delete(productId) : next.add(productId);
        return next;
      });
    });
  };

  const goToPage = (p) => {
    const next = new URLSearchParams(searchParams);
    next.set('page', p);
    setSearchParams(next);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const pageNumbers = useMemo(() => {
    const total = pagination.pages;
    if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
    const set = new Set([1, 2, total - 1, total, page - 1, page, page + 1]);
    return [...set].filter((n) => n >= 1 && n <= total).sort((a, b) => a - b);
  }, [pagination.pages, page]);

  return (
    <div className="bg-cream-50 min-h-screen overflow-x-hidden">
      <ShopStyles />

      {/* ── Title strip ── */}
      <div className="border-b border-charcoal-800/[0.06]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10 pt-9 sm:pt-14 pb-6 sm:pb-8">
          <p className="text-[10px] sm:text-[11px] font-medium tracking-[0.16em] uppercase text-charcoal-400 mb-2">
            Home <span className="mx-1 text-charcoal-300">/</span> Shop
          </p>
          <h1 className="font-serif text-[28px] sm:text-4xl text-charcoal-800">Shop the Collection</h1>
          <p className="text-xs sm:text-sm text-charcoal-400 mt-2">
            {loading ? 'Loading…' : `${pagination.total} product${pagination.total !== 1 ? 's' : ''}`}
            {activeCategory && (
              <>
                {' '}in{' '}
                <span className="text-charcoal-600">
                  {categories.find((c) => c._id === activeCategory)?.name || 'this category'}
                </span>
              </>
            )}
          </p>
        </div>
      </div>

      {/* ── Sticky control bar ── */}
      <div className="sticky top-0 z-20 bg-cream-50/95 backdrop-blur border-b border-charcoal-800/[0.06]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10 py-3 sm:py-4 flex flex-col gap-2.5 sm:gap-3">

          {/* Row 1: Search (full width on mobile) */}
          <form onSubmit={handleSearchSubmit} className="relative w-full">
            <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-charcoal-300" />
            <input
              type="text"
              placeholder="Search products…"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="sp-search-input input-field !pl-11 w-full !rounded-full"
            />
          </form>

          {/* Row 2: Filters + Sort + Density */}
          <div className="flex items-center gap-2 w-full">

            {/* Filters button */}
            <div className="relative flex-shrink-0">
              <button
                type="button"
                onClick={() => setFiltersOpen((v) => !v)}
                className={`h-10 flex items-center gap-1.5 rounded-full px-3.5 text-sm font-medium border transition-colors whitespace-nowrap ${
                  activeFilterCount > 0
                    ? 'border-charcoal-800 bg-charcoal-800 text-cream-50'
                    : 'border-charcoal-800/15 text-charcoal-600 hover:border-charcoal-800/40'
                }`}
              >
                <SlidersHorizontal size={14} />
                <span>Filters</span>
                {activeFilterCount > 0 && (
                  <span className="text-[10px] font-semibold bg-cream-50 text-charcoal-800 rounded-full w-4 h-4 flex items-center justify-center">
                    {activeFilterCount}
                  </span>
                )}
              </button>

              {filtersOpen && (
                <>
                  {/* Mobile backdrop */}
                  <div
                    className="fixed inset-0 z-30 bg-charcoal-800/30 sm:hidden"
                    onClick={() => setFiltersOpen(false)}
                    aria-hidden="true"
                  />
                  {/* Panel: bottom-sheet on mobile, dropdown on sm+ */}
                  <div
                    className="fixed inset-x-0 bottom-0 z-40 max-h-[85vh] overflow-y-auto rounded-t-3xl
                               sm:absolute sm:inset-x-auto sm:bottom-auto sm:top-[calc(100%+8px)] sm:left-0
                               sm:max-h-none sm:overflow-visible sm:w-[300px] sm:rounded-2xl
                               border border-charcoal-800/10 bg-white shadow-xl p-5"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <p className="font-serif text-base text-charcoal-800">Filters</p>
                      <button type="button" onClick={() => setFiltersOpen(false)} className="text-charcoal-400 hover:text-charcoal-700">
                        <X size={16} />
                      </button>
                    </div>

                    {categories.length > 0 && (
                      <div className="mb-5">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-charcoal-400 mb-2.5">Category</p>
                        <div className="flex flex-wrap gap-2">
                          {categories.map((c) => {
                            const active = activeCategory === c._id;
                            return (
                              <button
                                key={c._id}
                                type="button"
                                onClick={() => updateParams({ category: active ? '' : c._id })}
                                className={`rounded-full px-3.5 py-1.5 text-xs font-medium border transition-colors ${
                                  active
                                    ? 'border-charcoal-800 bg-charcoal-800 text-cream-50'
                                    : 'border-charcoal-800/15 text-charcoal-500 hover:border-charcoal-800/40'
                                }`}
                              >
                                {c.name}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    <div className="mb-5">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-charcoal-400 mb-2.5">Price range</p>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min="0"
                          placeholder="Min"
                          value={priceInputs.min}
                          onChange={(e) => setPriceInputs((p) => ({ ...p, min: e.target.value }))}
                          className="input-field w-full !py-2 text-sm"
                        />
                        <span className="text-charcoal-300 text-xs flex-shrink-0">to</span>
                        <input
                          type="number"
                          min="0"
                          placeholder="Max"
                          value={priceInputs.max}
                          onChange={(e) => setPriceInputs((p) => ({ ...p, max: e.target.value }))}
                          className="input-field w-full !py-2 text-sm"
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pb-[env(safe-area-inset-bottom)]">
                      <button
                        type="button"
                        onClick={applyPriceFilter}
                        className="flex-1 text-sm font-medium py-2.5 rounded-full text-cream-50 bg-charcoal-800 hover:opacity-90 transition-opacity"
                      >
                        Apply
                      </button>
                      {activeFilterCount > 0 && (
                        <button type="button" onClick={clearFilters} className="text-xs text-charcoal-400 hover:text-charcoal-700 px-2">
                          Clear
                        </button>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Sort select — grows to fill remaining space */}
            <select
              value={sort}
              onChange={(e) => updateParams({ sort: e.target.value })}
              className="input-field flex-1 min-w-0 text-sm !rounded-full"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>

            {/* Density toggle */}
            <div className="flex items-center gap-1 rounded-full bg-cream-100 p-1 flex-shrink-0">
              {COLUMN_OPTIONS.map((opt) => {
                const Icon = opt.icon;
                const active = cols === opt.value;
                return (
                  <button
                    key={opt.value}
                    onClick={() => setCols(opt.value)}
                    aria-label={opt.label}
                    aria-pressed={active}
                    className={`h-8 w-8 rounded-full flex items-center justify-center transition-colors ${
                      active ? 'bg-charcoal-800 text-cream-50' : 'text-charcoal-400 hover:text-charcoal-700'
                    }`}
                  >
                    <Icon size={14} />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active filter pills */}
          {activeFilterCount > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              {activeCategory && (
                <span className="flex items-center gap-1.5 rounded-full bg-charcoal-800/[0.05] px-3 py-1 text-xs text-charcoal-600">
                  {categories.find((c) => c._id === activeCategory)?.name || 'Category'}
                  <button onClick={() => updateParams({ category: '' })} aria-label="Remove category filter">
                    <X size={11} />
                  </button>
                </span>
              )}
              {(minPrice || maxPrice) && (
                <span className="flex items-center gap-1.5 rounded-full bg-charcoal-800/[0.05] px-3 py-1 text-xs text-charcoal-600">
                  Rs. {minPrice || '0'} – {maxPrice || '∞'}
                  <button
                    onClick={() => {
                      setPriceInputs({ min: '', max: '' });
                      updateParams({ minPrice: '', maxPrice: '' });
                    }}
                    aria-label="Remove price filter"
                  >
                    <X size={11} />
                  </button>
                </span>
              )}
              <button onClick={clearFilters} className="text-xs text-charcoal-400 underline hover:text-charcoal-700">
                Clear all
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── Product grid ── */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10 py-7 sm:py-10">
        {loading ? (
          <div className={GRID_CLASS[cols]}>
            {Array.from({ length: 8 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : error ? (
          <EmptyState icon={PackageSearch} title="Couldn't load products" description={error} />
        ) : products.length === 0 ? (
          <EmptyState icon={PackageSearch} title="No products found" description="Try a different search or clear your filters." />
        ) : (
          <div className={GRID_CLASS[cols]}>
            {products.map((product) => (
              <ProductCard
                key={product._id}
                product={product}
                wishlisted={wishlist.has(product._id)}
                onToggleWishlist={toggleWishlist}
              />
            ))}
          </div>
        )}

        {/* Pagination */}
        {!loading && pagination.pages > 1 && (
          <div className="flex items-center justify-center gap-1 sm:gap-1.5 mt-10 sm:mt-14 overflow-x-auto">
            <button
              onClick={() => goToPage(page - 1)}
              disabled={page <= 1}
              className="h-8 w-8 sm:h-9 sm:w-9 rounded-full border border-charcoal-800/10 flex items-center justify-center text-charcoal-500 disabled:opacity-30 hover:border-charcoal-800/30 transition-colors flex-shrink-0"
            >
              <ChevronLeft size={15} />
            </button>
            {pageNumbers.map((p, i) => (
              <span key={p} className="flex items-center flex-shrink-0">
                {i > 0 && pageNumbers[i - 1] !== p - 1 && (
                  <span className="px-1 text-charcoal-300 text-sm">…</span>
                )}
                <button
                  onClick={() => goToPage(p)}
                  className={`h-8 w-8 sm:h-9 sm:w-9 rounded-full text-sm transition-colors ${
                    p === page ? 'bg-charcoal-800 text-cream-50' : 'text-charcoal-500 hover:bg-cream-100'
                  }`}
                >
                  {p}
                </button>
              </span>
            ))}
            <button
              onClick={() => goToPage(page + 1)}
              disabled={page >= pagination.pages}
              className="h-8 w-8 sm:h-9 sm:w-9 rounded-full border border-charcoal-800/10 flex items-center justify-center text-charcoal-500 disabled:opacity-30 hover:border-charcoal-800/30 transition-colors flex-shrink-0"
            >
              <ChevronRight size={15} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}