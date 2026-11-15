import React, { useEffect, useState } from 'react';
import api from '../../api/axios';
import { Loader2, Plus, Edit2, Trash2, ArrowUp, ArrowDown, Eye, EyeOff, Film, Image as ImageIcon } from 'lucide-react';
import toast from 'react-hot-toast';

const emptySlide = {
  media_type: 'image',
  media_url: '',
  title: '',
  subtitle: '',
  button_text: 'Shop Now',
  button_link: '/products',
  sort_order: 0,
  is_active: 1
};

const HeroSlides = () => {
  const [slides, setSlides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(emptySlide);

  const fetchSlides = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/hero-slides');
      setSlides(res.data || []);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load slides');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSlides();
  }, []);

  const openModal = (slide = null) => {
    if (slide) {
      setCurrentSlide({ ...slide });
    } else {
      setCurrentSlide({
        ...emptySlide,
        sort_order: slides.length + 1
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (currentSlide.id) {
        await api.put(`/hero-slides/${currentSlide.id}`, currentSlide);
        toast.success('Slide updated');
      } else {
        await api.post('/hero-slides', currentSlide);
        toast.success('Slide created');
      }
      setIsModalOpen(false);
      fetchSlides();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to save slide');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this slide?')) return;
    try {
      await api.delete(`/hero-slides/${id}`);
      toast.success('Slide deleted');
      fetchSlides();
    } catch (err) {
      toast.error('Failed to delete slide');
    }
  };

  const toggleActive = async (slide) => {
    try {
      const newStatus = slide.is_active ? 0 : 1;
      await api.put(`/hero-slides/${slide.id}`, { is_active: newStatus });
      toast.success(`Slide ${newStatus ? 'activated' : 'deactivated'}`);
      fetchSlides();
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  const moveOrder = async (index, direction) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= slides.length) return;

    const current = slides[index];
    const target = slides[targetIndex];

    try {
      await Promise.all([
        api.put(`/hero-slides/${current.id}`, { sort_order: target.sort_order }),
        api.put(`/hero-slides/${target.id}`, { sort_order: current.sort_order })
      ]);
      fetchSlides();
    } catch (err) {
      toast.error('Failed to update sort order');
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
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-lightText dark:text-darkText">Hero Slider Management</h2>
          <p className="text-xs sm:text-sm text-lightTextSecondary dark:text-darkTextSecondary mt-0.5">
            Configure homepage banners, promo slides, and background videos
          </p>
        </div>
        <button onClick={() => openModal()} className="btn-primary flex items-center gap-2">
          <Plus size={18} /> Add New Slide
        </button>
      </div>

      <div className="bg-lightCard dark:bg-darkCard rounded-2xl border border-lightBorder dark:border-darkBorder shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-lightBg dark:bg-darkBg border-b border-lightBorder dark:border-darkBorder text-xs uppercase tracking-wider font-bold text-darkBlue dark:text-cyan">
                <th className="p-4">Order</th>
                <th className="p-4">Media</th>
                <th className="p-4">Title & Subtitle</th>
                <th className="p-4">Button Action</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-lightBorder dark:divide-darkBorder text-sm">
              {slides.map((slide, index) => (
                <tr key={slide.id} className="hover:bg-lightBg/50 dark:hover:bg-darkBg/50 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-1">
                      <span className="font-bold text-base w-6 text-center">{slide.sort_order}</span>
                      <div className="flex flex-col">
                        <button
                          disabled={index === 0}
                          onClick={() => moveOrder(index, -1)}
                          className="text-lightTextSecondary dark:text-darkTextSecondary hover:text-darkBlue dark:hover:text-cyan disabled:opacity-20"
                          title="Move Up"
                        >
                          <ArrowUp size={14} />
                        </button>
                        <button
                          disabled={index === slides.length - 1}
                          onClick={() => moveOrder(index, 1)}
                          className="text-lightTextSecondary dark:text-darkTextSecondary hover:text-darkBlue dark:hover:text-cyan disabled:opacity-20"
                          title="Move Down"
                        >
                          <ArrowDown size={14} />
                        </button>
                      </div>
                    </div>
                  </td>

                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <div className="w-14 h-9 rounded bg-black/20 overflow-hidden flex items-center justify-center flex-shrink-0">
                        {slide.media_type === 'video' ? (
                          <Film size={20} className="text-darkBlue dark:text-cyan" />
                        ) : (
                          <img
                            src={slide.media_url}
                            alt=""
                            className="w-full h-full object-cover"
                            onError={(e) => { e.target.style.display = 'none'; }}
                          />
                        )}
                      </div>
                      <div className="text-xs">
                        <span className="font-bold uppercase tracking-wider text-[10px] px-1.5 py-0.5 rounded bg-darkBlue/10 dark:bg-cyan/15 text-darkBlue dark:text-cyan">
                          {slide.media_type}
                        </span>
                        <div className="text-lightTextSecondary dark:text-darkTextSecondary truncate max-w-[120px] mt-0.5" title={slide.media_url}>
                          {slide.media_url || 'plain bg'}
                        </div>
                      </div>
                    </div>
                  </td>

                  <td className="p-4 max-w-xs">
                    <div className="font-bold text-lightText dark:text-darkText">{slide.title || 'Untitled'}</div>
                    <div className="text-xs text-lightTextSecondary dark:text-darkTextSecondary line-clamp-1">{slide.subtitle}</div>
                  </td>

                  <td className="p-4">
                    <div className="text-xs font-semibold">{slide.button_text}</div>
                    <div className="text-[11px] text-lightTextSecondary dark:text-darkTextSecondary">{slide.button_link}</div>
                  </td>

                  <td className="p-4">
                    <button
                      onClick={() => toggleActive(slide)}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold transition-colors ${
                        slide.is_active
                          ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                          : 'bg-red-500/15 text-red-600 dark:text-red-400 border border-red-500/30'
                      }`}
                    >
                      {slide.is_active ? <Eye size={12} /> : <EyeOff size={12} />}
                      {slide.is_active ? 'Active' : 'Hidden'}
                    </button>
                  </td>

                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openModal(slide)}
                        className="p-1.5 rounded hover:bg-lightBorder dark:hover:bg-darkBorder text-lightTextSecondary dark:text-darkTextSecondary hover:text-darkBlue dark:hover:text-cyan"
                        title="Edit Slide"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(slide.id)}
                        className="p-1.5 rounded hover:bg-lightBorder dark:hover:bg-darkBorder text-lightTextSecondary dark:text-darkTextSecondary hover:text-red-500"
                        title="Delete Slide"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-lightCard dark:bg-darkCard border border-lightBorder dark:border-darkBorder rounded-2xl p-6 w-full max-w-lg shadow-2xl">
            <h3 className="text-xl font-bold mb-4 text-lightText dark:text-darkText">
              {currentSlide.id ? 'Edit Hero Slide' : 'Add New Hero Slide'}
            </h3>

            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-lightTextSecondary dark:text-darkTextSecondary mb-1">
                    Media Type
                  </label>
                  <select
                    value={currentSlide.media_type}
                    onChange={(e) => setCurrentSlide({ ...currentSlide, media_type: e.target.value })}
                    className="input-field text-sm"
                  >
                    <option value="image">Image</option>
                    <option value="video">Video</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-lightTextSecondary dark:text-darkTextSecondary mb-1">
                    Sort Order
                  </label>
                  <input
                    type="number"
                    value={currentSlide.sort_order}
                    onChange={(e) => setCurrentSlide({ ...currentSlide, sort_order: parseInt(e.target.value) || 0 })}
                    className="input-field text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-lightTextSecondary dark:text-darkTextSecondary mb-1">
                  Media URL (or path in /images/hero/ or /videos/hero/)
                </label>
                <input
                  type="text"
                  placeholder="/images/hero/placeholder-1.jpg or https://..."
                  value={currentSlide.media_url}
                  onChange={(e) => setCurrentSlide({ ...currentSlide, media_url: e.target.value })}
                  className="input-field text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-lightTextSecondary dark:text-darkTextSecondary mb-1">
                  Title
                </label>
                <input
                  type="text"
                  placeholder="e.g. Welcome to AJMart"
                  value={currentSlide.title}
                  onChange={(e) => setCurrentSlide({ ...currentSlide, title: e.target.value })}
                  className="input-field text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-lightTextSecondary dark:text-darkTextSecondary mb-1">
                  Subtitle
                </label>
                <input
                  type="text"
                  placeholder="e.g. Quality groceries delivered next day"
                  value={currentSlide.subtitle}
                  onChange={(e) => setCurrentSlide({ ...currentSlide, subtitle: e.target.value })}
                  className="input-field text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-lightTextSecondary dark:text-darkTextSecondary mb-1">
                    Button Text
                  </label>
                  <input
                    type="text"
                    placeholder="Shop Now"
                    value={currentSlide.button_text}
                    onChange={(e) => setCurrentSlide({ ...currentSlide, button_text: e.target.value })}
                    className="input-field text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-lightTextSecondary dark:text-darkTextSecondary mb-1">
                    Button Link
                  </label>
                  <input
                    type="text"
                    placeholder="/products"
                    value={currentSlide.button_link}
                    onChange={(e) => setCurrentSlide({ ...currentSlide, button_link: e.target.value })}
                    className="input-field text-sm"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="slide_active"
                  checked={Boolean(currentSlide.is_active)}
                  onChange={(e) => setCurrentSlide({ ...currentSlide, is_active: e.target.checked ? 1 : 0 })}
                  className="w-4 h-4 rounded text-darkBlue dark:text-cyan border-lightBorder dark:border-darkBorder cursor-pointer"
                />
                <label htmlFor="slide_active" className="text-sm font-semibold cursor-pointer select-none">
                  Active (visible on website)
                </label>
              </div>

              <div className="flex justify-end gap-3 mt-6 pt-2 border-t border-lightBorder dark:border-darkBorder">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 hover:bg-lightBorder dark:hover:bg-darkBorder rounded-lg font-medium text-sm transition-colors"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary text-sm px-5 py-2">
                  Save Slide
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default HeroSlides;
