import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  UploadCloud, X, Images, Check, Loader2, Shirt, Footprints, Gem, Package,
  Tag, Search, Layers, ShoppingBag, Ruler,
} from 'lucide-react';
import { adminApi, categoryApi, uploadApi } from '../../api/endpoints.js';
import LoadingScreen from '../../components/LoadingScreen.jsx';

const empty = {
  name: '', slug: '', description: '', details: '', fit: '', sku: '', price: '', compareAtPrice: '',
  stock: '', images: [], category: '', status: 'active', featured: false, bestseller: false,
  productType: 'dress',
  fabricType: '', material: '',
  sizes: [], sizeStock: [], colors: [], jewelrySize: '',
  onSale: false, saleDiscountPercent: '', saleEndsAt: '',
};

const PRODUCT_TYPES = [
  { value: 'dress', label: 'Dress / Clothing', icon: Shirt },
  { value: 'shoes', label: 'Shoes', icon: Footprints },
  { value: 'jewelry', label: 'Jewelry', icon: Gem },
  { value: 'other', label: 'Other', icon: Package },
];

const CLOTHING_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
const SHOE_SIZES = ['36', '37', '38', '39', '40', '41', '42', '43', '44', '45'];
const JEWELRY_SIZES = ['5', '6', '7', '8', '9', '10', '11', '12', 'Adjustable'];

const SHOE_SIZE_CHART = [
  { eu: '36', uk: '3', us: '5', cm: '23' },
  { eu: '37', uk: '4', us: '6', cm: '23.5' },
  { eu: '38', uk: '5', us: '7', cm: '24' },
  { eu: '39', uk: '6', us: '8', cm: '24.5' },
  { eu: '40', uk: '6.5', us: '8.5', cm: '25' },
  { eu: '41', uk: '7', us: '9', cm: '25.5' },
  { eu: '42', uk: '8', us: '10', cm: '26.5' },
  { eu: '43', uk: '9', us: '11', cm: '27.5' },
  { eu: '44', uk: '10', us: '12', cm: '28.5' },
  { eu: '45', uk: '11', us: '13', cm: '29.5' },
];

const DRESS_SIZE_CHART = [
  { size: 'XS', bust: '32-33', waist: '25-26', hips: '35-36' },
  { size: 'S', bust: '34-35', waist: '27-28', hips: '37-38' },
  { size: 'M', bust: '36-37', waist: '29-30', hips: '39-40' },
  { size: 'L', bust: '38-40', waist: '31-33', hips: '41-43' },
  { size: 'XL', bust: '41-43', waist: '34-36', hips: '44-46' },
  { size: 'XXL', bust: '44-46', waist: '37-39', hips: '47-49' },
];

const RING_SIZE_CHART = [
  { size: '5', diameter: '15.7', circumference: '49.3' },
  { size: '6', diameter: '16.5', circumference: '51.9' },
  { size: '7', diameter: '17.3', circumference: '54.4' },
  { size: '8', diameter: '18.2', circumference: '57.0' },
  { size: '9', diameter: '19.0', circumference: '59.5' },
  { size: '10', diameter: '19.8', circumference: '62.1' },
  { size: '11', diameter: '20.6', circumference: '64.6' },
  { size: '12', diameter: '21.4', circumference: '67.2' },
];

function usesSizeStock(form) {
  if (form.productType === 'shoes') return true;
  if (form.productType === 'jewelry') return true;
  if (form.productType === 'dress' && form.fabricType === 'Stitched') return true;
  return false;
}

