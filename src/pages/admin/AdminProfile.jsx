import { useAuth } from '../../context/AuthContext.jsx';

export default function AdminProfile() {
  const { user } = useAuth();
  return (
    <div>
      <h1 className="text-2xl font-display font-semibold text-charcoal-800 mb-6">Admin Profile</h1>
      <div className="card p-6 max-w-md space-y-2 text-sm">
        <p><strong className="text-charcoal-800">Name:</strong> {user?.name}</p>
        <p><strong className="text-charcoal-800">Email:</strong> {user?.email}</p>
        <p><strong className="text-charcoal-800">Role:</strong> {user?.role}</p>
      </div>
    </div>
  );
}
