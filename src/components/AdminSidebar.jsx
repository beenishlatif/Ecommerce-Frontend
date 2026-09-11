import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  FolderTree,
  ClipboardList,
  Users,
  UserCog,
  Ticket,
  CreditCard,
  Star,
  Boxes,
  Settings,
  LogOut,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';

const links = [
  { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/admin/products', label: 'Products', icon: Package },
  { to: '/admin/categories', label: 'Categories', icon: FolderTree },
  { to: '/admin/orders', label: 'Orders', icon: ClipboardList },
  { to: '/admin/customers', label: 'Customers', icon: Users },
  { to: '/admin/users', label: 'Users', icon: UserCog },
  { to: '/admin/coupons', label: 'Coupons', icon: Ticket },
  { to: '/admin/payments', label: 'Payments', icon: CreditCard },
  { to: '/admin/reviews', label: 'Reviews', icon: Star },
  { to: '/admin/inventory', label: 'Inventory', icon: Boxes },
  { to: '/admin/settings', label: 'Settings', icon: Settings },
];

export default function AdminSidebar() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/admin/login');
  };

  return (
    <aside className="w-64 shrink-0 h-screen sticky top-0 bg-charcoal-800 text-cream-100 flex flex-col">
      <div className="px-6 py-6 border-b border-white/10">
        <span className="text-xl font-display font-semibold">Lumière Admin</span>
      </div>
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        {links.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
                isActive ? 'bg-lilac-500/20 text-lilac-200' : 'text-cream-100/70 hover:bg-white/5 hover:text-cream-50'
              }`
            }
          >
            <Icon className="h-4 w-4" />
            {label}
          </NavLink>
        ))}
      </nav>
      <div className="p-3 border-t border-white/10">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-cream-100/70 hover:bg-white/5 hover:text-cream-50 transition-colors"
        >
          <LogOut className="h-4 w-4" />
          Log out
        </button>
      </div>
    </aside>
  );
}
