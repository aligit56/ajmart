import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Truck, Tag, Phone, ChevronLeft, ChevronRight } from 'lucide-react';
import { WhatsAppIcon, TikTokIcon, FacebookIcon, InstagramIcon } from './SocialIcons';
import api from '../api/axios';

const PROMOTIONS = [
  {
    icon: Truck,
    badge: 'MIN ORDER PKR 5,000',
    text: 'Minimum order of PKR 5,000 required for doorstep delivery across Rawalpindi & Islamabad',
    link: '/products'
  },
  {
    icon: Sparkles,
    badge: '50 REWARD POINTS',
    text: 'Sign in & earn 50 reward points on every PKR 2,000 spent on grocery & wholesale!',
    link: '/login'
  },
  {
    icon: Tag,
    badge: 'WHOLESALE RATES',
    text: 'Special wholesale sack rates on Dalen, Premium Rice & Spices — Direct from Namak Mandi!',
    link: '/products'
  }
];

const TopBar = () => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [settings, setSettings] = useState({});

  useEffect(() => {
    api.get('/settings')
      .then(res => setSettings(res.data || {}))
      .catch(err => console.error('Failed to load settings in TopBar:', err));
  }, []);

  // Auto-cycle announcements every 4.5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIdx(prev => (prev + 1) % PROMOTIONS.length);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  const promo = PROMOTIONS[currentIdx];
  const IconComponent = promo.icon;

  const nextPromo = () => setCurrentIdx(prev => (prev + 1) % PROMOTIONS.length);
  const prevPromo = () => setCurrentIdx(prev => (prev - 1 + PROMOTIONS.length) % PROMOTIONS.length);

  return (
    <div className="bg-[#f8f5ee] dark:bg-[#0c0c0c] border-b border-[#e7e0d3] dark:border-[#222] text-[#2c2621] dark:text-[#d1d5db] text-xs transition-colors duration-200">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="flex items-center justify-between h-9 gap-3">
          
          {/* Left / Center: Rotating Promotional Announcements */}
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <button 
              onClick={prevPromo} 
              aria-label="Previous Offer" 
              className="text-lightTextSecondary hover:text-darkBlue dark:hover:text-cyan transition-colors hidden sm:block"
            >
              <ChevronLeft size={14} />
            </button>

            <div className="flex items-center gap-2 truncate">
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded font-black text-[10px] uppercase tracking-wider bg-darkBlue/10 dark:bg-cyan/15 text-darkBlue dark:text-cyan flex-shrink-0">
                <IconComponent size={12} />
                <span>{promo.badge}</span>
              </span>

              <Link 
                to={promo.link} 
                className="font-medium text-xs hover:text-darkBlue dark:hover:text-cyan transition-colors truncate"
              >
                {promo.text}
              </Link>
            </div>

            <button 
              onClick={nextPromo} 
              aria-label="Next Offer" 
              className="text-lightTextSecondary hover:text-darkBlue dark:hover:text-cyan transition-colors hidden sm:block"
            >
              <ChevronRight size={14} />
            </button>
          </div>

          {/* Right Side: Quick Links + Social Media Icons */}
          <div className="flex items-center gap-4 flex-shrink-0">
            {/* Quick Links */}
            <div className="hidden md:flex items-center gap-3 text-lightTextSecondary dark:text-darkTextSecondary font-medium">
              <Link to="/about" className="hover:text-darkBlue dark:hover:text-cyan transition-colors">
                About Us
              </Link>
              <span>•</span>
              <Link to="/contact" className="hover:text-darkBlue dark:hover:text-cyan transition-colors">
                Contact Us
              </Link>
              <span>•</span>
              <a 
                href={`tel:${settings.owner_aqib || '03357727555'}`} 
                className="hover:text-darkBlue dark:hover:text-cyan transition-colors flex items-center gap-1"
              >
                <Phone size={11} /> 0335-7727555
              </a>
            </div>

            {/* Social Icons Strip (Matching Screenshot) */}
            <div className="flex items-center gap-2 border-l border-lightBorder/80 dark:border-[#333] pl-3">
              <a
                href={settings.facebook_url || 'https://www.facebook.com/share/14uooa52BdR/'}
                target="_blank"
                rel="noopener noreferrer"
                className="w-6 h-6 rounded-full flex items-center justify-center text-lightTextSecondary dark:text-darkTextSecondary hover:text-[#1877F2] hover:bg-[#1877F2]/10 transition-all"
                title="Follow AJMart on Facebook"
                aria-label="Facebook"
              >
                <FacebookIcon size={14} />
              </a>

              <a
                href={settings.instagram_url || 'https://www.instagram.com/aj_traders006'}
                target="_blank"
                rel="noopener noreferrer"
                className="w-6 h-6 rounded-full flex items-center justify-center text-lightTextSecondary dark:text-darkTextSecondary hover:text-[#E4405F] hover:bg-[#E4405F]/10 transition-all"
                title="Follow AJMart on Instagram"
                aria-label="Instagram"
              >
                <InstagramIcon size={14} />
              </a>

              <a
                href={settings.tiktok_url || 'https://www.tiktok.com/@aj.traders07'}
                target="_blank"
                rel="noopener noreferrer"
                className="w-6 h-6 rounded-full flex items-center justify-center text-lightTextSecondary dark:text-darkTextSecondary hover:text-black dark:hover:text-white transition-all"
                title="Watch AJMart on TikTok"
                aria-label="TikTok"
              >
                <TikTokIcon size={14} />
              </a>

              <a
                href={settings.whatsapp_channel_url || 'https://whatsapp.com/channel/0029Vb9yavmE50UlfeAKWo39'}
                target="_blank"
                rel="noopener noreferrer"
                className="h-6 px-2 rounded-full flex items-center gap-1 font-bold text-[11px] text-[#25D366] hover:bg-[#25D366]/10 transition-all"
                title="Join AJMart WhatsApp Channel"
                aria-label="WhatsApp Channel"
              >
                <WhatsAppIcon size={13} />
                <span className="hidden sm:inline">Channel</span>
              </a>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
};

export default TopBar;
