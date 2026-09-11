import { Link, Outlet } from 'react-router-dom';

export default function AuthLayout({ title, subtitle }) {
  return (
    <div className="min-h-screen bg-hero-gradient flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-md">
        <Link to="/" className="block text-center text-3xl font-display font-semibold text-charcoal-800 mb-8">
          Lumière
        </Link>
        <div className="card p-8 md:p-10">
          {title && <h1 className="text-2xl font-display font-semibold text-charcoal-800 mb-1">{title}</h1>}
          {subtitle && <p className="text-sm text-charcoal-500 mb-6">{subtitle}</p>}
          <Outlet />
        </div>
      </div>
    </div>
  );
}
