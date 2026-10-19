import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin, Clock, MessageCircle, ShieldCheck } from 'lucide-react';
import api from '../api/axios';

const FacebookIcon = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
);

const InstagramIcon = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
  </svg>
);

const Footer = () => {
  const [categories, setCategories] = useState([]);
  const [settings, setSettings] = useState({});

  useEffect(() => {
    api.get('/categories')
      .then(res => setCategories(res.data.slice(0, 6)))
      .catch(err => console.error('Failed to load categories in footer:', err));

    api.get('/settings')
      .then(res => setSettings(res.data || {}))
      .catch(err => console.error('Failed to load settings in footer:', err));
  }, []);

  const whatsappNum = settings.whatsapp_number || '923001234567';
  const phone = settings.phone || '0300-0000000';
  const email = settings.email || 'info@ajtraders.pk';
  const address = settings.address || 'Placeholder address, Karachi';
  const hours = settings.opening_hours || settings.working_hours || 'Mon-Sun, 9 AM - 10 PM';

  return (
    <footer className="bg-lightCard dark:bg-[#0e0e0e] border-t border-lightBorder dark:border-[#222] text-lightText dark:text-darkText transition-colors duration-200 mt-16">
      <div className="container mx-auto px-4 py-12 max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-10">
          
          {/* Column 1: Brand & About */}
          <div className="space-y-4">
            <Link to="/" className="text-2xl font-bold text-darkBlue dark:text-cyan flex items-center gap-2 group">
              <div 
                className="w-9 h-11 bg-darkBlue dark:bg-cyan transition-colors"
                style={{ 
                  WebkitMaskImage: 'url(/logo-alpha.png)', 
                  WebkitMaskSize: 'contain', 
                  WebkitMaskRepeat: 'no-repeat', 
                  WebkitMaskPosition: 'center',
                  maskImage: 'url(/logo-alpha.png)',
                  maskSize: 'contain',
                  maskRepeat: 'no-repeat',
                  maskPosition: 'center'
                }}
              ></div>
              <span className="font-extrabold tracking-tight">AJ<span className="text-lightBlue dark:text-aqua">Traders</span></span>
            </Link>
            <p className="text-sm text-lightTextSecondary dark:text-darkTextSecondary leading-relaxed">
              Your trusted partner for fresh grocery staples, daily household essentials, and authentic branded goods with fast next-day delivery across Karachi.
            </p>
            {/* Social Icons */}
            <div className="flex items-center gap-3 pt-2">
              {settings.facebook_url ? (
                <a 
                  href={settings.facebook_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full bg-lightBg dark:bg-[#1f1f1f] border border-lightBorder dark:border-[#333] flex items-center justify-center text-lightTextSecondary dark:text-darkTextSecondary hover:text-darkBlue dark:hover:text-cyan transition-colors"
                  aria-label="Facebook"
                >
                  <FacebookIcon size={18} />
                </a>
              ) : (
                <span className="w-9 h-9 rounded-full bg-lightBg dark:bg-[#1f1f1f] border border-lightBorder dark:border-[#333] flex items-center justify-center text-lightTextSecondary dark:text-darkTextSecondary opacity-60">
                  <FacebookIcon size={18} />
                </span>
              )}

              {settings.instagram_url ? (
                <a 
                  href={settings.instagram_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full bg-lightBg dark:bg-[#1f1f1f] border border-lightBorder dark:border-[#333] flex items-center justify-center text-lightTextSecondary dark:text-darkTextSecondary hover:text-darkBlue dark:hover:text-cyan transition-colors"
                  aria-label="Instagram"
                >
                  <InstagramIcon size={18} />
                </a>
              ) : (
                <span className="w-9 h-9 rounded-full bg-lightBg dark:bg-[#1f1f1f] border border-lightBorder dark:border-[#333] flex items-center justify-center text-lightTextSecondary dark:text-darkTextSecondary opacity-60">
                  <InstagramIcon size={18} />
                </span>
              )}

              <a 
                href={`https://wa.me/${whatsappNum}?text=Hello%20AJTraders,%20I%20want%20to%20order`}
                target="_blank" 
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-lightBg dark:bg-[#1f1f1f] border border-lightBorder dark:border-[#333] flex items-center justify-center text-green-600 dark:text-green-400 hover:bg-green-500 hover:text-white transition-colors"
                aria-label="WhatsApp"
              >
                <MessageCircle size={18} />
              </a>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h4 className="font-bold text-base text-darkBlue dark:text-cyan mb-4 uppercase tracking-wider text-xs">
              Quick Links
            </h4>
            <ul className="space-y-2.5 text-sm text-lightTextSecondary dark:text-darkTextSecondary font-medium">
              <li>
                <Link to="/" className="hover:text-darkBlue dark:hover:text-cyan transition-colors">Home</Link>
              </li>
              <li>
                <Link to="/products" className="hover:text-darkBlue dark:hover:text-cyan transition-colors">All Products</Link>
              </li>
              <li>
                <Link to="/categories" className="hover:text-darkBlue dark:hover:text-cyan transition-colors">Shop Categories</Link>
              </li>
              <li>
                <Link to="/offers" className="hover:text-darkBlue dark:hover:text-cyan transition-colors">Deals & Offers</Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-darkBlue dark:hover:text-cyan transition-colors">About Us</Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-darkBlue dark:hover:text-cyan transition-colors">Contact & Location</Link>
              </li>
              <li>
                <Link to="/faq" className="hover:text-darkBlue dark:hover:text-cyan transition-colors">FAQs & Delivery</Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Top Categories */}
          <div>
            <h4 className="font-bold text-base text-darkBlue dark:text-cyan mb-4 uppercase tracking-wider text-xs">
              Top Categories
            </h4>
            <ul className="space-y-2.5 text-sm text-lightTextSecondary dark:text-darkTextSecondary font-medium">
              {categories.map(cat => (
                <li key={cat.id}>
                  <Link to={`/category/${cat.id}`} className="hover:text-darkBlue dark:hover:text-cyan transition-colors">
                    {cat.name}
                  </Link>
                </li>
              ))}
              <li>
                <Link to="/categories" className="text-lightBlue dark:text-aqua font-semibold hover:underline">
                  View All &rarr;
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Contact & Store Info */}
          <div className="space-y-3">
            <h4 className="font-bold text-base text-darkBlue dark:text-cyan mb-4 uppercase tracking-wider text-xs">
              Contact & Hours
            </h4>
            <ul className="space-y-3 text-sm text-lightTextSecondary dark:text-darkTextSecondary font-medium">
              <li className="flex items-start gap-2.5">
                <MapPin size={18} className="text-darkBlue dark:text-cyan flex-shrink-0 mt-0.5" />
                <span>{address}</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone size={18} className="text-darkBlue dark:text-cyan flex-shrink-0" />
                <a href={`tel:${phone}`} className="hover:underline">{phone}</a>
              </li>
              <li className="flex items-center gap-2.5">
                <MessageCircle size={18} className="text-green-500 flex-shrink-0" />
                <a href={`https://wa.me/${whatsappNum}`} target="_blank" rel="noopener noreferrer" className="hover:underline font-semibold text-green-600 dark:text-green-400">
                  WhatsApp: +{whatsappNum}
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail size={18} className="text-darkBlue dark:text-cyan flex-shrink-0" />
                <a href={`mailto:${email}`} className="hover:underline">{email}</a>
              </li>
              <li className="flex items-start gap-2.5">
                <Clock size={18} className="text-darkBlue dark:text-cyan flex-shrink-0 mt-0.5" />
                <span>{hours}</span>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-lightBorder dark:border-[#222] flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-lightTextSecondary dark:text-darkTextSecondary">
          <div className="flex items-center gap-2">
            <ShieldCheck size={16} className="text-darkBlue dark:text-cyan" />
            <span>Payment Methods: <strong>Cash on Delivery (COD)</strong> • <strong>WhatsApp Direct Order</strong> • <strong>Bank Transfer</strong></span>
          </div>
          <div className="flex items-center gap-6">
            <Link to="/terms" className="hover:text-darkBlue dark:hover:text-cyan transition-colors">Terms of Service</Link>
            <Link to="/privacy" className="hover:text-darkBlue dark:hover:text-cyan transition-colors">Privacy Policy</Link>
            <span>&copy; 2026 AJTraders. All rights reserved.</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
