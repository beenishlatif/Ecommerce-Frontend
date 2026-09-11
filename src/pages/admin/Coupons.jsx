import { useEffect, useState } from 'react';
import { Ticket, Trash2, Plus } from 'lucide-react';
import { adminApi } from '../../api/endpoints.js';
import LoadingScreen from '../../components/LoadingScreen.jsx';
import EmptyState from '../../components/EmptyState.jsx';

const empty = { code: '', type: 'percentage', value: '', minOrderAmount: '', maxDiscount: '' };

export default function Coupons() {
  const [coupons, setCoupons] = useState([]);
  const [form, setForm] = useState(empty);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = () => {
    setLoading(true);
    adminApi.coupons.list().then((res) => setCoupons(res.data?.data || [])).catch((err) => setError(err.message)).finally(() => setLoading(false));
  };
  useEffect(load, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await adminApi.coupons.create({
        ...form,
        value: Number(form.value),
        minOrderAmount: Number(form.minOrderAmount) || 0,
        maxDiscount: Number(form.maxDiscount) || 0,
      });
      setForm(empty);
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this coupon?')) return;
    await adminApi.coupons.remove(id).catch((err) => alert(err.message));
    load();
  };

  return (
    <div>
      <h1 className="text-2xl font-display font-semibold text-charcoal-800 mb-6">Coupons</h1>
      <div className="grid md:grid-cols-[1fr_320px] gap-8">
        <div>
          {loading ? <LoadingScreen /> : coupons.length === 0 ? (
            <EmptyState icon={Ticket} title="No coupons yet" />
          ) : (
            <div className="space-y-3">
              {coupons.map((c) => (
                <div key={c._id} className="card p-4 flex justify-between items-center">
                  <div>
                    <p className="font-medium text-charcoal-800">{c.code}</p>
                    <p className="text-xs text-charcoal-400">{c.type === 'percentage' ? `${c.value}% off` : `Rs. ${c.value} off`}</p>
                  </div>
                  <button onClick={() => handleDelete(c._id)} className="text-blush-500"><Trash2 className="h-4 w-4" /></button>
                </div>
              ))}
            </div>
          )}
        </div>
        <form onSubmit={handleCreate} className="card p-6 h-fit space-y-3">
          <h3 className="font-semibold text-charcoal-800">New Coupon</h3>
          <input className="input-field" placeholder="CODE" required value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} />
          <select className="input-field" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
            <option value="percentage">Percentage</option>
            <option value="fixed">Fixed Amount</option>
          </select>
          <input className="input-field" type="number" placeholder="Value" required value={form.value} onChange={(e) => setForm({ ...form, value: e.target.value })} />
          <input className="input-field" type="number" placeholder="Min Order Amount" value={form.minOrderAmount} onChange={(e) => setForm({ ...form, minOrderAmount: e.target.value })} />
          {error && <p className="text-sm text-blush-600">{error}</p>}
          <button type="submit" className="btn-primary w-full"><Plus className="h-4 w-4" /> Create Coupon</button>
        </form>
      </div>
    </div>
  );
}
