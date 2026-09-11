import { useEffect, useRef, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ChevronLeft, ChevronDown, Heart, ShoppingBag, Share2,
  ArrowLeft, ArrowRight, X, Check, Facebook, Instagram,
  MessageCircle, Link2, Ruler, Gem, Footprints, Shirt, Minus, Plus,
} from 'lucide-react';
import { productApi, userApi } from '../api/endpoints.js';
import { useCart } from '../context/CartContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import LoadingScreen from '../components/LoadingScreen.jsx';
import EmptyState from '../components/EmptyState.jsx';

/* ============================================================
   SIZE CHART CONFIGURATION
   ------------------------------------------------------------
   Three chart "types" are supported out of the box: clothing,
   shoes, and jewelry (rings). Each has its own columns, its own
   default rows, and its own pair of display units.

   Resolution order for a product's chart:
     1. product.sizeChartType   -> forces 'clothing' | 'shoes' | 'ring'
     2. product.category / subCategory / name text -> auto-detected
     3. falls back to 'clothing'

   Resolution order for a product's chart ROWS:
     1. product.sizeChart (array from the API, same row shape as
        the relevant default table below)
     2. the built-in default table for that type

   To edit the numbers shown to users, just edit the *_SIZE_CHART
   arrays below — nothing else needs to change.
   ============================================================ */

// ---- Clothing (unisex ready-to-wear / stitched suits) ----
// Values are single measurements per size (inches), matching a
// standard 2-piece/3-piece size guide.
const CLOTHING_SIZE_CHART = [
  { size: 'S',  length: 40.5, shoulder: 17.5, sleeves: 25,   chest: 21, waist: 20.5, hip: 21.5, neck: 15,   shalwar: 40,   bottom: 16 },
  { size: 'M',  length: 41,   shoulder: 18,   sleeves: 25.5, chest: 22, waist: 21.5, hip: 22.5, neck: 15.5, shalwar: 40.5, bottom: 16 },
  { size: 'L',  length: 41.5, shoulder: 18.5, sleeves: 26,   chest: 23, waist: 22.5, hip: 23.5, neck: 16,   shalwar: 41,   bottom: 16 },
  { size: 'XL', length: 42,   shoulder: 19,   sleeves: 26.5, chest: 24, waist: 23.5, hip: 24.5, neck: 16.5, shalwar: 41.5, bottom: 16 },
];

// ---- Footwear ----
// foot length is in inches; pk === eu size for our market.
const SHOE_SIZE_CHART = [
  { pk: '39', us: '6.5',  uk: '6',  foot: 9.5 },
  { pk: '40', us: '7.5',  uk: '7',  foot: 9.8 },
  { pk: '41', us: '8.5',  uk: '8',  foot: 10.1 },
  { pk: '42', us: '9.5',  uk: '9',  foot: 10.4 },
  { pk: '43', us: '10.5', uk: '10', foot: 10.7 },
  { pk: '44', us: '11.5', uk: '11', foot: 11.0 },
];

// ---- Jewelry (rings) ----
// diameter / circumference are in millimeters (industry standard base unit).
const RING_SIZE_CHART = [
  { us: '3',   uk: 'F', diameter: 14.1, circumference: 44.2 },
  { us: '3.5', uk: 'G', diameter: 14.5, circumference: 45.5 },
  { us: '4',   uk: 'H', diameter: 14.9, circumference: 46.8 },
  { us: '4.5', uk: 'I', diameter: 15.3, circumference: 48.0 },
  { us: '5',   uk: 'J', diameter: 15.7, circumference: 49.3 },
  { us: '5.5', uk: 'K', diameter: 16.1, circumference: 50.6 },
  { us: '6',   uk: 'L', diameter: 16.5, circumference: 51.9 },
  { us: '6.5', uk: 'M', diameter: 16.9, circumference: 53.1 },
  { us: '7',   uk: 'N', diameter: 17.3, circumference: 54.4 },
  { us: '7.5', uk: 'O', diameter: 17.7, circumference: 55.7 },
  { us: '8',   uk: 'P', diameter: 18.1, circumference: 57.0 },
  { us: '8.5', uk: 'Q', diameter: 18.5, circumference: 58.2 },
  { us: '9',   uk: 'R', diameter: 18.9, circumference: 59.5 },
  { us: '9.5', uk: 'S', diameter: 19.3, circumference: 60.8 },
  { us: '10',  uk: 'T', diameter: 19.7, circumference: 62.1 },
];

