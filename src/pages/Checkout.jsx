import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { orderApi, couponApi } from '../api/endpoints.js';

const paymentMethods = [
  {
    value: 'cod',
    label: 'Cash on Delivery',
    hint: 'Pay in cash when your order arrives',
    badge: 'COD',
  },
  {
    value: 'jazzcash',
    label: 'JazzCash',
    hint: 'Pay securely via your JazzCash mobile account',
    badge: 'JC',
  },
];

const ACCENT = '#A88950';
const ACCENT_DARK = '#8C6F3C';
const CHARCOAL = '#262626';

const STANDARD_SHIPPING = 250;
const FREE_SHIPPING_THRESHOLD = 10000;

const STEPS = [
  { key: 'contact', label: 'Contact', hint: 'Your email' },
  { key: 'shipping', label: 'Shipping', hint: 'Where we should ship to' },
  { key: 'payment', label: 'Payment', hint: 'Confirm your order' },
];

/* Small inline icons — no external icon dependency */
const IconLock = (props) => (
  <svg viewBox="0 0 20 20" fill="none" width="14" height="14" {...props}>
    <rect x="4" y="9" width="12" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
    <path d="M6.5 9V6.5a3.5 3.5 0 0 1 7 0V9" stroke="currentColor" strokeWidth="1.4" />
  </svg>
);
const IconCheck = (props) => (
  <svg viewBox="0 0 20 20" fill="none" width="13" height="13" {...props}>
    <path d="M4 10.5 8 14l8-8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const IconChevron = (props) => (
  <svg viewBox="0 0 20 20" fill="none" width="14" height="14" {...props}>
    <path d="M6 8l4 4 4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const IconArrowRight = (props) => (
  <svg viewBox="0 0 20 20" fill="none" width="15" height="15" {...props}>
    <path d="M4 10h12M11 5l5 5-5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const IconTag = (props) => (
  <svg viewBox="0 0 20 20" fill="none" width="14" height="14" {...props}>
    <path d="M10.5 3H4v6.5L12 17l6-6-7.5-8Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
    <circle cx="7" cy="6.5" r="1" fill="currentColor" />
  </svg>
);
const IconTruck = (props) => (
  <svg viewBox="0 0 20 20" fill="none" width="14" height="14" {...props}>
    <rect x="1.5" y="6" width="10" height="8" rx="1" stroke="currentColor" strokeWidth="1.3" />
    <path d="M11.5 9h3.2L17 11.5V14h-5.5V9Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
    <circle cx="5" cy="15.5" r="1.4" stroke="currentColor" strokeWidth="1.2" />
    <circle cx="14" cy="15.5" r="1.4" stroke="currentColor" strokeWidth="1.2" />
  </svg>
);

/** Horizontal progress tracker across the top of the page — mirrors a classic
 *  numbered-step checkout, with a connecting line that fills in as steps complete. */
function ProgressTracker({ activeIndex, furthestIndex, onStepClick }) {
  return (
    <ol className="flex items-start max-w-2xl mx-auto lg:mx-0">
      {STEPS.map((step, i) => {
        const state = i < activeIndex ? 'done' : i === activeIndex ? 'active' : 'upcoming';
        const clickable = i <= furthestIndex && i !== activeIndex;
        return (
          <li key={step.key} className="flex items-start flex-1 last:flex-none">
            <div className="flex flex-col items-center gap-2 w-20 sm:w-24">
              <button
                type="button"
                disabled={!clickable}
                onClick={() => clickable && onStepClick(i)}
                className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-[13px] font-semibold transition-colors disabled:cursor-default"
                style={{
                  backgroundColor: state === 'upcoming' ? 'transparent' : state === 'active' ? ACCENT : CHARCOAL,
                  color: state === 'upcoming' ? '#9A9A9A' : '#FFFFFF',
                  border: state === 'upcoming' ? '1.5px solid rgba(38,38,38,0.25)' : 'none',
                }}
              >
                {state === 'done' ? <IconCheck /> : i + 1}
              </button>
              <div className="text-center leading-tight">
                <p
                  className="text-sm"
                  style={{ color: state === 'upcoming' ? '#9A9A9A' : CHARCOAL, fontWeight: state === 'active' ? 600 : 500 }}
                >
                  {step.label}
                </p>
                <p className="text-[11px] text-charcoal-400 hidden sm:block">{step.hint}</p>
              </div>
            </div>
            {i < STEPS.length - 1 && (
              <span
                className="flex-1 h-px mt-4 mx-1"
                style={{ backgroundColor: i < activeIndex ? ACCENT : 'rgba(38,38,38,0.15)' }}
              />
            )}
          </li>
        );
      })}
    </ol>
  );
}

