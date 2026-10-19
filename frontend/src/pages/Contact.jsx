import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import { MessageCircle, Phone, Mail, MapPin, Clock, Send, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';

const Contact = () => {
  const [settings, setSettings] = useState({
    store_name: 'AJTraders',
    phone: '+92 300 1234567',
    whatsapp_number: '923001234567',
    email: 'info@ajtraders.pk',
    address: 'Shop # 12, Main Market, Karachi, Pakistan',
    working_hours: 'Mon - Sat: 9:00 AM - 10:00 PM, Sunday: Closed'
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

  const directWhatsAppUrl = `https://wa.me/${settings.whatsapp_number}?text=${encodeURIComponent(`Hello ${settings.store_name || 'AJTraders'}, I want to place an order.`)}`;

  return (
    <div className="space-y-10 max-w-6xl mx-auto">
      {/* Header */}
      <div className="bg-lightCard dark:bg-darkCard p-6 md:p-8 rounded-3xl border border-lightBorder dark:border-darkBorder shadow-sm text-center">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-darkBlue/10 dark:bg-cyan/15 text-darkBlue dark:text-cyan text-xs font-bold uppercase tracking-wider mb-2">
          <Sparkles size={13} /> We'd Love to Hear From You
        </div>
        <h1 className="text-3xl md:text-5xl font-black text-lightText dark:text-darkText tracking-tight">
          Contact & Customer Support
        </h1>
        <p className="text-sm md:text-base text-lightTextSecondary dark:text-darkTextSecondary mt-2 max-w-xl mx-auto">
          Have a question about an order, wholesale inquiry, or special delivery? Reach out to us via WhatsApp, phone, or the contact form below.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* Left: Contact Info & Direct WhatsApp CTA */}
        <div className="space-y-6">
          {/* Quick WhatsApp Action Card */}
          <div className="bg-gradient-to-br from-[#25D366]/15 via-emerald-500/10 to-transparent p-6 md:p-8 rounded-3xl border border-[#25D366]/30 shadow-sm">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-14 h-14 rounded-2xl bg-[#25D366] text-white flex items-center justify-center shadow-lg">
                <MessageCircle size={32} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-lightText dark:text-darkText">Order Directly on WhatsApp</h3>
                <p className="text-xs text-lightTextSecondary dark:text-darkTextSecondary">Instant replies during operating hours</p>
              </div>
            </div>
            <p className="text-sm text-lightTextSecondary dark:text-darkTextSecondary mb-6 leading-relaxed">
              Send your grocery list or voice note on WhatsApp. Our team will immediately verify stock, confirm total price, and arrange delivery!
            </p>
            <a
              href={directWhatsAppUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 w-full py-3.5 px-6 rounded-xl bg-[#25D366] hover:bg-[#20ba5a] text-white font-bold text-base shadow-lg transition-transform hover:scale-[1.02] active:scale-[0.98]"
            >
              <MessageCircle size={20} /> Chat on WhatsApp ({settings.phone || settings.whatsapp_number})
            </a>
          </div>

          {/* Store Details Card */}
          <div className="bg-lightCard dark:bg-darkCard p-6 md:p-8 rounded-3xl border border-lightBorder dark:border-darkBorder shadow-sm space-y-6">
            <h3 className="text-xl font-bold text-lightText dark:text-darkText border-l-4 border-darkBlue dark:border-cyan pl-3">
              Store Information
            </h3>

            <div className="space-y-4">
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-darkBlue/10 dark:bg-cyan/15 text-darkBlue dark:text-cyan flex items-center justify-center flex-shrink-0 mt-0.5">
                  <MapPin size={20} />
                </div>
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-lightTextSecondary dark:text-darkTextSecondary">Location & Fulfillment Center</h4>
                  <p className="text-sm font-semibold text-lightText dark:text-darkText mt-0.5">{settings.address}</p>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-darkBlue/10 dark:bg-cyan/15 text-darkBlue dark:text-cyan flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Phone size={20} />
                </div>
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-lightTextSecondary dark:text-darkTextSecondary">Phone Helpline</h4>
                  <a href={`tel:${settings.phone}`} className="text-sm font-semibold text-lightText dark:text-darkText hover:text-darkBlue dark:hover:text-cyan mt-0.5 block">
                    {settings.phone}
                  </a>
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
        <div className="bg-lightCard dark:bg-darkCard p-6 md:p-8 rounded-3xl border border-lightBorder dark:border-darkBorder shadow-sm space-y-6">
          <div>
            <h3 className="text-2xl font-bold text-lightText dark:text-darkText">Send Us a Message</h3>
            <p className="text-xs md:text-sm text-lightTextSecondary dark:text-darkTextSecondary mt-1">
              Fill in your details below and submit. It will immediately generate and send a WhatsApp message to our desk.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
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

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-lightTextSecondary dark:text-darkTextSecondary mb-1.5">
                Your Message / Product List *
              </label>
              <textarea
                required
                rows={5}
                placeholder="Write your inquiry or list the grocery items you want to order..."
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                className="input-field text-sm resize-none"
              ></textarea>
            </div>

            <button
              type="submit"
              className="w-full btn-primary py-3.5 flex items-center justify-center gap-2 font-bold shadow-md hover:shadow-lg transition-all"
            >
              <Send size={18} /> Submit via WhatsApp
            </button>
          </form>
        </div>
      </div>

      {/* Google Maps Embed Placeholder */}
      <div className="bg-lightCard dark:bg-darkCard p-6 rounded-3xl border border-lightBorder dark:border-darkBorder shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="text-darkBlue dark:text-cyan" size={20} />
            <h3 className="font-bold text-base md:text-lg text-lightText dark:text-darkText">Store Location Map</h3>
          </div>
          <span className="text-xs text-lightTextSecondary dark:text-darkTextSecondary">{settings.address}</span>
        </div>

        <div className="w-full h-64 md:h-80 rounded-2xl overflow-hidden border border-lightBorder dark:border-darkBorder bg-gray-100 dark:bg-[#111] relative flex items-center justify-center">
          <iframe
            title="AJTraders Location"
            src="https://maps.google.com/maps?q=Karachi%20Pakistan&t=&z=13&ie=UTF8&iwloc=&output=embed"
            className="w-full h-full border-0 filter dark:contrast-125 dark:brightness-90"
            loading="lazy"
          ></iframe>
        </div>
      </div>
    </div>
  );
};

export default Contact;
