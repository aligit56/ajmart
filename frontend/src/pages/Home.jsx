import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../api/axios';
import ProductCard from '../components/ProductCard';
import CategoryCarousel from '../components/CategoryCarousel';
import HeroSlider from '../components/HeroSlider';
import FeaturedVideos from '../components/FeaturedVideos';
import TrustStrip from '../components/TrustStrip';
import { Loader2, ShoppingBag, BadgePercent, PackagePlus, LayoutGrid, ArrowRight } from 'lucide-react';

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
    setSearchParams({});
    setSearchResults([]);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
        <Loader2 className="animate-spin text-darkBlue dark:text-cyan" size={48} />
        <p className="text-lightTextSecondary dark:text-darkTextSecondary font-medium text-sm">
          Loading grocery catalog...
        </p>
      </div>
    );
  }

  // If query is active, render instant search results view
  if (query.trim()) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-lightBorder dark:border-darkBorder">
          <div>
            <h1 className="text-2xl font-bold text-lightText dark:text-darkText">
              Search Results for <span className="text-darkBlue dark:text-cyan">"{query}"</span>
            </h1>
            <p className="text-sm text-lightTextSecondary dark:text-darkTextSecondary mt-1">
              Found {searchResults.length} {searchResults.length === 1 ? 'item' : 'items'}
            </p>
          </div>
          <button 
            onClick={clearSearch}
            className="text-sm font-semibold text-error-light dark:text-error-dark hover:underline"
          >
            Clear Search
          </button>
        </div>

        {searchLoading ? (
          <div className="flex justify-center p-12">
            <Loader2 className="animate-spin text-darkBlue dark:text-cyan" size={32} />
          </div>
        ) : searchResults.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {searchResults.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
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
    <div className="space-y-16 md:space-y-20">
      {/* 1. Hero Slider */}
      <HeroSlider />

      {/* 2. Shop by Category */}
      <section id="categories" className="scroll-mt-24">
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-lightText dark:text-darkText border-l-4 border-darkBlue dark:border-cyan pl-3 flex items-center gap-2">
            <LayoutGrid className="text-darkBlue dark:text-cyan" size={22} /> Shop by Category
          </h2>
          <Link to="/categories" className="text-xs sm:text-sm font-semibold text-lightBlue dark:text-aqua hover:underline flex items-center gap-1">
            All Categories <ArrowRight size={14} />
          </Link>
        </div>
        <CategoryCarousel categories={categories} />
      </section>

      {/* 3. Featured Products */}
      <section id="featured-products" className="scroll-mt-24">
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-lightText dark:text-darkText border-l-4 border-darkBlue dark:border-cyan pl-3 flex items-center gap-2">
              <ShoppingBag className="text-darkBlue dark:text-cyan" size={22} /> Featured Products
            </h2>
            <p className="text-xs sm:text-sm text-lightTextSecondary dark:text-darkTextSecondary pl-4 mt-0.5">
              Hand-picked bestsellers, staple grains, and daily household essentials
            </p>
          </div>
          <Link to="/products" className="text-xs sm:text-sm font-semibold text-lightBlue dark:text-aqua hover:underline flex items-center gap-1">
            View All <ArrowRight size={14} />
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
          {featuredProducts.slice(0, 8).map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* 4. Today's Deals & Discounts */}
      {dealsProducts.length > 0 && (
        <section id="todays-deals" className="scroll-mt-24 bg-gradient-to-r from-brandGold/15 via-brandGold/5 to-transparent p-4 sm:p-6 md:p-8 rounded-2xl md:rounded-3xl border border-brandGold/30 shadow-xs">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brandGold text-white text-[11px] sm:text-xs font-black uppercase tracking-wider mb-1.5 shadow-xs">
                <BadgePercent size={13} /> Limited Time Offers
              </div>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-lightText dark:text-darkText">
                Today's Deals &amp; Discounts
              </h2>
            </div>
            <Link to="/offers" className="text-xs sm:text-sm font-bold text-brandGold-dark dark:text-brandGold-light hover:underline flex items-center gap-1">
              See All Deals <ArrowRight size={14} />
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
            {dealsProducts.slice(0, 4).map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}

      {/* 5. New Arrivals */}
      <section id="new-arrivals" className="scroll-mt-24">
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-lightText dark:text-darkText border-l-4 border-darkBlue dark:border-cyan pl-3 flex items-center gap-2">
              <PackagePlus className="text-darkBlue dark:text-cyan" size={22} /> New Arrivals
            </h2>
            <p className="text-xs sm:text-sm text-lightTextSecondary dark:text-darkTextSecondary pl-4 mt-0.5">
              Recently added cosmetics, personal care, and grocery items
            </p>
          </div>
          <Link to="/products" className="text-xs sm:text-sm font-semibold text-lightBlue dark:text-aqua hover:underline flex items-center gap-1">
            Browse Catalog <ArrowRight size={14} />
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
          {newArrivals.slice(0, 8).map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* 6. Featured Videos (Above Footer) */}
      <div id="featured-videos" className="scroll-mt-24">
        <FeaturedVideos />
      </div>

      {/* 7. Trust Strip */}
      <div id="trust-strip" className="scroll-mt-24">
        <TrustStrip />
      </div>
    </div>
  );
};

export default Home;
