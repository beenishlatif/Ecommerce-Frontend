import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, X } from 'lucide-react';
import { userApi } from '../api/endpoints.js';
import LoadingScreen from '../components/LoadingScreen.jsx';
import EmptyState from '../components/EmptyState.jsx';

function WishlistStyles() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@500;600;700&display=swap');

      .wl-card-img {
        position: relative;
        aspect-ratio: 3 / 4;
        overflow: hidden;
        background: #f5f2ee;
        border-radius: 10px;
      }
      .wl-card-img::after {
        content: '';
        position: absolute;
        inset: 0;
        border-radius: 10px;
        box-shadow: inset 0 0 0 1px rgba(26,26,26,0.06);
        pointer-events: none;
      }
      .wl-card-img img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: block;
        transition: transform 0.7s cubic-bezier(0.22, 1, 0.36, 1);
      }
      .wl-card:hover .wl-card-img img {
        transform: scale(1.045);
      }

      .wl-sale-tag {
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

      .wl-remove-btn {
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
        color: #d9788a;
        transition: transform 0.2s ease, background 0.2s ease, color 0.2s ease;
      }
      .wl-remove-btn:hover {
        background: #1a1a1a;
        color: #fff;
        transform: scale(1.07);
      }
      .wl-remove-btn:active { transform: scale(0.94); }

      .wl-price {
        font-family: 'Cormorant Garamond', serif;
        font-weight: 600;
        letter-spacing: 0.01em;
        color: #1a1a1a;
      }
      .wl-price-original {
        font-family: 'Cormorant Garamond', serif;
        font-weight: 500;
        color: #a8a29a;
        text-decoration: line-through;
        text-decoration-color: rgba(168,162,154,0.6);
      }
      .wl-price-divider {
        width: 1px;
        height: 10px;
        background: rgba(26,26,26,0.16);
        flex-shrink: 0;
      }
      .wl-sale-caption {
        font-size: 8.5px;
        font-weight: 600;
        letter-spacing: 0.14em;
        text-transform: uppercase;
        color: #a3854f;
      }
    `}</style>
  );
}

function WishlistCard({ product, onRemove }) {
  const onSale = product.compareAtPrice > product.price;
  const savedPct = onSale ? Math.round(100 - (product.price / product.compareAtPrice) * 100) : 0;

  return (
    <div className="wl-card group">
      <div className="wl-card-img">
        <Link to={`/product/${product.slug}`} className="block h-full w-full">
          {product.images?.[0] ? (
            <img src={product.images[0]} alt={product.name} />
          ) : (
            <div className="h-full w-full bg-blush-100" />
          )}
        </Link>

        {onSale && <span className="wl-sale-tag">−{savedPct}%</span>}

        <button
          type="button"
          onClick={() => onRemove(product._id)}
          aria-label="Remove from wishlist"
          className="wl-remove-btn"
        >
          <X size={14} strokeWidth={2} />
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

        {onSale && <p className="wl-sale-caption mb-0.5">Sale · {savedPct}% off</p>}

        <div className="flex items-baseline gap-1.5 sm:gap-2">
          <p className="wl-price text-[15px] sm:text-[17px]">
            Rs. {product.price?.toLocaleString()}
          </p>
          {onSale && (
            <>
              <span className="wl-price-divider" />
              <p className="wl-price-original text-[12px] sm:text-[13px]">
                Rs. {product.compareAtPrice?.toLocaleString()}
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

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

  const handleRemove = (productId) => {
    // Optimistic — item disappears immediately, this page only ever
    // shows what's actually in the wishlist so removing means it's gone.
    setItems((prev) => prev.filter((p) => p._id !== productId));
    userApi.toggleWishlist(productId).catch(() => {
      // Roll back on failure — refetch to stay in sync with the server.
      userApi
        .wishlist()
        .then((res) => setItems(res.data?.data || []))
        .catch(() => {});
    });
  };

  return (
    <div className="bg-cream-50 min-h-screen">
      <WishlistStyles />

      {/* ── Title strip — matches Shop page language ── */}
      <div className="border-b border-charcoal-800/[0.06]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10 pt-9 sm:pt-14 pb-6 sm:pb-8">
          <p className="text-[10px] sm:text-[11px] font-medium tracking-[0.16em] uppercase text-charcoal-400 mb-2">
            Home <span className="mx-1 text-charcoal-300">/</span> Wishlist
          </p>
          <h1 className="font-serif text-[28px] sm:text-4xl text-charcoal-800">Your Wishlist</h1>
          {!loading && !error && (
            <p className="text-xs sm:text-sm text-charcoal-400 mt-2">
              {items.length} item{items.length !== 1 ? 's' : ''} saved
            </p>
          )}
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10 py-7 sm:py-10">
        {loading ? (
          <LoadingScreen />
        ) : error ? (
          <EmptyState icon={Heart} title="Sign in to see your wishlist" description={error} />
        ) : items.length === 0 ? (
          <EmptyState icon={Heart} title="Your wishlist is empty" description="Save items you love for later." />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3.5 sm:gap-5 lg:gap-6 xl:gap-7">
            {items.map((product) => (
              <WishlistCard key={product._id} product={product} onRemove={handleRemove} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}