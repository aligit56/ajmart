import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin, Clock, ShieldCheck } from 'lucide-react';
import { WhatsAppIcon, TikTokIcon, FacebookIcon, InstagramIcon } from './SocialIcons';
import api from '../api/axios';

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

  const whatsappNum = settings.whatsapp_number || '923357727555';
  const phone = settings.phone || '0335-7727555 / 0312-5637557';
  const email = settings.email || 'info@ajmart.pk';
  const address = settings.address || 'Shop # V-488, Namak Mandi Chowk, Raja Bazar, Rawalpindi';
  const hours = settings.opening_hours || settings.working_hours || 'Mon-Sat: 9 AM - 10 PM, Sun: Closed';
  const googleMapsUrl = settings.google_maps_url || 'https://maps.google.com/maps?q=AJ+Traders+Namak+Mandi+Chowk+Raja+Bazar+Rawalpindi';

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
              <span className="font-extrabold tracking-tight">AJ<span className="text-lightBlue dark:text-aqua">Mart</span></span>
            </Link>
            <p className="text-sm text-lightTextSecondary dark:text-darkTextSecondary leading-relaxed">
              Your trusted partner for fresh grocery staples, daily household essentials, and authentic branded goods with fast next-day delivery across Rawalpindi & Islamabad.
            </p>
            {/* Social Icons */}
            <div className="flex items-center gap-2.5 pt-2 flex-wrap">
              <a 
                href={settings.facebook_url || 'https://www.facebook.com/share/14uooa52BdR/'} 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-lightBg dark:bg-[#1f1f1f] border border-lightBorder dark:border-[#333] flex items-center justify-center text-lightTextSecondary dark:text-darkTextSecondary hover:text-[#1877F2] hover:border-[#1877F2]/40 dark:hover:text-[#1877F2] transition-all hover:scale-110 shadow-sm"
                aria-label="Facebook"
                title="Follow AJMart on Facebook"
              >
                <FacebookIcon size={18} />
              </a>

              <a 
                href={settings.instagram_url || 'https://www.instagram.com/aj_traders006'} 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-lightBg dark:bg-[#1f1f1f] border border-lightBorder dark:border-[#333] flex items-center justify-center text-lightTextSecondary dark:text-darkTextSecondary hover:text-[#E4405F] hover:border-[#E4405F]/40 dark:hover:text-[#E4405F] transition-all hover:scale-110 shadow-sm"
                aria-label="Instagram"
                title="Follow AJMart on Instagram"
              >
                <InstagramIcon size={18} />
              </a>

              <a 
                href={settings.tiktok_url || 'https://www.tiktok.com/@aj.traders07'} 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-lightBg dark:bg-[#1f1f1f] border border-lightBorder dark:border-[#333] flex items-center justify-center text-lightTextSecondary dark:text-darkTextSecondary hover:text-[#000000] dark:hover:text-white hover:border-black/40 dark:hover:border-white/40 transition-all hover:scale-110 shadow-sm"
                aria-label="TikTok"
                title="Watch AJMart on TikTok"
              >
                <TikTokIcon size={18} />
              </a>

              <a 
                href={settings.whatsapp_channel_url || 'https://whatsapp.com/channel/0029Vb9yavmE50UlfeAKWo39'} 
                target="_blank" 
                rel="noopener noreferrer"
                className="h-9 px-3 rounded-full bg-lightBg dark:bg-[#1f1f1f] border border-lightBorder dark:border-[#333] flex items-center gap-1.5 text-xs font-bold text-[#25D366] hover:bg-[#25D366] hover:text-white hover:border-[#25D366] transition-all hover:scale-105 shadow-sm"
                aria-label="WhatsApp Channel"
                title="Join our official WhatsApp Channel"
              >
                <WhatsAppIcon size={16} />
                <span>Channel</span>
              </a>

              <a 
                href={`https://wa.me/${whatsappNum}?text=Hello%20AJMart,%20I%20want%20to%20order`}
                target="_blank" 
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-[#25D366] text-white flex items-center justify-center hover:bg-[#20ba5a] transition-all hover:scale-110 shadow-sm"
                aria-label="Chat on WhatsApp"
                title="Chat directly on WhatsApp"
              >
                <WhatsAppIcon size={18} />
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
                <a href={googleMapsUrl} target="_blank" rel="noopener noreferrer" className="hover:underline">
                  {address}
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone size={18} className="text-darkBlue dark:text-cyan flex-shrink-0" />
                <a href={`tel:${phone}`} className="hover:underline">{phone}</a>
              </li>
              <li className="flex items-center gap-2.5">
                <WhatsAppIcon size={18} className="text-[#25D366] flex-shrink-0" />
                <a href={`https://wa.me/${whatsappNum}`} target="_blank" rel="noopener noreferrer" className="hover:underline font-semibold text-green-600 dark:text-green-400">
                  WhatsApp: +{whatsappNum}
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                <WhatsAppIcon size={18} className="text-[#25D366] flex-shrink-0" />
                <a href={settings.whatsapp_channel_url || 'https://whatsapp.com/channel/0029Vb9yavmE50UlfeAKWo39'} target="_blank" rel="noopener noreferrer" className="hover:underline font-semibold text-emerald-600 dark:text-emerald-400">
                  Official WhatsApp Channel
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
            <span>&copy; 2026 AJMart. All rights reserved.</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