function SizeStockRow({ size, stock, onChange }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-charcoal-800/10 px-3 py-2">
      <span className="text-sm font-medium text-charcoal-700">{size}</span>
      <input
        type="number"
        min="0"
        placeholder="Qty"
        className="input-field !py-1.5 text-sm w-24 text-right"
        value={stock}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

function SizeGuideButton({ onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-1 text-[11px] font-semibold text-lilac-600 hover:text-lilac-700"
    >
      <Ruler size={12} /> Size Guide
    </button>
  );
}

export default function ProductForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [form, setForm] = useState(empty);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const [galleryOpen, setGalleryOpen] = useState(false);
  const [galleryImages, setGalleryImages] = useState([]);
  const [galleryLoading, setGalleryLoading] = useState(false);
  const [galleryError, setGalleryError] = useState('');
  const [tempSelected, setTempSelected] = useState([]);

  const [sizeChartOpen, setSizeChartOpen] = useState(false);

  // Bulk sale scope
  const [saleScope, setSaleScope] = useState('product'); // 'product' | 'category' | 'products'
  const [saleName, setSaleName] = useState(''); // required by the backend Sale model when scope !== 'product'
  const [saleCategory, setSaleCategory] = useState('');
  const [allProducts, setAllProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const [productSearch, setProductSearch] = useState('');
  const [selectedProductIds, setSelectedProductIds] = useState([]);
  const [bulkApplying, setBulkApplying] = useState(false);
  const [bulkResult, setBulkResult] = useState(null);
  const [bulkError, setBulkError] = useState('');

  useEffect(() => {
    categoryApi.list().then((res) => setCategories(res.data?.data || [])).catch(() => {});
  }, []);

  useEffect(() => {
    if (!isEdit) return;
    adminApi.products
      .get(id)
      .then((res) => {
        const product = res.data?.data;
        if (product) {
          const onSale = (product.saleDiscountPercent || 0) > 0;
          setForm({
            ...empty,
            ...product,
            price: onSale ? product.compareAtPrice : product.price,
            compareAtPrice: onSale ? '' : product.compareAtPrice || '',
            images: product.images || [],
            sizes: product.sizes || [],
            sizeStock: (product.sizeStock || []).map((row) => ({ size: row.size, stock: String(row.stock ?? '') })),
            colors: product.colors || [],
            category: product.category?._id || product.category || '',
            onSale,
            saleDiscountPercent: onSale ? String(product.saleDiscountPercent) : '',
            saleEndsAt: product.saleEndsAt ? product.saleEndsAt.slice(0, 10) : '',
          });
        }
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id, isEdit]);

  useEffect(() => {
    if (saleScope !== 'products' || allProducts.length > 0) return;
    setProductsLoading(true);
    adminApi.products
      .list()
      .then((res) => setAllProducts(res.data?.data || []))
      .catch(() => {})
      .finally(() => setProductsLoading(false));
  }, [saleScope]);

  const openGallery = () => {
    setTempSelected(form.images);
    setGalleryOpen(true);
    setGalleryLoading(true);
    setGalleryError('');
    uploadApi
      .gallery()
      .then((res) => setGalleryImages(res.data?.data || []))
      .catch((err) => setGalleryError(err.message))
      .finally(() => setGalleryLoading(false));
  };

  const toggleTempSelect = (url) => {
    setTempSelected((prev) => (prev.includes(url) ? prev.filter((u) => u !== url) : [...prev, url]));
  };

  const confirmGallerySelection = () => {
    setForm((prev) => ({ ...prev, images: tempSelected }));
    setGalleryOpen(false);
  };

  const handleNewUpload = async (e) => {
    const files = e.target.files;
    if (!files?.length) return;
    setUploading(true);
    setGalleryError('');
    try {
      const res = await uploadApi.uploadMultiple(files);
      const urls = res.data?.data?.urls || [];
      setGalleryImages((prev) => [...urls, ...prev]);
      setTempSelected((prev) => [...prev, ...urls]);
    } catch (err) {
      setGalleryError(err.message);
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const removeImage = (url) => {
    setForm((prev) => ({ ...prev, images: prev.images.filter((u) => u !== url) }));
  };

  const toggleSize = (size) => {
    setForm((prev) => {
      const isSelected = prev.sizes.includes(size);
      if (isSelected) {
        return {
          ...prev,
          sizes: prev.sizes.filter((s) => s !== size),
          sizeStock: prev.sizeStock.filter((row) => row.size !== size),
        };
      }
      return {
        ...prev,
        sizes: [...prev.sizes, size],
        sizeStock: [...prev.sizeStock, { size, stock: '' }],
      };
    });
  };

  const updateSizeStock = (size, value) => {
    setForm((prev) => ({
      ...prev,
      sizeStock: prev.sizeStock.map((row) => (row.size === size ? { ...row, stock: value } : row)),
    }));
  };

  const handleColorsInput = (value) => {
    setForm((prev) => ({
      ...prev,
      colors: value.split(',').map((c) => c.trim()).filter(Boolean),
    }));
  };

  const sizesActive = usesSizeStock(form);
  const totalSizeStock = form.sizeStock.reduce((sum, row) => sum + (Number(row.stock) || 0), 0);

  const regularPrice = Number(form.price) || 0;
  const discountPercent = Number(form.saleDiscountPercent) || 0;
  const salePrice = form.onSale && discountPercent > 0 ? Math.round(regularPrice * (1 - discountPercent / 100)) : null;

  const toggleSelectedProduct = (productId) => {
    setSelectedProductIds((prev) => (prev.includes(productId) ? prev.filter((p) => p !== productId) : [...prev, productId]));
  };

  const filteredProducts = allProducts.filter((p) =>
    p.name.toLowerCase().includes(productSearch.toLowerCase())
  );

  // Matches the ACTUAL backend contract in controllers/saleController.js:
  // POST /api/admin/sales/apply expects { name, scope, discountPercent,
  // productIds?, categoryId?, endsAt? } — scope is 'products' | 'category' | 'all'.
  const handleBulkApply = async () => {
    setBulkError('');
    setBulkResult(null);

    if (!saleName.trim()) {
      return setBulkError('Enter a name for this sale (e.g. "Eid Sale 2026")');
    }
    if (!form.saleDiscountPercent || discountPercent <= 0 || discountPercent >= 100) {
      return setBulkError('Enter a valid discount between 1 and 99%');
    }
    if (saleScope === 'category' && !saleCategory) {
      return setBulkError('Select a category');
    }
    if (saleScope === 'products' && selectedProductIds.length === 0) {
      return setBulkError('Select at least one product');
    }

    setBulkApplying(true);
    try {
      const payload = {
        name: saleName.trim(),
        scope: saleScope, // 'category' or 'products' — matches controller's expected values
        discountPercent,
        endsAt: form.saleEndsAt || null,
        ...(saleScope === 'category' ? { categoryId: saleCategory } : { productIds: selectedProductIds }),
      };
      const res = await adminApi.sales.apply(payload);
      setBulkResult({ count: res.data?.data?.affectedProducts?.length ?? 0 });
    } catch (err) {
      setBulkError(err.message);
    } finally {
      setBulkApplying(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const applySaleToThisProduct = form.onSale && saleScope === 'product';

    if (applySaleToThisProduct && (!form.saleDiscountPercent || discountPercent <= 0 || discountPercent >= 100)) {
      return setError('Enter a valid sale discount between 1 and 99%');
    }

    setSaving(true);
    try {
      const payload = {
        ...form,
        price: applySaleToThisProduct ? salePrice : Number(form.price),
        compareAtPrice: applySaleToThisProduct ? regularPrice : Number(form.compareAtPrice) || 0,
        saleDiscountPercent: applySaleToThisProduct ? discountPercent : 0,
        saleEndsAt: applySaleToThisProduct && form.saleEndsAt ? form.saleEndsAt : null,
        stock: sizesActive ? totalSizeStock : Number(form.stock),
        sizeStock: sizesActive
          ? form.sizeStock.map((row) => ({ size: row.size, stock: Number(row.stock) || 0 }))
          : [],
        slug: form.slug || form.name.toLowerCase().trim().replace(/\s+/g, '-'),
      };
      if (isEdit) await adminApi.products.update(id, payload);
      else await adminApi.products.create(payload);
      navigate('/admin/products');
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingScreen />;

  return (
    <div>
      <h1 className="text-2xl font-display font-semibold text-charcoal-800 mb-1">
        {isEdit ? 'Edit Product' : 'Add Product'}
      </h1>
      <p className="text-sm text-charcoal-400 mb-8">
        {isEdit ? 'Update the details below.' : 'Fill in the details to list a new product.'}
      </p>

      <form onSubmit={handleSubmit} className="max-w-3xl space-y-6">
        {/* Basic info */}
        <div className="rounded-2xl bg-cream-50 shadow-soft p-7 space-y-5">
          <h2 className="text-sm font-semibold text-charcoal-700 tracking-wide uppercase">Basic Information</h2>

          <div className="grid sm:grid-cols-2 gap-4">
            <input
              className="input-field"
              placeholder="Product Name"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
            <input
              className="input-field"
              placeholder="SKU"
              required
              value={form.sku}
              onChange={(e) => setForm({ ...form, sku: e.target.value })}
            />
            <div>
              <input
                className="input-field"
                type="number"
                step="0.01"
                placeholder={form.onSale ? 'Regular Price (before discount)' : 'Price'}
                required
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
              />
            </div>

            <input
              className="input-field disabled:bg-charcoal-800/[0.03] disabled:text-charcoal-400"
              type="number"
              step="0.01"
              placeholder="Compare-at Price (optional)"
              value={form.onSale ? '' : form.compareAtPrice}
              onChange={(e) => setForm({ ...form, compareAtPrice: e.target.value })}
              disabled={form.onSale}
            />

            {sizesActive ? (
              <div className="input-field flex items-center justify-between !text-charcoal-500 bg-charcoal-800/[0.03]">
                <span className="text-sm">Total Stock (auto)</span>
                <span className="font-semibold text-charcoal-700">{totalSizeStock}</span>
              </div>
            ) : (
              <input
                className="input-field"
                type="number"
                placeholder="Stock"
                required
                value={form.stock}
                onChange={(e) => setForm({ ...form, stock: e.target.value })}
              />
            )}

            <select
              className="input-field"
              required
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
            >
              <option value="">Select Category</option>
              {categories.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <textarea
            className="input-field min-h-[100px] resize-none"
            placeholder="Description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
        </div>

        {/* Sale */}
        <div className="rounded-2xl bg-cream-50 shadow-soft p-7 space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-charcoal-700 tracking-wide uppercase flex items-center gap-2">
              <Tag size={14} /> Sale
            </h2>
            <label className="inline-flex items-center gap-2.5 cursor-pointer">
              <span className="text-xs font-medium text-charcoal-500">{form.onSale ? 'On' : 'Off'}</span>
              <span
                onClick={() => {
                  setForm((prev) => ({ ...prev, onSale: !prev.onSale }));
                  setBulkResult(null);
                  setBulkError('');
                }}
                className={`relative h-6 w-11 rounded-full transition-colors ${
                  form.onSale ? 'bg-blush-500' : 'bg-charcoal-800/15'
                }`}
              >
                <span
                  className={`absolute top-0.5 h-5 w-5 rounded-full bg-cream-50 shadow-sm transition-transform ${
                    form.onSale ? 'translate-x-[22px]' : 'translate-x-0.5'
                  }`}
                />
              </span>
            </label>
          </div>

          {form.onSale && (
            <div className="space-y-5 pt-1">
              <div>
                <p className="text-xs font-medium text-charcoal-500 mb-2">Apply Sale To</p>
                <div className="grid grid-cols-3 gap-2.5">
                  {[
                    { value: 'product', label: 'This Product', icon: Tag },
                    { value: 'category', label: 'Entire Category', icon: Layers },
                    { value: 'products', label: 'Selected Products', icon: ShoppingBag },
                  ].map(({ value, label, icon: Icon }) => (
                    <button
                      type="button"
                      key={value}
                      onClick={() => {
                        setSaleScope(value);
                        setBulkResult(null);
                        setBulkError('');
                      }}
                      className={`flex flex-col items-center gap-1.5 rounded-xl border-2 py-3.5 px-2 text-[11px] font-medium transition-colors ${
                        saleScope === value
                          ? 'border-lilac-400 bg-lilac-50 text-lilac-600'
                          : 'border-charcoal-800/10 text-charcoal-500 hover:border-lilac-300'
                      }`}
                    >
                      <Icon size={16} />
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sale name — required by the backend for category/selected-products scope */}
              {saleScope !== 'product' && (
                <input
                  className="input-field"
                  placeholder="Sale Name (e.g. Eid Sale 2026)"
                  value={saleName}
                  onChange={(e) => setSaleName(e.target.value)}
                />
              )}

              <div className="grid sm:grid-cols-2 gap-4">
                <input
                  className="input-field"
                  type="number"
                  min="1"
                  max="99"
                  placeholder="Discount %"
                  value={form.saleDiscountPercent}
                  onChange={(e) => setForm({ ...form, saleDiscountPercent: e.target.value })}
                />
                <input
                  className="input-field"
                  type="date"
                  value={form.saleEndsAt}
                  onChange={(e) => setForm({ ...form, saleEndsAt: e.target.value })}
                />
              </div>
              <p className="text-[11px] text-charcoal-400 -mt-3">Leave the end date empty for a sale with no expiry.</p>

              {regularPrice > 0 && discountPercent > 0 && saleScope === 'product' && (
                <div className="flex items-center gap-3 rounded-xl bg-blush-50 px-4 py-3">
                  <span className="rounded-full bg-blush-500 px-2.5 py-0.5 text-xs font-semibold text-cream-50">
                    -{discountPercent}%
                  </span>
                  <span className="text-sm text-charcoal-400 line-through">Rs. {regularPrice}</span>
                  <span className="text-sm font-semibold text-charcoal-800">Rs. {salePrice}</span>
                </div>
              )}

              {saleScope === 'category' && (
                <div className="pt-1 border-t border-charcoal-800/10">
                  <p className="text-xs font-medium text-charcoal-500 mb-2 mt-4">Select Category</p>
                  <select
                    className="input-field"
                    value={saleCategory}
                    onChange={(e) => setSaleCategory(e.target.value)}
                  >
                    <option value="">Select Category</option>
                    {categories.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                  <p className="text-[11px] text-charcoal-400 mt-1.5">
                    Discount will be applied to every active product currently in this category.
                  </p>
                </div>
              )}

              {saleScope === 'products' && (
                <div className="pt-1 border-t border-charcoal-800/10">
                  <p className="text-xs font-medium text-charcoal-500 mb-2 mt-4">
                    Select Products {selectedProductIds.length > 0 && `(${selectedProductIds.length} selected)`}
                  </p>
                  <div className="relative mb-3">
                    <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-charcoal-300" />
                    <input
                      className="input-field !pl-9 text-sm"
                      placeholder="Search products…"
                      value={productSearch}
                      onChange={(e) => setProductSearch(e.target.value)}
                    />
                  </div>

                  {productsLoading ? (
                    <div className="flex justify-center py-8">
                      <Loader2 size={20} className="animate-spin text-lilac-400" />
                    </div>
                  ) : (
                    <div className="max-h-64 overflow-y-auto rounded-xl border border-charcoal-800/10 divide-y divide-charcoal-800/5">
                      {filteredProducts.length === 0 ? (
                        <p className="text-sm text-charcoal-400 text-center py-6">No products found.</p>
                      ) : (
                        filteredProducts.map((p) => {
                          const selected = selectedProductIds.includes(p._id);
                          return (
                            <label
                              key={p._id}
                              className="flex items-center gap-3 px-3.5 py-2.5 cursor-pointer hover:bg-cream-100/60"
                            >
                              <input
                                type="checkbox"
                                checked={selected}
                                onChange={() => toggleSelectedProduct(p._id)}
                                className="accent-lilac-500"
                              />
                              <div className="h-9 w-9 rounded-lg overflow-hidden bg-blush-100 shrink-0">
                                {p.images?.[0] && (
                                  <img src={p.images[0]} alt="" className="h-full w-full object-cover" />
                                )}
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="text-sm text-charcoal-700 truncate">{p.name}</p>
                                <p className="text-[11px] text-charcoal-400">Rs. {p.price}</p>
                              </div>
                            </label>
                          );
                        })
                      )}
                    </div>
                  )}
                </div>
              )}

              {saleScope !== 'product' && (
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={handleBulkApply}
                    disabled={bulkApplying}
                    className="btn-primary w-full !rounded-xl"
                  >
                    {bulkApplying
                      ? 'Applying…'
                      : saleScope === 'category'
                      ? 'Apply Sale to Category'
                      : 'Apply Sale to Selected Products'}
                  </button>
                  {bulkError && <p className="text-sm text-blush-600 mt-2">{bulkError}</p>}
                  {bulkResult && (
                    <p className="text-sm text-lilac-600 mt-2">
                      Sale applied to {bulkResult.count} product{bulkResult.count !== 1 ? 's' : ''}. 🎉
                    </p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Product type */}
        <div className="rounded-2xl bg-cream-50 shadow-soft p-7 space-y-5">
          <h2 className="text-sm font-semibold text-charcoal-700 tracking-wide uppercase">Product Type</h2>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {PRODUCT_TYPES.map(({ value, label, icon: Icon }) => (
              <button
                type="button"
                key={value}
                onClick={() =>
                  setForm({ ...form, productType: value, sizes: [], sizeStock: [], fabricType: '', jewelrySize: '' })
                }
                className={`flex flex-col items-center gap-2 rounded-xl border-2 py-4 px-2 text-xs font-medium transition-colors ${
                  form.productType === value
                    ? 'border-lilac-400 bg-lilac-50 text-lilac-600'
                    : 'border-charcoal-800/10 text-charcoal-500 hover:border-lilac-300'
                }`}
              >
                <Icon size={20} />
                {label}
              </button>
            ))}
          </div>

          {form.productType === 'dress' && (
            <div className="space-y-5 pt-2 border-t border-charcoal-800/10">
              <div>
                <p className="text-xs font-medium text-charcoal-500 mb-2">Fabric Type</p>
                <div className="flex gap-3">
                  {['Stitched', 'Unstitched'].map((opt) => (
                    <button
                      type="button"
                      key={opt}
                      onClick={() =>
                        setForm((prev) => ({
                          ...prev,
                          fabricType: opt,
                          sizes: opt === 'Unstitched' ? [] : prev.sizes,
                          sizeStock: opt === 'Unstitched' ? [] : prev.sizeStock,
                        }))
                      }
                      className={`rounded-full px-5 py-2 text-sm font-medium border transition-colors ${
                        form.fabricType === opt
                          ? 'border-lilac-400 bg-lilac-50 text-lilac-600'
                          : 'border-charcoal-800/10 text-charcoal-500 hover:border-lilac-300'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              {form.fabricType === 'Stitched' && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-medium text-charcoal-500">Available Sizes & Stock</p>
                    <SizeGuideButton onClick={() => setSizeChartOpen(true)} />
                  </div>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {CLOTHING_SIZES.map((size) => (
                      <button
                        type="button"
                        key={size}
                        onClick={() => toggleSize(size)}
                        className={`h-10 w-14 rounded-lg text-sm font-medium border transition-colors ${
                          form.sizes.includes(size)
                            ? 'border-lilac-400 bg-lilac-50 text-lilac-600'
                            : 'border-charcoal-800/10 text-charcoal-500 hover:border-lilac-300'
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>

                  {form.sizeStock.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                      {form.sizeStock.map((row) => (
                        <SizeStockRow
                          key={row.size}
                          size={row.size}
                          stock={row.stock}
                          onChange={(value) => updateSizeStock(row.size, value)}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}

              <input
                className="input-field"
                placeholder="Fabric / Material (e.g. Lawn, Chiffon, Cotton)"
                value={form.material}
                onChange={(e) => setForm({ ...form, material: e.target.value })}
              />
            </div>
          )}

          {form.productType === 'shoes' && (
            <div className="space-y-5 pt-2 border-t border-charcoal-800/10">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-medium text-charcoal-500">Available Sizes (EU) & Stock</p>
                  <SizeGuideButton onClick={() => setSizeChartOpen(true)} />
                </div>
                <div className="flex flex-wrap gap-2 mb-3">
                  {SHOE_SIZES.map((size) => (
                    <button
                      type="button"
                      key={size}
                      onClick={() => toggleSize(size)}
                      className={`h-10 w-12 rounded-lg text-sm font-medium border transition-colors ${
                        form.sizes.includes(size)
                          ? 'border-lilac-400 bg-lilac-50 text-lilac-600'
                          : 'border-charcoal-800/10 text-charcoal-500 hover:border-lilac-300'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>

                {form.sizeStock.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    {form.sizeStock.map((row) => (
                      <SizeStockRow
                        key={row.size}
                        size={row.size}
                        stock={row.stock}
                        onChange={(value) => updateSizeStock(row.size, value)}
                      />
                    ))}
                  </div>
                )}
              </div>

              <input
                className="input-field"
                placeholder="Material (e.g. Leather, Suede, Canvas)"
                value={form.material}
                onChange={(e) => setForm({ ...form, material: e.target.value })}
              />
            </div>
          )}

          {form.productType === 'jewelry' && (
            <div className="space-y-5 pt-2 border-t border-charcoal-800/10">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-medium text-charcoal-500">Available Sizes & Stock</p>
                  <SizeGuideButton onClick={() => setSizeChartOpen(true)} />
                </div>
                <div className="flex flex-wrap gap-2 mb-3">
                  {JEWELRY_SIZES.map((size) => (
                    <button
                      type="button"
                      key={size}
                      onClick={() => toggleSize(size)}
                      className={`h-10 ${size === 'Adjustable' ? 'px-3.5' : 'w-12'} rounded-lg text-sm font-medium border transition-colors ${
                        form.sizes.includes(size)
                          ? 'border-lilac-400 bg-lilac-50 text-lilac-600'
                          : 'border-charcoal-800/10 text-charcoal-500 hover:border-lilac-300'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
                <p className="text-[11px] text-charcoal-400 mb-3">
                  Numbers are standard ring sizes. Select "Adjustable" for open/free-size pieces.
                </p>

                {form.sizeStock.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    {form.sizeStock.map((row) => (
                      <SizeStockRow
                        key={row.size}
                        size={row.size}
                        stock={row.stock}
                        onChange={(value) => updateSizeStock(row.size, value)}
                      />
                    ))}
                  </div>
                )}
              </div>

              <input
                className="input-field"
                placeholder="Material (e.g. Gold Plated, Silver, Stainless Steel)"
                value={form.material}
                onChange={(e) => setForm({ ...form, material: e.target.value })}
              />
            </div>
          )}

          <div className="pt-2 border-t border-charcoal-800/10">
            <p className="text-xs font-medium text-charcoal-500 mb-2">Available Colors</p>
            <input
              className="input-field"
              placeholder="Comma-separated e.g. Red, Black, Beige"
              value={form.colors.join(', ')}
              onChange={(e) => handleColorsInput(e.target.value)}
            />
            {form.colors.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {form.colors.map((c) => (
                  <span key={c} className="rounded-full bg-blush-50 text-blush-600 text-xs font-medium px-3 py-1">
                    {c}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Additional details */}
        <div className="rounded-2xl bg-cream-50 shadow-soft p-7 space-y-5">
          <h2 className="text-sm font-semibold text-charcoal-700 tracking-wide uppercase">Additional Details</h2>
          <textarea
            className="input-field min-h-[90px] resize-none"
            placeholder="Details (composition, dimensions, weight, care instructions, etc.)"
            value={form.details}
            onChange={(e) => setForm({ ...form, details: e.target.value })}
          />
          <textarea
            className="input-field min-h-[70px] resize-none"
            placeholder="Fit / Care notes (e.g. True to size, hand wash only)"
            value={form.fit}
            onChange={(e) => setForm({ ...form, fit: e.target.value })}
          />
        </div>

        {/* Images */}
        <div className="rounded-2xl bg-cream-50 shadow-soft p-7 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-charcoal-700 tracking-wide uppercase">
              Product Images {form.images.length > 0 && `(${form.images.length})`}
            </h2>
            <button
              type="button"
              onClick={openGallery}
              className="inline-flex items-center gap-1.5 rounded-full border border-charcoal-800/15 px-3 py-1.5 text-xs font-semibold text-charcoal-600 transition-colors hover:border-lilac-400 hover:text-lilac-600"
            >
              <Images size={13} />
              Choose Images
            </button>
          </div>

          {form.images.length > 0 ? (
            <div className="flex flex-wrap gap-3">
              {form.images.map((url) => (
                <div key={url} className="relative h-20 w-20 overflow-hidden rounded-xl bg-blush-100 group shadow-sm">
                  <img src={url} alt="" className="h-full w-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeImage(url)}
                    className="absolute top-1 right-1 h-5 w-5 rounded-full bg-charcoal-800/70 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X size={11} />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <button
              type="button"
              onClick={openGallery}
              className="flex h-24 w-full items-center justify-center gap-2 rounded-xl border border-dashed border-charcoal-800/20 text-sm text-charcoal-400 transition-colors hover:border-lilac-400 hover:text-lilac-600"
            >
              <UploadCloud size={18} />
              Select product images
            </button>
          )}
        </div>

        {/* Visibility */}
        <div className="rounded-2xl bg-cream-50 shadow-soft p-7">
          <h2 className="text-sm font-semibold text-charcoal-700 tracking-wide uppercase mb-5">Visibility</h2>
          <div className="flex flex-wrap items-center gap-6 text-sm">
            <label className="flex items-center gap-2 text-charcoal-600">
              <input
                type="checkbox"
                checked={form.featured}
                onChange={(e) => setForm({ ...form, featured: e.target.checked })}
              />
              Featured
            </label>
            <label className="flex items-center gap-2 text-charcoal-600">
              <input
                type="checkbox"
                checked={form.bestseller}
                onChange={(e) => setForm({ ...form, bestseller: e.target.checked })}
              />
              Bestseller
            </label>
            <select
              className="input-field !w-40"
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
            >
              <option value="active">Active</option>
              <option value="draft">Draft</option>
              <option value="archived">Archived</option>
            </select>
          </div>
        </div>

        {error && <p className="text-sm text-blush-600">{error}</p>}

        <div className="flex gap-3">
          <button type="submit" className="btn-primary" disabled={saving || uploading}>
            {saving ? 'Saving…' : isEdit ? 'Save Changes' : 'Create Product'}
          </button>
          <button type="button" onClick={() => navigate('/admin/products')} className="btn-secondary">
            Cancel
          </button>
        </div>
      </form>

      {/* Gallery modal */}
      {galleryOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-charcoal-800/50 backdrop-blur-sm" onClick={() => setGalleryOpen(false)} />
          <div className="relative flex max-h-[85vh] w-full max-w-3xl flex-col rounded-xl2 bg-cream-50 shadow-soft">
            <div className="flex items-center justify-between border-b border-charcoal-800/10 p-5">
              <h3 className="font-display text-lg text-charcoal-800">Select Images</h3>
              <button type="button" onClick={() => setGalleryOpen(false)} aria-label="Close">
                <X size={18} className="text-charcoal-500" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5">
              {galleryError && <p className="mb-3 text-sm text-blush-600">{galleryError}</p>}

              <label className="mb-4 flex h-20 w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-charcoal-800/20 text-sm text-charcoal-400 transition-colors hover:border-lilac-400 hover:text-lilac-600">
                {uploading ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <>
                    <UploadCloud size={16} />
                    Upload new images
                  </>
                )}
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/avif"
                  multiple
                  className="hidden"
                  onChange={handleNewUpload}
                  disabled={uploading}
                />
              </label>

              {galleryLoading ? (
                <div className="flex justify-center py-10">
                  <Loader2 size={24} className="animate-spin text-lilac-400" />
                </div>
              ) : galleryImages.length === 0 ? (
                <p className="py-10 text-center text-sm text-charcoal-400">
                  No images uploaded yet. Upload some above.
                </p>
              ) : (
                <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
                  {galleryImages.map((url) => {
                    const selected = tempSelected.includes(url);
                    return (
                      <button
                        type="button"
                        key={url}
                        onClick={() => toggleTempSelect(url)}
                        className={`group relative aspect-square overflow-hidden rounded-xl border-2 transition-colors ${
                          selected ? 'border-lilac-400' : 'border-transparent'
                        }`}
                      >
                        <img src={url} alt="" className="h-full w-full object-cover" />
                        {selected && (
                          <div className="absolute inset-0 flex items-center justify-center bg-charcoal-800/40">
                            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-lilac-500">
                              <Check size={14} className="text-white" strokeWidth={3} />
                            </div>
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="flex items-center justify-between border-t border-charcoal-800/10 p-5">
              <p className="text-xs text-charcoal-400">
                {tempSelected.length} image{tempSelected.length !== 1 ? 's' : ''} selected
              </p>
              <div className="flex gap-3">
                <button type="button" onClick={() => setGalleryOpen(false)} className="btn-secondary !py-2.5">
                  Cancel
                </button>
                <button type="button" onClick={confirmGallerySelection} className="btn-primary !py-2.5">
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Size chart modal */}
      {sizeChartOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-charcoal-800/50 backdrop-blur-sm" onClick={() => setSizeChartOpen(false)} />
          <div className="relative flex max-h-[85vh] w-full max-w-lg flex-col rounded-xl2 bg-cream-50 shadow-soft">
            <div className="flex items-center justify-between border-b border-charcoal-800/10 p-5">
              <h3 className="font-display text-lg text-charcoal-800">
                {form.productType === 'shoes'
                  ? 'Shoe Size Guide'
                  : form.productType === 'jewelry'
                  ? 'Ring Size Guide'
                  : 'Dress Size Guide'}
              </h3>
              <button type="button" onClick={() => setSizeChartOpen(false)} aria-label="Close">
                <X size={18} className="text-charcoal-500" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5">
              {form.productType === 'shoes' && (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-charcoal-500 border-b border-charcoal-800/10">
                      <th className="py-2 font-medium">EU</th>
                      <th className="py-2 font-medium">UK</th>
                      <th className="py-2 font-medium">US</th>
                      <th className="py-2 font-medium">Foot Length (cm)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {SHOE_SIZE_CHART.map((row) => (
                      <tr key={row.eu} className="border-b border-charcoal-800/5">
                        <td className="py-2 text-charcoal-700 font-medium">{row.eu}</td>
                        <td className="py-2 text-charcoal-600">{row.uk}</td>
                        <td className="py-2 text-charcoal-600">{row.us}</td>
                        <td className="py-2 text-charcoal-600">{row.cm}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {form.productType === 'dress' && (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-charcoal-500 border-b border-charcoal-800/10">
                      <th className="py-2 font-medium">Size</th>
                      <th className="py-2 font-medium">Bust (in)</th>
                      <th className="py-2 font-medium">Waist (in)</th>
                      <th className="py-2 font-medium">Hips (in)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {DRESS_SIZE_CHART.map((row) => (
                      <tr key={row.size} className="border-b border-charcoal-800/5">
                        <td className="py-2 text-charcoal-700 font-medium">{row.size}</td>
                        <td className="py-2 text-charcoal-600">{row.bust}</td>
                        <td className="py-2 text-charcoal-600">{row.waist}</td>
                        <td className="py-2 text-charcoal-600">{row.hips}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {form.productType === 'jewelry' && (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-charcoal-500 border-b border-charcoal-800/10">
                      <th className="py-2 font-medium">Ring Size</th>
                      <th className="py-2 font-medium">Diameter (mm)</th>
                      <th className="py-2 font-medium">Circumference (mm)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {RING_SIZE_CHART.map((row) => (
                      <tr key={row.size} className="border-b border-charcoal-800/5">
                        <td className="py-2 text-charcoal-700 font-medium">{row.size}</td>
                        <td className="py-2 text-charcoal-600">{row.diameter}</td>
                        <td className="py-2 text-charcoal-600">{row.circumference}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              <p className="text-[11px] text-charcoal-400 mt-4">
                This chart is for reference only. Actual measurements may vary slightly by style.
              </p>
            </div>

            <div className="flex justify-end border-t border-charcoal-800/10 p-5">
              <button type="button" onClick={() => setSizeChartOpen(false)} className="btn-secondary !py-2.5">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}