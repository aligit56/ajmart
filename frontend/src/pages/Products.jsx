import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../api/axios';
import ProductCard from '../components/ProductCard';
import { Loader2, ArrowUpDown, Filter, ChevronLeft, ChevronRight, Sparkles, X } from 'lucide-react';

const ITEMS_PER_PAGE = 24;

const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryParam = searchParams.get('category') || 'all';

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters & sorting
  const [selectedCategory, setSelectedCategory] = useState(categoryParam);
  const [sortBy, setSortBy] = useState('default');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [prodRes, catRes] = await Promise.all([
          api.get('/products'),
          api.get('/categories')
        ]);
        setProducts(prodRes.data || []);
        setCategories(catRes.data || []);
      } catch (err) {
        console.error('Failed to load products:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Sync state if URL query param changes
  useEffect(() => {
    if (categoryParam) {
      setSelectedCategory(categoryParam);
      setCurrentPage(1);
    }
  }, [categoryParam]);

  // Scroll to top of catalog when page changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentPage]);

  const handleCategoryChange = (catIdOrName) => {
    setSelectedCategory(catIdOrName);
    setCurrentPage(1);
    if (catIdOrName === 'all') {
      searchParams.delete('category');
    } else {
      searchParams.set('category', catIdOrName);
    }
    setSearchParams(searchParams);
  };

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <Loader2 className="animate-spin text-darkBlue dark:text-cyan" size={44} />
      </div>
    );
  }

  // Filter products by selected category
  const filteredProducts = products.filter(p => {
    if (selectedCategory === 'all') return true;
    // selectedCategory may be category_id or category name
    const matchId = p.category_id && p.category_id.toString() === selectedCategory.toString();
    const matchedCategory = categories.find(c => c.name.toLowerCase() === selectedCategory.toLowerCase());
    const matchName = matchedCategory && p.category_id === matchedCategory.id;
    return matchId || matchName;
  });

  // Sort products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === 'price-asc') return a.price - b.price;
    if (sortBy === 'price-desc') return b.price - a.price;
    if (sortBy === 'name-asc') return (a.name || '').localeCompare(b.name || '');
    if (sortBy === 'name-desc') return (b.name || '').localeCompare(a.name || '');
    if (sortBy === 'newest') return (b.id || 0) - (a.id || 0);
    return 0;
  });

  // Pagination calculation
  const totalItems = sortedProducts.length;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE) || 1;
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedProducts = sortedProducts.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  // Active category display name
  const activeCategoryObj = categories.find(
    c => c.id.toString() === selectedCategory.toString() || c.name.toLowerCase() === selectedCategory.toLowerCase()
  );
  const activeCategoryName = activeCategoryObj ? activeCategoryObj.name : (selectedCategory === 'all' ? 'All Categories' : selectedCategory);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-lightCard dark:bg-darkCard p-6 md:p-8 rounded-2xl border border-lightBorder dark:border-darkBorder shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-darkBlue/10 dark:bg-cyan/15 text-darkBlue dark:text-cyan text-xs font-bold uppercase tracking-wider mb-2">
            <Sparkles size={13} /> Complete Grocery Catalog
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-lightText dark:text-darkText tracking-tight">
            Explore All Products
          </h1>
          <p className="text-sm md:text-base text-lightTextSecondary dark:text-darkTextSecondary mt-1">
            Browse our wide selection of {totalItems} fresh, quality grocery items delivered to your doorstep
          </p>
        </div>
      </div>

      {/* Control Bar: Category Filter & Sort */}
      <div className="bg-lightCard dark:bg-darkCard p-4 md:p-5 rounded-xl border border-lightBorder dark:border-darkBorder shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Left: Category selector dropdown & quick chips */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <label htmlFor="category-select" className="text-xs font-bold uppercase tracking-wider text-lightTextSecondary dark:text-darkTextSecondary flex items-center gap-1.5">
              <Filter size={15} className="text-darkBlue dark:text-cyan" /> Category:
            </label>
            <select
              id="category-select"
              value={selectedCategory}
              onChange={(e) => handleCategoryChange(e.target.value)}
              className="bg-white dark:bg-[#0a0a0a] text-lightText dark:text-darkText text-sm font-semibold border border-lightBorder dark:border-darkBorder rounded-lg px-3.5 py-2 outline-none focus:border-darkBlue dark:focus:border-cyan cursor-pointer transition-colors shadow-sm"
            >
              <option value="all">All Categories ({products.length})</option>
              {categories.map(cat => {
                const count = products.filter(p => p.category_id === cat.id).length;
                return (
                  <option key={cat.id} value={cat.id}>
                    {cat.name} ({count})
                  </option>
                );
              })}
            </select>
          </div>

          {selectedCategory !== 'all' && (
            <span className="inline-flex items-center gap-1.5 bg-darkBlue/10 dark:bg-cyan/15 text-darkBlue dark:text-cyan text-xs font-semibold px-3 py-1 rounded-full border border-darkBlue/20 dark:border-cyan/30">
              <span>{activeCategoryName}</span>
              <button
                onClick={() => handleCategoryChange('all')}
                className="hover:text-red-500 font-bold ml-1 text-sm leading-none"
                title="Clear category filter"
              >
                <X size={13} />
              </button>
            </span>
          )}
        </div>

        {/* Right: Sort & Count */}
        <div className="flex items-center justify-between lg:justify-end gap-4">
          <div className="text-sm text-lightTextSecondary dark:text-darkTextSecondary font-medium">
            Showing <strong className="text-lightText dark:text-darkText">{Math.min(startIndex + 1, totalItems)} - {Math.min(startIndex + ITEMS_PER_PAGE, totalItems)}</strong> of {totalItems}
          </div>

          <div className="flex items-center gap-2">
            <label htmlFor="sort-select" className="text-xs font-bold uppercase tracking-wider text-lightTextSecondary dark:text-darkTextSecondary flex items-center gap-1.5">
              <ArrowUpDown size={15} className="text-darkBlue dark:text-cyan" /> Sort:
            </label>
            <select
              id="sort-select"
              value={sortBy}
              onChange={(e) => { setSortBy(e.target.value); setCurrentPage(1); }}
              className="bg-white dark:bg-[#0a0a0a] text-lightText dark:text-darkText text-sm font-semibold border border-lightBorder dark:border-darkBorder rounded-lg px-3.5 py-2 outline-none focus:border-darkBlue dark:focus:border-cyan cursor-pointer transition-colors shadow-sm"
            >
              <option value="default">Default Order</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="name-asc">Name: A to Z</option>
              <option value="name-desc">Name: Z to A</option>
              <option value="newest">Newest Arrivals</option>
            </select>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      {paginatedProducts.length === 0 ? (
        <div className="text-center py-20 bg-lightCard dark:bg-darkCard rounded-2xl border border-lightBorder dark:border-darkBorder">
          <p className="text-lg text-lightTextSecondary dark:text-darkTextSecondary mb-4">No products found in this category.</p>
          <button onClick={() => handleCategoryChange('all')} className="btn-primary">
            View All Products
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {paginatedProducts.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-6">
          <button
            onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
            disabled={currentPage === 1}
            className="p-2 rounded-lg border border-lightBorder dark:border-darkBorder disabled:opacity-40 disabled:cursor-not-allowed hover:bg-lightBorder dark:hover:bg-darkBorder transition-colors"
            title="Previous Page"
          >
            <ChevronLeft size={20} />
          </button>

          <div className="flex items-center gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => {
              const isActive = page === currentPage;
              return (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-9 h-9 rounded-lg text-sm font-bold transition-colors ${
                    isActive
                      ? 'bg-darkBlue dark:bg-cyan text-white dark:text-black shadow-md'
                      : 'border border-lightBorder dark:border-darkBorder hover:bg-lightBorder dark:hover:bg-darkBorder text-lightText dark:text-darkText'
                  }`}
                >
                  {page}
                </button>
              );
            })}
          </div>

          <button
            onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="p-2 rounded-lg border border-lightBorder dark:border-darkBorder disabled:opacity-40 disabled:cursor-not-allowed hover:bg-lightBorder dark:hover:bg-darkBorder transition-colors"
            title="Next Page"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      )}
    </div>
  );
};

export default Products;
