import { useEffect, useState } from 'react';
import { UploadCloud, X, Loader2 } from 'lucide-react';
import { settingApi, uploadApi } from '../../api/endpoints.js';

export default function Settings() {
  const [heroImage, setHeroImage] = useState('');
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    settingApi
      .getHomepage()
      .then((res) => setHeroImage(res.data?.data?.heroImage || ''))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError('');
    setSaved(false);
    try {
      const uploadRes = await uploadApi.uploadImage(file);
      const url = uploadRes.data?.data?.url;
      if (url) {
        setHeroImage(url);
        setSaving(true);
        await settingApi.updateHomepage({ heroImage: url });
        setSaved(true);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
      setSaving(false);
      e.target.value = '';
    }
  };

  const handleRemove = async () => {
    setSaving(true);
    setError('');
    setSaved(false);
    try {
      await settingApi.updateHomepage({ heroImage: '' });
      setHeroImage('');
      setSaved(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-display font-semibold text-charcoal-800 mb-6">Settings</h1>

      <div className="card p-6 max-w-xl space-y-5">
        <div>
          <p className="text-sm font-medium text-charcoal-800 mb-1">Homepage Cover Image</p>
          <p className="text-xs text-charcoal-400 mb-4">
            Shows in the hero section on the homepage, next to the headline.
          </p>

          {loading ? (
            <div className="flex h-56 w-full items-center justify-center rounded-2xl bg-blush-50">
              <Loader2 size={22} className="animate-spin text-charcoal-400" />
            </div>
          ) : (
            <label className="flex h-56 w-full cursor-pointer items-center justify-center overflow-hidden rounded-2xl border border-dashed border-charcoal-800/20 bg-blush-50 hover:border-lilac-400 transition-colors relative">
              {uploading || saving ? (
                <Loader2 size={22} className="animate-spin text-charcoal-400" />
              ) : heroImage ? (
                <>
                  <img src={heroImage} alt="" className="h-full w-full object-cover" />
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      handleRemove();
                    }}
                    className="absolute top-2 right-2 h-7 w-7 rounded-full bg-charcoal-800/70 text-white flex items-center justify-center"
                  >
                    <X size={14} />
                  </button>
                </>
              ) : (
                <span className="flex flex-col items-center gap-2 text-charcoal-400">
                  <UploadCloud size={22} />
                  <span className="text-sm">Upload cover image</span>
                </span>
              )}
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/avif"
                className="hidden"
                onChange={handleUpload}
                disabled={uploading || saving}
              />
            </label>
          )}

          {error && <p className="text-sm text-blush-600 mt-3">{error}</p>}
          {saved && <p className="text-sm text-lilac-600 mt-3">Saved — check the homepage.</p>}
        </div>

        <div className="border-t border-charcoal-800/10 pt-5 space-y-4">
          <p className="text-sm text-charcoal-500">
            Store configuration (name, currency, shipping rules, tax settings) goes here. This is a
            base-code placeholder — wire it up to a Settings model/endpoint as your store grows.
          </p>
          <input className="input-field" placeholder="Store Name" defaultValue="Lumière" disabled />
          <input className="input-field" placeholder="Currency" defaultValue="PKR" disabled />
        </div>
      </div>
    </div>
  );
}