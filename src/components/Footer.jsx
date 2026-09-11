import { Link } from 'react-router-dom';
import { Instagram, Facebook, Twitter } from 'lucide-react';

const columns = [
  {
    title: 'Shop',
    links: [
      { to: '/shop', label: 'All Products' },
      { to: '/categories', label: 'Categories' },
      { to: '/shop?featured=true', label: 'Featured' },
    ],
  },
  {
    title: 'Support',
    links: [
      { to: '/faq', label: 'FAQ' },
      { to: '/shipping-policy', label: 'Shipping Policy' },
      { to: '/return-policy', label: 'Returns & Refunds' },
      { to: '/contact', label: 'Contact Us' },
    ],
  },
  {
    title: 'Company',
    links: [
      { to: '/about', label: 'About Us' },
      { to: '/privacy-policy', label: 'Privacy Policy' },
      { to: '/terms', label: 'Terms & Conditions' },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="mt-24 border-t border-white/60 bg-hero-gradient">
      <div className="section-padding grid grid-cols-2 md:grid-cols-4 gap-10">
        <div className="col-span-2 md:col-span-1">
          <h3 className="text-2xl font-display font-semibold text-charcoal-800 mb-3">Lumière</h3>
          <p className="text-sm text-charcoal-500 max-w-xs">
            Thoughtfully designed essentials, crafted for everyday elegance.
          </p>
          <div className="flex gap-3 mt-5">
            <Instagram className="h-4 w-4 text-charcoal-500" />
            <Facebook className="h-4 w-4 text-charcoal-500" />
            <Twitter className="h-4 w-4 text-charcoal-500" />
          </div>
        </div>
        {columns.map((col) => (
          <div key={col.title}>
            <h4 className="text-sm font-semibold text-charcoal-700 mb-4">{col.title}</h4>
            <ul className="space-y-2">
              {col.links.map((link) => (
                <li key={link.to}>
                  <Link to={link.to} className="text-sm text-charcoal-500 hover:text-blush-500 transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-white/60 py-5 text-center text-xs text-charcoal-400">
        © {new Date().getFullYear()} Lumière. All rights reserved.
      </div>
    </footer>
  );
}
