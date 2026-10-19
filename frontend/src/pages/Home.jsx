import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../api/axios';
import ProductCard from '../components/ProductCard';
import CategoryCarousel from '../components/CategoryCarousel';
import HeroSlider from '../components/HeroSlider';
import FeaturedVideos from '../components/FeaturedVideos';
import TrustStrip from '../components/TrustStrip';
import { Loader2, Sparkles, Tag, Clock, ArrowRight } from 'lucide-react';

const Home = () => {
  const [categories, setCategories] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [dealsProducts, setDealsProducts] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('q') || '';

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catRes, featRes, dealsRes, newRes] = await Promise.all([
          api.get('/categories'),
          api.get('/products/featured'),
          api.get('/products/deals'),
          api.get('/products/new-arrivals')
        ]);
        setCategories(catRes.data || []);
        setFeaturedProducts(featRes.data || []);
        setDealsProducts(dealsRes.data || []);
        setNewArrivals(newRes.data || []);
      } catch (err) {
        console.error('Failed to load homepage data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      setSearchLoading(true);
      try {
        const res = await api.get(`/products/search?q=${encodeURIComponent(query)}`);
        setSearchResults(res.data);
      } catch (error) {
        console.error('Search failed:', error);
        setSearchResults([]);
      } finally {
        setSearchLoading(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  const clearSearch = () => {
    searchParams.delete('q');
    setSearchParams(searchParams);
  };

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <Loader2 className="animate-spin text-darkBlue dark:text-cyan" size={44} />
      </div>
    );
  }

  // Search Results View
  if (query) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between pb-2 border-b border-lightBorder dark:border-[#2a2a2a]">
          <h2 className="text-2xl font-bold text-lightBlue dark:text-aqua border-l-4 border-darkBlue dark:border-cyan pl-3">
            Search Results for "{query}"
          </h2>
          <button onClick={clearSearch} className="text-sm text-lightTextSecondary dark:text-darkTextSecondary hover:underline">
            Clear Search
          </button>
        </div>
        
        {searchLoading ? (
          <div className="flex items-center gap-2 text-lightTextSecondary dark:text-darkTextSecondary py-12 justify-center">
            <Loader2 className="animate-spin text-darkBlue dark:text-cyan" size={24} /> Searching products...
          </div>
        ) : searchResults.length > 0 ? (
          <div>
            <p className="mb-4 text-sm text-lightTextSecondary dark:text-darkTextSecondary">
              Found {searchResults.length} {searchResults.length === 1 ? 'product' : 'products'}
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {searchResults.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        ) : (
          <div className="mt-8 text-center bg-lightCard dark:bg-darkCard p-12 rounded-2xl border border-lightBorder dark:border-darkBorder">
            <p className="text-lg text-lightTextSecondary dark:text-darkTextSecondary mb-4">No products found matching "{query}"</p>
            <button onClick={clearSearch} className="btn-primary">
              Browse All Products
            </button>
          </div>
        )}
      </div>
    );
  }

  // Complete Professional Homepage Layout
  return (
    <div className="space-y-14">
      {/* 1. Hero Slider */}
      <HeroSlider />

      {/* 2. Shop by Category (EXISTING) */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl md:text-3xl font-bold text-lightText dark:text-darkText border-l-4 border-darkBlue dark:border-cyan pl-3">
            Shop by Category
          </h2>
          <Link to="/categories" className="text-xs md:text-sm font-semibold text-lightBlue dark:text-aqua hover:underline flex items-center gap-1">
            All Categories <ArrowRight size={14} />
          </Link>
        </div>
        <CategoryCarousel categories={categories} />
      </section>

      {/* 3. Featured Products */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-lightText dark:text-darkText border-l-4 border-darkBlue dark:border-cyan pl-3 flex items-center gap-2">
              <Sparkles className="text-amber-500" size={24} /> Featured Products
            </h2>
            <p className="text-xs md:text-sm text-lightTextSecondary dark:text-darkTextSecondary pl-4 mt-1">
              Hand-picked bestsellers and daily household essentials
            </p>
          </div>
          <Link to="/products" className="text-xs md:text-sm font-semibold text-lightBlue dark:text-aqua hover:underline flex items-center gap-1">
            View All <ArrowRight size={14} />
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {featuredProducts.slice(0, 8).map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* 4. Featured Videos */}
      <FeaturedVideos />

      {/* 5. Today's Deals (Only shown if active discounts exist) */}
      {dealsProducts.length > 0 && (
        <section className="bg-gradient-to-r from-red-500/10 via-amber-500/10 to-red-500/5 p-6 md:p-8 rounded-2xl border border-red-500/20">
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-error-light/20 dark:bg-error-dark/30 text-error-light dark:text-error-dark text-xs font-bold uppercase tracking-wider mb-2">
                <Tag size={13} /> Limited Time Offers
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-lightText dark:text-darkText">
                Today's Deals
              </h2>
            </div>
            <Link to="/offers" className="text-xs md:text-sm font-semibold text-error-light dark:text-error-dark hover:underline flex items-center gap-1">
              See All Deals <ArrowRight size={14} />
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {dealsProducts.slice(0, 4).map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}

      {/* 6. New Arrivals */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-lightText dark:text-darkText border-l-4 border-darkBlue dark:border-cyan pl-3 flex items-center gap-2">
              <Clock className="text-darkBlue dark:text-cyan" size={24} /> New Arrivals
            </h2>
            <p className="text-xs md:text-sm text-lightTextSecondary dark:text-darkTextSecondary pl-4 mt-1">
              Recently added cosmetics, personal care, and grocery items
            </p>
          </div>
          <Link to="/products" className="text-xs md:text-sm font-semibold text-lightBlue dark:text-aqua hover:underline flex items-center gap-1">
            Browse Catalog <ArrowRight size={14} />
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {newArrivals.slice(0, 8).map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* 7. Trust Strip */}
      <TrustStrip />
    </div>
  );
};

export default Home;
