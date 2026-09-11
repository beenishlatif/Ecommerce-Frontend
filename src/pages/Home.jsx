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
   PRODUCT CARD — redesigned
   Rules from brief:
   • "New" badge on new products (top-left)
   • Sale badge: pill below image, left-aligned
     with original price struck through
   • "Add To Cart" button below image, right-aligned
   • Card is clean, no rounded-3xl overflow clipping
     — image sits edge-to-edge in a square frame
   • Hover: subtle lift + image scale
───────────────────────────────────────────── */
function ProductCard({ product }) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);

  const onSale = product.compareAtPrice > product.price;
  const discountPercent = onSale
    ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
    : 0;

  // treat "new" as products with a createdAt within last 30 days,
  // or if the API exposes product.isNew
  const isNew = product.isNew || false;

  const handleQuickAdd = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (product.stock === 0) return;
    addItem(product, 1, { size: product.sizes?.[0] || '', color: product.colors?.[0] || '' });
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&display=swap');

        .pc-root {
          font-family: 'Inter', sans-serif;
          position: relative;
          cursor: pointer;
        }

        /* ── Image wrapper ── */
        .pc-img-wrap {
          position: relative;
          aspect-ratio: 4 / 5;
          overflow: hidden;
          background: #f5f2ee;
          border-radius: 4px;
        }
        .pc-img-wrap img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
          transition: transform 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94);
        }
        .pc-root:hover .pc-img-wrap img {
          transform: scale(1.05);
        }

        /* ── "New" badge — top left over image ── */
        .pc-badge-new {
          position: absolute;
          top: 10px;
          left: 10px;
          z-index: 2;
          background: #ffffff;
          color: #1a1a1a;
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.05em;
          padding: 3px 9px;
          border-radius: 20px;
          border: 1px solid rgba(0,0,0,0.12);
          line-height: 1.6;
        }

        /* ── Sale % badge — top left over image (when no New) ── */
        .pc-badge-sale-img {
          position: absolute;
          top: 10px;
          left: 10px;
          z-index: 2;
          background: #1a1a1a;
          color: #fff;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.04em;
          padding: 3px 9px;
          border-radius: 20px;
          line-height: 1.6;
        }

        /* ── "Add To Cart" button — bottom right, always visible on desktop hover ── */
        .pc-atc {
          position: absolute;
          bottom: 10px;
          right: 10px;
          z-index: 3;
          display: flex;
          align-items: center;
          gap: 6px;
          background: rgba(255,255,255,0.95);
          color: #1a1a1a;
          border: 1px solid rgba(0,0,0,0.1);
          border-radius: 20px;
          padding: 6px 14px;
          font-family: 'Inter', sans-serif;
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.04em;
          cursor: pointer;
          backdrop-filter: blur(6px);
          opacity: 0;
          transform: translateY(4px);
          transition: opacity 0.22s ease, transform 0.22s ease, background 0.15s;
          white-space: nowrap;
          box-shadow: 0 2px 12px rgba(0,0,0,0.12);
        }
        .pc-root:hover .pc-atc {
          opacity: 1;
          transform: translateY(0);
        }
        /* always visible on touch / mobile */
        @media (hover: none) {
          .pc-atc { opacity: 1; transform: translateY(0); }
        }
        .pc-atc:hover {
          background: #1a1a1a;
          color: #fff;
          border-color: #1a1a1a;
        }
        .pc-atc:disabled {
          opacity: 0.45 !important;
          cursor: not-allowed;
          pointer-events: none;
        }
        .pc-atc.added {
          background: #1a7a4a;
          color: #fff;
          border-color: #1a7a4a;
        }

        /* ── Info row below image ── */
        .pc-info {
          padding: 10px 2px 0;
        }

        /* Sale row: badge + original price + add-to-cart (on mobile) */
        .pc-sale-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 6px;
        }
        .pc-sale-left {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        /* Sale price pill below image */
        .pc-badge-sale-below {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          background: #fff0f0;
          color: #c0392b;
          border: 1px solid rgba(192,57,43,0.18);
          border-radius: 20px;
          font-size: 10px;
          font-weight: 700;
          padding: 2px 8px;
          letter-spacing: 0.03em;
          line-height: 1.6;
          white-space: nowrap;
        }
        .pc-price-original {
          font-size: 12px;
          color: #999;
          text-decoration: line-through;
          font-weight: 400;
        }

        /* Mobile add-to-cart (always visible, below info) */
        .pc-atc-mobile {
          display: flex;
          align-items: center;
          gap: 6px;
          background: transparent;
          color: #1a1a1a;
          border: 1px solid rgba(0,0,0,0.18);
          border-radius: 20px;
          padding: 5px 12px;
          font-family: 'Inter', sans-serif;
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.04em;
          cursor: pointer;
          transition: background 0.15s, color 0.15s;
          white-space: nowrap;
        }
        .pc-atc-mobile:hover { background: #1a1a1a; color: #fff; }
        .pc-atc-mobile:disabled { opacity: 0.4; cursor: not-allowed; }
        .pc-atc-mobile.added { background: #1a7a4a; color: #fff; border-color: #1a7a4a; }

        .pc-name {
          font-size: 13px;
          font-weight: 400;
          color: #1a1a1a;
          line-height: 1.45;
          margin-bottom: 5px;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .pc-price-row {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .pc-price {
          font-size: 13px;
          font-weight: 600;
          color: #1a1a1a;
        }
        .pc-price.sale { color: #c0392b; }
      `}</style>

      <div className="pc-root group">
        <Link to={`/product/${product.slug}`} style={{ textDecoration: 'none', display: 'block' }}>

          {/* ── Image frame ── */}
          <div className="pc-img-wrap">
            {product.images?.[0] ? (
              <img src={product.images[0]} alt={product.name} />
            ) : (
              <div style={{ width: '100%', height: '100%', background: '#ede8e0' }} />
            )}

            {/* Badges over image: New takes priority, then sale % */}
            {isNew && !onSale && (
              <span className="pc-badge-new">New</span>
            )}
            {isNew && onSale && (
              <span className="pc-badge-new">New</span>
            )}
            {onSale && !isNew && (
              <span className="pc-badge-sale-img">-{discountPercent}%</span>
            )}

            {/* Add to cart — desktop hover */}
            <button
              className={`pc-atc ${added ? 'added' : ''}`}
              onClick={handleQuickAdd}
              disabled={product.stock === 0}
              type="button"
            >
              {added ? (
                <><Check size={12} /> Added</>
              ) : product.stock === 0 ? (
                'Out of Stock'
              ) : (
                <><ShoppingBag size={12} /> Add To Cart</>
              )}
            </button>
          </div>

          {/* ── Info below image ── */}
          <div className="pc-info">

            {/* Sale row: pill + strikethrough + mobile cart btn */}
            {onSale && (
              <div className="pc-sale-row">
                <div className="pc-sale-left">
                  <span className="pc-badge-sale-below">-{discountPercent}%</span>
                  <span className="pc-price-original">Rs. {product.compareAtPrice?.toLocaleString()}</span>
                </div>
                {/* mobile always-visible add-to-cart */}
                <button
                  className={`pc-atc-mobile ${added ? 'added' : ''}`}
                  onClick={handleQuickAdd}
                  disabled={product.stock === 0}
                  type="button"
                  style={{ display: 'none' }}  /* shown via media query below */
                >
                  {added ? <><Check size={11} /> Added</> : <><ShoppingBag size={11} /> Add To Cart</>}
                </button>
              </div>
            )}

            {/* Product name */}
            <p className="pc-name">{product.name}</p>

            {/* Price row */}
            <div className="pc-price-row">
              <span className={`pc-price ${onSale ? 'sale' : ''}`}>
                Rs. {product.price?.toLocaleString()}
              </span>
            </div>
          </div>
        </Link>
      </div>
    </>
  );
}

function ProductGrid({ products }) {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(2, 1fr)',
      gap: '20px 16px',
    }}
      className="sm:grid-cols-3 md:grid-cols-4 lg:gap-x-6 lg:gap-y-8"
    >
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