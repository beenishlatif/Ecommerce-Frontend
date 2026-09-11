import { Outlet } from 'react-router-dom';
import AdminSidebar from './AdminSidebar.jsx';

export default function AdminLayout() {
  return (
    <div className="flex bg-cream-100 min-h-screen">
      <AdminSidebar />
      <main className="flex-1 p-8">
        <Outlet />
      </main>
    </div>
  );
}