const SIZE_CHART_CONFIGS = {
  clothing: {
    icon: Shirt,
    title: 'Size Chart',
    idKey: 'size',
    units: ['in', 'cm'],
    unitLabel: { in: 'inches', cm: 'centimeters' },
    convert: (v, unit) => (unit === 'cm' ? Math.round(v * 2.54 * 10) / 10 : v),
    columns: [
      { key: 'size',     label: 'Size',     measurement: false },
      { key: 'length',   label: 'Length',   measurement: true },
      { key: 'shoulder', label: 'Shoulder', measurement: true },
      { key: 'sleeves',  label: 'Sleeves',  measurement: true },
      { key: 'chest',    label: 'H/Chest',  measurement: true },
      { key: 'waist',    label: 'H/Waist',  measurement: true },
      { key: 'hip',      label: 'H/Hip',    measurement: true },
      { key: 'neck',     label: 'Neck',     measurement: true },
      { key: 'shalwar',  label: 'Shalwar',  measurement: true },
      { key: 'bottom',   label: 'Bottom',   measurement: true },
    ],
    defaultRows: CLOTHING_SIZE_CHART,
    matchesSelectedSize: (row, sizes) => sizes?.includes(row.size),
  },
  shoes: {
    icon: Footprints,
    title: 'Shoe Size Guide',
    idKey: 'pk',
    units: ['in', 'cm'],
    unitLabel: { in: 'inches', cm: 'centimeters' },
    convert: (v, unit) => (unit === 'cm' ? Math.round(v * 2.54 * 10) / 10 : v),
    columns: [
      { key: 'pk',   label: 'PK / EU',     measurement: false },
      { key: 'us',   label: 'US',          measurement: false },
      { key: 'uk',   label: 'UK',          measurement: false },
      { key: 'foot', label: 'Foot Length', measurement: true },
    ],
    defaultRows: SHOE_SIZE_CHART,
    matchesSelectedSize: (row, sizes) => sizes?.includes(row.pk) || sizes?.includes(row.us),
  },
  ring: {
    icon: Gem,
    title: 'Jewelry Size Guide',
    idKey: 'us',
    units: ['mm', 'in'],
    unitLabel: { mm: 'millimeters', in: 'inches' },
    convert: (v, unit) => (unit === 'in' ? Math.round((v / 25.4) * 100) / 100 : v),
    columns: [
      { key: 'us',            label: 'US Size',      measurement: false },
      { key: 'uk',            label: 'UK Size',       measurement: false },
      { key: 'diameter',      label: 'Diameter',      measurement: true },
      { key: 'circumference', label: 'Circumference', measurement: true },
    ],
    defaultRows: RING_SIZE_CHART,
    matchesSelectedSize: (row, sizes) => sizes?.includes(row.us) || sizes?.includes(row.uk),
  },
};

// Detects which chart to use for a product. Prefer an explicit
// product.sizeChartType from the API; otherwise sniff the category,
// subCategory, and product name text. This is checked in order of
// most-specific signal to least-specific, and jewelry/shoe keywords
// are checked BEFORE falling back to clothing so a jewelry or shoe
// product never accidentally renders the dress/suit chart.
function resolveSizeChartType(product) {
  if (product?.sizeChartType && SIZE_CHART_CONFIGS[product.sizeChartType]) {
    return product.sizeChartType;
  }

  const text = `${product?.category || ''} ${product?.subCategory || ''} ${product?.name || ''}`.toLowerCase();

  const JEWELRY_KEYWORDS = /ring|jewell?ery|bangle|bracelet|necklace|earring|pendant|anklet|chain|choker/;
  const SHOE_KEYWORDS = /shoe|sandal|heel|sneaker|footwear|slipper|loafer|khussa|chappal|pump|boot/;

  if (JEWELRY_KEYWORDS.test(text)) return 'ring';
  if (SHOE_KEYWORDS.test(text)) return 'shoes';
  return 'clothing';
}

