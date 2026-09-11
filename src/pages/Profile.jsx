import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import PageHeader from '../components/PageHeader.jsx';

const links = [
  { to: '/profile/edit', label: 'Edit Profile' },
  { to: '/addresses', label: 'Addresses' },
  { to: '/orders', label: 'Order History' },
  { to: '/wishlist', label: 'Wishlist' },
];

export default function Profile() {
  const { user, logout } = useAuth();

  return (
    <div>
      <PageHeader title="My Profile" subtitle={`Welcome back, ${user?.name || 'friend'}.`} />
      <div className="section-padding grid sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
        {links.map((l) => (
          <Link key={l.to} to={l.to} className="card p-6 hover:-translate-y-0.5">
            <p className="font-medium text-charcoal-800">{l.label}</p>
          </Link>
        ))}
        <button onClick={logout} className="card p-6 text-left text-blush-600 hover:-translate-y-0.5">
          Log Out
        </button>
      </div>
    </div>
  );
}
