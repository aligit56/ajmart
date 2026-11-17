import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { CartContext } from '../context/CartContext';
import { AuthContext } from '../context/AuthContext';
import { generateWhatsAppLink } from '../utils/whatsapp';
import { WhatsAppIcon } from '../components/SocialIcons';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { Loader2, ShieldCheck, MapPin, User, Phone, FileText, Award, AlertCircle, LogIn, ArrowRight, ShieldAlert } from 'lucide-react';
import { normalizeImageUrl, handleProductImageError } from '../utils/imageHelpers';

const Checkout = () => {
  const { cart, cartTotal, clearCart } = useContext(CartContext);
  const { user, refreshUser, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const [settings, setSettings] = useState({});
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    notes: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (cart.length === 0) navigate('/cart');
    
    api.get('/settings')
      .then(res => setSettings(res.data || {}))
      .catch(err => console.error('Failed to load settings in Checkout:', err));

    if (user) {
      setFormData(prev => ({
        ...prev,
        name: user.name || '',
        phone: user.phone || '',
        address: user.address || ''
      }));
    }
  }, [user, cart, navigate]);

  const handleChange = (e) => {
    setFormData({...formData, [e.target.name]: e.target.value});
  };

  const aqibNumber = settings.owner_aqib || settings.whatsapp_number || '0335-7727555';
  const cleanAqibPhone = aqibNumber.replace(/\D/g, '').replace(/^0/, '92') || '923357727555';

  const minOrderAmount = Number(settings.minimum_order_amount) || 2000;
  const isUnderMinOrder = cartTotal < minOrderAmount;
  const earnedPoints = Math.floor(cartTotal / 2000) * 50;
  const isAdmin = user && user.role === 'admin';

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isUnderMinOrder) {
      toast.error(`Minimum order amount is PKR ${minOrderAmount.toLocaleString()}. Please add PKR ${(minOrderAmount - cartTotal).toLocaleString()} more.`);
      return;
    }

    setLoading(true);
    try {
      const orderPayload = {
        items: cart.map(item => ({ product_id: item.product_id, quantity: item.quantity, price: item.price, variant_name: item.variant_name })),
        total_price: cartTotal,
        delivery_address: formData.address,
        notes: formData.notes,
        customer_name: formData.name,
        customer_phone: formData.phone
      };

      await api.post('/orders', orderPayload);
      
      // If signed in, refresh user profile to update points in context
      if (user && refreshUser) {
        try {
          await refreshUser();
        } catch (e) {
          // ignore
        }
      }

      // Generate WhatsApp link directing to Aqib's real number
      const whatsappUrl = generateWhatsAppLink(
        { items: cart, total_price: cartTotal },
        formData,
        cleanAqibPhone
      );
      
      clearCart();
      window.open(whatsappUrl, '_blank');
      
      if (user) {
        navigate('/orders');
      } else {
        navigate('/');
      }
      
      toast.success(
        user && earnedPoints > 0
          ? `Order placed! +${earnedPoints} points credited to your account! Opening WhatsApp...`
          : "Order placed successfully! Redirecting to Aqib on WhatsApp..."
      );
      
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to place order");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto my-4 sm:my-8 px-4">
      <div className="mb-6 space-y-1">
        <h1 className="text-2xl sm:text-3xl font-black text-lightText dark:text-darkText border-l-4 border-darkBlue dark:border-cyan pl-3">
          Complete Your Order
        </h1>
        <p className="text-xs sm:text-sm text-lightTextSecondary dark:text-darkTextSecondary pl-4">
          Direct wholesale & grocery order dispatch via WhatsApp
        </p>
      </div>

      {/* Administrator Account Detected Notice */}
      {isAdmin ? (
        <div className="bg-amber-500/10 border-2 border-amber-500/30 rounded-2xl p-6 md:p-8 my-6 text-center shadow-xs">
          <ShieldAlert className="w-14 h-14 text-amber-600 dark:text-amber-400 mx-auto mb-3" />
          <h2 className="text-xl font-bold text-lightText dark:text-darkText mb-2">
            Administrator Account Detected
          </h2>
          <p className="text-sm text-lightTextSecondary dark:text-darkTextSecondary mb-6 max-w-md mx-auto leading-relaxed">
            You are logged in as an administrator. Customer ordering is not available from an admin account. Please sign out and continue as a customer or guest to place an order.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link to="/admin" className="btn-primary w-full sm:w-auto text-center">
              Return to Admin Dashboard
            </Link>
            <button 
              onClick={logout} 
              className="px-5 py-2.5 border border-lightBorder dark:border-darkBorder rounded-lg font-semibold hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors w-full sm:w-auto"
            >
              Sign Out
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Minimum Order Warning Alert if cartTotal < 2000 */}
          {isUnderMinOrder && (
            <div className="bg-amber-500/10 border-2 border-amber-500/30 rounded-2xl p-4 mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-amber-800 dark:text-amber-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center flex-shrink-0 shadow-sm">
                  <AlertCircle size={22} />
                </div>
                <div>
                  <div className="text-xs font-black uppercase tracking-wider text-amber-700 dark:text-amber-400">
                    Minimum Order Requirement
                  </div>
                  <div className="text-sm font-bold">
                    Orders must be at least <span className="font-black text-amber-600 dark:text-amber-300">PKR {minOrderAmount.toLocaleString()}</span> for delivery across Rawalpindi & Islamabad.
                  </div>
                  <div className="text-xs text-amber-700/80 dark:text-amber-300/80 mt-0.5">
                    Current Cart: PKR {cartTotal.toLocaleString()} • Add <strong className="font-black">PKR {(minOrderAmount - cartTotal).toLocaleString()}</strong> more to checkout.
                  </div>
                </div>
              </div>
              <Link
                to="/products"
                className="px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs flex items-center gap-1.5 self-end sm:self-center transition-colors flex-shrink-0"
              >
                <span>Add Items</span>
                <ArrowRight size={13} />
              </Link>
            </div>
          )}

          {/* Rewards Points Status Banner */}
          {user ? (
            <div className="bg-gradient-to-r from-amber-500/10 via-amber-400/5 to-transparent border border-amber-500/30 rounded-2xl p-4 mb-6 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center flex-shrink-0 shadow-sm">
                  <Award size={20} />
                </div>
                <div>
                  <div className="text-xs font-black uppercase tracking-wider text-amber-700 dark:text-amber-400">
                    Customer Reward Points Program
                  </div>
                  <div className="text-sm font-black text-lightText dark:text-darkText">
                    {earnedPoints > 0 ? (
                      <>
                        You will earn <span className="text-amber-600 dark:text-amber-400 font-extrabold">+{earnedPoints} Points</span> on this order!
                      </>
                    ) : (
                      <>
                        Earn 50 points on every PKR 2,000 spent!
                      </>
                    )}
                  </div>
                  <div className="text-xs text-lightTextSecondary dark:text-darkTextSecondary">
                    Your current points balance: <strong className="text-amber-600 dark:text-amber-400 font-bold">{user.points || 0} pts</strong>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-gradient-to-r from-blue-500/10 via-cyan-500/5 to-transparent border border-blue-500/20 rounded-2xl p-4 mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-darkBlue dark:bg-cyan text-white dark:text-black flex items-center justify-center flex-shrink-0 shadow-sm">
                  <Award size={20} />
                </div>
                <div>
                  <div className="text-xs font-black uppercase tracking-wider text-darkBlue dark:text-cyan">
                    Guest Checkout Allowed
                  </div>
                  <div className="text-sm font-bold text-lightText dark:text-darkText">
                    Want to earn <span className="text-amber-600 dark:text-amber-400 font-black">50 points</span> per PKR 2,000 spent?
                  </div>
                  <div className="text-xs text-lightTextSecondary dark:text-darkTextSecondary">
                    Sign in to collect loyalty reward points, or simply proceed as guest below!
                  </div>
                </div>
              </div>
              <Link
                to="/login?redirect=checkout"
                className="px-3.5 py-1.5 rounded-xl bg-darkBlue dark:bg-cyan text-white dark:text-black font-bold text-xs flex items-center gap-1.5 self-end sm:self-center transition-opacity hover:opacity-90 flex-shrink-0"
              >
                <LogIn size={13} />
                <span>Sign In to Earn</span>
              </Link>
            </div>
          )}

      {/* Seller Verification Card */}
      <div className="bg-[#25D366]/10 border border-[#25D366]/30 rounded-2xl p-4 mb-6 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#25D366] text-white flex items-center justify-center flex-shrink-0 shadow-sm">
            <WhatsAppIcon size={22} />
          </div>
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
              Direct Seller & Wholesale Desk
            </div>
            <div className="text-sm font-black text-lightText dark:text-darkText">
              Aqib • <span className="text-emerald-600 dark:text-emerald-400">{aqibNumber}</span>
            </div>
            <div className="text-[11px] text-lightTextSecondary dark:text-darkTextSecondary">
              Shop # V-488, Namak Mandi Chowk, Raja Bazar, Rawalpindi
            </div>
          </div>
        </div>
        <div className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white dark:bg-[#1a1a1a] text-[11px] font-bold text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
          <ShieldCheck size={13} />
          <span>Verified Seller</span>
        </div>
      </div>
      
      <div className="bg-lightCard dark:bg-darkCard rounded-3xl p-6 sm:p-8 border border-lightBorder dark:border-darkBorder shadow-lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Full Name */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-lightTextSecondary dark:text-darkTextSecondary mb-1.5">
              Full Name *
            </label>
            <div className="relative">
              <input 
                type="text" 
                name="name" 
                value={formData.name} 
                onChange={handleChange} 
                required 
                className="input-field pl-10 text-sm" 
                placeholder="Enter your full name"
              />
              <User size={16} className="absolute left-3.5 top-3.5 text-lightTextSecondary dark:text-darkTextSecondary" />
            </div>
          </div>

          {/* WhatsApp Phone */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-lightTextSecondary dark:text-darkTextSecondary mb-1.5">
              Your WhatsApp Phone Number *
            </label>
            <div className="relative">
              <input 
                type="tel" 
                name="phone" 
                value={formData.phone} 
                onChange={handleChange} 
                required 
                className="input-field pl-10 text-sm" 
                placeholder="0335-7727555" 
              />
              <Phone size={16} className="absolute left-3.5 top-3.5 text-lightTextSecondary dark:text-darkTextSecondary" />
            </div>
            <span className="text-[11px] text-lightTextSecondary dark:text-darkTextSecondary mt-1 block">
              Aqib will confirm order items and dispatch time with you on this WhatsApp number.
            </span>
          </div>

          {/* Delivery Address */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-lightTextSecondary dark:text-darkTextSecondary mb-1.5">
              Delivery Address (Rawalpindi / Islamabad) *
            </label>
            <div className="relative">
              <textarea 
                name="address" 
                value={formData.address} 
                onChange={handleChange} 
                required 
                className="input-field pl-10 pt-3 h-24 text-sm resize-none" 
                placeholder="House #, Street #, Sector / Colony, Rawalpindi or Islamabad"
              ></textarea>
              <MapPin size={16} className="absolute left-3.5 top-3.5 text-lightTextSecondary dark:text-darkTextSecondary" />
            </div>
          </div>

          {/* Special Instructions */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-lightTextSecondary dark:text-darkTextSecondary mb-1.5">
              Special Instructions / Wholesale Notes (Optional)
            </label>
            <div className="relative">
              <textarea 
                name="notes" 
                value={formData.notes} 
                onChange={handleChange} 
                className="input-field pl-10 pt-3 h-16 text-sm resize-none"
                placeholder="e.g. Please send 50kg bag, delivery before 2 PM..."
              ></textarea>
              <FileText size={16} className="absolute left-3.5 top-3.5 text-lightTextSecondary dark:text-darkTextSecondary" />
            </div>
          </div>
          
          {/* Order Total & Payment Summary */}
          <div className="bg-lightBg dark:bg-black/30 p-4 rounded-2xl border border-lightBorder dark:border-darkBorder my-6 space-y-2">
            <div className="flex justify-between items-center font-black text-lg text-lightText dark:text-darkText">
              <span>Total Payable Amount:</span>
              <span className="text-darkBlue dark:text-cyan text-xl">PKR {cartTotal.toLocaleString()}</span>
            </div>

            {earnedPoints > 0 && user && (
              <div className="flex justify-between items-center text-xs font-bold text-amber-600 dark:text-amber-400 pt-1 border-t border-lightBorder dark:border-darkBorder">
                <span className="flex items-center gap-1">
                  <Award size={13} />
                  <span>Points to be Earned:</span>
                </span>
                <span className="font-extrabold text-sm">+{earnedPoints} pts</span>
              </div>
            )}

            <p className="text-xs text-lightTextSecondary dark:text-darkTextSecondary leading-relaxed pt-1">
              • Minimum order of PKR {minOrderAmount.toLocaleString()} required for doorstep delivery.<br />
              • Cash on Delivery (COD) / Bank Transfer upon delivery confirmation.<br />
              • Clicking below will immediately send your order details straight to <strong>Aqib</strong> on WhatsApp.
            </p>
          </div>

          {/* Submit Button */}
          <button 
            type="submit" 
            disabled={loading || isUnderMinOrder} 
            className="w-full py-4 px-6 rounded-2xl bg-[#25D366] hover:bg-[#20ba5a] text-white flex justify-center items-center gap-2 font-bold text-base shadow-xl hover:shadow-2xl transition-all duration-200 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" size={20} />
                <span>Processing Order...</span>
              </>
            ) : isUnderMinOrder ? (
              <>
                <AlertCircle size={20} />
                <span>Minimum Order PKR {minOrderAmount.toLocaleString()} Required (Add PKR {(minOrderAmount - cartTotal).toLocaleString()})</span>
              </>
            ) : (
              <>
                <WhatsAppIcon size={22} />
                <span>Confirm & Send Order to Aqib ({aqibNumber})</span>
              </>
            )}
          </button>
        </form>
      </div>
        </>
      )}
    </div>
  );
};

export default Checkout;