function FieldLabel({ children, htmlFor }) {
  return (
    <label htmlFor={htmlFor} className="sr-only">
      {children}
    </label>
  );
}

export default function Checkout() {
  const { items, subtotal, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [stepIndex, setStepIndex] = useState(0);
  const [furthestIndex, setFurthestIndex] = useState(0);

  const [email, setEmail] = useState(user?.email || '');
  const [address, setAddress] = useState({
    firstName: '',
    lastName: '',
    line1: '',
    line2: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'Pakistan',
    phone: '',
  });
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [couponCode, setCouponCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [couponMsg, setCouponMsg] = useState('');
  const [couponStatus, setCouponStatus] = useState(null); // 'success' | 'error' | null
  const [couponLoading, setCouponLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [summaryOpen, setSummaryOpen] = useState(false);

  const amountToFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);
  const shippingFee = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : STANDARD_SHIPPING;
  const total = Math.max(0, subtotal - discount + shippingFee);
  const itemCount = items.reduce((n, i) => n + i.quantity, 0);

  const updateAddress = (key) => (e) => setAddress({ ...address, [key]: e.target.value });

  const contactValid = useMemo(() => /\S+@\S+\.\S+/.test(email), [email]);
  const shippingValid = useMemo(
    () =>
      Boolean(
        address.firstName && address.lastName && address.line1 && address.city && address.state && address.postalCode
      ),
    [address]
  );

  const goToStep = (i) => {
    setStepIndex(i);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleContinue = () => {
    if (stepIndex === 0 && !contactValid) {
      setError('Enter a valid email to continue.');
      return;
    }
    if (stepIndex === 1 && !shippingValid) {
      setError('Fill in the required delivery fields to continue.');
      return;
    }
    setError('');
    const next = stepIndex + 1;
    setFurthestIndex((f) => Math.max(f, next));
    goToStep(next);
  };

  const applyCoupon = async () => {
    if (!couponCode.trim()) return;
    setCouponMsg('');
    setCouponStatus(null);
    setCouponLoading(true);
    try {
      const res = await couponApi.validate({ code: couponCode, subtotal });
      const coupon = res.data.data;
      const value = coupon.type === 'percentage' ? (subtotal * coupon.value) / 100 : coupon.value;
      setDiscount(coupon.maxDiscount ? Math.min(value, coupon.maxDiscount) : value);
      setCouponMsg(`"${couponCode.toUpperCase()}" applied`);
      setCouponStatus('success');
    } catch (err) {
      setDiscount(0);
      setCouponMsg(err.message);
      setCouponStatus('error');
    } finally {
      setCouponLoading(false);
    }
  };

  const removeCoupon = () => {
    setDiscount(0);
    setCouponCode('');
    setCouponMsg('');
    setCouponStatus(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (stepIndex !== 2) return;
    setError('');
    setSubmitting(true);
    try {
      const res = await orderApi.create({
        items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
        shippingAddress: {
          fullName: `${address.firstName} ${address.lastName}`.trim(),
          email,
          phone: address.phone,
          line1: address.line1,
          line2: address.line2,
          city: address.city,
          state: address.state,
          postalCode: address.postalCode,
          country: address.country,
        },
        paymentMethod,
        couponCode: couponCode || undefined,
      });
      clearCart();
      navigate(`/orders/${res.data.data._id}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-cream-50 flex items-center justify-center section-padding">
        <div className="text-center max-w-sm">
          <div
            className="w-14 h-14 rounded-full mx-auto mb-5 flex items-center justify-center"
            style={{ backgroundColor: 'rgba(38,38,38,0.06)' }}
          >
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none">
              <path
                d="M4 4h2l1.2 12h11.2L20 8H7"
                stroke={CHARCOAL}
                strokeWidth="1.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <circle cx="9.5" cy="20" r="1.2" fill={CHARCOAL} />
              <circle cx="17" cy="20" r="1.2" fill={CHARCOAL} />
            </svg>
          </div>
          <h1 className="font-serif text-xl text-charcoal-800 mb-2">Your cart is empty</h1>
          <p className="text-sm text-charcoal-500 mb-6">Add something you love, then come back to check out.</p>
          <button
            type="button"
            onClick={() => navigate('/shop')}
            className="text-sm font-medium px-6 py-3 rounded-lg text-white transition-opacity hover:opacity-90"
            style={{ backgroundColor: ACCENT }}
          >
            Continue shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream-50">
      {/* Brand + trust bar */}
      <div className="border-b border-charcoal-800/10">
        <div className="max-w-6xl mx-auto px-6 py-6 flex items-center justify-between">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="font-serif text-2xl tracking-[0.06em] text-charcoal-800"
          >
            Lumiere
          </button>
          <div className="flex items-center gap-1.5 text-xs text-charcoal-400">
            <IconLock className="text-charcoal-400" />
            <span>Secure checkout</span>
          </div>
        </div>
        <div className="max-w-6xl mx-auto px-6 pb-6 overflow-x-auto">
          <ProgressTracker activeIndex={stepIndex} furthestIndex={furthestIndex} onStepClick={goToStep} />
        </div>
      </div>

      {/* Mobile order summary — collapsed by default, since the form is the priority on small screens */}
      <div className="lg:hidden border-b border-charcoal-800/10 bg-white/70">
        <button
          type="button"
          onClick={() => setSummaryOpen((v) => !v)}
          className="w-full flex items-center justify-between px-6 py-4 text-sm"
        >
          <span className="flex items-center gap-2 text-charcoal-600">
            <IconChevron
              className={`transition-transform ${summaryOpen ? 'rotate-180' : ''}`}
              style={{ color: CHARCOAL }}
            />
            {summaryOpen ? 'Hide order summary' : `Show order summary (${itemCount} item${itemCount === 1 ? '' : 's'})`}
          </span>
          <span className="font-semibold text-charcoal-800">Rs. {total.toFixed(2)}</span>
        </button>
        {summaryOpen && (
          <div className="px-6 pb-6">
            <OrderSummary
              items={items}
              subtotal={subtotal}
              shippingFee={shippingFee}
              amountToFreeShipping={amountToFreeShipping}
              discount={discount}
              total={total}
              couponCode={couponCode}
              setCouponCode={setCouponCode}
              couponMsg={couponMsg}
              couponStatus={couponStatus}
              couponLoading={couponLoading}
              applyCoupon={applyCoupon}
              removeCoupon={removeCoupon}
              compact
            />
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="max-w-6xl mx-auto px-6 py-10 grid lg:grid-cols-[1fr_380px] gap-12">
        {/* Left: current step */}
        <div className="space-y-6 max-w-xl">
          {!user && stepIndex === 0 && (
            <div className="rounded-xl border border-charcoal-800/10 bg-white/60 px-5 py-3.5 flex items-center justify-between gap-4 text-sm">
              <span className="text-charcoal-500">Checking out as a guest — no account needed.</span>
              <button
                type="button"
                className="text-xs font-medium underline whitespace-nowrap flex-shrink-0"
                style={{ color: ACCENT_DARK }}
                onClick={() => navigate('/login?redirect=/checkout')}
              >
                Log in instead
              </button>
            </div>
          )}

          {/* Step 1 — Contact */}
          {stepIndex === 0 && (
            <section aria-labelledby="step-contact">
              <h2 id="step-contact" className="text-xs font-semibold tracking-wide text-charcoal-500 mb-4">
                Contact information
              </h2>
              <FieldLabel htmlFor="email">Email</FieldLabel>
              <input
                id="email"
                type="email"
                required
                autoComplete="email"
                className="input-field w-full"
                placeholder="Email *"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={!!user}
              />
              <p className="text-xs text-charcoal-400 mt-2">We'll send your order confirmation here.</p>
            </section>
          )}

          {/* Step 2 — Shipping */}
          {stepIndex === 1 && (
            <section aria-labelledby="step-shipping" className="space-y-3">
              <h2 id="step-shipping" className="text-xs font-semibold tracking-wide text-charcoal-500 mb-1">
                Delivery address
              </h2>

              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <FieldLabel htmlFor="firstName">First name</FieldLabel>
                  <input
                    id="firstName"
                    required
                    autoComplete="given-name"
                    className="input-field w-full"
                    placeholder="First name *"
                    value={address.firstName}
                    onChange={updateAddress('firstName')}
                  />
                </div>
                <div>
                  <FieldLabel htmlFor="lastName">Last name</FieldLabel>
                  <input
                    id="lastName"
                    required
                    autoComplete="family-name"
                    className="input-field w-full"
                    placeholder="Last name *"
                    value={address.lastName}
                    onChange={updateAddress('lastName')}
                  />
                </div>
              </div>

              <div>
                <FieldLabel htmlFor="line1">Street address</FieldLabel>
                <input
                  id="line1"
                  required
                  autoComplete="address-line1"
                  className="input-field w-full"
                  placeholder="Street address *"
                  value={address.line1}
                  onChange={updateAddress('line1')}
                />
              </div>

              <div>
                <FieldLabel htmlFor="line2">Apartment, suite, unit, etc.</FieldLabel>
                <input
                  id="line2"
                  autoComplete="address-line2"
                  className="input-field w-full"
                  placeholder="Apartment, suite, unit etc. (optional)"
                  value={address.line2}
                  onChange={updateAddress('line2')}
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <FieldLabel htmlFor="city">Town / City</FieldLabel>
                  <input
                    id="city"
                    required
                    autoComplete="address-level2"
                    className="input-field w-full"
                    placeholder="Town / City *"
                    value={address.city}
                    onChange={updateAddress('city')}
                  />
                </div>
                <div>
                  <FieldLabel htmlFor="postalCode">ZIP code</FieldLabel>
                  <input
                    id="postalCode"
                    required
                    autoComplete="postal-code"
                    className="input-field w-full"
                    placeholder="ZIP code *"
                    value={address.postalCode}
                    onChange={updateAddress('postalCode')}
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <FieldLabel htmlFor="country">Country</FieldLabel>
                  <select id="country" className="input-field w-full" value={address.country} onChange={updateAddress('country')}>
                    <option value="Pakistan">Pakistan</option>
                    <option value="United States">United States</option>
                    <option value="United Kingdom">United Kingdom</option>
                  </select>
                </div>
                <div>
                  <FieldLabel htmlFor="state">State / Province</FieldLabel>
                  <input
                    id="state"
                    required
                    autoComplete="address-level1"
                    className="input-field w-full"
                    placeholder="State *"
                    value={address.state}
                    onChange={updateAddress('state')}
                  />
                </div>
              </div>

              <div>
                <FieldLabel htmlFor="phone">Phone</FieldLabel>
                <input
                  id="phone"
                  autoComplete="tel"
                  className="input-field w-full"
                  placeholder="Phone"
                  value={address.phone}
                  onChange={updateAddress('phone')}
                />
              </div>

              <div className="flex items-center gap-2 text-xs text-charcoal-400 pt-1">
                <IconTruck />
                {shippingFee === 0
                  ? 'Your order qualifies for free shipping.'
                  : `Standard shipping is Rs. ${STANDARD_SHIPPING}. Spend Rs. ${amountToFreeShipping.toFixed(0)} more for free shipping.`}
              </div>
            </section>
          )}

          {/* Step 3 — Payment */}
          {stepIndex === 2 && (
            <section aria-labelledby="step-payment">
              <h2 id="step-payment" className="text-xs font-semibold tracking-wide text-charcoal-500 mb-1">
                Payment method
              </h2>
              <p className="text-xs text-charcoal-400 mb-4">All transactions are secure and encrypted.</p>
              <div className="grid sm:grid-cols-2 gap-3">
                {paymentMethods.map((pm) => {
                  const active = paymentMethod === pm.value;
                  return (
                    <label
                      key={pm.value}
                      className="relative flex items-start gap-3 rounded-xl p-4 cursor-pointer border transition-colors focus-within:ring-2"
                      style={{
                        borderColor: active ? ACCENT : 'rgba(38,38,38,0.14)',
                        backgroundColor: active ? 'rgba(168,137,80,0.06)' : 'transparent',
                      }}
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        className="sr-only"
                        checked={active}
                        onChange={() => setPaymentMethod(pm.value)}
                      />
                      <span
                        className="flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center text-[11px] font-semibold text-white"
                        style={{ backgroundColor: active ? ACCENT : '#26262633' }}
                      >
                        {pm.badge}
                      </span>
                      <span>
                        <span className="block font-medium text-charcoal-800">{pm.label}</span>
                        <span className="block text-xs text-charcoal-400 mt-0.5">{pm.hint}</span>
                      </span>
                      {active && (
                        <span
                          className="absolute top-3 right-3 w-4 h-4 rounded-full flex items-center justify-center"
                          style={{ backgroundColor: ACCENT }}
                        >
                          <IconCheck className="text-white" />
                        </span>
                      )}
                    </label>
                  );
                })}
              </div>

              <div className="mt-6 rounded-xl border border-charcoal-800/10 bg-white/60 p-4 space-y-1.5 text-sm">
                <p className="text-charcoal-500">
                  <span className="text-charcoal-800 font-medium">{`${address.firstName} ${address.lastName}`.trim()}</span>
                  {address.line1 && ` · ${address.line1}`}
                  {address.city && `, ${address.city}`}
                </p>
                <button
                  type="button"
                  onClick={() => goToStep(1)}
                  className="text-xs font-medium underline"
                  style={{ color: ACCENT_DARK }}
                >
                  Edit delivery details
                </button>
              </div>
            </section>
          )}

          {error && (
            <div className="rounded-lg border border-blush-600/30 bg-blush-600/5 px-4 py-3 text-sm text-blush-600" role="alert">
              {error}
            </div>
          )}

          {/* Step navigation */}
          <div className="pt-2">
            {stepIndex < 2 ? (
              <button
                type="button"
                onClick={handleContinue}
                className="w-full flex items-center justify-center gap-2 text-sm font-medium py-3.5 rounded-lg text-white transition-opacity hover:opacity-90"
                style={{ backgroundColor: ACCENT }}
              >
                {stepIndex === 0 ? 'Continue to shipping' : 'Continue to payment'}
                <IconArrowRight />
              </button>
            ) : (
              <button
                type="submit"
                disabled={submitting}
                className="w-full flex items-center justify-center gap-2 text-sm font-medium py-3.5 rounded-lg text-white transition-opacity hover:opacity-90 disabled:opacity-60"
                style={{ backgroundColor: ACCENT }}
              >
                {submitting ? 'Placing order…' : 'Place order'}
              </button>
            )}
            <button
              type="button"
              onClick={() => (stepIndex === 0 ? navigate('/cart') : goToStep(stepIndex - 1))}
              className="w-full text-center text-xs mt-3 text-charcoal-400 hover:text-charcoal-600"
            >
              {stepIndex === 0 ? '← Return to cart' : '← Back'}
            </button>
          </div>
        </div>

        {/* Right: order summary (desktop) */}
        <div className="hidden lg:block h-fit lg:sticky lg:top-8">
          <OrderSummary
            items={items}
            subtotal={subtotal}
            shippingFee={shippingFee}
            amountToFreeShipping={amountToFreeShipping}
            discount={discount}
            total={total}
            couponCode={couponCode}
            setCouponCode={setCouponCode}
            couponMsg={couponMsg}
            couponStatus={couponStatus}
            couponLoading={couponLoading}
            applyCoupon={applyCoupon}
            removeCoupon={removeCoupon}
          />
        </div>
      </form>
    </div>
  );
}

function OrderSummary({
  items,
  subtotal,
  shippingFee,
  amountToFreeShipping,
  discount,
  total,
  couponCode,
  setCouponCode,
  couponMsg,
  couponStatus,
  couponLoading,
  applyCoupon,
  removeCoupon,
  compact,
}) {
  return (
    <div
      className={`rounded-2xl border border-charcoal-800/10 bg-white p-6 space-y-5 ${
        compact ? '' : 'shadow-[0_1px_2px_rgba(0,0,0,0.04)]'
      }`}
    >
      {!compact && <h2 className="font-serif text-lg text-charcoal-800">Order summary</h2>}

      <div className="space-y-4 max-h-72 overflow-y-auto pr-1">
        {items.map((item) => (
          <div key={item.productId} className="flex items-start gap-3">
            <img
              src={item.image}
              alt={item.name}
              className="w-16 h-16 rounded-lg object-cover border border-charcoal-800/10 flex-shrink-0"
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm text-charcoal-800 leading-snug truncate">{item.name}</p>
              <div className="flex items-center gap-2 mt-1.5">
                <span
                  className="inline-flex items-center justify-center text-[11px] font-medium rounded-full px-2 py-0.5 border"
                  style={{ borderColor: 'rgba(38,38,38,0.18)', color: CHARCOAL }}
                >
                  Qty {item.quantity}
                </span>
                <span className="text-xs text-charcoal-400">Rs. {item.price.toFixed(2)} each</span>
              </div>
            </div>
            <span className="text-sm font-medium text-charcoal-800 flex-shrink-0 pt-0.5">
              Rs. {(item.price * item.quantity).toFixed(2)}
            </span>
          </div>
        ))}
      </div>

      {/* Coupon */}
      <div className="pt-1">
        {couponStatus === 'success' ? (
          <div className="flex items-center justify-between rounded-lg border border-[#A88950]/30 bg-[#A88950]/[0.06] px-3.5 py-2.5 text-sm">
            <span className="flex items-center gap-2 text-charcoal-700">
              <IconTag style={{ color: ACCENT }} />
              {couponMsg}
            </span>
            <button type="button" onClick={removeCoupon} className="text-xs underline text-charcoal-400 hover:text-charcoal-600">
              Remove
            </button>
          </div>
        ) : (
          <>
            <div className="flex gap-2">
              <input
                className="input-field flex-1"
                placeholder="Discount code"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    applyCoupon();
                  }
                }}
              />
              <button
                type="button"
                className="btn-secondary !px-4 disabled:opacity-60"
                onClick={applyCoupon}
                disabled={couponLoading || !couponCode.trim()}
              >
                {couponLoading ? 'Checking…' : 'Apply'}
              </button>
            </div>
            {couponMsg && couponStatus === 'error' && <p className="text-xs text-blush-600 mt-2">{couponMsg}</p>}
          </>
        )}
      </div>

      {/* Totals */}
      <div className="text-sm text-charcoal-500 space-y-2 pt-3 border-t border-charcoal-800/10">
        <div className="flex justify-between">
          <span>Subtotal</span>
          <span>Rs. {subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span>Shipping</span>
          <span>{shippingFee === 0 ? 'Free' : `Rs. ${shippingFee.toFixed(2)}`}</span>
        </div>
        {discount > 0 && (
          <div className="flex justify-between" style={{ color: ACCENT_DARK }}>
            <span>Discount</span>
            <span>-Rs. {discount.toFixed(2)}</span>
          </div>
        )}
        <div className="flex justify-between font-semibold text-charcoal-800 pt-3 border-t border-charcoal-800/10 text-base">
          <span>Total</span>
          <span>Rs. {total.toFixed(2)}</span>
        </div>
      </div>

      {shippingFee > 0 && (
        <div className="flex items-center gap-2 text-xs text-charcoal-400 border-t border-charcoal-800/10 pt-4">
          <IconTruck />
          <span>
            Standard shipping is Rs. {STANDARD_SHIPPING}. Spend{' '}
            <span className="font-medium" style={{ color: ACCENT_DARK }}>
              Rs. {amountToFreeShipping.toFixed(0)}
            </span>{' '}
            more for free shipping.
          </span>
        </div>
      )}

      <p className="flex items-center justify-center gap-1.5 text-[11px] text-charcoal-400 pt-1">
        <IconLock />
        Your information is protected and encrypted
      </p>
    </div>
  );
}