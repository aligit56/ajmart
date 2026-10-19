import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { ShieldCheck, Truck, Clock, HeartHandshake, Users, Package, MapPin, Sparkles, CheckCircle2 } from 'lucide-react';

const About = () => {
  const [settings, setSettings] = useState({
    store_name: 'AJTraders',
    happy_customers: '1000+',
    products_count: '150+',
    delivery_areas: 'Karachi'
  });

  useEffect(() => {
    api.get('/settings')
      .then(res => {
        if (res.data) {
          setSettings(prev => ({ ...prev, ...res.data }));
        }
      })
      .catch(err => console.error('Failed to load settings in About:', err));
  }, []);

  return (
    <div className="space-y-12 max-w-5xl mx-auto">
      {/* Hero Section */}
      <div className="text-center space-y-4 py-6">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-darkBlue/10 dark:bg-cyan/15 text-darkBlue dark:text-cyan text-xs font-bold uppercase tracking-wider">
          <Sparkles size={13} /> Our Journey & Promise
        </div>
        <h1 className="text-3xl md:text-5xl font-black text-lightText dark:text-darkText tracking-tight">
          About {settings.store_name || 'AJTraders'}
        </h1>
        <p className="text-base md:text-lg text-lightTextSecondary dark:text-darkTextSecondary max-w-2xl mx-auto leading-relaxed">
          Delivering premium unadulterated groceries, staple grains, household essentials, and authentic personal care products right to your home in {settings.delivery_areas || 'Karachi'}.
        </p>
      </div>

      {/* Story & Store Image */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center bg-lightCard dark:bg-darkCard p-6 md:p-10 rounded-3xl border border-lightBorder dark:border-darkBorder shadow-sm">
        <div className="space-y-4">
          <h2 className="text-2xl md:text-3xl font-extrabold text-lightText dark:text-darkText border-l-4 border-darkBlue dark:border-cyan pl-3">
            Our Story
          </h2>
          <p className="text-sm md:text-base text-lightTextSecondary dark:text-darkTextSecondary leading-relaxed">
            Founded with a singular mission: to make everyday grocery shopping hassle-free, honest, and affordable for families. We noticed that getting pure pulses, unpolished rice, clean spices, and genuine cosmetics often required visiting multiple crowded markets.
          </p>
          <p className="text-sm md:text-base text-lightTextSecondary dark:text-darkTextSecondary leading-relaxed">
            At {settings.store_name || 'AJTraders'}, we source directly from reputable mills and certified distributors. Every batch is inspected for cleanliness, aroma, and freshness before it is packaged and delivered to your doorstep.
          </p>

          <div className="pt-2 space-y-2">
            {['100% Guaranteed Purity & Freshness', 'Next-Day Delivery Across Karachi', 'Cash on Delivery & Easy WhatsApp Ordering'].map((point, idx) => (
              <div key={idx} className="flex items-center gap-2.5 text-sm font-semibold text-lightText dark:text-darkText">
                <CheckCircle2 size={18} className="text-emerald-500 flex-shrink-0" />
                <span>{point}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl overflow-hidden border border-lightBorder dark:border-darkBorder shadow-md relative aspect-video md:aspect-square bg-gray-100 dark:bg-[#111]">
          <img
            src="/images/about/store-placeholder.jpg"
            alt="AJTraders Store"
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = '/images/placeholder.jpg';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end p-6">
            <span className="text-white text-sm font-semibold tracking-wide">
              {settings.store_name || 'AJTraders'} Karachi Fulfillment Hub
            </span>
          </div>
        </div>
      </div>

      {/* Stats Counter Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-lightCard dark:bg-darkCard p-6 rounded-2xl border border-lightBorder dark:border-darkBorder text-center shadow-sm hover:border-darkBlue dark:hover:border-cyan transition-colors">
          <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-darkBlue/10 dark:bg-cyan/15 text-darkBlue dark:text-cyan flex items-center justify-center">
            <Users size={24} />
          </div>
          <div className="text-3xl md:text-4xl font-extrabold text-lightText dark:text-darkText mb-1">
            {settings.happy_customers || '1000+'}
          </div>
          <div className="text-xs uppercase font-bold tracking-wider text-lightTextSecondary dark:text-darkTextSecondary">
            Happy Customers
          </div>
        </div>

        <div className="bg-lightCard dark:bg-darkCard p-6 rounded-2xl border border-lightBorder dark:border-darkBorder text-center shadow-sm hover:border-darkBlue dark:hover:border-cyan transition-colors">
          <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
            <Package size={24} />
          </div>
          <div className="text-3xl md:text-4xl font-extrabold text-lightText dark:text-darkText mb-1">
            {settings.products_count || '150+'}
          </div>
          <div className="text-xs uppercase font-bold tracking-wider text-lightTextSecondary dark:text-darkTextSecondary">
            Products In Stock
          </div>
        </div>

        <div className="bg-lightCard dark:bg-darkCard p-6 rounded-2xl border border-lightBorder dark:border-darkBorder text-center shadow-sm hover:border-darkBlue dark:hover:border-cyan transition-colors">
          <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center">
            <MapPin size={24} />
          </div>
          <div className="text-3xl md:text-4xl font-extrabold text-lightText dark:text-darkText mb-1">
            {settings.delivery_areas || 'Karachi'}
          </div>
          <div className="text-xs uppercase font-bold tracking-wider text-lightTextSecondary dark:text-darkTextSecondary">
            Fast Delivery Areas
          </div>
        </div>
      </div>

      {/* Why Choose Us */}
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl md:text-3xl font-extrabold text-lightText dark:text-darkText">
            Why Shop With Us?
          </h2>
          <p className="text-sm text-lightTextSecondary dark:text-darkTextSecondary mt-1">
            We put customer trust and food safety above all else
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-lightCard dark:bg-darkCard p-5 rounded-2xl border border-lightBorder dark:border-darkBorder">
            <ShieldCheck size={28} className="text-emerald-500 mb-3" />
            <h3 className="font-bold text-base mb-1">Quality Guaranteed</h3>
            <p className="text-xs text-lightTextSecondary dark:text-darkTextSecondary leading-relaxed">
              Every item is quality-checked before packing. If you are not satisfied, we replace it hassle-free.
            </p>
          </div>

          <div className="bg-lightCard dark:bg-darkCard p-5 rounded-2xl border border-lightBorder dark:border-darkBorder">
            <Truck size={28} className="text-darkBlue dark:text-cyan mb-3" />
            <h3 className="font-bold text-base mb-1">Next-Day Delivery</h3>
            <p className="text-xs text-lightTextSecondary dark:text-darkTextSecondary leading-relaxed">
              Fast, careful doorstep delivery throughout Karachi with flexible morning or evening delivery slots.
            </p>
          </div>

          <div className="bg-lightCard dark:bg-darkCard p-5 rounded-2xl border border-lightBorder dark:border-darkBorder">
            <HeartHandshake size={28} className="text-amber-500 mb-3" />
            <h3 className="font-bold text-base mb-1">Fair Wholesale Rates</h3>
            <p className="text-xs text-lightTextSecondary dark:text-darkTextSecondary leading-relaxed">
              Direct producer partnerships allow us to pass significant grocery savings directly on to you.
            </p>
          </div>

          <div className="bg-lightCard dark:bg-darkCard p-5 rounded-2xl border border-lightBorder dark:border-darkBorder">
            <Clock size={28} className="text-indigo-500 mb-3" />
            <h3 className="font-bold text-base mb-1">WhatsApp Support</h3>
            <p className="text-xs text-lightTextSecondary dark:text-darkTextSecondary leading-relaxed">
              Need to add an extra item or ask a question? Our friendly support team is always one tap away.
            </p>
          </div>
        </div>
      </div>

      {/* CTA Box */}
      <div className="text-center bg-gradient-to-r from-darkBlue/10 to-cyan/10 p-8 rounded-3xl border border-darkBlue/20 dark:border-cyan/20">
        <h3 className="text-xl md:text-2xl font-bold mb-2">Ready to order your household groceries?</h3>
        <p className="text-sm text-lightTextSecondary dark:text-darkTextSecondary mb-6 max-w-md mx-auto">
          Explore our complete catalog or place your order directly via WhatsApp in seconds.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4">
          <Link to="/products" className="btn-primary">Browse Products</Link>
          <Link to="/contact" className="px-5 py-2.5 rounded-xl border border-lightBorder dark:border-darkBorder font-semibold hover:bg-lightCard dark:hover:bg-darkCard transition-colors">Contact Us</Link>
        </div>
      </div>
    </div>
  );
};

export default About;
