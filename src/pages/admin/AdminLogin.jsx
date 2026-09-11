import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';

export default function AdminLogin() {
  const { adminLogin } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await adminLogin(form);
      navigate('/admin/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-charcoal-800 flex items-center justify-center px-6">
      <div className="w-full max-w-sm card p-8 bg-white/95">
        <h1 className="text-2xl font-display font-semibold text-charcoal-800 mb-1">Admin Login</h1>
        <p className="text-sm text-charcoal-500 mb-6">Restricted access — authorized personnel only.</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="email" required placeholder="Admin email" className="input-field" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <input type="password" required placeholder="Password" className="input-field" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          {error && <p className="text-sm text-blush-600">{error}</p>}
          <button type="submit" className="btn-primary w-full" disabled={loading}>
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}
