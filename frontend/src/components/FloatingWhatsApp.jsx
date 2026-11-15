import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { WhatsAppIcon } from './SocialIcons';
import api from '../api/axios';

const FloatingWhatsApp = () => {
  const [whatsappNumber, setWhatsappNumber] = useState('923357727555');
  const location = useLocation();

  useEffect(() => {
    api.get('/settings')
      .then(res => {
        if (res.data && res.data.whatsapp_number) {
          setWhatsappNumber(res.data.whatsapp_number);
        }
      })
      .catch(err => console.error('Failed to load whatsapp number:', err));
  }, []);

  // Hide on checkout page to avoid blocking Place Order button
  if (location.pathname === '/checkout') return null;

  const url = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent('Hello AJTraders, I want to order')}`;

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Order on WhatsApp"
      className="fixed bottom-6 right-6 z-40 w-14 h-14 md:w-16 md:h-16 rounded-full bg-[#25D366] hover:bg-[#20ba5a] text-white flex items-center justify-center shadow-2xl hover:scale-110 active:scale-95 transition-all duration-300 group"
      title="Chat with us on WhatsApp"
    >
      <WhatsAppIcon size={32} />
      
      {/* Tooltip on Hover */}
      <span className="absolute right-full mr-3 bg-black/80 text-white text-xs font-semibold px-3 py-1.5 rounded-lg shadow-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none hidden sm:block">
        Order on WhatsApp
      </span>
    </a>
  );
};

export default FloatingWhatsApp;
