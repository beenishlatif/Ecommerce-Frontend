import { useState, useEffect } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShoppingBag,
  Heart,
  User,
  Search,
  Menu,
  X,
  ChevronDown,
  Home as HomeIcon,
  Grid3x3,
  Store,
  Info,
  Mail,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { useCart } from '../context/CartContext.jsx';

// Links can optionally carry `children` (subcategories). The expand arrow
// only ever renders on an item that itself has children — a subcategory
// with no further children (e.g. Men, Women) renders as a plain row.
// Each top-level link also carries an `icon` — used in the mobile drawer
// so every row reads as icon + label, matching the bottom shortcut bar.
const links = [
  { to: '/', label: 'Home', icon: HomeIcon },
  { to: '/shop', label: 'Shop', icon: Store },
  {
    to: '/categories',
    label: 'Categories',
    icon: Grid3x3,
    children: [
      { to: '/categories/men', label: 'Men' },
      { to: '/categories/women', label: 'Women' },
    ],
  },
  { to: '/about', label: 'About', icon: Info },
  { to: '/contact', label: 'Contact', icon: Mail },
];

// Bottom shortcut bar (mobile only) — kept to five pages people browse
// most. Cart and Profile are reachable from the top bar on every screen,
// so the bottom bar focuses on browsing entry points instead.
const shortcuts = [
  { to: '/', label: 'Home', icon: HomeIcon },
  { to: '/shop', label: 'Shop', icon: Store },
  { to: '/categories', label: 'Categories', icon: Grid3x3 },
  { to: '/wishlist', label: 'Wishlist', icon: Heart },
  { to: '/contact', label: 'Contact', icon: Mail },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [expanded, setExpanded] = useState(null);
  const { user } = useAuth();
  const { itemCount } = useCart();
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  // Close the drawer automatically on route change (e.g. tapping a shortcut
  // while the drawer happens to be open).
  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  // Reserve space at the BOTTOM of the actual scrollable page (not right
  // after the navbar) so the fixed mobile bottom tab-bar never covers page
  // content. Applied directly on <body> instead of rendering an extra div
  // right here — a div here would sit between the navbar and the routed
  // page content in the DOM, which is exactly what was causing the large
  // empty gap right below the navbar on mobile.
  useEffect(() => {
    document.body.classList.add('pb-[62px]', 'lg:pb-0');
    return () => {
      document.body.classList.remove('pb-[62px]', 'lg:pb-0');
    };
  }, []);

  return (
    <>
      <header
        className={`sticky top-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-cream-50/90 backdrop-blur-md shadow-[0_1px_20px_rgba(0,0,0,0.05)] border-b border-charcoal-900/5'
            : 'bg-cream-50/70 backdrop-blur-sm border-b border-transparent'
        }`}
      >
        <div
          className={`section-padding flex items-center justify-between gap-3 transition-all duration-300 ${
            scrolled ? '!py-3' : '!py-4 sm:!py-5'
          }`}
        >
          {/* Mobile drawer toggle — left side, since the drawer itself opens from the left */}
          <button
            className="lg:hidden relative h-9 w-9 flex items-center justify-center text-charcoal-700 rounded-full hover:bg-charcoal-900/5 transition-colors -ml-1.5"
            onClick={() => setOpen(true)}
            aria-label="Open menu"
            aria-expanded={open}
          >
            <Menu className="h-5 w-5" strokeWidth={1.75} />
          </button>

          {/* Logo */}
          <Link to="/" className="group relative flex flex-col shrink-0 lg:mr-2">
            <span className="text-xl sm:text-2xl font-display font-semibold tracking-[0.08em] text-charcoal-800 transition-colors group-hover:text-blush-500">
              Lumière
            </span>
            <span className="hidden sm:block h-px w-0 bg-gradient-to-r from-blush-400 to-transparent transition-all duration-500 group-hover:w-full" />
          </Link>

          {/* Desktop nav links */}
          <nav className="hidden lg:flex items-center gap-10">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `relative py-1 text-[13px] font-medium uppercase tracking-[0.12em] transition-colors ${
                    isActive ? 'text-blush-500' : 'text-charcoal-600 hover:text-charcoal-900'
                  } group`
                }
              >
                {({ isActive }) => (
                  <>
                    {link.label}
                    <span
                      className={`absolute -bottom-1 left-0 h-[1.5px] bg-blush-500 transition-all duration-300 ${
                        isActive ? 'w-full' : 'w-0 group-hover:w-full'
                      }`}
                    />
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          {/* Right-side icons */}
          <div className="flex items-center gap-1 sm:gap-1.5">
            {/* Search + Wishlist: desktop/tablet only — mobile already has these in the bottom bar */}
            <IconLink to="/search" label="Search" className="hidden sm:flex">
              <Search className="h-[18px] w-[18px]" strokeWidth={1.75} />
            </IconLink>
            <IconLink to="/wishlist" label="Wishlist" className="hidden sm:flex">
              <Heart className="h-[18px] w-[18px]" strokeWidth={1.75} />
            </IconLink>

            {/* Subtle divider — desktop/tablet only, separates browse icons from account/cart */}
            <span className="hidden sm:block w-px h-5 bg-charcoal-900/[0.08] mx-1" />

            {/* Cart + Profile: always visible, including mobile top-right */}
            <IconLink to="/cart" label="Cart">
              <ShoppingBag className="h-[18px] w-[18px]" strokeWidth={1.75} />
              <AnimatePresence>
                {itemCount > 0 && (
                  <motion.span
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    className="absolute -top-1 -right-1 h-[17px] min-w-[17px] px-[3px] rounded-full bg-blush-500 text-[10px] font-semibold leading-[17px] text-white text-center shadow-sm ring-2 ring-cream-50"
                  >
                    {itemCount}
                  </motion.span>
                )}
              </AnimatePresence>
            </IconLink>
            <IconLink to={user ? '/profile' : '/login'} label={user ? 'Profile' : 'Login'}>
              <User className="h-[18px] w-[18px]" strokeWidth={1.75} />
            </IconLink>
          </div>
        </div>
      </header>

      {/* Mobile drawer — slides in from the left */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 bg-charcoal-900/40 backdrop-blur-[2px] lg:hidden z-[60]"
            />

            <motion.nav
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ duration: 0.32, ease: [0.32, 0.72, 0, 1] }}
              className="fixed inset-y-0 left-0 w-[85%] max-w-[340px] bg-cream-50 lg:hidden z-[70] shadow-2xl flex flex-col"
            >
              <div className="flex items-center justify-between px-6 pt-6 pb-5 border-b border-charcoal-900/[0.06]">
                <span className="text-xl font-display font-semibold tracking-[0.08em] text-charcoal-800">
                  Lumière
                </span>
                <button
                  onClick={() => setOpen(false)}
                  aria-label="Close menu"
                  className="h-9 w-9 flex items-center justify-center text-charcoal-500 rounded-full hover:bg-charcoal-900/5 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Quiet section caption — premium editorial touch, matches the
                  tracked micro-labels used elsewhere in the app */}
              <div className="px-6 pt-5 pb-1">
                <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-charcoal-400">
                  Menu
                </span>
              </div>

              <div className="flex-1 overflow-y-auto px-6 py-2">
                {links.map((link, i) => {
                  const hasChildren = Boolean(link.children?.length);
                  const isExpanded = expanded === link.to;
                  const Icon = link.icon;
                  const isTopActive =
                    location.pathname === link.to ||
                    (hasChildren && link.children.some((c) => location.pathname === c.to));

                  return (
                    <motion.div
                      key={link.to}
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.04, duration: 0.25 }}
                    >
                      {hasChildren ? (
                        <div>
                          <button
                            type="button"
                            onClick={() => setExpanded(isExpanded ? null : link.to)}
                            aria-expanded={isExpanded}
                            className="w-full flex items-center justify-between py-3 border-b border-charcoal-900/[0.06] group"
                          >
                            <span className="flex items-center gap-3.5">
                              <span
                                className={`h-9 w-9 rounded-full flex items-center justify-center transition-colors duration-200 ${
                                  isTopActive || isExpanded
                                    ? 'bg-blush-500 text-white'
                                    : 'bg-charcoal-900/[0.04] text-charcoal-500 group-hover:bg-charcoal-900/[0.07]'
                                }`}
                              >
                                <Icon className="h-4 w-4" strokeWidth={1.75} />
                              </span>
                              <span
                                className={`text-[15px] font-medium transition-colors ${
                                  isExpanded ? 'text-charcoal-900' : 'text-charcoal-700'
                                }`}
                              >
                                {link.label}
                              </span>
                            </span>
                            <ChevronDown
                              className={`h-4 w-4 text-charcoal-400 transition-transform duration-300 ease-out ${
                                isExpanded ? 'rotate-180' : ''
                              }`}
                              strokeWidth={1.75}
                            />
                          </button>

                          <AnimatePresence initial={false}>
                            {isExpanded && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.28, ease: [0.4, 0, 0.2, 1] }}
                                className="overflow-hidden border-b border-charcoal-900/[0.06]"
                              >
                                {/* Editorial-style sublist: a thin connecting rule down the left,
                                    each row a plain label — no pills, no rings, no backgrounds. */}
                                <div className="relative pl-[3.25rem] py-1">
                                  <span className="absolute left-[2.6rem] top-1 bottom-1 w-px bg-charcoal-900/10" />
                                  {link.children.map((child, ci) => (
                                    <motion.div
                                      key={child.to}
                                      initial={{ opacity: 0, x: -6 }}
                                      animate={{ opacity: 1, x: 0 }}
                                      transition={{ delay: ci * 0.05, duration: 0.2 }}
                                      className="relative"
                                    >
                                      <NavLink
                                        to={child.to}
                                        onClick={() => setOpen(false)}
                                        className={({ isActive }) =>
                                          `group relative flex items-center py-2.5 text-[14px] transition-colors ${
                                            isActive ? 'text-charcoal-900 font-medium' : 'text-charcoal-400 hover:text-charcoal-800'
                                          }`
                                        }
                                      >
                                        {({ isActive }) => (
                                          <>
                                            <span
                                              className={`absolute -left-5 top-1/2 -translate-y-1/2 h-px transition-all duration-300 ${
                                                isActive ? 'w-3.5 bg-charcoal-800' : 'w-2 bg-charcoal-900/15 group-hover:w-3.5 group-hover:bg-charcoal-500'
                                              }`}
                                            />
                                            {child.label}
                                          </>
                                        )}
                                      </NavLink>
                                    </motion.div>
                                  ))}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      ) : (
                        <NavLink
                          to={link.to}
                          onClick={() => setOpen(false)}
                          className="group flex items-center gap-3.5 py-3 border-b border-charcoal-900/[0.06]"
                        >
                          {({ isActive }) => (
                            <>
                              <span
                                className={`h-9 w-9 rounded-full flex items-center justify-center transition-colors duration-200 ${
                                  isActive
                                    ? 'bg-blush-500 text-white'
                                    : 'bg-charcoal-900/[0.04] text-charcoal-500 group-hover:bg-charcoal-900/[0.07]'
                                }`}
                              >
                                <Icon className="h-4 w-4" strokeWidth={1.75} />
                              </span>
                              <span
                                className={`text-[15px] font-medium transition-colors ${
                                  isActive ? 'text-blush-500' : 'text-charcoal-700'
                                }`}
                              >
                                {link.label}
                              </span>
                            </>
                          )}
                        </NavLink>
                      )}
                    </motion.div>
                  );
                })}
              </div>

              <div className="px-6 py-5 border-t border-charcoal-900/[0.06]">
                <Link
                  to={user ? '/profile' : '/login'}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 rounded-2xl bg-charcoal-900/[0.03] px-4 py-3.5 text-charcoal-700 hover:bg-charcoal-900/[0.06] transition-colors"
                >
                  <span className="h-9 w-9 rounded-full bg-blush-100 flex items-center justify-center text-blush-500 shrink-0">
                    <User className="h-4 w-4" strokeWidth={1.75} />
                  </span>
                  <span className="text-sm font-medium">{user ? 'My Profile' : 'Login / Register'}</span>
                </Link>
              </div>
            </motion.nav>
          </>
        )}
      </AnimatePresence>

      {/* Bottom shortcut bar — mobile only, fixed. Kept to five essential
          pages with icon + label for a premium, legible feel rather than a
          crowded icon-only strip. Minimum 44px touch targets, horizontal
          scroll as a safety net on the narrowest devices. */}
      <nav className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-cream-50/95 backdrop-blur-md border-t border-charcoal-900/[0.06] shadow-[0_-4px_20px_rgba(0,0,0,0.04)]">
        <style>{`
          .bottom-nav-track::-webkit-scrollbar { display: none; }
          .bottom-nav-track { scrollbar-width: none; -ms-overflow-style: none; }
        `}</style>
        <div className="bottom-nav-track flex items-center justify-between overflow-x-auto px-2 py-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))]">
          {shortcuts.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              aria-label={label}
              className={({ isActive }) =>
                `relative flex flex-col items-center justify-center gap-1 shrink-0 min-w-[52px] py-1.5 transition-colors duration-200 ${
                  isActive ? 'text-blush-500' : 'text-charcoal-500'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <span
                    className={`relative flex items-center justify-center h-9 w-9 rounded-full transition-all duration-300 ease-out ${
                      isActive ? 'bg-blush-50' : ''
                    }`}
                  >
                    <Icon
                      className="h-[19px] w-[19px] transition-transform duration-300"
                      strokeWidth={isActive ? 2 : 1.6}
                      style={{ transform: isActive ? 'scale(1.06)' : 'scale(1)' }}
                    />
                  </span>
                  <span
                    className={`text-[9.5px] tracking-wide transition-all duration-200 ${
                      isActive ? 'font-semibold opacity-100' : 'font-medium opacity-70'
                    }`}
                  >
                    {label}
                  </span>
                  {isActive && (
                    <motion.span
                      layoutId="bottom-nav-dot"
                      className="absolute -top-2 h-1 w-1 rounded-full bg-blush-500"
                    />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </div>
      </nav>
    </>
  );
}

function IconLink({ to, label, children, className = '' }) {
  return (
    <Link
      to={to}
      aria-label={label}
      className={`relative h-9 w-9 items-center justify-center text-charcoal-600 rounded-full hover:text-blush-500 hover:bg-charcoal-900/[0.05] active:scale-95 transition-all duration-200 flex ${className}`}
    >
      {children}
    </Link>
  );
}