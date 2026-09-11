import { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { userApi } from '../api/endpoints.js';
import PageHeader from '../components/PageHeader.jsx';

export default function EditProfile() {
  const { user, refreshMe } = useAuth();
  const [form, setForm] = useState({ name: user?.name || '', phone: user?.phone || '' });
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await userApi.updateProfile(form);
      await refreshMe();
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div>
      <PageHeader title="Edit Profile" />
      <form onSubmit={handleSubmit} className="section-padding max-w-md mx-auto space-y-4">
        <input className="input-field" placeholder="Full Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <input className="input-field" placeholder="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
        {error && <p className="text-sm text-blush-600">{error}</p>}
        {saved && <p className="text-sm text-lilac-600">Saved!</p>}
        <button type="submit" className="btn-primary w-full">Save Changes</button>
      </form>
    </div>
  );
}
