import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin, Clock, ShieldCheck, ChevronDown } from 'lucide-react';
import { WhatsAppIcon, TikTokIcon, FacebookIcon, InstagramIcon } from './SocialIcons';
import api from '../api/axios';

const Footer = () => {
  const [categories, setCategories] = useState([]);
  const [settings, setSettings] = useState({});
  const [openSection, setOpenSection] = useState(null);

  useEffect(() => {
    api.get('/categories')
      .then(res => setCategories(res.data.slice(0, 8)))
      .catch(err => console.error('Failed to load categories in footer:', err));

    api.get('/settings')
      .then(res => setSettings(res.data || {}))
      .catch(err => console.error('Failed to load settings in footer:', err));
  }, []);

  const toggleSection = (section) => {
    setOpenSection(prev => prev === section ? null : section);
  };

  const whatsappNum = settings.whatsapp_number || '923357727555';
  const phone = settings.phone || '0335-7727555 / 0312-5637557';
  const email = settings.email || 'info@ajmart.pk';
  const address = settings.address || 'Shop # V-488, Namak Mandi Chowk, Raja Bazar, Rawalpindi';
  const hours = settings.opening_hours || settings.working_hours || 'Mon-Sat: 9 AM - 10 PM, Sun: Closed';
  const googleMapsUrl = settings.google_maps_url || 'https://maps.google.com/maps?q=AJ+Traders+Namak+Mandi+Chowk+Raja+Bazar+Rawalpindi';

  return (
    <footer className="bg-lightCard dark:bg-[#0e0e0e] border-t border-lightBorder dark:border-[#222] text-lightText dark:text-darkText transition-colors duration-200 mt-12 md:mt-16 pb-20 md:pb-8">
      <div className="container mx-auto px-4 py-8 md:py-12 max-w-7xl">
        
        {/* DESKTOP LAYOUT (md and up) */}
        <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-10">
          
          {/* Column 1: Brand & About */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center" aria-label="AJMart Home">
              <img 
                src="/images/brand/ajmart-logo-primary.webp" 
                alt="AJMart" 
                className="h-10 w-auto object-contain dark:hidden block" 
                onError={(e) => { e.currentTarget.src = '/images/brand/ajmart-logo-primary.png'; }}
              />
              <img 
                src="/images/brand/ajmart-logo-dark.webp" 
                alt="AJMart" 
                className="h-10 w-auto object-contain hidden dark:block" 
                onError={(e) => { e.currentTarget.src = '/images/brand/ajmart-logo-dark.png'; }}
              />
            </Link>
            <p className="text-sm text-lightTextSecondary dark:text-darkTextSecondary leading-relaxed">
              Your trusted partner for fresh grocery staples, daily household essentials, and authentic branded goods with fast next-day delivery across Rawalpindi &amp; Islamabad.
            </p>
            {/* Social Icons */}
            <div className="flex items-center gap-2.5 pt-2 flex-wrap">
              <a 
                href={settings.facebook_url || 'https://www.facebook.com/share/14uooa52BdR/'} 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-lightBg dark:bg-[#1f1f1f] border border-lightBorder dark:border-[#333] flex items-center justify-center text-lightTextSecondary dark:text-darkTextSecondary hover:text-[#1877F2] hover:border-[#1877F2]/40 dark:hover:text-[#1877F2] transition-all hover:scale-110 shadow-xs"
                aria-label="Facebook"
                title="Follow AJMart on Facebook"
              >
                <FacebookIcon size={18} />
              </a>

              <a 
                href={settings.instagram_url || 'https://www.instagram.com/aj_traders006'} 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-lightBg dark:bg-[#1f1f1f] border border-lightBorder dark:border-[#333] flex items-center justify-center text-lightTextSecondary dark:text-darkTextSecondary hover:text-[#E4405F] hover:border-[#E4405F]/40 dark:hover:text-[#E4405F] transition-all hover:scale-110 shadow-xs"
                aria-label="Instagram"
                title="Follow AJMart on Instagram"
              >
                <InstagramIcon size={18} />
              </a>

              <a 
                href={settings.tiktok_url || 'https://www.tiktok.com/@aj.traders07'} 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-lightBg dark:bg-[#1f1f1f] border border-lightBorder dark:border-[#333] flex items-center justify-center text-lightTextSecondary dark:text-darkTextSecondary hover:text-[#000000] dark:hover:text-white hover:border-black/40 dark:hover:border-white/40 transition-all hover:scale-110 shadow-xs"
                aria-label="TikTok"
                title="Watch AJMart on TikTok"
              >
                <TikTokIcon size={18} />
              </a>

              <a 
                href={settings.whatsapp_channel_url || 'https://whatsapp.com/channel/0029Vb9yavmE50UlfeAKWo39'} 
                target="_blank" 
                rel="noopener noreferrer"
                className="h-9 px-3 rounded-full bg-lightBg dark:bg-[#1f1f1f] border border-lightBorder dark:border-[#333] flex items-center gap-1.5 text-xs font-bold text-[#25D366] hover:bg-[#25D366] hover:text-white hover:border-[#25D366] transition-all hover:scale-105 shadow-xs"
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
                className="w-9 h-9 rounded-full bg-[#25D366] text-white flex items-center justify-center hover:bg-[#20ba5a] transition-all hover:scale-110 shadow-xs"
                aria-label="Chat on WhatsApp"
                title="Chat directly on WhatsApp"
              >
                <WhatsAppIcon size={18} />
              </a>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h4 className="font-bold text-xs text-darkBlue dark:text-cyan mb-4 uppercase tracking-wider">
              Quick Links
            </h4>
            <ul className="space-y-2.5 text-sm text-lightTextSecondary dark:text-darkTextSecondary font-medium">
              <li><Link to="/" className="hover:text-darkBlue dark:hover:text-cyan transition-colors">Home</Link></li>
              <li><Link to="/products" className="hover:text-darkBlue dark:hover:text-cyan transition-colors">All Products</Link></li>
              <li><Link to="/categories" className="hover:text-darkBlue dark:hover:text-cyan transition-colors">Shop Categories</Link></li>
              <li><Link to="/offers" className="hover:text-darkBlue dark:hover:text-cyan transition-colors">Deals &amp; Offers</Link></li>
              <li><Link to="/about" className="hover:text-darkBlue dark:hover:text-cyan transition-colors">About Us</Link></li>
              <li><Link to="/contact" className="hover:text-darkBlue dark:hover:text-cyan transition-colors">Contact &amp; Location</Link></li>
              <li><Link to="/faq" className="hover:text-darkBlue dark:hover:text-cyan transition-colors">FAQs &amp; Delivery</Link></li>
            </ul>
          </div>

          {/* Column 3: Top Categories */}
          <div>
            <h4 className="font-bold text-xs text-darkBlue dark:text-cyan mb-4 uppercase tracking-wider">
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
            <h4 className="font-bold text-xs text-darkBlue dark:text-cyan mb-4 uppercase tracking-wider">
              Contact &amp; Hours
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

        {/* MOBILE COMPACT ACCORDION LAYOUT (md:hidden) */}
        <div className="md:hidden space-y-4">
          
          {/* Brand & Social Header */}
          <div className="text-center pb-2">
            <Link to="/" className="inline-flex items-center justify-center mb-2" aria-label="AJMart Home">
              <img 
                src="/images/brand/ajmart-logo-primary.webp" 
                alt="AJMart" 
                className="h-8 w-auto object-contain dark:hidden block mx-auto" 
                onError={(e) => { e.currentTarget.src = '/images/brand/ajmart-logo-primary.png'; }}
              />
              <img 
                src="/images/brand/ajmart-logo-dark.webp" 
                alt="AJMart" 
                className="h-8 w-auto object-contain hidden dark:block mx-auto" 
                onError={(e) => { e.currentTarget.src = '/images/brand/ajmart-logo-dark.png'; }}
              />
            </Link>
            <p className="text-xs text-lightTextSecondary dark:text-darkTextSecondary max-w-sm mx-auto">
              Fresh grocery staples &amp; household essentials across Rawalpindi &amp; Islamabad.
            </p>

            {/* Compact Mobile Social Strip */}
            <div className="flex items-center justify-center gap-2.5 pt-3">
              <a 
                href={settings.facebook_url || 'https://www.facebook.com/share/14uooa52BdR/'} 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full bg-lightBg dark:bg-[#1f1f1f] border border-lightBorder dark:border-[#333] flex items-center justify-center text-lightTextSecondary dark:text-darkTextSecondary hover:text-[#1877F2]"
                aria-label="Facebook"
              >
                <FacebookIcon size={16} />
              </a>
              <a 
                href={settings.instagram_url || 'https://www.instagram.com/aj_traders006'} 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full bg-lightBg dark:bg-[#1f1f1f] border border-lightBorder dark:border-[#333] flex items-center justify-center text-lightTextSecondary dark:text-darkTextSecondary hover:text-[#E4405F]"
                aria-label="Instagram"
              >
                <InstagramIcon size={16} />
              </a>
              <a 
                href={settings.tiktok_url || 'https://www.tiktok.com/@aj.traders07'} 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full bg-lightBg dark:bg-[#1f1f1f] border border-lightBorder dark:border-[#333] flex items-center justify-center text-lightTextSecondary dark:text-darkTextSecondary hover:text-black dark:hover:text-white"
                aria-label="TikTok"
              >
                <TikTokIcon size={16} />
              </a>
              <a 
                href={settings.whatsapp_channel_url || 'https://whatsapp.com/channel/0029Vb9yavmE50UlfeAKWo39'} 
                target="_blank" 
                rel="noopener noreferrer"
                className="h-8 px-2.5 rounded-full bg-lightBg dark:bg-[#1f1f1f] border border-lightBorder dark:border-[#333] flex items-center gap-1 text-[11px] font-bold text-[#25D366]"
                aria-label="WhatsApp Channel"
              >
                <WhatsAppIcon size={14} />
                <span>Channel</span>
              </a>
              <a 
                href={`https://wa.me/${whatsappNum}?text=Hello%20AJMart,%20I%20want%20to%20order`}
                target="_blank" 
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full bg-[#25D366] text-white flex items-center justify-center"
                aria-label="Chat on WhatsApp"
              >
                <WhatsAppIcon size={16} />
              </a>
            </div>
          </div>

          {/* Collapsible Accordion 1: Quick Links */}
          <div className="border border-lightBorder dark:border-[#222] rounded-xl overflow-hidden bg-white/50 dark:bg-[#141414]/50">
            <button
              onClick={() => toggleSection('links')}
              className="w-full px-4 py-3 flex items-center justify-between text-left font-bold text-xs uppercase tracking-wider text-lightText dark:text-darkText"
              aria-expanded={openSection === 'links'}
            >
              <span>Quick Links</span>
              <ChevronDown 
                size={16} 
                className={`text-lightTextSecondary transition-transform duration-200 ${openSection === 'links' ? 'rotate-180' : ''}`}
              />
            </button>
            {openSection === 'links' && (
              <div className="px-4 pb-3 pt-1 border-t border-lightBorder/50 dark:border-[#222]">
                <div className="grid grid-cols-2 gap-2 text-xs text-lightTextSecondary dark:text-darkTextSecondary font-medium">
                  <Link to="/" className="py-1 hover:text-darkBlue dark:hover:text-cyan">Home</Link>
                  <Link to="/products" className="py-1 hover:text-darkBlue dark:hover:text-cyan">All Products</Link>
                  <Link to="/categories" className="py-1 hover:text-darkBlue dark:hover:text-cyan">Categories</Link>
                  <Link to="/offers" className="py-1 hover:text-darkBlue dark:hover:text-cyan">Deals &amp; Offers</Link>
                  <Link to="/about" className="py-1 hover:text-darkBlue dark:hover:text-cyan">About Us</Link>
                  <Link to="/contact" className="py-1 hover:text-darkBlue dark:hover:text-cyan">Contact Us</Link>
                  <Link to="/faq" className="py-1 hover:text-darkBlue dark:hover:text-cyan">FAQs &amp; Delivery</Link>
                  <Link to="/cart" className="py-1 hover:text-darkBlue dark:hover:text-cyan">Cart</Link>
                </div>
              </div>
            )}
          </div>

          {/* Collapsible Accordion 2: Top Categories */}
          <div className="border border-lightBorder dark:border-[#222] rounded-xl overflow-hidden bg-white/50 dark:bg-[#141414]/50">
            <button
              onClick={() => toggleSection('categories')}
              className="w-full px-4 py-3 flex items-center justify-between text-left font-bold text-xs uppercase tracking-wider text-lightText dark:text-darkText"
              aria-expanded={openSection === 'categories'}
            >
              <span>Shop Categories</span>
              <ChevronDown 
                size={16} 
                className={`text-lightTextSecondary transition-transform duration-200 ${openSection === 'categories' ? 'rotate-180' : ''}`}
              />
            </button>
            {openSection === 'categories' && (
              <div className="px-4 pb-3 pt-1 border-t border-lightBorder/50 dark:border-[#222]">
                <div className="grid grid-cols-2 gap-2 text-xs text-lightTextSecondary dark:text-darkTextSecondary font-medium">
                  {categories.map(cat => (
                    <Link key={cat.id} to={`/category/${cat.id}`} className="py-1 hover:text-darkBlue dark:hover:text-cyan line-clamp-1">
                      {cat.name}
                    </Link>
                  ))}
                  <Link to="/categories" className="py-1 font-bold text-darkBlue dark:text-cyan col-span-2">
                    View All Categories &rarr;
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Collapsible Accordion 3: Contact & Hours */}
          <div className="border border-lightBorder dark:border-[#222] rounded-xl overflow-hidden bg-white/50 dark:bg-[#141414]/50">
            <button
              onClick={() => toggleSection('contact')}
              className="w-full px-4 py-3 flex items-center justify-between text-left font-bold text-xs uppercase tracking-wider text-lightText dark:text-darkText"
              aria-expanded={openSection === 'contact'}
            >
              <span>Contact &amp; Store Info</span>
              <ChevronDown 
                size={16} 
                className={`text-lightTextSecondary transition-transform duration-200 ${openSection === 'contact' ? 'rotate-180' : ''}`}
              />
            </button>
            {openSection === 'contact' && (
              <div className="px-4 pb-3 pt-1 border-t border-lightBorder/50 dark:border-[#222] space-y-2 text-xs text-lightTextSecondary dark:text-darkTextSecondary font-medium">
                <div className="flex items-start gap-2 pt-1">
                  <MapPin size={15} className="text-darkBlue dark:text-cyan flex-shrink-0 mt-0.5" />
                  <a href={googleMapsUrl} target="_blank" rel="noopener noreferrer" className="hover:underline">
                    {address}
                  </a>
                </div>
                <div className="flex items-center gap-2">
                  <Phone size={15} className="text-darkBlue dark:text-cyan flex-shrink-0" />
                  <a href={`tel:${phone}`} className="hover:underline">{phone}</a>
                </div>
                <div className="flex items-center gap-2">
                  <WhatsAppIcon size={15} className="text-[#25D366] flex-shrink-0" />
                  <a href={`https://wa.me/${whatsappNum}`} target="_blank" rel="noopener noreferrer" className="text-green-600 dark:text-green-400 font-semibold">
                    +{whatsappNum}
                  </a>
                </div>
                <div className="flex items-center gap-2">
                  <Clock size={15} className="text-darkBlue dark:text-cyan flex-shrink-0" />
                  <span>{hours}</span>
                </div>
              </div>
            )}
          </div>

        </div>

        {/* Bottom Bar: Payments & Copyright */}
        <div className="mt-8 md:mt-12 pt-6 md:pt-8 border-t border-lightBorder dark:border-[#222] flex flex-col md:flex-row items-center justify-between gap-3 text-center md:text-left text-xs text-lightTextSecondary dark:text-darkTextSecondary">
          <div className="flex items-center justify-center gap-2 flex-wrap">
            <ShieldCheck size={15} className="text-darkBlue dark:text-cyan flex-shrink-0" />
            <span>Payments: <strong>Cash on Delivery (COD)</strong> • <strong>WhatsApp Direct</strong> • <strong>Bank Transfer</strong></span>
          </div>
          <div className="flex items-center justify-center gap-4 text-[11px] sm:text-xs">
            <Link to="/terms" className="hover:text-darkBlue dark:hover:text-cyan transition-colors">Terms</Link>
            <span>•</span>
            <Link to="/privacy" className="hover:text-darkBlue dark:hover:text-cyan transition-colors">Privacy</Link>
            <span>•</span>
            <span>&copy; 2026 AJMart. All rights reserved.</span>
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
