import React, { useEffect, useState } from 'react';
import api from '../../api/axios';
import { Loader2, Save, Store, Phone, MessageCircle, Mail, MapPin, Clock, Megaphone, BarChart3, Share2 } from 'lucide-react';
import toast from 'react-hot-toast';

const SettingsAdmin = () => {
  const [settings, setSettings] = useState({
    store_name: 'AJMart',
    phone: '0335-7727555 / 0312-5637557',
    whatsapp_number: '923357727555',
    email: 'info@ajmart.pk',
    address: 'Shop # V-488, Namak Mandi Chowk, Raja Bazar, Rawalpindi',
    working_hours: 'Mon - Sat: 9:00 AM - 10:00 PM, Sunday: Closed',
    announcement_bar_text: 'Minimum order of PKR 5,000 required for doorstep delivery across Rawalpindi & Islamabad',
    happy_customers: '1000+',
    products_count: '150+',
    delivery_areas: 'Rawalpindi & Islamabad',
    facebook_url: 'https://www.facebook.com/share/14uooa52BdR/',
    instagram_url: 'https://www.instagram.com/aj_traders006',
    tiktok_url: 'https://www.tiktok.com/@aj.traders07',
    whatsapp_channel_url: 'https://whatsapp.com/channel/0029Vb9yavmE50UlfeAKWo39'
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true);
        const res = await api.get('/settings');
        if (res.data) {
          setSettings(prev => ({ ...prev, ...res.data }));
        }
      } catch (err) {
        console.error('Failed to load settings:', err);
        toast.error('Failed to load settings');
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleChange = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      await api.put('/settings', settings);
      toast.success('Store settings updated successfully!');
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.error || 'Failed to update settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="animate-spin text-darkBlue dark:text-cyan" size={40} />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h2 className="text-2xl font-bold text-lightText dark:text-darkText">Store Settings</h2>
        <p className="text-xs sm:text-sm text-lightTextSecondary dark:text-darkTextSecondary mt-0.5">
          Manage your business contact information, operating hours, announcement bar, and social stats
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-8">
        {/* Business Identity */}
        <div className="bg-lightCard dark:bg-darkCard p-6 rounded-2xl border border-lightBorder dark:border-darkBorder shadow-sm space-y-4">
          <h3 className="text-base font-bold text-lightText dark:text-darkText flex items-center gap-2 border-b border-lightBorder dark:border-darkBorder pb-3">
            <Store size={18} className="text-darkBlue dark:text-cyan" /> Store Identity
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-lightTextSecondary dark:text-darkTextSecondary mb-1.5">
                Store Name
              </label>
              <input
                type="text"
                value={settings.store_name}
                onChange={(e) => handleChange('store_name', e.target.value)}
                className="input-field text-sm"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-lightTextSecondary dark:text-darkTextSecondary mb-1.5">
                Support Email Address
              </label>
              <input
                type="email"
                value={settings.email}
                onChange={(e) => handleChange('email', e.target.value)}
                className="input-field text-sm"
                required
              />
            </div>
          </div>
        </div>

        {/* Contact Numbers & WhatsApp */}
        <div className="bg-lightCard dark:bg-darkCard p-6 rounded-2xl border border-lightBorder dark:border-darkBorder shadow-sm space-y-4">
          <h3 className="text-base font-bold text-lightText dark:text-darkText flex items-center gap-2 border-b border-lightBorder dark:border-darkBorder pb-3">
            <Phone size={18} className="text-darkBlue dark:text-cyan" /> Contact Numbers
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-lightTextSecondary dark:text-darkTextSecondary mb-1.5">
                Phone Display Number
              </label>
              <input
                type="text"
                placeholder="0335-7727555 / 0312-5637557"
                value={settings.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                className="input-field text-sm"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-lightTextSecondary dark:text-darkTextSecondary mb-1.5">
                WhatsApp Order Number (digits only, e.g. 923357727555)
              </label>
              <input
                type="text"
                placeholder="923357727555"
                value={settings.whatsapp_number}
                onChange={(e) => handleChange('whatsapp_number', e.target.value)}
                className="input-field text-sm"
                required
              />
            </div>
          </div>
        </div>

        {/* Social Media & Community Channels */}
        <div className="bg-lightCard dark:bg-darkCard p-6 rounded-2xl border border-lightBorder dark:border-darkBorder shadow-sm space-y-4">
          <h3 className="text-base font-bold text-lightText dark:text-darkText flex items-center gap-2 border-b border-lightBorder dark:border-darkBorder pb-3">
            <Share2 size={18} className="text-darkBlue dark:text-cyan" /> Social Media & Community Channels
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-lightTextSecondary dark:text-darkTextSecondary mb-1.5">
                TikTok Profile URL
              </label>
              <input
                type="url"
                placeholder="https://www.tiktok.com/@aj.traders07"
                value={settings.tiktok_url || ''}
                onChange={(e) => handleChange('tiktok_url', e.target.value)}
                className="input-field text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-lightTextSecondary dark:text-darkTextSecondary mb-1.5">
                Facebook Page URL
              </label>
              <input
                type="url"
                placeholder="https://www.facebook.com/share/14uooa52BdR/"
                value={settings.facebook_url || ''}
                onChange={(e) => handleChange('facebook_url', e.target.value)}
                className="input-field text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-lightTextSecondary dark:text-darkTextSecondary mb-1.5">
                Instagram Profile URL
              </label>
              <input
                type="url"
                placeholder="https://www.instagram.com/aj_traders006"
                value={settings.instagram_url || ''}
                onChange={(e) => handleChange('instagram_url', e.target.value)}
                className="input-field text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-lightTextSecondary dark:text-darkTextSecondary mb-1.5">
                WhatsApp Official Channel URL
              </label>
              <input
                type="url"
                placeholder="https://whatsapp.com/channel/0029Vb9yavmE50UlfeAKWo39"
                value={settings.whatsapp_channel_url || ''}
                onChange={(e) => handleChange('whatsapp_channel_url', e.target.value)}
                className="input-field text-sm"
              />
            </div>
          </div>
        </div>

        {/* Physical Address & Hours */}
        <div className="bg-lightCard dark:bg-darkCard p-6 rounded-2xl border border-lightBorder dark:border-darkBorder shadow-sm space-y-4">
          <h3 className="text-base font-bold text-lightText dark:text-darkText flex items-center gap-2 border-b border-lightBorder dark:border-darkBorder pb-3">
            <MapPin size={18} className="text-darkBlue dark:text-cyan" /> Location & Working Hours
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-lightTextSecondary dark:text-darkTextSecondary mb-1.5">
                Physical Address
              </label>
              <input
                type="text"
                value={settings.address}
                onChange={(e) => handleChange('address', e.target.value)}
                className="input-field text-sm"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-lightTextSecondary dark:text-darkTextSecondary mb-1.5">
                Working Hours
              </label>
              <input
                type="text"
                placeholder="Mon - Sat: 9:00 AM - 10:00 PM, Sunday: Closed"
                value={settings.working_hours}
                onChange={(e) => handleChange('working_hours', e.target.value)}
                className="input-field text-sm"
                required
              />
            </div>
          </div>
        </div>

        {/* Announcement & Stats */}
        <div className="bg-lightCard dark:bg-darkCard p-6 rounded-2xl border border-lightBorder dark:border-darkBorder shadow-sm space-y-4">
          <h3 className="text-base font-bold text-lightText dark:text-darkText flex items-center gap-2 border-b border-lightBorder dark:border-darkBorder pb-3">
            <Megaphone size={18} className="text-darkBlue dark:text-cyan" /> Announcement & Public Stats
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-lightTextSecondary dark:text-darkTextSecondary mb-1.5">
                Announcement Bar Text (Optional)
              </label>
              <input
                type="text"
                placeholder="Minimum order of PKR 5,000 required for doorstep delivery across Rawalpindi & Islamabad"
                value={settings.announcement_bar_text}
                onChange={(e) => handleChange('announcement_bar_text', e.target.value)}
                className="input-field text-sm"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-lightTextSecondary dark:text-darkTextSecondary mb-1.5">
                  Happy Customers Stat
                </label>
                <input
                  type="text"
                  placeholder="1000+"
                  value={settings.happy_customers}
                  onChange={(e) => handleChange('happy_customers', e.target.value)}
                  className="input-field text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-lightTextSecondary dark:text-darkTextSecondary mb-1.5">
                  Products Count Stat
                </label>
                <input
                  type="text"
                  placeholder="150+"
                  value={settings.products_count}
                  onChange={(e) => handleChange('products_count', e.target.value)}
                  className="input-field text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-lightTextSecondary dark:text-darkTextSecondary mb-1.5">
                  Delivery Areas Stat
                </label>
                <input
                  type="text"
                  placeholder="Karachi"
                  value={settings.delivery_areas}
                  onChange={(e) => handleChange('delivery_areas', e.target.value)}
                  className="input-field text-sm"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={saving}
            className="btn-primary flex items-center gap-2 font-bold px-8 py-3 text-base shadow-lg disabled:opacity-50"
          >
            {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
            <span>Save Settings</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default SettingsAdmin;
