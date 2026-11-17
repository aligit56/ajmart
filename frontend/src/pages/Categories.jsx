import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { Loader2, ArrowRight, LayoutGrid } from 'lucide-react';
import { normalizeImageUrl, handleCategoryImageError } from '../utils/imageHelpers';

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catRes, prodRes] = await Promise.all([
          api.get('/categories'),
          api.get('/products')
        ]);
        setCategories(catRes.data || []);
        setProducts(prodRes.data || []);
      } catch (err) {
        console.error('Failed to load categories:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <Loader2 className="animate-spin text-darkBlue dark:text-cyan" size={44} />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="bg-lightCard dark:bg-darkCard p-6 md:p-8 rounded-2xl border border-lightBorder dark:border-darkBorder shadow-sm">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-darkBlue/10 dark:bg-cyan/15 text-darkBlue dark:text-cyan text-xs font-bold uppercase tracking-wider mb-2">
          <LayoutGrid size={13} /> Product Categories
        </div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-lightText dark:text-darkText tracking-tight">
          Browse by Category
        </h1>
        <p className="text-sm text-lightTextSecondary dark:text-darkTextSecondary mt-1">
          Explore all grocery sections from staple pulses &amp; rice to daily household &amp; personal care
        </p>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
        {categories.map((cat) => {
          const count = products.filter(p => p.category_id === cat.id).length;
          const imageUrl = normalizeImageUrl(cat.image_url);
          return (
            <Link
              key={cat.id}
              to={`/category/${cat.id}`}
              className="group bg-lightCard dark:bg-darkCard border border-lightBorder dark:border-darkBorder rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:border-darkBlue dark:hover:border-cyan transition-all duration-300 flex flex-col"
            >
              {/* Category Image */}
              <div className="aspect-[4/3] w-full bg-gray-50 dark:bg-[#111] overflow-hidden relative flex items-center justify-center p-3 sm:p-4">
                {imageUrl ? (
                  <>
                    <div
                      className="absolute inset-0 opacity-20 dark:opacity-10 blur-lg scale-110"
                      style={{ backgroundImage: `url(${imageUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
                    />
                    <img
                      src={imageUrl}
                      alt={cat.name}
                      loading="lazy"
                      className="relative z-10 w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                      onError={handleCategoryImageError}
                    />
                  </>
                ) : (
                  <LayoutGrid size={40} className="text-lightTextSecondary dark:text-darkTextSecondary opacity-40" />
                )}

                {/* Badge showing item count */}
                <span className="absolute top-2.5 right-2.5 z-20 bg-darkBlue/80 dark:bg-cyan/90 text-white dark:text-black text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded-full shadow-md backdrop-blur-sm">
                  {count} {count === 1 ? 'item' : 'items'}
                </span>
              </div>

              {/* Category Content */}
              <div className="p-5 flex-grow flex flex-col justify-between">
                <div>
                  <h3 className="text-lg font-bold text-lightText dark:text-darkText group-hover:text-darkBlue dark:group-hover:text-cyan transition-colors">
                    {cat.name}
                  </h3>
                  {cat.description && (
                    <p className="text-xs text-lightTextSecondary dark:text-darkTextSecondary line-clamp-2 mt-1.5 leading-relaxed">
                      {cat.description}
                    </p>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-lightBorder/60 dark:border-darkBorder/60 flex items-center justify-between text-xs font-semibold text-darkBlue dark:text-cyan">
                  <span>Explore Products</span>
                  <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default Categories;
