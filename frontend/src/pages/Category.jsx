import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api/axios';
import ProductCard from '../components/ProductCard';
import { Loader2, ArrowUpDown, SlidersHorizontal } from 'lucide-react';

const Category = () => {
  const { id } = useParams();
  const [products, setProducts] = useState([]);
  const [category, setCategory] = useState(null);
  const [loading, setLoading] = useState(true);

  // Filters and sorting state
  const [selectedType, setSelectedType] = useState('all');
  const [priceSort, setPriceSort] = useState('default'); // 'default', 'asc', 'desc'

  useEffect(() => {
    setSelectedType('all');
    setPriceSort('default');
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [id]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const [prodRes, catRes] = await Promise.all([
          api.get(`/products?category=${id}`),
          api.get('/categories')
        ]);
        setProducts(prodRes.data);
        const cat = catRes.data.find(c => c.id === parseInt(id));
        if (cat) setCategory(cat);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="animate-spin text-darkBlue dark:text-cyan" size={40} />
      </div>
    );
  }

  const isCosmetics = category && (category.id === 6 || category.name?.toLowerCase().includes('cosmetics'));

  // Filter products by sub-type (for Cosmetics)
  const filteredProducts = products.filter(p => {
    if (!isCosmetics || selectedType === 'all') return true;
    const name = (p.name || '').toLowerCase();
    if (selectedType === 'spray') return name.includes('spray');
    if (selectedType === 'lotion') return name.includes('lotion');
    if (selectedType === 'cream') return name.includes('cream');
    if (selectedType === 'oil') return name.includes('oil');
    return true;
  });

  // Sort products by price
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (priceSort === 'asc') return a.price - b.price;
    if (priceSort === 'desc') return b.price - a.price;
    return 0;
  });

  return (
    <div>
      {category && (
        <div className="flex flex-col md:flex-row items-stretch bg-lightCard dark:bg-[#1a1a1a] rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300 mb-8 border border-lightBorder dark:border-[#333]">
          
          {category.image_url && (
            <div className="w-full md:w-2/5 lg:w-1/3 aspect-video md:aspect-auto flex-shrink-0 relative bg-gray-100 dark:bg-[#0a0a0a] flex items-center justify-center p-4">
              {/* Blurred background effect */}
              <div 
                className="absolute inset-0 opacity-30 dark:opacity-20 blur-xl scale-110" 
                style={{ backgroundImage: `url(${category.image_url})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
              ></div>
              
              {/* Actual Image (Fully Visible) */}
              <img 
                src={category.image_url} 
                alt={category.name} 
                className="relative z-10 w-full h-full object-contain max-h-[250px] md:max-h-[300px] drop-shadow-md" 
              />
            </div>
          )}
          
          <div className={`p-6 md:p-8 flex flex-col justify-center w-full ${category.image_url ? 'md:w-3/5 lg:w-2/3' : ''}`}>
            <h2 className="text-3xl md:text-4xl font-bold text-lightBlue dark:text-aqua border-l-4 border-darkBlue dark:border-cyan pl-4 mb-4">
              {category.name}
            </h2>
            {category.description && (
              <p className="text-base md:text-lg text-lightTextSecondary dark:text-darkTextSecondary pl-4 max-w-2xl leading-relaxed">
                {category.description}
              </p>
            )}
          </div>
          
        </div>
      )}

      {/* Modern Filter & Sorting Control Bar */}
      <div className="bg-lightCard dark:bg-[#1a1a1a] px-5 py-4 rounded-xl border border-lightBorder dark:border-[#333] shadow-sm mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Left: Product count & active filter badge */}
        <div className="flex items-center gap-3 text-sm text-lightTextSecondary dark:text-darkTextSecondary">
          <span className="font-bold text-lightText dark:text-darkText text-base">
            {sortedProducts.length} <span className="font-normal text-lightTextSecondary dark:text-darkTextSecondary text-sm">{sortedProducts.length === 1 ? 'Product' : 'Products'}</span>
          </span>
          {isCosmetics && selectedType !== 'all' && (
            <span className="inline-flex items-center gap-1.5 bg-darkBlue/10 dark:bg-cyan/15 text-darkBlue dark:text-cyan text-xs font-semibold px-3 py-1 rounded-full border border-darkBlue/20 dark:border-cyan/30">
              <span>Filtered by:</span>
              <strong className="capitalize">
                {selectedType === 'spray' && 'Body Sprays'}
                {selectedType === 'lotion' && 'Lotions'}
                {selectedType === 'cream' && 'Creams'}
                {selectedType === 'oil' && 'Hair Oils'}
              </strong>
              <button 
                onClick={() => setSelectedType('all')} 
                className="hover:text-red-500 font-bold ml-1 text-sm leading-none"
                title="Clear filter"
              >
                &times;
              </button>
            </span>
          )}
        </div>

        {/* Right: Dropdown Controls */}
        <div className="flex flex-wrap items-center gap-4">
          {/* Cosmetics Sub-type Filter (Enabled for Cosmetics) */}
          {isCosmetics && (
            <div className="flex items-center gap-2">
              <label htmlFor="type-filter" className="text-xs font-bold uppercase tracking-wider text-lightTextSecondary dark:text-darkTextSecondary flex items-center gap-1.5">
                <SlidersHorizontal size={15} className="text-darkBlue dark:text-cyan" /> Type:
              </label>
              <select
                id="type-filter"
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="bg-white dark:bg-[#0a0a0a] text-lightText dark:text-darkText text-sm font-semibold border border-lightBorder dark:border-darkBorder rounded-lg px-3.5 py-2 outline-none focus:border-darkBlue dark:focus:border-cyan cursor-pointer transition-colors shadow-sm"
              >
                <option value="all">All Cosmetics</option>
                <option value="spray">Body Sprays</option>
                <option value="lotion">Lotions</option>
                <option value="cream">Creams</option>
                <option value="oil">Hair Oils</option>
              </select>
            </div>
          )}

          {/* Price Sorting Filter (Available in ALL categories) */}
          <div className="flex items-center gap-2">
            <label htmlFor="price-sort" className="text-xs font-bold uppercase tracking-wider text-lightTextSecondary dark:text-darkTextSecondary flex items-center gap-1.5">
              <ArrowUpDown size={15} className="text-darkBlue dark:text-cyan" /> Price:
            </label>
            <select
              id="price-sort"
              value={priceSort}
              onChange={(e) => setPriceSort(e.target.value)}
              className="bg-white dark:bg-[#0a0a0a] text-lightText dark:text-darkText text-sm font-semibold border border-lightBorder dark:border-darkBorder rounded-lg px-3.5 py-2 outline-none focus:border-darkBlue dark:focus:border-cyan cursor-pointer transition-colors shadow-sm"
            >
              <option value="default">Default Order</option>
              <option value="asc">Low to High (سستے سے مہنگا)</option>
              <option value="desc">High to Low (مہنگے سے سستا)</option>
            </select>
          </div>
        </div>
      </div>
      
      {sortedProducts.length === 0 ? (
        <div className="text-center py-20 bg-lightCard dark:bg-[#1a1a1a] rounded-xl border border-lightBorder dark:border-[#333] text-lightTextSecondary dark:text-darkTextSecondary">
          <p className="text-lg font-medium mb-3">No products found matching your filter.</p>
          {selectedType !== 'all' && (
            <button 
              onClick={() => setSelectedType('all')} 
              className="btn-primary text-sm px-4 py-2"
            >
              Show All Products
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {sortedProducts.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Category;
