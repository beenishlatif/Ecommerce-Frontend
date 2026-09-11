import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ShoppingBag, Check } from 'lucide-react';
import { productApi, categoryApi, settingApi } from '../api/endpoints.js';
import { useCart } from '../context/CartContext.jsx';
import LoadingScreen from '../components/LoadingScreen.jsx';
import EmptyState from '../components/EmptyState.jsx';

function topLevelCategories(categories) {
  const ids = new Set(categories.map((c) => c._id));
  return categories.filter((c) => {
    const parentId = c.parent?._id || c.parent || null;
    return !parentId || !ids.has(parentId);
  });
}

/* ─────────────────────────────────────────────
   PRODUCT CARD — v2 (premium, unique)
   • Badges (New / Sale %) stay minimal, top-left over image ONLY
   • Add To Cart moved BELOW image — circular icon button
     sitting in the price row, no generic pill/overlay
   • Grid fixed: no inline gridTemplateColumns override,
     proper Tailwind responsive columns (2 → 3 → 4 → 5)
     so cards don't blow up on laptop/desktop widths
───────────────────────────────────────────── */
function ProductCard({ product }) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);

  const onSale = product.compareAtPrice > product.price;
  const discountPercent = onSale
    ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
    : 0;

  const isNew = product.isNew || false;
  const outOfStock = product.stock === 0;

  const handleQuickAdd = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (outOfStock || added) return;
    addItem(product, 1, { size: product.sizes?.[0] || '', color: product.colors?.[0] || '' });
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Cormorant+Garamond:wght@500;600;700&display=swap');

        .pc-root {
          font-family: 'Inter', sans-serif;
          width: 100%;
        }

        /* ── Image wrapper ── */
        .pc-img-wrap {
          position: relative;
          aspect-ratio: 3 / 4;
          overflow: hidden;
          background: #f5f2ee;
        }
        .pc-img-wrap img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
          transition: transform 0.7s cubic-bezier(0.22, 1, 0.36, 1);
        }
        .pc-root:hover .pc-img-wrap img {
          transform: scale(1.045);
        }
        .pc-img-wrap::after {
          content: '';
          position: absolute;
          inset: 0;
          box-shadow: inset 0 0 0 1px rgba(26,26,26,0.06);
          pointer-events: none;
        }

        /* ── Badges — top left over image only ── */
        .pc-badge-new,
        .pc-badge-sale-img {
          position: absolute;
          top: 10px;
          left: 10px;
          z-index: 2;
          font-size: 9.5px;
          font-weight: 600;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          padding: 4px 9px;
          line-height: 1.5;
        }
        .pc-badge-new {
          background: #fff;
          color: #1a1a1a;
          border: 1px solid rgba(0,0,0,0.1);
        }
        .pc-badge-sale-img {
          background: #1a1a1a;
          color: #fff;
        }

        /* ── Info below image ── */
        .pc-info {
          padding: 12px 1px 0;
        }

        .pc-name {
          font-size: clamp(12.5px, 1vw, 14px);
          font-weight: 400;
          color: #2b2926;
          line-height: 1.4;
          margin: 0 0 8px;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .pc-bottom-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
        }

        /* Price stacks in a column — stays clean at any card width,
           no side-by-side wrapping that breaks on narrow mobile cards */
        .pc-price-block {
          display: flex;
          flex-direction: column;
          gap: 4px;
          min-width: 0;
        }

        /* Editorial micro-caption — quiet, tracked, no pill/badge shape */
        .pc-sale-caption {
          font-family: 'Inter', sans-serif;
          font-size: 8.5px;
          font-weight: 600;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: #a3854f;
        }

        .pc-price-row {
          display: flex;
          align-items: baseline;
          gap: 8px;
          white-space: nowrap;
        }

        .pc-price {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(17px, 1.3vw, 19px);
          font-weight: 600;
          color: #1a1a1a;
          letter-spacing: 0.01em;
          line-height: 1;
        }

        /* thin structural divider instead of a badge */
        .pc-price-divider {
          width: 1px;
          height: 11px;
          background: rgba(26,26,26,0.16);
          flex-shrink: 0;
        }

        .pc-price-original {
          font-family: 'Cormorant Garamond', serif;
          font-size: 13.5px;
          color: #a8a29a;
          text-decoration: line-through;
          text-decoration-color: rgba(168,162,154,0.6);
          font-weight: 500;
        }

        /* ── Icon-only Add-to-Cart button — below image, premium ── */
        .pc-cart-btn {
          position: relative;
          flex-shrink: 0;
          width: 34px;
          height: 34px;
          border-radius: 50%;
          border: 1px solid rgba(26,26,26,0.18);
          background: transparent;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          overflow: hidden;
          transition: border-color 0.3s ease, background 0.35s cubic-bezier(0.65, 0, 0.35, 1);
        }
        .pc-cart-btn::before {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: 50%;
          background: #1a1a1a;
          transform: scale(0);
          transition: transform 0.35s cubic-bezier(0.65, 0, 0.35, 1);
        }
        .pc-cart-btn:hover:not(:disabled)::before {
          transform: scale(1);
        }
        .pc-cart-btn svg {
          position: relative;
          z-index: 1;
          color: #1a1a1a;
          transition: color 0.3s ease, transform 0.3s ease;
        }
        .pc-cart-btn:hover:not(:disabled) svg {
          color: #fff;
        }
        .pc-cart-btn:active:not(:disabled) svg {
          transform: scale(0.88);
        }
        .pc-cart-btn:disabled {
          opacity: 0.35;
          cursor: not-allowed;
        }

        .pc-cart-btn.added {
          border-color: #1a1a1a;
        }
        .pc-cart-btn.added::before {
          transform: scale(1);
          background: #1a1a1a;
        }
        .pc-cart-btn.added svg { color: #fff; }
        .pc-cart-btn.added::after {
          content: '';
          position: absolute;
          inset: -1px;
          border-radius: 50%;
          border: 1px solid #1a1a1a;
          animation: pc-pulse 0.6s ease-out;
        }
        @keyframes pc-pulse {
          0% { transform: scale(1); opacity: 0.6; }
          100% { transform: scale(1.6); opacity: 0; }
        }

        .pc-oos {
          font-size: 10px;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          color: #a8a29a;
          white-space: nowrap;
        }
      `}</style>

      <div className="pc-root group">
        <Link to={`/product/${product.slug}`} style={{ textDecoration: 'none', display: 'block' }}>
          <div className="pc-img-wrap">
            {product.images?.[0] ? (
              <img src={product.images[0]} alt={product.name} />
            ) : (
              <div style={{ width: '100%', height: '100%', background: '#ede8e0' }} />
            )}

            {isNew && <span className="pc-badge-new">New</span>}
            {onSale && !isNew && <span className="pc-badge-sale-img">-{discountPercent}%</span>}
          </div>

          <div className="pc-info">
            <p className="pc-name">{product.name}</p>

            <div className="pc-bottom-row">
              <div className="pc-price-block">
                {onSale && (
                  <span className="pc-sale-caption">Sale · {discountPercent}% off</span>
                )}
                <div className="pc-price-row">
                  <span className="pc-price">
                    Rs. {product.price?.toLocaleString()}
                  </span>
                  {onSale && (
                    <>
                      <span className="pc-price-divider" />
                      <span className="pc-price-original">Rs. {product.compareAtPrice?.toLocaleString()}</span>
                    </>
                  )}
                </div>
              </div>

              {outOfStock ? (
                <span className="pc-oos">Out of stock</span>
              ) : (
                <button
                  className={`pc-cart-btn ${added ? 'added' : ''}`}
                  onClick={handleQuickAdd}
                  disabled={added}
                  type="button"
                  aria-label={added ? 'Added to cart' : 'Add to cart'}
                >
                  {added ? <Check size={14} strokeWidth={2.4} /> : <ShoppingBag size={14} strokeWidth={1.8} />}
                </button>
              )}
            </div>
          </div>
        </Link>
      </div>
    </>
  );
}

function ProductGrid({ products }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-4 gap-y-8 sm:gap-x-5 lg:gap-x-6 lg:gap-y-10">
      {products.map((product) => (
        <ProductCard key={product._id} product={product} />
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────────
   HOME — everything below is UNCHANGED
───────────────────────────────────────────── */
export default function Home() {
  const [featured, setFeatured] = useState([]);
  const [bestsellers, setBestsellers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [heroImage, setHeroImage] = useState('');
  const [heroImageOk, setHeroImageOk] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;
    Promise.all([
      productApi.list({ featured: true, limit: 8 }),
      productApi.list({ bestseller: true, limit: 4 }),
      categoryApi.list(),
      settingApi.getHomepage(),
    ])
      .then(([featuredRes, bestsellerRes, categoriesRes, homepageRes]) => {
        if (!mounted) return;
        setFeatured(featuredRes.data?.data || []);
        setBestsellers(bestsellerRes.data?.data || []);
        setCategories(categoriesRes.data?.data || []);
        setHeroImage(homepageRes.data?.data?.heroImage || '');
      })
      .catch((err) => mounted && setError(err.message))
      .finally(() => mounted && setLoading(false));
    return () => {
      mounted = false;
    };
  }, []);

  const homeCategories = topLevelCategories(categories);

  return (
    <div>
      <section className="relative w-full h-[420px] sm:h-[480px] lg:h-[560px] overflow-hidden bg-charcoal-800">
        {heroImageOk && heroImage ? (
          <img
            src={heroImage}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
            onError={() => setHeroImageOk(false)}
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-charcoal-800 to-blush-500" />
        )}

        <div className="absolute inset-0 bg-gradient-to-r from-charcoal-800/80 via-charcoal-800/40 to-transparent" />

        <div className="relative h-full mx-auto max-w-7xl px-6 lg:px-10 flex items-center">
          <div className="max-w-md">
            <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl leading-tight text-cream-50 mb-4">
              Raining Offers For Hot Summer!
            </h1>
            <p className="text-cream-100/90 text-sm sm:text-base mb-8">
              Discover Our Latest Collection
            </p>
            <div className="flex flex-wrap gap-3">
              <Link to="/shop" className="btn-primary text-sm">
                Shop Now
              </Link>
              <Link
                to="/shop"
                className="rounded-full border border-cream-50/60 px-6 py-2.5 text-sm text-cream-50 hover:bg-cream-50/10 transition-colors"
              >
                Find More
              </Link>
            </div>
          </div>
        </div>
      </section>

      {!loading && homeCategories.length > 0 && (
        <section className="mx-auto max-w-7xl px-6 lg:px-10 py-12 lg:py-16">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-7">
            {homeCategories.slice(0, 3).map((cat) => (
              <div
                key={cat._id}
                className="relative aspect-[4/5] sm:aspect-[3/4] rounded-2xl overflow-hidden bg-blush-100 group"
              >
                {cat.image ? (
                  <img
                    src={cat.image}
                    alt={cat.name}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="h-full w-full bg-charcoal-800/10" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-charcoal-800/70 via-charcoal-800/10 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <h3 className="text-cream-50 text-lg font-medium mb-1">{cat.name}</h3>
                  {cat.description && (
                    <p className="text-cream-100/80 text-xs mb-4 line-clamp-2 max-w-[85%]">
                      {cat.description}
                    </p>
                  )}
                  <Link
                    to={`/categories/${cat.slug}`}
                    className="inline-block rounded-full bg-cream-50 px-5 py-2 text-xs font-medium text-charcoal-800 hover:bg-cream-100 transition-colors"
                  >
                    Shop Now
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="mx-auto max-w-7xl px-6 lg:px-10 py-10">
        <div className="flex items-end justify-between mb-7">
          <h2 className="font-serif text-2xl sm:text-3xl text-charcoal-800">Featured Products</h2>
          <Link to="/shop" className="text-sm text-blush-500 hover:text-blush-600 flex items-center gap-1 shrink-0">
            View all <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {loading ? (
          <LoadingScreen label="Loading products…" />
        ) : error ? (
          <EmptyState title="Couldn't load products" description={error} />
        ) : featured.length === 0 ? (
          <EmptyState
            title="No featured products yet"
            description="Once the admin marks products as featured, they'll appear here."
          />
        ) : (
          <ProductGrid products={featured} />
        )}
      </section>

      {!loading && bestsellers.length > 0 && (
        <section className="mx-auto max-w-7xl px-6 lg:px-10 pb-20">
          <div className="flex items-end justify-between mb-7">
            <h2 className="font-serif text-2xl sm:text-3xl text-charcoal-800">Bestsellers</h2>
            <Link
              to="/shop?bestseller=true"
              className="text-sm text-blush-500 hover:text-blush-600 flex items-center gap-1 shrink-0"
            >
              View all <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <ProductGrid products={bestsellers} />
        </section>
      )}
    </div>
  );
}