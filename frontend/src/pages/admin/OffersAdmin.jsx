import React, { useEffect, useState, useMemo } from 'react';
import api from '../../api/axios';
import { 
  Tag, Plus, Edit2, Trash2, CheckCircle2, XCircle, Clock, 
  Search, AlertTriangle, ArrowRight, Loader2, Sparkles, Percent, Calendar
} from 'lucide-react';
import toast from 'react-hot-toast';

const normalizeImageUrl = (url) => {
  if (!url) return '/images/placeholder-product.jpg';
  if (url.startsWith('http://') || url.startsWith('https://')) {
    try {
      const parsed = new URL(url);
      if (parsed.pathname.startsWith('/images/')) return parsed.pathname;
    } catch (e) {}
  }
  return url;
};

const OffersAdmin = () => {
  const [discounts, setDiscounts] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOffer, setEditingOffer] = useState(null); // null = Add mode, object = Edit mode
  const [productSearch, setProductSearch] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [discountPercent, setDiscountPercent] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Delete Confirmation State
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch Discounts & Products
  const fetchData = async () => {
    try {
      setLoading(true);
      const [discRes, prodRes] = await Promise.all([
        api.get('/admin/discounts'),
        api.get('/products')
      ]);
      setDiscounts(discRes.data || []);
      setProducts(prodRes.data || []);
    } catch (err) {
      console.error('Failed to load offers:', err);
      toast.error('Failed to load discounts.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filtered Discounts List
  const filteredDiscounts = useMemo(() => {
    if (!searchTerm.trim()) return discounts;
    const q = searchTerm.toLowerCase();
    return discounts.filter(d => 
      (d.product_name && d.product_name.toLowerCase().includes(q)) ||
      (d.category_name && d.category_name.toLowerCase().includes(q)) ||
      d.discount_percent.toString().includes(q)
    );
  }, [discounts, searchTerm]);

  // Products available for new offers (filtered by search in modal)
  const availableProducts = useMemo(() => {
    if (!productSearch.trim()) return products.slice(0, 15);
    const q = productSearch.toLowerCase();
    return products.filter(p => p.name.toLowerCase().includes(q) || (p.brand && p.brand.toLowerCase().includes(q))).slice(0, 20);
  }, [products, productSearch]);

  // Check if selected product already has an active discount
  const existingActiveDiscount = useMemo(() => {
    if (!selectedProduct) return null;
    return discounts.find(d => 
      d.product_id === selectedProduct.id && 
      d.is_active === 1 && 
      (!editingOffer || editingOffer.id !== d.id)
    );
  }, [selectedProduct, discounts, editingOffer]);

  // Live calculation for preview
  const originalPrice = selectedProduct ? Number(selectedProduct.price || selectedProduct.original_price) : 0;
  const numDiscountPct = parseFloat(discountPercent) || 0;
  const isPercentValid = !isNaN(numDiscountPct) && isFinite(numDiscountPct) && numDiscountPct > 0 && numDiscountPct < 100;
  const previewDiscountedPrice = isPercentValid ? Math.round(originalPrice * (100 - numDiscountPct) / 100) : originalPrice;
  const previewSavings = isPercentValid ? Math.round(originalPrice * numDiscountPct / 100) : 0;

  // Open Add Modal
  const handleOpenAdd = () => {
    setEditingOffer(null);
    setSelectedProduct(null);
    setProductSearch('');
    setDiscountPercent('10');
    // Default 1 year from now
    const oneYearLater = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16);
    const today = new Date().toISOString().slice(0, 16);
    setStartDate(today);
    setEndDate(oneYearLater);
    setIsActive(true);
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (offer) => {
    setEditingOffer(offer);
    const prod = products.find(p => p.id === offer.product_id) || {
      id: offer.product_id,
      name: offer.product_name,
      price: offer.original_price,
      image_url: offer.image_url
    };
    setSelectedProduct(prod);
    setProductSearch(offer.product_name);
    setDiscountPercent(offer.discount_percent.toString());
    setStartDate(offer.start_date ? new Date(offer.start_date).toISOString().slice(0, 16) : '');
    setEndDate(offer.valid_until ? new Date(offer.valid_until).toISOString().slice(0, 16) : '');
    setIsActive(offer.is_active === 1);
    setIsModalOpen(true);
  };

  // Close Modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingOffer(null);
    setSelectedProduct(null);
  };

  // Save (Create or Update)
  const handleSave = async (e) => {
    e.preventDefault();
    if (!selectedProduct) {
      toast.error('Please select a product.');
      return;
    }

    if (!isPercentValid) {
      toast.error('Discount must be a valid number between 0% and 100%.');
      return;
    }

    if (!editingOffer && existingActiveDiscount) {
      toast.error(`"${selectedProduct.name}" already has an active discount. Edit or deactivate it first.`);
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        product_id: selectedProduct.id,
        discount_percent: numDiscountPct,
        start_date: startDate ? startDate.replace('T', ' ') : null,
        valid_until: endDate ? endDate.replace('T', ' ') : null,
        is_active: isActive ? 1 : 0
      };

      if (editingOffer) {
        await api.put(`/discounts/${editingOffer.id}`, payload);
        toast.success(`Updated ${numDiscountPct}% discount for ${selectedProduct.name}`);
      } else {
        await api.post('/discounts', payload);
        toast.success(`Created ${numDiscountPct}% offer for ${selectedProduct.name}`);
      }

      handleCloseModal();
      fetchData();
    } catch (err) {
      console.error('Error saving discount:', err);
      toast.error(err.response?.data?.error || 'Failed to save promotion.');
    } finally {
      setSubmitting(false);
    }
  };

  // Toggle Active / Inactive Status
  const handleToggleActive = async (offer) => {
    try {
      const nextActive = offer.is_active === 1 ? 0 : 1;
      await api.put(`/discounts/${offer.id}`, { is_active: nextActive });
      toast.success(nextActive === 1 ? `Activated offer for ${offer.product_name}` : `Deactivated offer for ${offer.product_name}`);
      fetchData();
    } catch (err) {
      console.error('Error toggling status:', err);
      toast.error(err.response?.data?.error || 'Failed to update offer status.');
    }
  };

  // Remove Offer
  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      setIsDeleting(true);
      await api.delete(`/discounts/${deleteTarget.id}`);
      toast.success(`Removed promotion for "${deleteTarget.product_name}". Normal pricing restored.`);
      setDeleteTarget(null);
      fetchData();
    } catch (err) {
      console.error('Error deleting discount:', err);
      toast.error(err.response?.data?.error || 'Failed to remove discount.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-lightCard dark:bg-darkCard border border-lightBorder dark:border-darkBorder rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="flex items-center gap-2 text-brandGreen dark:text-brandGreen-light text-xs font-black uppercase tracking-wider mb-1">
              <Tag size={16} /> Promotions Engine
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-lightText dark:text-darkText">
              Offers & Discounts Management
            </h1>
            <p className="text-xs sm:text-sm text-lightTextSecondary dark:text-darkTextSecondary mt-1">
              Manage promotional price cuts, percentage discounts, and active storefront deals.
            </p>
          </div>
          <button
            onClick={handleOpenAdd}
            className="btn-primary inline-flex items-center gap-2 whitespace-nowrap px-4 py-2.5 rounded-xl font-bold shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            <Plus size={18} /> Add New Offer
          </button>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-lightBorder/60 dark:border-darkBorder/60">
          <div className="bg-lightBg dark:bg-darkBg/60 p-3 rounded-xl border border-lightBorder/50 dark:border-darkBorder/50">
            <div className="text-xs text-lightTextSecondary dark:text-darkTextSecondary font-medium">Total Promotions</div>
            <div className="text-xl font-black text-lightText dark:text-darkText mt-0.5">{discounts.length}</div>
          </div>
          <div className="bg-lightBg dark:bg-darkBg/60 p-3 rounded-xl border border-lightBorder/50 dark:border-darkBorder/50">
            <div className="text-xs text-lightTextSecondary dark:text-darkTextSecondary font-medium">Active Deals</div>
            <div className="text-xl font-black text-brandGreen dark:text-brandGreen-light mt-0.5">
              {discounts.filter(d => d.status === 'active').length}
            </div>
          </div>
          <div className="bg-lightBg dark:bg-darkBg/60 p-3 rounded-xl border border-lightBorder/50 dark:border-darkBorder/50">
            <div className="text-xs text-lightTextSecondary dark:text-darkTextSecondary font-medium">Inactive / Paused</div>
            <div className="text-xl font-black text-amber-500 mt-0.5">
              {discounts.filter(d => d.status === 'inactive').length}
            </div>
          </div>
          <div className="bg-lightBg dark:bg-darkBg/60 p-3 rounded-xl border border-lightBorder/50 dark:border-darkBorder/50">
            <div className="text-xs text-lightTextSecondary dark:text-darkTextSecondary font-medium">Expired</div>
            <div className="text-xl font-black text-red-500 mt-0.5">
              {discounts.filter(d => d.status === 'expired').length}
            </div>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-lightTextSecondary dark:text-darkTextSecondary" />
          <input
            type="text"
            placeholder="Search offer by product or category..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm rounded-xl border border-lightBorder dark:border-darkBorder bg-lightCard dark:bg-darkCard text-lightText dark:text-darkText focus:outline-none focus:ring-2 focus:ring-brandGreen/40"
          />
        </div>
        <div className="text-xs text-lightTextSecondary dark:text-darkTextSecondary self-end sm:self-center font-medium">
          Showing {filteredDiscounts.length} of {discounts.length} promotional offers
        </div>
      </div>

      {/* Existing Offers Table / Cards */}
      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin text-brandGreen" size={36} />
        </div>
      ) : filteredDiscounts.length === 0 ? (
        <div className="text-center py-16 bg-lightCard dark:bg-darkCard rounded-2xl border border-lightBorder dark:border-darkBorder p-6">
          <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-brandGold/10 text-brandGold flex items-center justify-center">
            <Tag size={28} />
          </div>
          <h3 className="text-lg font-bold text-lightText dark:text-darkText mb-1">No Offers Found</h3>
          <p className="text-xs sm:text-sm text-lightTextSecondary dark:text-darkTextSecondary max-w-sm mx-auto mb-4">
            {searchTerm ? 'No promotions match your search criteria.' : 'No promotional discounts have been created yet.'}
          </p>
          {!searchTerm && (
            <button onClick={handleOpenAdd} className="btn-primary text-xs px-4 py-2 rounded-lg">
              Create First Offer
            </button>
          )}
        </div>
      ) : (
        <div className="bg-lightCard dark:bg-darkCard border border-lightBorder dark:border-darkBorder rounded-2xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm border-collapse">
              <thead>
                <tr className="bg-lightBg/80 dark:bg-darkBg/60 border-b border-lightBorder dark:border-darkBorder text-lightTextSecondary dark:text-darkTextSecondary font-bold uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4">Product</th>
                  <th className="py-3 px-3">Original</th>
                  <th className="py-3 px-3">Discount</th>
                  <th className="py-3 px-3">Deal Price</th>
                  <th className="py-3 px-3">Savings</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3">Valid Until</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-lightBorder/60 dark:divide-darkBorder/60">
                {filteredDiscounts.map((offer) => {
                  const isDealActive = offer.status === 'active';
                  const isExpired = offer.status === 'expired';
                  const isInactive = offer.status === 'inactive';

                  return (
                    <tr key={offer.id} className="hover:bg-lightBg/40 dark:hover:bg-darkBg/30 transition-colors">
                      {/* Product Name & Image */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={normalizeImageUrl(offer.image_url)}
                            alt={offer.product_name}
                            className="w-10 h-10 object-contain rounded-lg bg-white p-1 border border-lightBorder dark:border-darkBorder flex-shrink-0"
                            onError={(e) => { e.currentTarget.src = '/images/placeholder-product.jpg'; }}
                          />
                          <div className="min-w-0">
                            <div className="font-bold text-lightText dark:text-darkText line-clamp-1">
                              {offer.product_name}
                            </div>
                            <div className="text-[11px] text-lightTextSecondary dark:text-darkTextSecondary">
                              {offer.category_name || 'General Grocery'}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Original Price */}
                      <td className="py-3 px-3 font-semibold text-lightTextSecondary dark:text-darkTextSecondary whitespace-nowrap">
                        Rs {offer.original_price}
                      </td>

                      {/* Discount % */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-brandGold/15 text-brandGold dark:text-brandGold-light font-black text-xs border border-brandGold/30">
                          <Percent size={12} /> {offer.discount_percent}% OFF
                        </span>
                      </td>

                      {/* Discounted Price */}
                      <td className="py-3 px-3 font-black text-brandGreen dark:text-brandGreen-light whitespace-nowrap">
                        Rs {offer.discounted_price}
                      </td>

                      {/* Amount Saved */}
                      <td className="py-3 px-3 font-bold text-emerald-600 dark:text-emerald-400 whitespace-nowrap text-xs">
                        -Rs {offer.savings_amount}
                      </td>

                      {/* Status Badge */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        {isDealActive && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20">
                            <CheckCircle2 size={12} /> Active
                          </span>
                        )}
                        {isInactive && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                            <Clock size={12} /> Inactive
                          </span>
                        )}
                        {isExpired && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20">
                            <XCircle size={12} /> Expired
                          </span>
                        )}
                        {offer.status === 'scheduled' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                            <Clock size={12} /> Scheduled
                          </span>
                        )}
                      </td>

                      {/* Valid Until */}
                      <td className="py-3 px-3 text-xs text-lightTextSecondary dark:text-darkTextSecondary whitespace-nowrap">
                        {offer.valid_until ? offer.valid_until.slice(0, 10) : 'Ongoing'}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleToggleActive(offer)}
                            className={`p-1.5 rounded-lg border text-xs font-semibold transition-all ${
                              offer.is_active === 1
                                ? 'border-amber-500/30 text-amber-600 dark:text-amber-400 hover:bg-amber-500/10'
                                : 'border-green-500/30 text-green-600 dark:text-green-400 hover:bg-green-500/10'
                            }`}
                            title={offer.is_active === 1 ? 'Pause / Deactivate Offer' : 'Activate Offer'}
                            aria-label={offer.is_active === 1 ? 'Deactivate' : 'Activate'}
                          >
                            {offer.is_active === 1 ? 'Pause' : 'Activate'}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(offer)}
                            className="p-1.5 rounded-lg border border-lightBorder dark:border-darkBorder text-lightTextSecondary hover:text-lightText dark:hover:text-darkText hover:bg-lightBg dark:hover:bg-darkBg transition-colors"
                            title="Edit Offer"
                            aria-label={`Edit ${offer.product_name}`}
                          >
                            <Edit2 size={15} />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteTarget(offer)}
                            className="p-1.5 rounded-lg border border-red-500/20 text-red-500 hover:bg-red-500/10 transition-colors"
                            title="Remove Offer"
                            aria-label={`Remove offer for ${offer.product_name}`}
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ADD / EDIT OFFER MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-lightCard dark:bg-darkCard border border-lightBorder dark:border-darkBorder rounded-2xl w-full max-w-lg shadow-2xl p-6 relative animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-lightBorder dark:border-darkBorder">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-brandGold/15 text-brandGold flex items-center justify-center">
                  <Percent size={18} />
                </div>
                <h2 className="text-lg font-black text-lightText dark:text-darkText">
                  {editingOffer ? 'Edit Promotion Offer' : 'Add New Promotional Offer'}
                </h2>
              </div>
              <button
                type="button"
                onClick={handleCloseModal}
                className="text-lightTextSecondary hover:text-lightText dark:hover:text-darkText p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              {/* Product Selection (Only in Add mode) */}
              {!editingOffer ? (
                <div>
                  <label className="block text-xs font-bold text-lightText dark:text-darkText uppercase tracking-wider mb-1.5">
                    1. Select Product *
                  </label>
                  <div className="relative mb-2">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-lightTextSecondary" />
                    <input
                      type="text"
                      placeholder="Type to search product catalog..."
                      value={productSearch}
                      onChange={(e) => setProductSearch(e.target.value)}
                      className="w-full pl-8 pr-3 py-2 text-xs rounded-xl border border-lightBorder dark:border-darkBorder bg-lightBg dark:bg-darkBg text-lightText dark:text-darkText focus:outline-none focus:ring-2 focus:ring-brandGreen/40"
                    />
                  </div>

                  <div className="max-h-40 overflow-y-auto rounded-xl border border-lightBorder dark:border-darkBorder divide-y divide-lightBorder/40 dark:divide-darkBorder/40 bg-lightBg/50 dark:bg-darkBg/50 p-1">
                    {availableProducts.length === 0 ? (
                      <div className="text-center py-4 text-xs text-lightTextSecondary">No products found.</div>
                    ) : (
                      availableProducts.map(p => {
                        const isSelected = selectedProduct?.id === p.id;
                        return (
                          <div
                            key={p.id}
                            onClick={() => setSelectedProduct(p)}
                            className={`flex items-center justify-between p-2 rounded-lg cursor-pointer text-xs transition-colors ${
                              isSelected 
                                ? 'bg-brandGreen text-white font-bold' 
                                : 'hover:bg-white dark:hover:bg-darkBg text-lightText dark:text-darkText'
                            }`}
                          >
                            <div className="flex items-center gap-2 truncate">
                              <img
                                src={normalizeImageUrl(p.image_url)}
                                alt={p.name}
                                className="w-6 h-6 object-contain rounded bg-white p-0.5 flex-shrink-0"
                                onError={(e) => { e.currentTarget.src = '/images/placeholder-product.jpg'; }}
                              />
                              <span className="truncate">{p.name}</span>
                            </div>
                            <span className={isSelected ? 'text-white/90 whitespace-nowrap ml-2' : 'text-brandGreen dark:text-brandGreen-light font-bold whitespace-nowrap ml-2'}>
                              Rs {p.price}
                            </span>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              ) : (
                /* Edit Mode: Product display card */
                <div className="p-3 rounded-xl bg-lightBg dark:bg-darkBg border border-lightBorder dark:border-darkBorder flex items-center gap-3">
                  <img
                    src={normalizeImageUrl(selectedProduct?.image_url)}
                    alt={selectedProduct?.name}
                    className="w-12 h-12 object-contain rounded-lg bg-white p-1 border border-lightBorder flex-shrink-0"
                    onError={(e) => { e.currentTarget.src = '/images/placeholder-product.jpg'; }}
                  />
                  <div>
                    <div className="text-xs text-brandGreen font-bold uppercase tracking-wider">Promoted Product</div>
                    <div className="font-bold text-sm text-lightText dark:text-darkText">{selectedProduct?.name}</div>
                    <div className="text-xs text-lightTextSecondary">Base Price: Rs {selectedProduct?.price}</div>
                  </div>
                </div>
              )}

              {/* Warning if already has active discount */}
              {!editingOffer && existingActiveDiscount && (
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-400 text-xs flex items-start gap-2">
                  <AlertTriangle size={16} className="flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Conflicting Active Offer:</span> This product already has an active {existingActiveDiscount.discount_percent}% discount. To avoid customer confusion, edit or deactivate the existing offer instead.
                  </div>
                </div>
              )}

              {/* Discount Percentage Input */}
              <div>
                <label className="block text-xs font-bold text-lightText dark:text-darkText uppercase tracking-wider mb-1.5">
                  2. Discount Percentage (% OFF) *
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.5"
                    min="0.5"
                    max="99.9"
                    required
                    placeholder="e.g. 10, 12.5, 15, 20"
                    value={discountPercent}
                    onChange={(e) => setDiscountPercent(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-lightBorder dark:border-darkBorder bg-lightBg dark:bg-darkBg text-lightText dark:text-darkText font-bold focus:outline-none focus:ring-2 focus:ring-brandGreen/40"
                  />
                  <span className="absolute right-3.5 top-1/2 -translate-y-1/2 font-bold text-xs text-lightTextSecondary">
                    %
                  </span>
                </div>
                <div className="flex gap-1.5 mt-2 flex-wrap">
                  {['5', '10', '12.5', '15', '20', '25', '30'].map(preset => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setDiscountPercent(preset)}
                      className={`px-2.5 py-1 text-xs rounded-lg border font-semibold transition-colors ${
                        discountPercent === preset 
                          ? 'bg-brandGold text-white border-brandGold' 
                          : 'bg-lightBg dark:bg-darkBg text-lightTextSecondary hover:text-lightText border-lightBorder dark:border-darkBorder'
                      }`}
                    >
                      {preset}%
                    </button>
                  ))}
                </div>
              </div>

              {/* Live Preview Box */}
              {selectedProduct && (
                <div className="p-3.5 rounded-xl bg-gradient-to-r from-brandGreen/10 via-brandGold/10 to-transparent border border-brandGreen/30 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-brandGreen dark:text-brandGreen-light">
                    <Sparkles size={14} /> Storefront Pricing Preview
                  </div>
                  <div className="grid grid-cols-3 gap-2 pt-1 text-center">
                    <div className="p-2 rounded-lg bg-white/60 dark:bg-darkBg/60 border border-lightBorder/50">
                      <div className="text-[10px] text-lightTextSecondary font-medium">Original</div>
                      <div className="text-xs font-bold text-lightText dark:text-darkText line-through">
                        Rs {originalPrice}
                      </div>
                    </div>
                    <div className="p-2 rounded-lg bg-white/60 dark:bg-darkBg/60 border border-lightBorder/50">
                      <div className="text-[10px] text-brandGreen font-medium">Discounted</div>
                      <div className="text-sm font-black text-brandGreen dark:text-brandGreen-light">
                        Rs {previewDiscountedPrice}
                      </div>
                    </div>
                    <div className="p-2 rounded-lg bg-white/60 dark:bg-darkBg/60 border border-lightBorder/50">
                      <div className="text-[10px] text-emerald-600 font-medium">Customer Saves</div>
                      <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                        Rs {previewSavings}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Start Date & End Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-lightText dark:text-darkText uppercase tracking-wider mb-1">
                    Start Date (Optional)
                  </label>
                  <input
                    type="datetime-local"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs rounded-xl border border-lightBorder dark:border-darkBorder bg-lightBg dark:bg-darkBg text-lightText dark:text-darkText focus:outline-none focus:ring-2 focus:ring-brandGreen/40"
                  />
                  <span className="text-[10px] text-lightTextSecondary">Leave blank for immediate activation</span>
                </div>
                <div>
                  <label className="block text-xs font-bold text-lightText dark:text-darkText uppercase tracking-wider mb-1">
                    End Date (Optional)
                  </label>
                  <input
                    type="datetime-local"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs rounded-xl border border-lightBorder dark:border-darkBorder bg-lightBg dark:bg-darkBg text-lightText dark:text-darkText focus:outline-none focus:ring-2 focus:ring-brandGreen/40"
                  />
                  <span className="text-[10px] text-lightTextSecondary">Defaults to 1 year validity</span>
                </div>
              </div>

              {/* Active Toggle */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="offerActiveCheck"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="rounded text-brandGreen focus:ring-brandGreen w-4 h-4 cursor-pointer"
                />
                <label htmlFor="offerActiveCheck" className="text-xs font-bold text-lightText dark:text-darkText cursor-pointer">
                  Activate this promotion immediately on storefront
                </label>
              </div>

              {/* Form Buttons */}
              <div className="flex justify-end gap-2.5 pt-3 border-t border-lightBorder dark:border-darkBorder">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  disabled={submitting}
                  className="px-4 py-2 text-xs font-bold rounded-xl border border-lightBorder dark:border-darkBorder text-lightTextSecondary hover:text-lightText hover:bg-lightBg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || !selectedProduct || !isPercentValid || (!editingOffer && Boolean(existingActiveDiscount))}
                  className="btn-primary px-5 py-2 text-xs font-bold rounded-xl shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
                >
                  {submitting && <Loader2 size={14} className="animate-spin" />}
                  {editingOffer ? 'Update Promotion' : 'Save & Publish Offer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-lightCard dark:bg-darkCard border border-lightBorder dark:border-darkBorder rounded-2xl w-full max-w-md shadow-2xl p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center mx-auto">
              <Trash2 size={24} />
            </div>
            <div className="text-center">
              <h3 className="text-lg font-bold text-lightText dark:text-darkText">Remove Promotional Offer?</h3>
              <p className="text-xs text-lightTextSecondary dark:text-darkTextSecondary mt-1 leading-relaxed">
                Are you sure you want to remove the <span className="font-bold text-brandGold">{deleteTarget.discount_percent}% OFF</span> deal for <span className="font-bold text-lightText dark:text-darkText">{deleteTarget.product_name}</span>?
              </p>
              <div className="p-3 rounded-xl bg-lightBg dark:bg-darkBg border border-lightBorder dark:border-darkBorder text-[11px] text-lightTextSecondary text-left mt-3 space-y-1">
                <div>✓ The product itself will <strong>NOT</strong> be deleted.</div>
                <div>✓ Normal catalog price (<strong>Rs {deleteTarget.original_price}</strong>) will be restored.</div>
                <div>✓ Historical orders and customer invoices remain unchanged.</div>
              </div>
            </div>
            <div className="flex justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                disabled={isDeleting}
                className="px-4 py-2 text-xs font-bold rounded-xl border border-lightBorder dark:border-darkBorder text-lightTextSecondary hover:text-lightText transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="px-4 py-2 text-xs font-bold rounded-xl bg-red-600 hover:bg-red-700 text-white shadow-md disabled:opacity-50 flex items-center gap-1.5 transition-colors"
              >
                {isDeleting && <Loader2 size={14} className="animate-spin" />}
                Confirm Removal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OffersAdmin;
