import { useEffect, useState } from 'react';
import { Plus, Trash2, FolderTree, UploadCloud, Loader2, ChevronRight } from 'lucide-react';
import { categoryApi, adminApi, uploadApi } from '../../api/endpoints.js';
import LoadingScreen from '../../components/LoadingScreen.jsx';
import EmptyState from '../../components/EmptyState.jsx';

// Turns the flat categories array into a nested tree of any depth.
function buildTree(categories) {
  const map = new Map();
  categories.forEach((c) => map.set(c._id, { ...c, children: [] }));
  const roots = [];
  categories.forEach((c) => {
    const parentId = c.parent?._id || c.parent || null;
    const node = map.get(c._id);
    if (parentId && map.has(parentId)) {
      map.get(parentId).children.push(node);
    } else {
      roots.push(node);
    }
  });
  return roots;
}

// Flattens the tree back out for the "Parent Category" dropdown, keeping depth
// so subcategories (and their subcategories) can also be picked as a parent.
function flattenForSelect(nodes, depth = 0, out = []) {
  nodes.forEach((node) => {
    out.push({ _id: node._id, name: node.name, depth });
    if (node.children?.length) flattenForSelect(node.children, depth + 1, out);
  });
  return out;
}

function CategoryNode({ node, depth, onDelete }) {
  return (
    <div className="space-y-2">
      <div
        className="card p-3.5 flex justify-between items-center gap-4"
        style={{ marginLeft: depth * 28, backgroundColor: depth > 0 ? 'rgba(0,0,0,0.015)' : undefined }}
      >
        <div className="flex items-center gap-3 min-w-0">
          {depth > 0 && <ChevronRight size={14} className="text-charcoal-300 shrink-0" />}
          <div
            className={`${depth === 0 ? 'h-14 w-14 rounded-xl' : 'h-10 w-10 rounded-lg'} overflow-hidden bg-blush-100 shrink-0`}
          >
            {node.image ? (
              <img src={node.image} alt="" className="h-full w-full object-cover" />
            ) : (
              <div className="h-full w-full flex items-center justify-center text-charcoal-300">
                <FolderTree size={depth === 0 ? 18 : 13} />
              </div>
            )}
          </div>
          <div className="min-w-0">
            <p className={`${depth === 0 ? 'font-medium' : 'text-sm font-medium'} text-charcoal-800 truncate`}>
              {node.name}
            </p>
            <p className={`${depth === 0 ? 'text-xs' : 'text-[11px]'} text-charcoal-400`}>{node.slug}</p>
          </div>
        </div>
        <button onClick={() => onDelete(node._id)} className="text-blush-500 shrink-0">
          <Trash2 className={depth === 0 ? 'h-4 w-4' : 'h-3.5 w-3.5'} />
        </button>
      </div>

      {node.children?.length > 0 && (
        <div className="space-y-2">
          {node.children.map((child) => (
            <CategoryNode key={child._id} node={child} depth={depth + 1} onDelete={onDelete} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({ name: '', slug: '', description: '', image: '', parent: '' });
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const load = () => {
    setLoading(true);
    categoryApi
      .list()
      .then((res) => setCategories(res.data?.data || []))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };
  useEffect(load, []);

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError('');
    try {
      const res = await uploadApi.uploadImage(file);
      const url = res.data?.data?.url;
      if (url) setForm((f) => ({ ...f, image: url }));
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await adminApi.categories.create({
        ...form,
        parent: form.parent || null,
        slug: form.slug || form.name.toLowerCase().trim().replace(/\s+/g, '-'),
      });
      setForm({ name: '', slug: '', description: '', image: '', parent: '' });
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this category? (Note: subcategories under it will need to be reassigned first)')) return;
    await adminApi.categories.remove(id).catch((err) => alert(err.message));
    load();
  };

  const tree = buildTree(categories);
  const parentOptions = flattenForSelect(tree);

  return (
    <div>
      <h1 className="text-2xl font-display font-semibold text-charcoal-800 mb-6">Categories</h1>
      <div className="grid md:grid-cols-[1fr_360px] gap-8">
        <div>
          {loading ? (
            <LoadingScreen />
          ) : categories.length === 0 ? (
            <EmptyState icon={FolderTree} title="No categories yet" />
          ) : (
            <div className="space-y-3">
              {tree.map((node) => (
                <CategoryNode key={node._id} node={node} depth={0} onDelete={handleDelete} />
              ))}
            </div>
          )}
        </div>

        <form onSubmit={handleCreate} className="card p-6 h-fit space-y-4">
          <h3 className="font-semibold text-charcoal-800">New Category</h3>

          <div>
            <p className="text-xs font-medium text-charcoal-500 mb-2">Cover Image</p>
            <label className="flex h-32 w-full cursor-pointer items-center justify-center overflow-hidden rounded-xl border border-dashed border-charcoal-800/20 bg-blush-50 hover:border-lilac-400 transition-colors relative">
              {uploading ? (
                <Loader2 size={18} className="animate-spin text-charcoal-400" />
              ) : form.image ? (
                <img src={form.image} alt="" className="h-full w-full object-cover" />
              ) : (
                <span className="flex flex-col items-center gap-1.5 text-charcoal-400">
                  <UploadCloud size={18} />
                  <span className="text-xs">Upload cover image</span>
                </span>
              )}
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/avif"
                className="hidden"
                onChange={handleImageUpload}
                disabled={uploading}
              />
            </label>
          </div>

          <div>
            <p className="text-xs font-medium text-charcoal-500 mb-2">Parent Category</p>
            <select className="input-field" value={form.parent} onChange={(e) => setForm({ ...form, parent: e.target.value })}>
              <option value="">— None (Top-Level Category) —</option>
              {parentOptions.map((c) => (
                <option key={c._id} value={c._id}>
                  {'—'.repeat(c.depth) + (c.depth > 0 ? ' ' : '')}
                  {c.name}
                </option>
              ))}
            </select>
            <p className="text-[11px] text-charcoal-400 mt-1.5">
              Leave as "None" for a top-level category. Pick any existing category — including a subcategory — as the
              parent to nest as deep as you like (e.g. Women → Clothing → Stitched).
            </p>
          </div>

          <input
            className="input-field"
            placeholder="Name"
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <textarea
            className="input-field min-h-[80px] resize-none"
            placeholder="Description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
          {error && <p className="text-sm text-blush-600">{error}</p>}
          <button type="submit" className="btn-primary w-full" disabled={uploading}>
            <Plus className="h-4 w-4" /> Add Category
          </button>
        </form>
      </div>
    </div>
  );
}