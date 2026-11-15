import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import { Phone, Mail, MapPin, Clock, Send, Sparkles, ExternalLink, ShieldCheck, Share2 } from 'lucide-react';
import { WhatsAppIcon, TikTokIcon, FacebookIcon, InstagramIcon } from '../components/SocialIcons';
import toast from 'react-hot-toast';

const Contact = () => {
  const [settings, setSettings] = useState({
    store_name: 'AJTraders',
    phone: '0335-7727555 / 0312-5637557',
    whatsapp_number: '923357727555',
    email: 'info@ajtraders.pk',
    address: 'Shop # V-488, Namak Mandi Chowk, Raja Bazar, Rawalpindi',
    working_hours: 'Mon - Sat: 9:00 AM - 10:00 PM, Sunday: Closed',
    owner_aqib: '0335-7727555',
    owner_junaid: '0312-5637557',
    google_maps_url: 'https://maps.google.com/maps?rlz=1C1JJTC_en-GBPK1128PK1128&sca_esv=bce34edbebca93c5&udm&fvr=1&pvq=Cg0vZy8xMXprcG0zMWZ0IhAKCmFqIHRyYWRlcnMQAhgDiQFZ6uReYoCV_w&lqi=ChNhaiB0cmFkZXJzIGxvY2F0aW9uSLmLxtnGvoCACFoUEAAQARgAGAEiCmFqIHRyYWRlcnOSAQ1ncm9jZXJ5X3N0b3Jl&vet=10CAAQoqAOahcKEwiwxv-MzImYAxUAAAAAHQAAAAAQBQ..i&cs=1&um=1&ie=UTF-8&fb=1&gl=pk&sa=X&ftid=0x38df95003331a049:0xff9580625ee4ea59'
  });

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    message: ''
  });

  useEffect(() => {
    api.get('/settings')
      .then(res => {
        if (res.data) {
          setSettings(prev => ({ ...prev, ...res.data }));
        }
      })
      .catch(err => console.error('Failed to load settings in Contact:', err));
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.message.trim()) {
      toast.error('Please enter your name and message');
      return;
    }

    const text = `Hello ${settings.store_name || 'AJTraders'}, my name is ${formData.name}${formData.phone ? ` (${formData.phone})` : ''}.\n\nMessage: ${formData.message}`;
    const url = `https://wa.me/${settings.whatsapp_number}?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
    toast.success('Opening WhatsApp with your message!');
  };

  const directWhatsAppUrl = `https://wa.me/${settings.whatsapp_number}?text=${encodeURIComponent(`Hello ${settings.store_name || 'AJTraders'}, I want to place a grocery order.`)}`;

  return (
    <div className="space-y-12 max-w-6xl mx-auto">
      {/* Header */}
      <div className="bg-lightCard dark:bg-darkCard p-6 md:p-10 rounded-3xl border border-lightBorder dark:border-darkBorder shadow-sm text-center">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-darkBlue/10 dark:bg-cyan/15 text-darkBlue dark:text-cyan text-xs font-bold uppercase tracking-wider mb-2">
          <Sparkles size={13} /> We'd Love to Hear From You
        </div>
        <h1 className="text-3xl md:text-5xl font-black text-lightText dark:text-darkText tracking-tight">
          Contact & Store Visit
        </h1>
        <p className="text-sm md:text-base text-lightTextSecondary dark:text-darkTextSecondary mt-2 max-w-2xl mx-auto">
          Visit our wholesale store in Namak Mandi, Raja Bazar or order online for fast doorstep delivery across Rawalpindi & Islamabad.
        </p>
      </div>

      {/* Official Visiting Card Showcase */}
      <div className="bg-gradient-to-br from-darkBlue/5 via-cyan/5 to-darkBlue/10 dark:from-darkBlue/25 dark:via-cyan/15 dark:to-darkBlue/30 p-6 md:p-10 rounded-3xl border border-darkBlue/20 dark:border-cyan/30 shadow-lg">
        <div className="flex flex-col lg:flex-row items-center gap-8 md:gap-10">
          {/* Card Graphic with 3D Hover Effect */}
          <div className="w-full lg:w-1/2 flex justify-center">
            <div className="relative group rounded-2xl overflow-hidden shadow-2xl border-4 border-white dark:border-zinc-700 bg-white dark:bg-zinc-900 transition-all duration-300 hover:scale-[1.03] hover:shadow-cyan/30">
              <img
                src="/images/brand/ajtraders-visiting-card.jpg"
                alt="AJ Traders Official Shop Card"
                className="w-full max-w-md md:max-w-lg object-contain"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                <span className="text-white text-xs font-bold tracking-wide">
                  Official Wholesale Visiting Card • Shop # V-488, Namak Mandi, Rawalpindi
                </span>
              </div>
            </div>
          </div>

          {/* Direct Contact Actions for Aqib & Junaid */}
          <div className="w-full lg:w-1/2 space-y-4">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-black uppercase tracking-wider">
              <ShieldCheck size={14} /> Official Shop Business Card
            </div>
            <h3 className="text-2xl md:text-3xl font-black text-lightText dark:text-darkText">
              Direct Contact & Wholesale Desk
            </h3>
            <p className="text-sm text-lightTextSecondary dark:text-darkTextSecondary leading-relaxed">
              Serving retailers, restaurants, and households straight from the Raja Bazar wholesale hub. For bulk orders, custom sacks, or wholesale price quotes, connect directly with our store management:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              {/* Aqib Card */}
              <div className="p-4 rounded-2xl bg-white dark:bg-darkCard border border-lightBorder dark:border-darkBorder shadow-sm flex flex-col justify-between">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-lightTextSecondary dark:text-darkTextSecondary block">
                    Wholesale & Inquiries
                  </span>
                  <span className="text-lg font-black text-lightText dark:text-darkText block mt-0.5">
                    Aqib
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-3">
                  <a
                    href="tel:03357727555"
                    className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-darkBlue dark:bg-cyan text-white dark:text-black text-xs font-bold hover:opacity-90 transition-opacity"
                  >
                    <Phone size={13} /> Call
                  </a>
                  <a
                    href="https://wa.me/923357727555"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-[#25D366] text-white text-xs font-bold hover:bg-[#20ba5a] transition-colors"
                  >
                    <WhatsAppIcon size={14} /> WhatsApp
                  </a>
                </div>
              </div>

              {/* Junaid Card */}
              <div className="p-4 rounded-2xl bg-white dark:bg-darkCard border border-lightBorder dark:border-darkBorder shadow-sm flex flex-col justify-between">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-lightTextSecondary dark:text-darkTextSecondary block">
                    Sales & Deliveries
                  </span>
                  <span className="text-lg font-black text-lightText dark:text-darkText block mt-0.5">
                    Junaid
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-3">
                  <a
                    href="tel:03125637557"
                    className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-darkBlue dark:bg-cyan text-white dark:text-black text-xs font-bold hover:opacity-90 transition-opacity"
                  >
                    <Phone size={13} /> Call
                  </a>
                  <a
                    href="https://wa.me/923125637557"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-[#25D366] text-white text-xs font-bold hover:bg-[#20ba5a] transition-colors"
                  >
                    <WhatsAppIcon size={14} /> WhatsApp
                  </a>
                </div>
              </div>
            </div>

            <div className="pt-2 text-xs font-medium text-lightTextSecondary dark:text-darkTextSecondary bg-white/60 dark:bg-black/30 p-3 rounded-xl border border-lightBorder/50 dark:border-darkBorder/50">
              <span className="font-bold text-darkBlue dark:text-cyan">اردو نوٹ: </span>
              "چاول، دالیں، بیسن، مصالحے نیز گھر کے راشن کی تمام اشیاء ہول سیل ریٹ پر دستیاب ہیں"
            </div>
          </div>
        </div>
      </div>

      {/* Google Maps Embed Section - Right After Visiting Card */}
      <div className="bg-lightCard dark:bg-darkCard p-6 md:p-8 rounded-3xl border border-lightBorder dark:border-darkBorder shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-darkBlue/10 dark:bg-cyan/15 text-darkBlue dark:text-cyan flex items-center justify-center">
              <MapPin size={20} />
            </div>
            <div>
              <h3 className="font-bold text-lg text-lightText dark:text-darkText">Shop Location on Google Maps</h3>
              <p className="text-xs text-lightTextSecondary dark:text-darkTextSecondary mt-0.5">
                {settings.address}
              </p>
            </div>
          </div>
          {settings.google_maps_url && (
            <a
              href={settings.google_maps_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-darkBlue dark:bg-cyan text-white dark:text-black text-xs font-bold hover:scale-105 transition-transform shadow-sm flex-shrink-0 self-start sm:self-auto"
            >
              <ExternalLink size={14} /> Open in Google Maps
            </a>
          )}
        </div>

        <div className="w-full h-80 md:h-[420px] rounded-2xl overflow-hidden border border-lightBorder dark:border-darkBorder bg-gray-100 dark:bg-[#111] relative flex items-center justify-center shadow-inner">
          <iframe
            title="AJTraders Location - Namak Mandi Rawalpindi"
            src="https://maps.google.com/maps?q=AJ+Traders+Namak+Mandi+Chowk+Raja+Bazar+Rawalpindi&t=&z=16&ie=UTF8&iwloc=&output=embed"
            className="w-full h-full border-0 filter dark:contrast-125 dark:brightness-90"
            loading="lazy"
          ></iframe>
        </div>
      </div>

      {/* Direct WhatsApp Action & Contact Details & Inquiry Form */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
        {/* Left: Store Details */}
        <div className="space-y-6 flex flex-col justify-between">
          {/* Quick WhatsApp Action Card */}
          <div className="bg-gradient-to-br from-[#25D366]/15 via-emerald-500/10 to-transparent p-6 md:p-8 rounded-3xl border border-[#25D366]/30 shadow-sm">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-14 h-14 rounded-2xl bg-[#25D366] text-white flex items-center justify-center shadow-lg">
                <WhatsAppIcon size={32} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-lightText dark:text-darkText">Order Directly on WhatsApp</h3>
                <p className="text-xs text-lightTextSecondary dark:text-darkTextSecondary">Instant replies during operating hours</p>
              </div>
            </div>
            <p className="text-sm text-lightTextSecondary dark:text-darkTextSecondary mb-6 leading-relaxed">
              Send your grocery list or voice note on WhatsApp. Our team will verify stock immediately, confirm wholesale prices, and schedule dispatch!
            </p>
            <a
              href={directWhatsAppUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 w-full py-3.5 px-6 rounded-xl bg-[#25D366] hover:bg-[#20ba5a] text-white font-bold text-base shadow-lg transition-transform hover:scale-[1.02] active:scale-[0.98]"
            >
              <WhatsAppIcon size={20} /> Chat on WhatsApp ({settings.phone || settings.whatsapp_number})
            </a>
          </div>

          {/* Store Details Card */}
          <div className="bg-lightCard dark:bg-darkCard p-6 md:p-8 rounded-3xl border border-lightBorder dark:border-darkBorder shadow-sm space-y-6 flex-1 flex flex-col justify-between">
            <h3 className="text-xl font-bold text-lightText dark:text-darkText border-l-4 border-darkBlue dark:border-cyan pl-3">
              Store Information
            </h3>

            <div className="space-y-4">
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-darkBlue/10 dark:bg-cyan/15 text-darkBlue dark:text-cyan flex items-center justify-center flex-shrink-0 mt-0.5">
                  <MapPin size={20} />
                </div>
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-lightTextSecondary dark:text-darkTextSecondary">Physical Store Address</h4>
                  <p className="text-sm font-semibold text-lightText dark:text-darkText mt-0.5">{settings.address}</p>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-darkBlue/10 dark:bg-cyan/15 text-darkBlue dark:text-cyan flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Phone size={20} />
                </div>
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-lightTextSecondary dark:text-darkTextSecondary">Phone Helpline</h4>
                  <p className="text-sm font-semibold text-lightText dark:text-darkText mt-0.5">
                    Aqib: <a href="tel:03357727555" className="hover:underline text-darkBlue dark:text-cyan font-bold">0335-7727555</a> | Junaid: <a href="tel:03125637557" className="hover:underline text-darkBlue dark:text-cyan font-bold">0312-5637557</a>
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-darkBlue/10 dark:bg-cyan/15 text-darkBlue dark:text-cyan flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Mail size={20} />
                </div>
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-lightTextSecondary dark:text-darkTextSecondary">Email Support</h4>
                  <a href={`mailto:${settings.email}`} className="text-sm font-semibold text-lightText dark:text-darkText hover:text-darkBlue dark:hover:text-cyan mt-0.5 block">
                    {settings.email}
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-darkBlue/10 dark:bg-cyan/15 text-darkBlue dark:text-cyan flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Clock size={20} />
                </div>
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-lightTextSecondary dark:text-darkTextSecondary">Opening Hours</h4>
                  <p className="text-sm font-semibold text-lightText dark:text-darkText mt-0.5">{settings.working_hours}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Contact Form */}
        <div className="bg-lightCard dark:bg-darkCard p-6 md:p-8 rounded-3xl border border-lightBorder dark:border-darkBorder shadow-sm flex flex-col justify-between h-full">
          <div>
            <h3 className="text-2xl font-bold text-lightText dark:text-darkText">Send Us an Inquiry</h3>
            <p className="text-xs md:text-sm text-lightTextSecondary dark:text-darkTextSecondary mt-1">
              Fill in your details below. It will prepare and open a WhatsApp message directly to our order desk.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3.5 flex-1 flex flex-col justify-between mt-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-lightTextSecondary dark:text-darkTextSecondary mb-1.5">
                Your Full Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Muhammad Ali"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="input-field text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-lightTextSecondary dark:text-darkTextSecondary mb-1.5">
                Phone Number (Optional)
              </label>
              <input
                type="tel"
                placeholder="0300-1234567"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="input-field text-sm"
              />
            </div>

            <div className="flex-1 flex flex-col">
              <label className="block text-xs font-bold uppercase tracking-wider text-lightTextSecondary dark:text-darkTextSecondary mb-1.5">
                Your Inquiry or Grocery List *
              </label>
              <textarea
                required
                rows={3}
                placeholder="Write your wholesale inquiry or list the grocery items you need..."
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                className="input-field text-sm resize-none flex-1 min-h-[85px]"
              ></textarea>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 px-6 rounded-xl bg-[#25D366] hover:bg-[#20ba5a] text-white flex items-center justify-center gap-2 font-bold text-base shadow-md hover:shadow-lg transition-all active:scale-[0.99] mt-2"
            >
              <WhatsAppIcon size={20} /> Submit via WhatsApp
            </button>
          </form>
        </div>
      </div>

      {/* Official Social Media & Community Channels - At the End */}
      <div className="bg-lightCard dark:bg-darkCard p-6 md:p-8 rounded-3xl border border-lightBorder dark:border-darkBorder shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan/10 text-cyan text-xs font-bold uppercase tracking-wider mb-1">
              <Share2 size={13} /> Connect With Us
            </div>
            <h3 className="text-xl md:text-2xl font-black text-lightText dark:text-darkText">
              Official Social & Community Channels
            </h3>
          </div>
          <p className="text-xs text-lightTextSecondary dark:text-darkTextSecondary sm:text-right max-w-xs">
            Follow our channels for fresh arrivals, live market rates, and exclusive wholesale updates!
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* TikTok */}
          <a
            href={settings.tiktok_url || 'https://www.tiktok.com/@aj.traders07'}
            target="_blank"
            rel="noopener noreferrer"
            className="group p-5 rounded-2xl bg-white dark:bg-[#181818] border border-lightBorder dark:border-darkBorder hover:border-black dark:hover:border-white shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-black text-white flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <TikTokIcon size={24} />
              </div>
              <h4 className="font-bold text-base text-lightText dark:text-darkText group-hover:text-cyan transition-colors">
                TikTok
              </h4>
              <p className="text-xs text-lightTextSecondary dark:text-darkTextSecondary mt-1">
                @aj.traders07 • Daily videos & shop stock walkthroughs
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-lightBorder/60 dark:border-darkBorder/60 flex items-center justify-between text-xs font-bold text-darkBlue dark:text-cyan">
              <span>Watch on TikTok</span>
              <ExternalLink size={13} />
            </div>
          </a>

          {/* Facebook */}
          <a
            href={settings.facebook_url || 'https://www.facebook.com/share/14uooa52BdR/'}
            target="_blank"
            rel="noopener noreferrer"
            className="group p-5 rounded-2xl bg-white dark:bg-[#181818] border border-lightBorder dark:border-darkBorder hover:border-[#1877F2] shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-[#1877F2] text-white flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <FacebookIcon size={24} />
              </div>
              <h4 className="font-bold text-base text-lightText dark:text-darkText group-hover:text-[#1877F2] transition-colors">
                Facebook
              </h4>
              <p className="text-xs text-lightTextSecondary dark:text-darkTextSecondary mt-1">
                AJ Traders • Official page, community updates & deals
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-lightBorder/60 dark:border-darkBorder/60 flex items-center justify-between text-xs font-bold text-[#1877F2]">
              <span>Follow on Facebook</span>
              <ExternalLink size={13} />
            </div>
          </a>

          {/* Instagram */}
          <a
            href={settings.instagram_url || 'https://www.instagram.com/aj_traders006'}
            target="_blank"
            rel="noopener noreferrer"
            className="group p-5 rounded-2xl bg-white dark:bg-[#181818] border border-lightBorder dark:border-darkBorder hover:border-[#E4405F] shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] text-white flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <InstagramIcon size={24} />
              </div>
              <h4 className="font-bold text-base text-lightText dark:text-darkText group-hover:text-[#E4405F] transition-colors">
                Instagram
              </h4>
              <p className="text-xs text-lightTextSecondary dark:text-darkTextSecondary mt-1">
                @aj_traders006 • Product photos, stories & highlights
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-lightBorder/60 dark:border-darkBorder/60 flex items-center justify-between text-xs font-bold text-[#E4405F]">
              <span>Follow on Instagram</span>
              <ExternalLink size={13} />
            </div>
          </a>

          {/* WhatsApp Channel */}
          <a
            href={settings.whatsapp_channel_url || 'https://whatsapp.com/channel/0029Vb9yavmE50UlfeAKWo39'}
            target="_blank"
            rel="noopener noreferrer"
            className="group p-5 rounded-2xl bg-white dark:bg-[#181818] border border-lightBorder dark:border-darkBorder hover:border-[#25D366] shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-[#25D366] text-white flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <WhatsAppIcon size={24} />
              </div>
              <h4 className="font-bold text-base text-lightText dark:text-darkText group-hover:text-[#25D366] transition-colors">
                WhatsApp Channel
              </h4>
              <p className="text-xs text-lightTextSecondary dark:text-darkTextSecondary mt-1">
                AJ Traders Broadcast • Live wholesale rates & bulk alerts
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-lightBorder/60 dark:border-darkBorder/60 flex items-center justify-between text-xs font-bold text-[#25D366]">
              <span>Join Official Channel</span>
              <ExternalLink size={13} />
            </div>
          </a>
        </div>
      </div>
    </div>
  );
};

export default Contact;