export default function ProductDetails() {
  const { slug } = useParams();
  const { cartItems, addItem } = useCart();
  const { user } = useAuth();
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [qty, setQty] = useState(1);
  const [size, setSize] = useState('');
  const [color, setColor] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [added, setAdded] = useState(false);
  const [wishlisted, setWishlisted] = useState(false);

  const [activeImage, setActiveImage] = useState(0);
  const [gridOpen, setGridOpen] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);
  const [shareMenuOpen, setShareMenuOpen] = useState(false);
  const [sizeChartOpen, setSizeChartOpen] = useState(false);
  const [chartUnit, setChartUnit] = useState('in');
  const [openDropdown, setOpenDropdown] = useState(null); // 'color' | null

  const shareMenuRef = useRef(null);
  const shareBtnRef = useRef(null);
  const colorDropdownRef = useRef(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    productApi
      .bySlug(slug)
      .then((res) => {
        if (!mounted) return;
        const p = res.data.data;
        setProduct(p);
        setSize(p.sizes?.[0] || '');
        setColor(p.colors?.[0] || '');
        setActiveImage(0);
        return productApi.reviews(p._id);
      })
      .then((res) => mounted && res && setReviews(res.data?.data || []))
      .catch((err) => mounted && setError(err.message))
      .finally(() => mounted && setLoading(false));
    return () => {
      mounted = false;
    };
  }, [slug]);

  // Close share popover / dropdowns on outside click / Escape
  useEffect(() => {
    const onClickOutside = (e) => {
      if (
        shareMenuOpen &&
        shareMenuRef.current &&
        !shareMenuRef.current.contains(e.target) &&
        !shareBtnRef.current?.contains(e.target)
      ) {
        setShareMenuOpen(false);
      }
      if (
        openDropdown === 'color' &&
        colorDropdownRef.current &&
        !colorDropdownRef.current.contains(e.target)
      ) {
        setOpenDropdown(null);
      }
    };
    const onEscape = (e) => {
      if (e.key === 'Escape') {
        setShareMenuOpen(false);
        setGridOpen(false);
        setLightboxOpen(false);
        setSizeChartOpen(false);
        setOpenDropdown(null);
      }
    };
    document.addEventListener('mousedown', onClickOutside);
    document.addEventListener('keydown', onEscape);
    return () => {
      document.removeEventListener('mousedown', onClickOutside);
      document.removeEventListener('keydown', onEscape);
    };
  }, [shareMenuOpen, openDropdown]);

  const stock = product?.stock || 0;
  const clampQty = (n) => Math.max(1, Math.min(stock, n));

  const handleAddToCart = () => {
    if (stock === 0) return;
    addItem(product, clampQty(qty), { size, color });
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  const handleWishlist = () => {
    if (!user) return;
    setWishlisted((w) => !w);
    userApi.toggleWishlist(product._id).catch(() => {});
  };

  const images = product?.images || [];
  const goPrev = () => setActiveImage((i) => (i - 1 + images.length) % images.length);
  const goNext = () => setActiveImage((i) => (i + 1) % images.length);

  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';
  const shareText = product?.name || '';

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setShareCopied(true);
      setTimeout(() => setShareCopied(false), 2000);
    } catch {
      // clipboard denied — nothing more to do
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: shareText, text: shareText, url: shareUrl });
        setShareMenuOpen(false);
      } catch {
        // user cancelled the native share sheet
      }
    }
  };

  const shareToWhatsapp = () => {
    window.open(
      `https://wa.me/?text=${encodeURIComponent(`${shareText} — ${shareUrl}`)}`,
      '_blank',
      'noopener,noreferrer'
    );
  };

  const shareToFacebook = () => {
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
      '_blank',
      'noopener,noreferrer'
    );
  };

  const shareToInstagram = async () => {
    // Instagram has no web share-intent for posts/links — copy link then open Instagram.
    await handleCopyLink();
    window.open('https://www.instagram.com/', '_blank', 'noopener,noreferrer');
  };

  if (loading) return <LoadingScreen label="Loading product…" />;
  if (error || !product)
    return (
      <EmptyState
        title="Product not found"
        description={error || "This product doesn't exist or is no longer available."}
        action={
          <Link to="/shop" className="btn-primary">
            Back to Shop
          </Link>
        }
      />
    );

  const cartCount = cartItems?.reduce((sum, i) => sum + i.qty, 0) || 0;

  const onSale = product.compareAtPrice > product.price;
  const discountPercent = onSale
    ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
    : 0;

  const infoSections = [
    { label: 'Description', text: product.description },
    { label: 'Details', text: product.details },
    { label: 'Fit', text: product.fit },
  ].filter((s) => s.text);

  // ---- Size chart resolution ----
  const chartType = resolveSizeChartType(product);
  const chartConfig = SIZE_CHART_CONFIGS[chartType];
  const activeUnit = chartConfig.units.includes(chartUnit) ? chartUnit : chartConfig.units[0];

  const allChartRows = product.sizeChart?.length ? product.sizeChart : chartConfig.defaultRows;
  // Prefer rows that match the sizes this product actually sells; if none
  // match (e.g. sizes stored in a different format), fall back to the full
  // reference table rather than showing nothing.
  const matchedRows = allChartRows.filter((row) => chartConfig.matchesSelectedSize(row, product.sizes));
  const sizeChartRows = matchedRows.length > 0 ? matchedRows : allChartRows;
  const hasSizeChart = (product.sizes?.length || 0) > 0;
  const ChartIcon = chartConfig.icon;

  // ---- Full-page size chart view ----
  // Takes over the whole screen (rather than a modal) with a single back
  // button at the top. The unit toggle up top controls the whole table, so
  // individual cells show plain numbers only — no repeated unit suffixes.
  if (sizeChartOpen && hasSizeChart) {
    return (
      <div className="min-h-screen bg-white">
        <div className="mx-auto max-w-3xl px-6 lg:px-10 py-10">
          <button
            type="button"
            onClick={() => setSizeChartOpen(false)}
            className="inline-flex items-center gap-1.5 text-sm text-charcoal-500 hover:text-charcoal-800 mb-10 transition-colors"
          >
            <ChevronLeft className="h-4 w-4" /> Back to product
          </button>

          <div className="flex items-start justify-between gap-6 mb-8 flex-wrap">
            <div className="flex items-center gap-3.5">
              <span className="h-12 w-12 shrink-0 rounded-full bg-charcoal-900/[0.04] flex items-center justify-center text-charcoal-700">
                <ChartIcon className="h-5 w-5" strokeWidth={1.5} />
              </span>
              <div className="min-w-0">
                <h1 className="font-serif text-2xl tracking-wide text-charcoal-900 font-normal not-italic truncate">
                  {chartConfig.title}
                </h1>
                <p className="text-[13px] text-charcoal-400 mt-0.5 truncate">{product.name}</p>
              </div>
            </div>

            {/* Unit toggle */}
            {chartConfig.units.length > 1 && (
              <div className="inline-flex rounded-full border border-charcoal-900/10 p-1 bg-charcoal-900/[0.02] shrink-0">
                {chartConfig.units.map((u) => (
                  <button
                    key={u}
                    type="button"
                    onClick={() => setChartUnit(u)}
                    className={`px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wide transition-all ${
                      activeUnit === u
                        ? 'bg-charcoal-900 text-cream-50 shadow-sm'
                        : 'text-charcoal-500 hover:text-charcoal-800'
                    }`}
                  >
                    {u}
                  </button>
                ))}
              </div>
            )}
          </div>

          <p className="text-[13px] text-charcoal-400 mb-5 -mt-3">
            All measurements shown in {chartConfig.unitLabel[activeUnit]}.
          </p>

          <div className="overflow-x-auto rounded-2xl border border-charcoal-900/[0.08]">
            <table className="w-full min-w-[520px] text-sm border-collapse">
              <thead>
                <tr className="bg-charcoal-900/[0.03]">
                  {chartConfig.columns.map((col) => (
                    <th
                      key={col.key}
                      className="text-left font-semibold px-5 py-3.5 text-[11px] tracking-wide uppercase text-charcoal-500 whitespace-nowrap border-b border-charcoal-900/[0.08]"
                    >
                      {col.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sizeChartRows.map((row, idx) => (
                  <tr
                    key={row[chartConfig.idKey] ?? idx}
                    className={`${row[chartConfig.idKey] === size ? 'bg-blush-50/60' : 'bg-white'} ${
                      idx !== sizeChartRows.length - 1 ? 'border-b border-charcoal-900/[0.05]' : ''
                    }`}
                  >
                    {chartConfig.columns.map((col, colIdx) => (
                      <td
                        key={col.key}
                        className={`px-5 py-3.5 whitespace-nowrap ${
                          colIdx === 0 ? 'font-medium text-charcoal-800' : 'text-charcoal-500'
                        }`}
                      >
                        {col.measurement ? chartConfig.convert(row[col.key], activeUnit) : row[col.key]}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="text-[12px] text-charcoal-400 mt-5 leading-relaxed max-w-lg">
            {chartType === 'ring'
              ? "Not sure of your size? Wrap a strip of paper around your finger, mark where it overlaps, then match the length to the closest circumference above."
              : chartType === 'shoes'
              ? 'Measure your foot length in the evening (feet swell slightly through the day) and match it to the closest size above.'
              : "For the best fit, measure yourself and compare with the chart above. If you're between sizes, we recommend sizing up."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-charcoal-50/40">
      <div className="mx-auto max-w-6xl px-6 lg:px-10 py-10 lg:py-14 grid md:grid-cols-2 gap-14 lg:gap-24">
        {/* Left — gallery */}
        <div>
          <Link
            to="/shop"
            className="inline-flex items-center gap-1.5 text-sm text-charcoal-500 hover:text-charcoal-800 mb-6 transition-colors"
          >
            <ChevronLeft className="h-4 w-4" /> Back
          </Link>

          <div className="relative">
            <button
              type="button"
              onClick={() => images.length > 0 && setLightboxOpen(true)}
              className="relative aspect-[3/4] w-full rounded-[28px] overflow-hidden bg-charcoal-100 block cursor-zoom-in group ring-1 ring-charcoal-900/[0.06] shadow-[0_24px_60px_-28px_rgba(30,25,20,0.4)]"
            >
              {images[activeImage] && (
                <img
                  src={images[activeImage]}
                  alt={product.name}
                  className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                />
              )}
              {onSale && (
                <span className="absolute top-5 left-5 flex items-center gap-1 rounded-full bg-charcoal-900 px-3.5 py-1.5 text-[11px] font-semibold tracking-[0.08em] text-cream-50 shadow-md">
                  −{discountPercent}% OFF
                </span>
              )}
              {images.length > 1 && (
                <span className="absolute bottom-4 right-4 rounded-full bg-charcoal-900/70 backdrop-blur px-2.5 py-1 text-[11px] font-medium text-cream-50 tabular-nums">
                  {activeImage + 1} / {images.length}
                </span>
              )}
            </button>

            {/* Share — overlay chip, kept outside the image button to stay a11y-valid */}
            <div className="absolute top-5 right-5">
              <button
                ref={shareBtnRef}
                type="button"
                onClick={() => setShareMenuOpen((o) => !o)}
                title="Share"
                className={`h-10 w-10 rounded-full flex items-center justify-center backdrop-blur transition-all ${
                  shareMenuOpen
                    ? 'bg-charcoal-900 text-cream-50'
                    : 'bg-white/85 text-charcoal-700 hover:bg-white'
                }`}
              >
                <Share2 className="h-4 w-4" strokeWidth={1.75} />
              </button>

              <AnimatePresence>
                {shareMenuOpen && (
                  <motion.div
                    ref={shareMenuRef}
                    initial={{ opacity: 0, y: 8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.96 }}
                    transition={{ duration: 0.18, ease: [0.4, 0, 0.2, 1] }}
                    className="absolute z-30 top-12 right-0 w-64 rounded-2xl bg-white shadow-xl border border-charcoal-900/[0.06] p-2 origin-top-right"
                  >
                    <p className="px-3 pt-2 pb-1.5 text-[11px] font-semibold tracking-[0.1em] uppercase text-charcoal-400">
                      Share this product
                    </p>

                    <ShareRow
                      icon={<MessageCircle className="h-4 w-4" />}
                      label="WhatsApp"
                      iconBg="bg-[#25D366]/10 text-[#1DA851]"
                      onClick={shareToWhatsapp}
                    />
                    <ShareRow
                      icon={<Facebook className="h-4 w-4" />}
                      label="Facebook"
                      iconBg="bg-[#1877F2]/10 text-[#1877F2]"
                      onClick={shareToFacebook}
                    />
                    <ShareRow
                      icon={<Instagram className="h-4 w-4" />}
                      label="Instagram"
                      iconBg="bg-gradient-to-br from-[#f9ce34]/15 via-[#ee2a7b]/15 to-[#6228d7]/15 text-[#c4187a]"
                      onClick={shareToInstagram}
                    />

                    <div className="my-1.5 border-t border-charcoal-900/[0.06]" />

                    <ShareRow
                      icon={shareCopied ? <Check className="h-4 w-4" /> : <Link2 className="h-4 w-4" />}
                      label={shareCopied ? 'Link copied!' : 'Copy link'}
                      iconBg="bg-charcoal-900/5 text-charcoal-700"
                      onClick={handleCopyLink}
                      highlight={shareCopied}
                    />

                    {typeof navigator !== 'undefined' && navigator.share && (
                      <ShareRow
                        icon={<Share2 className="h-4 w-4" />}
                        label="More options"
                        iconBg="bg-charcoal-900/5 text-charcoal-700"
                        onClick={handleNativeShare}
                      />
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Thumbnail rail + navigation */}
          {images.length > 1 && (
            <>
              <div className="flex gap-2.5 overflow-x-auto mt-4 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {images.slice(0, 6).map((url, i) => (
                  <button
                    key={url}
                    type="button"
                    onClick={() => setActiveImage(i)}
                    className={`relative shrink-0 h-[84px] w-16 rounded-xl overflow-hidden ring-2 transition-all ${
                      i === activeImage
                        ? 'ring-charcoal-900'
                        : 'ring-transparent hover:ring-charcoal-900/20'
                    }`}
                  >
                    <img src={url} alt="" className="h-full w-full object-cover" />
                    {i === 5 && images.length > 6 && (
                      <span className="absolute inset-0 bg-charcoal-900/65 flex items-center justify-center text-cream-50 text-xs font-semibold">
                        +{images.length - 6}
                      </span>
                    )}
                  </button>
                ))}
              </div>

              <div className="flex items-center justify-between mt-3">
                <div className="flex items-center gap-0.5 -ml-2">
                  <button
                    type="button"
                    onClick={goPrev}
                    className="h-8 w-8 rounded-full flex items-center justify-center text-charcoal-400 hover:text-charcoal-800 transition-colors"
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={goNext}
                    className="h-8 w-8 rounded-full flex items-center justify-center text-charcoal-400 hover:text-charcoal-800 transition-colors"
                  >
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => setGridOpen(true)}
                  className="text-xs font-medium text-charcoal-500 hover:text-charcoal-900 underline-offset-4 hover:underline transition-colors"
                >
                  View all {images.length} photos
                </button>
              </div>
            </>
          )}
        </div>

        {/* Right — details */}
        <div className="flex flex-col pt-1 md:pt-14">
          <h1 className="font-serif text-[32px] leading-[1.15] tracking-wide text-charcoal-900 mb-3.5 not-italic font-normal">
            {product.name}
          </h1>

          {onSale ? (
            <div className="flex items-baseline gap-3.5 mb-7">
              <p className="font-display text-[28px] font-semibold tracking-wide text-blush-600">
                Rs. {product.price.toLocaleString()}
              </p>
              <p className="text-sm text-charcoal-400 line-through font-medium tracking-wide">
                Rs. {product.compareAtPrice.toLocaleString()}
              </p>
              <span className="rounded-full bg-blush-50 text-blush-600 text-[11px] font-semibold tracking-[0.06em] uppercase px-2.5 py-1">
                Save {discountPercent}%
              </span>
            </div>
          ) : (
            <p className="font-display text-[24px] font-medium tracking-wide text-charcoal-800 mb-7">
              Rs. {product.price.toLocaleString()}
            </p>
          )}

          {infoSections.length > 0 && (
            <div className="pb-7 mb-7 border-b border-charcoal-900/[0.07] space-y-5">
              {infoSections.map((section) => (
                <div key={section.label}>
                  <p className="text-[11px] font-semibold tracking-widest uppercase text-charcoal-800 mb-1.5">
                    {section.label}
                  </p>
                  <p className="text-[14.5px] text-charcoal-500 leading-relaxed font-normal not-italic max-w-md">
                    {section.text}
                  </p>
                </div>
              ))}
            </div>
          )}

          {(product.sizes?.length > 0 || product.colors?.length > 0) && (
            <div className="mb-7 max-w-sm space-y-6">
              {/* Sizes — premium chip selector */}
              {product.sizes?.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-2.5">
                    <p className="text-[11px] font-semibold tracking-widest uppercase text-charcoal-800">
                      Size
                    </p>
                    {hasSizeChart && (
                      <button
                        type="button"
                        onClick={() => setSizeChartOpen(true)}
                        className="inline-flex items-center gap-1 text-[11px] font-medium text-charcoal-500 hover:text-charcoal-900 transition-colors"
                      >
                        <Ruler className="h-3.5 w-3.5" />
                        Size guide
                      </button>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {product.sizes.map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setSize(s)}
                        aria-pressed={s === size}
                        className={`min-w-[46px] h-11 px-3.5 rounded-lg border text-sm font-medium tracking-wide transition-all ${
                          s === size
                            ? 'border-charcoal-900 bg-charcoal-900 text-cream-50 shadow-[0_8px_18px_-8px_rgba(30,25,20,0.55)]'
                            : 'border-charcoal-900/15 bg-white text-charcoal-700 hover:border-charcoal-900/40'
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Colors — dropdown */}
              {product.colors?.length > 0 && (
                <PremiumDropdown
                  dropdownRef={colorDropdownRef}
                  label="Color"
                  value={color}
                  options={product.colors}
                  isOpen={openDropdown === 'color'}
                  onToggle={() => setOpenDropdown((d) => (d === 'color' ? null : 'color'))}
                  onSelect={(v) => {
                    setColor(v);
                    setOpenDropdown(null);
                  }}
                />
              )}
            </div>
          )}

          <div className="flex items-stretch gap-3 mb-6 max-w-sm">
            <div className="flex items-center gap-3.5 rounded-lg border border-charcoal-900/10 bg-white px-3.5 shadow-[0_2px_10px_-4px_rgba(30,25,20,0.1)]">
              <button
                type="button"
                className="h-9 w-9 rounded-md flex items-center justify-center text-charcoal-500 hover:bg-charcoal-900/[0.04] hover:text-charcoal-900 disabled:opacity-25 disabled:hover:bg-transparent transition-colors"
                disabled={qty <= 1}
                onClick={() => setQty((q) => clampQty(q - 1))}
              >
                <Minus className="h-3.5 w-3.5" />
              </button>
              <span className="text-sm text-charcoal-800 tabular-nums font-medium w-4 text-center">
                {clampQty(qty)}
              </span>
              <button
                type="button"
                className="h-9 w-9 rounded-md flex items-center justify-center text-charcoal-500 hover:bg-charcoal-900/[0.04] hover:text-charcoal-900 disabled:opacity-25 disabled:hover:bg-transparent transition-colors"
                disabled={qty >= stock}
                onClick={() => setQty((q) => clampQty(q + 1))}
              >
                <Plus className="h-3.5 w-3.5" />
              </button>
            </div>

            <button
              className="flex-1 rounded-lg bg-charcoal-900 text-cream-50 text-xs font-semibold tracking-widest uppercase hover:bg-charcoal-800 active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-[0_14px_30px_-12px_rgba(30,25,20,0.55)]"
              disabled={stock === 0}
              onClick={handleAddToCart}
            >
              {added ? 'Added!' : stock === 0 ? 'Out of Stock' : 'Add to Cart'}
            </button>

            <button
              onClick={handleWishlist}
              title="Add to wishlist"
              className="shrink-0 h-auto w-12 rounded-lg border border-charcoal-900/10 bg-white flex items-center justify-center text-charcoal-500 hover:text-blush-500 hover:border-blush-200 transition-colors"
            >
              <Heart className={`h-[18px] w-[18px] ${wishlisted ? 'fill-blush-500 text-blush-500' : ''}`} />
            </button>
          </div>

          <p className="text-[13px] text-charcoal-400 font-normal">
            {stock > 0 ? `${stock} in stock — ` : ''}Free shipping on orders 50 USD
          </p>

          {reviews.length > 0 && (
            <div className="border-t border-charcoal-900/[0.07] pt-8 mt-10">
              <h3 className="text-[11px] font-semibold tracking-widest uppercase text-charcoal-800 mb-5">
                Customer Reviews
              </h3>
              <div className="space-y-4">
                {reviews.map((r) => (
                  <div
                    key={r._id}
                    className="flex gap-3.5 text-sm bg-white rounded-2xl p-4 border border-charcoal-900/[0.06]"
                  >
                    <span className="shrink-0 h-9 w-9 rounded-full bg-charcoal-900/[0.06] text-charcoal-700 text-xs font-semibold flex items-center justify-center">
                      {(r.user?.name || '?').trim().charAt(0).toUpperCase()}
                    </span>
                    <div className="min-w-0">
                      <p className="font-medium text-charcoal-800 mb-1">{r.user?.name}</p>
                      <p className="text-charcoal-500 leading-relaxed font-normal not-italic">
                        {r.comment}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Grid modal — premium "view all images" */}
      <AnimatePresence>
        {gridOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setGridOpen(false)}
              className="absolute inset-0 bg-charcoal-900/60 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, y: 16, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.97 }}
              transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
              className="relative w-full max-w-xl rounded-3xl bg-white p-6 shadow-2xl border border-white/10"
            >
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h3 className="font-serif text-xl tracking-wide text-charcoal-900 font-normal not-italic">
                    All Images
                  </h3>
                  <p className="text-xs text-charcoal-400 mt-0.5">{images.length} photos · tap to select</p>
                </div>
                <button
                  onClick={() => setGridOpen(false)}
                  aria-label="Close"
                  className="h-9 w-9 rounded-full flex items-center justify-center text-charcoal-500 hover:bg-charcoal-900/5 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>
              <div className="grid grid-cols-3 gap-3.5">
                {images.map((url, i) => (
                  <button
                    key={url}
                    type="button"
                    onClick={() => {
                      setActiveImage(i);
                      setGridOpen(false);
                    }}
                    className={`group relative aspect-square overflow-hidden rounded-2xl border-2 transition-all ${
                      i === activeImage
                        ? 'border-blush-500 ring-2 ring-blush-200'
                        : 'border-transparent hover:border-charcoal-900/10'
                    }`}
                  >
                    <img
                      src={url}
                      alt=""
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                    />
                    <span
                      className={`absolute top-1.5 left-1.5 h-5 w-5 rounded-full text-[10px] font-semibold flex items-center justify-center transition-opacity ${
                        i === activeImage
                          ? 'bg-blush-500 text-white opacity-100'
                          : 'bg-charcoal-900/60 text-white opacity-0 group-hover:opacity-100'
                      }`}
                    >
                      {i + 1}
                    </span>
                  </button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Lightbox — full image view with left/right */}
      {lightboxOpen && images[activeImage] && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-charcoal-900/95 p-4">
          <button
            type="button"
            onClick={() => setLightboxOpen(false)}
            className="absolute top-5 right-5 h-10 w-10 rounded-full bg-cream-50/10 flex items-center justify-center text-cream-50 hover:bg-cream-50/20"
          >
            <X size={20} />
          </button>

          {images.length > 1 && (
            <button
              type="button"
              onClick={goPrev}
              className="absolute left-4 sm:left-8 h-11 w-11 rounded-full bg-cream-50/10 flex items-center justify-center text-cream-50 hover:bg-cream-50/20"
            >
              <ArrowLeft size={18} />
            </button>
          )}

          <img
            src={images[activeImage]}
            alt={product.name}
            className="max-h-[85vh] max-w-full object-contain rounded-lg"
          />

          {images.length > 1 && (
            <button
              type="button"
              onClick={goNext}
              className="absolute right-4 sm:right-8 h-11 w-11 rounded-full bg-cream-50/10 flex items-center justify-center text-cream-50 hover:bg-cream-50/20"
            >
              <ArrowRight size={18} />
            </button>
          )}

          {images.length > 1 && (
            <span className="absolute bottom-6 rounded-full bg-cream-50/10 px-3 py-1 text-xs text-cream-50">
              {activeImage + 1} / {images.length}
            </span>
          )}
        </div>
      )}

      {/* Floating cart icon */}
      <Link
        to="/cart"
        className="fixed bottom-8 right-8 h-14 w-14 rounded-2xl bg-white shadow-[0_16px_40px_-16px_rgba(30,25,20,0.45)] flex items-center justify-center text-charcoal-900 hover:scale-105 transition-transform"
      >
        <ShoppingBag className="h-5 w-5" strokeWidth={1.75} />
        {cartCount > 0 && (
          <span className="absolute -top-1.5 -right-1.5 h-5 w-5 rounded-full bg-blush-500 text-cream-50 text-[10px] font-semibold flex items-center justify-center">
            {cartCount}
          </span>
        )}
      </Link>
    </div>
  );
}

/**
 * Fully custom, app-styled dropdown — replaces the native <select> so the
 * open list always renders in our white/cream theme instead of the OS's
 * native (often dark, on Android) picker. Used for Color only now.
 */
function PremiumDropdown({ dropdownRef, label, value, options, isOpen, onToggle, onSelect }) {
  return (
    <div className="relative" ref={dropdownRef}>
      <p className="text-[11px] font-semibold tracking-widest uppercase text-charcoal-800 mb-2.5">
        {label}
      </p>
      <button
        type="button"
        onClick={onToggle}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className={`w-full flex items-center justify-between rounded-lg border bg-white px-4 py-3 text-sm text-charcoal-700 font-normal transition-all ${
          isOpen
            ? 'border-charcoal-900/25 shadow-[0_4px_16px_-6px_rgba(30,25,20,0.2)]'
            : 'border-charcoal-900/10 hover:border-charcoal-900/25'
        }`}
      >
        <span className="truncate font-medium text-charcoal-800">{value}</span>
        <ChevronDown
          className={`h-3.5 w-3.5 text-charcoal-400 shrink-0 ml-2 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.ul
            role="listbox"
            initial={{ opacity: 0, y: 6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.98 }}
            transition={{ duration: 0.15, ease: [0.4, 0, 0.2, 1] }}
            className="absolute z-30 mt-2 w-full max-h-60 overflow-auto rounded-xl bg-white border border-charcoal-900/[0.08] shadow-xl p-1.5 origin-top"
          >
            {options.map((opt) => (
              <li key={opt}>
                <button
                  type="button"
                  role="option"
                  aria-selected={opt === value}
                  onClick={() => onSelect(opt)}
                  className={`w-full flex items-center justify-between gap-2 rounded-lg px-3 py-2.5 text-sm text-left transition-colors ${
                    opt === value
                      ? 'bg-blush-50 text-blush-600 font-medium'
                      : 'text-charcoal-700 hover:bg-charcoal-900/[0.04] font-normal'
                  }`}
                >
                  <span className="truncate">{opt}</span>
                  {opt === value && <Check className="h-3.5 w-3.5 shrink-0" />}
                </button>
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}

function ShareRow({ icon, label, iconBg, onClick, highlight }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
        highlight ? 'text-lilac-600 bg-lilac-50' : 'text-charcoal-700 hover:bg-charcoal-900/[0.04]'
      }`}
    >
      <span className={`h-8 w-8 rounded-full flex items-center justify-center ${iconBg}`}>
        {icon}
      </span>
      {label}
    </button>
  );
}