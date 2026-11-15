import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { ShieldCheck, Truck, Clock, HeartHandshake, Users, Package, MapPin, Sparkles, CheckCircle2 } from 'lucide-react';

const About = () => {
  const [settings, setSettings] = useState({
    store_name: 'AJMart',
    happy_customers: '1000+',
    products_count: '150+',
    delivery_areas: 'Rawalpindi & Islamabad'
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
          About {settings.store_name || 'AJMart'}
        </h1>
        <p className="text-base md:text-lg text-lightTextSecondary dark:text-darkTextSecondary max-w-2xl mx-auto leading-relaxed">
          Delivering premium unadulterated groceries, staple grains, household essentials, and authentic personal care products right to your home across {settings.delivery_areas || 'Rawalpindi & Islamabad'}.
        </p>
      </div>

      {/* Story & Store Image */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center bg-lightCard dark:bg-darkCard p-6 md:p-10 rounded-3xl border border-lightBorder dark:border-darkBorder shadow-sm">
        <div className="space-y-4">
          <h2 className="text-2xl md:text-3xl font-extrabold text-lightText dark:text-darkText border-l-4 border-darkBlue dark:border-cyan pl-3">
            Our Story & Heritage
          </h2>
          <p className="text-sm md:text-base text-lightTextSecondary dark:text-darkTextSecondary leading-relaxed">
            Headquartered in the historic wholesale heart of Rawalpindi at <strong>Namak Mandi Chowk, Raja Bazar</strong>, AJMart was founded to make pure, authentic grocery staples accessible at genuine wholesale pricing.
          </p>
          <p className="text-sm md:text-base text-lightTextSecondary dark:text-darkTextSecondary leading-relaxed">
            We source straight from certified mills and premier agricultural distributors. Every single batch of pulses, aged basmati rice, gram flour (baison), and spices is meticulously sifted, cleaned, and packed to ensure 100% purity and unmatched freshness.
          </p>

          <div className="pt-2 space-y-2">
            {[
              '100% Guaranteed Purity & Unadulterated Grains',
              'Next-Day Doorstep Delivery Across Rawalpindi & Islamabad',
              'Genuine Wholesale Rates & Easy WhatsApp Ordering'
            ].map((point, idx) => (
              <div key={idx} className="flex items-center gap-2.5 text-sm font-semibold text-lightText dark:text-darkText">
                <CheckCircle2 size={18} className="text-emerald-500 flex-shrink-0" />
                <span>{point}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl overflow-hidden border border-lightBorder dark:border-darkBorder shadow-md relative aspect-video md:aspect-square bg-gray-100 dark:bg-[#111] flex items-center justify-center p-2 bg-gradient-to-br from-zinc-50 to-zinc-200 dark:from-zinc-900 dark:to-zinc-950">
          <img
            src="/images/brand/ajtraders-visiting-card.jpg"
            alt="AJMart Official Store Card"
            className="w-full h-full object-contain rounded-xl shadow-lg hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = '/images/brand/ajtraders-logo.png';
            }}
          />
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex items-end p-4 rounded-b-2xl">
            <span className="text-white text-xs md:text-sm font-bold tracking-wide">
              {settings.store_name || 'AJMart'} • Namak Mandi, Raja Bazar, Rawalpindi Hub
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
            Happy Customers & Retailers
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
            Wholesale Products In Stock
          </div>
        </div>

        <div className="bg-lightCard dark:bg-darkCard p-6 rounded-2xl border border-lightBorder dark:border-darkBorder text-center shadow-sm hover:border-darkBlue dark:hover:border-cyan transition-colors">
          <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center">
            <MapPin size={24} />
          </div>
          <div className="text-2xl md:text-3xl font-extrabold text-lightText dark:text-darkText mb-1">
            {settings.delivery_areas || 'Rawalpindi & Islamabad'}
          </div>
          <div className="text-xs uppercase font-bold tracking-wider text-lightTextSecondary dark:text-darkTextSecondary">
            Fast Delivery Hubs
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
            We put customer trust, food safety, and fair wholesale pricing above all else
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
            <h3 className="font-bold text-base mb-1">Fast Delivery</h3>
            <p className="text-xs text-lightTextSecondary dark:text-darkTextSecondary leading-relaxed">
              Careful doorstep delivery throughout Rawalpindi & Islamabad with flexible morning or evening delivery slots.
            </p>
          </div>

          <div className="bg-lightCard dark:bg-darkCard p-5 rounded-2xl border border-lightBorder dark:border-darkBorder">
            <HeartHandshake size={28} className="text-amber-500 mb-3" />
            <h3 className="font-bold text-base mb-1">Direct Wholesale Rates</h3>
            <p className="text-xs text-lightTextSecondary dark:text-darkTextSecondary leading-relaxed">
              Direct grain-mill partnerships allow us to pass authentic Namak Mandi wholesale savings directly to you.
            </p>
          </div>

          <div className="bg-lightCard dark:bg-darkCard p-5 rounded-2xl border border-lightBorder dark:border-darkBorder">
            <Clock size={28} className="text-indigo-500 mb-3" />
            <h3 className="font-bold text-base mb-1">Direct WhatsApp Desk</h3>
            <p className="text-xs text-lightTextSecondary dark:text-darkTextSecondary leading-relaxed">
              Need to add an extra item or ask a question? Aqib & Junaid are always one tap away on WhatsApp.
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
