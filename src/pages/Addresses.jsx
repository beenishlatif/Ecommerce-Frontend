import { useState } from 'react';
import { MapPin, Trash2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { userApi } from '../api/endpoints.js';
import PageHeader from '../components/PageHeader.jsx';
import EmptyState from '../components/EmptyState.jsx';

export default function Addresses() {
  const { user, refreshMe } = useAuth();
  const [form, setForm] = useState({ label: '', fullName: '', phone: '', line1: '', city: '', country: '' });

  const handleAdd = async (e) => {
    e.preventDefault();
    await userApi.addAddress(form).catch(() => {});
    await refreshMe();
    setForm({ label: '', fullName: '', phone: '', line1: '', city: '', country: '' });
  };

  const handleDelete = async (id) => {
    await userApi.deleteAddress(id).catch(() => {});
    await refreshMe();
  };

  const addresses = user?.addresses || [];

  return (
    <div>
      <PageHeader title="Saved Addresses" />
      <div className="section-padding grid md:grid-cols-2 gap-10">
        <div>
          {addresses.length === 0 ? (
            <EmptyState icon={MapPin} title="No addresses saved" description="Add an address for faster checkout." />
          ) : (
            <div className="space-y-4">
              {addresses.map((addr) => (
                <div key={addr._id} className="card p-4 flex justify-between items-start">
                  <div className="text-sm">
                    <p className="font-medium text-charcoal-800">{addr.label} — {addr.fullName}</p>
                    <p className="text-charcoal-500">{addr.line1}, {addr.city}, {addr.country}</p>
                    <p className="text-charcoal-400">{addr.phone}</p>
                  </div>
                  <button onClick={() => handleDelete(addr._id)} className="text-charcoal-300 hover:text-blush-500">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
        <form onSubmit={handleAdd} className="card p-6 space-y-3 h-fit">
          <h3 className="font-semibold text-charcoal-800 mb-2">Add New Address</h3>
          {['label', 'fullName', 'phone', 'line1', 'city', 'country'].map((key) => (
            <input
              key={key} className="input-field" placeholder={key}
              value={form[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })}
            />
          ))}
          <button type="submit" className="btn-primary w-full">Add Address</button>
        </form>
      </div>
    </div>
  );
}
