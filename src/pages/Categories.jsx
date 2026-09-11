import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, ArrowRight, FolderTree } from 'lucide-react';
import { categoryApi } from '../api/endpoints.js';
import LoadingScreen from '../components/LoadingScreen.jsx';
import EmptyState from '../components/EmptyState.jsx';

const GOLD = '#c9a227';

// Turns the flat categories array into a nested tree so subcategories render
// inside their parent's card instead of as their own separate top-level card.
function buildTree(categories) {
  const map = new Map();
  categories.forEach((c) => map.set(c._id, { ...c, children: [] }));
  const roots = [];
  categories.forEach((c) => {
    const parentId = c.parent?._id || c.parent || null;
    const node = map.get(c._id);
    if (parentId && map.has(parentId)) map.get(parentId).children.push(node);
    else roots.push(node);
  });
  return roots;
}

// Flattens a subtree so grandchildren show up as chips on the top-level card too.
function flattenDescendants(nodes, out = []) {
  nodes.forEach((node) => {
    out.push(node);
    if (node.children?.length) flattenDescendants(node.children, out);
  });
  return out;
}

// A light, editorial split hero — text on one side, an overlapping photo
// collage on the other — instead of a dark full-bleed banner (that pattern
// is already used on the Home page, this keeps the Categories page distinct).
function CategoriesHero({ topLevel }) {
  const withImages = topLevel.filter((c) => c.image);
  const [imgA, imgB] = withImages;

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-lilac-50 via-cream-50 to-blush-50">
      <div className="mx-auto max-w-7xl px-6 lg:px-10 py-10 sm:py-20 lg:py-24 grid lg:grid-cols-2 gap-8 sm:gap-10 lg:gap-16 items-center">
        <div className="text-center lg:text-left">
          <span className="text-[10px] sm:text-[11px] tracking-[0.35em] uppercase text-charcoal-400">
            Explore Lumière
          </span>
          <h1 className="font-serif text-4xl sm:text-5xl lg:text-[3.25rem] text-charcoal-800 mt-3 leading-[1.1]">
            Find your <span className="" style={{ color: GOLD }}>edit.</span>
          </h1>
          <div className="w-12 h-px mx-auto lg:mx-0 my-5" style={{ backgroundColor: GOLD }} />
          <p className="text-charcoal-500 text-sm sm:text-base max-w-md mx-auto lg:mx-0">
            Every collection, organized the way you shop — from everyday essentials to statement pieces.
          </p>

          {topLevel.length > 0 && (
            <div className="flex flex-wrap justify-center lg:justify-start gap-2 sm:gap-2.5 mt-6 sm:mt-7">
              {topLevel.slice(0, 6).map((cat) => (
                <Link
                  key={cat._id}
                  to={`/categories/${cat.slug}`}
                  className="inline-flex items-center gap-1.5 rounded-full border border-charcoal-800/15 bg-cream-50/60 px-3.5 sm:px-4 py-1.5 sm:py-2 text-[11px] sm:text-sm text-charcoal-700 hover:border-charcoal-800 hover:bg-cream-50 transition-colors"
                >
                  {cat.name}
                  <ArrowRight size={11} />
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Collage now shows at every breakpoint — just shorter on small
            screens — instead of being hidden below `sm`, so mobile gets the
            same layout as desktop, only scaled down. */}
        <div className="relative h-[190px] xs:h-[220px] sm:h-[320px] lg:h-[400px] mt-4 lg:mt-0">
          {imgA ? (
            <div className="absolute left-[6%] top-0 w-[62%] h-[80%] rounded-2xl sm:rounded-3xl overflow-hidden shadow-xl ring-2 sm:ring-4 ring-cream-50 rotate-[-3deg]">
              <img src={imgA.image} alt={imgA.name} className="h-full w-full object-cover object-top" />
            </div>
          ) : (
            <div className="absolute left-[6%] top-0 w-[62%] h-[80%] rounded-2xl sm:rounded-3xl bg-gradient-to-br from-blush-200 to-lilac-200 rotate-[-3deg] shadow-xl ring-2 sm:ring-4 ring-cream-50" />
          )}

          {imgB ? (
            <div className="absolute right-[4%] bottom-0 w-[52%] h-[62%] rounded-2xl sm:rounded-3xl overflow-hidden shadow-xl ring-2 sm:ring-4 ring-cream-50 rotate-[4deg]">
              <img src={imgB.image} alt={imgB.name} className="h-full w-full object-cover object-top" />
            </div>
          ) : (
            <div className="absolute right-[4%] bottom-0 w-[52%] h-[62%] rounded-2xl sm:rounded-3xl bg-gradient-to-br from-lilac-200 to-blush-200 rotate-[4deg] shadow-xl ring-2 sm:ring-4 ring-cream-50 flex items-center justify-center">
              <FolderTree className="text-charcoal-800/20" size={24} />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function CategoryCard({ category }) {
  const subcategories = flattenDescendants(category.children || []);
  const visibleSubs = subcategories.slice(0, 4);
  const extraCount = subcategories.length - visibleSubs.length;

  return (
    <div className="group relative rounded-2xl sm:rounded-3xl overflow-hidden bg-cream-100 ring-1 ring-charcoal-800/5 shadow-sm hover:shadow-2xl transition-shadow duration-500">
      <Link to={`/categories/${category.slug}`} className="block">
        <div className="relative aspect-[3/4] overflow-hidden bg-charcoal-800/5">
          {category.image ? (
            <img
              src={category.image}
              alt={category.name}
              className="h-full w-full object-cover object-top transition-transform duration-700 group-hover:scale-105"
            />
          ) : (
            <div className="h-full w-full bg-gradient-to-br from-blush-200 via-cream-200 to-lilac-200 flex items-center justify-center">
              <FolderTree className="text-charcoal-800/20" size={40} />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-charcoal-800/85 via-charcoal-800/15 to-transparent" />

          <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-7">
            <span className="text-[10px] tracking-[0.3em] uppercase text-cream-100/60">Collection</span>
            <div className="flex items-end justify-between gap-3 mt-1.5">
              <h3 className="font-serif text-xl sm:text-2xl lg:text-[1.75rem] text-cream-50 leading-tight">
                {category.name}
              </h3>
              <span className="shrink-0 h-8 w-8 sm:h-9 sm:w-9 rounded-full bg-cream-50/15 backdrop-blur-sm flex items-center justify-center text-cream-50 group-hover:bg-blush-500 group-hover:rotate-45 transition-all duration-300">
                <ArrowUpRight size={15} />
              </span>
            </div>
            {category.description && (
              <p className="text-cream-100/80 text-xs sm:text-sm mt-2 max-w-md line-clamp-2">{category.description}</p>
            )}
          </div>
        </div>
      </Link>

      {subcategories.length > 0 && (
        <div className="flex flex-wrap gap-2 px-5 sm:px-7 py-4 sm:py-5 border-t border-charcoal-800/5">
          {visibleSubs.map((sub) => (
            <Link
              key={sub._id}
              to={`/categories/${sub.slug}`}
              className="rounded-full border border-charcoal-800/10 px-3 sm:px-3.5 py-1.5 text-[11px] sm:text-xs text-charcoal-600 hover:border-blush-500 hover:text-blush-500 transition-colors"
            >
              {sub.name}
            </Link>
          ))}
          {extraCount > 0 && (
            <span className="rounded-full px-3 sm:px-3.5 py-1.5 text-[11px] sm:text-xs text-charcoal-400">
              +{extraCount} more
            </span>
          )}
        </div>
      )}
    </div>
  );
}

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    categoryApi
      .list()
      .then((res) => setCategories(res.data?.data || []))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const topLevel = buildTree(categories);

  return (
    <div>
      <CategoriesHero topLevel={topLevel} />
      <div className="section-padding">
        {loading ? (
          <LoadingScreen />
        ) : error ? (
          <EmptyState icon={FolderTree} title="Couldn't load categories" description={error} />
        ) : topLevel.length === 0 ? (
          <EmptyState icon={FolderTree} title="No categories yet" description="Categories added by the admin will appear here." />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {topLevel.map((cat) => (
              <CategoryCard key={cat._id} category={cat} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}