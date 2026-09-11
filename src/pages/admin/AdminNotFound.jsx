import { Link } from 'react-router-dom';

export default function AdminNotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center">
      <h1 className="text-4xl font-display font-semibold text-charcoal-800 mb-2">404</h1>
      <p className="text-charcoal-500 mb-6">This admin page doesn't exist.</p>
      <Link to="/admin/dashboard" className="btn-primary">Back to Dashboard</Link>
    </div>
  );
}
