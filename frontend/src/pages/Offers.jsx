import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import ProductCard from '../components/ProductCard';
import { Loader2, Tag, Percent, ArrowRight, ShoppingBag } from 'lucide-react';

const Offers = () => {
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDeals = async () => {
      try {
        const res = await api.get('/products/deals');
        setDeals(res.data || []);
      } catch (err) {
        console.error('Failed to load deals:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDeals();
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
      {/* Banner */}
      <div className="bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 text-white p-8 md:p-10 rounded-3xl shadow-xl relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 opacity-15 pointer-events-none">
          <Percent size={280} />
        </div>
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold uppercase tracking-wider mb-3">
            <Tag size={14} /> Exclusive Promotions & Discounts
          </div>
          <h1 className="text-3xl md:text-5xl font-black tracking-tight mb-3">
            Special Grocery Deals
          </h1>
          <p className="text-sm md:text-base text-white/90 leading-relaxed">
            Save more on everyday staples, personal care products, and bulk groceries with limited-time price drops.
          </p>
        </div>
      </div>

      {/* Offers Grid or Empty State */}
      {deals.length === 0 ? (
        <div className="text-center py-20 bg-lightCard dark:bg-darkCard rounded-3xl border border-lightBorder dark:border-darkBorder p-8 max-w-xl mx-auto shadow-sm">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center">
            <Tag size={32} />
          </div>
          <h2 className="text-2xl font-bold text-lightText dark:text-darkText mb-2">
            No Active Deals Right Now
          </h2>
          <p className="text-sm text-lightTextSecondary dark:text-darkTextSecondary mb-6 leading-relaxed">
            Check back soon for new offers, seasonal sales, and weekly grocery discounts! You can still browse our regular low prices.
          </p>
          <Link to="/products" className="btn-primary inline-flex items-center gap-2">
            <ShoppingBag size={18} /> Browse All Products
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl md:text-2xl font-bold text-lightText dark:text-darkText">
              Active Price Cuts ({deals.length})
            </h2>
            <Link to="/products" className="text-xs md:text-sm font-semibold text-lightBlue dark:text-aqua hover:underline flex items-center gap-1">
              View All Products <ArrowRight size={14} />
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {deals.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Offers;
