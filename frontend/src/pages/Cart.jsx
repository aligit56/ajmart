import React, { useContext, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CartContext } from '../context/CartContext';
import { AuthContext } from '../context/AuthContext';
import { Trash2, ShoppingBag, ShieldAlert, ArrowRight, ShieldCheck } from 'lucide-react';
import api from '../api/axios';
import { normalizeImageUrl, handleProductImageError } from '../utils/imageHelpers';

const Cart = () => {
  const { cart, removeFromCart, updateQuantity, cartTotal } = useContext(CartContext);
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [settings, setSettings] = useState({});

  useEffect(() => {
    api.get('/settings')
      .then(res => setSettings(res.data || {}))
      .catch(err => console.error('Failed to load settings in Cart:', err));
  }, []);

  const minOrderAmount = Number(settings.minimum_order_amount) || 3500;
  const isUnderMinOrder = cartTotal < minOrderAmount;
  const isAdmin = user && user.role === 'admin';

  if (cart.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center max-w-md mx-auto">
        <div className="w-20 h-20 rounded-full bg-lightBg dark:bg-darkBg flex items-center justify-center mb-4 text-lightTextSecondary dark:text-darkTextSecondary">
          <ShoppingBag size={44} />
        </div>
        <h2 className="text-2xl font-bold text-lightText dark:text-darkText mb-2">Your cart is empty</h2>
        <p className="text-sm text-lightTextSecondary dark:text-darkTextSecondary mb-6">
          Add fresh grocery staples, premium rice, and household essentials to get started.
        </p>
        <Link to="/products" className="btn-primary">Continue Shopping</Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto w-full">
      <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-lightText dark:text-darkText border-l-4 border-darkBlue dark:border-cyan pl-3 flex items-center gap-2">
        <ShoppingBag className="text-darkBlue dark:text-cyan" size={24} /> Shopping Cart
      </h1>

      {/* Admin Notice Banner if logged in as Admin */}
      {isAdmin && (
        <div className="bg-amber-500/10 border-2 border-amber-500/30 rounded-2xl p-6 mb-8 text-center">
          <ShieldAlert className="w-12 h-12 text-amber-600 dark:text-amber-400 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-lightText dark:text-darkText mb-2">
            Administrator Account Detected
          </h3>
          <p className="text-sm text-lightTextSecondary dark:text-darkTextSecondary mb-5 max-w-lg mx-auto">
            You are logged in as an administrator. Customer ordering is not available from an admin account. Please sign out and continue as a customer or guest to place an order.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link to="/admin" className="btn-primary w-full sm:w-auto text-center">
              Return to Admin Dashboard
            </Link>
            <button 
              onClick={logout} 
              className="px-4 py-2 border border-lightBorder dark:border-darkBorder rounded-lg font-semibold hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors w-full sm:w-auto"
            >
              Sign Out
            </button>
          </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row gap-8">
        {/* Cart Items List */}
        <div className="w-full md:w-2/3 space-y-3 sm:space-y-4">
          {cart.map((item, index) => {
            const cartItemId = item.cart_id || `${item.product_id}`;
            const imgUrl = normalizeImageUrl(item.image_url);
            return (
              <div key={cartItemId + index} className="card p-3 sm:p-4 flex items-center gap-3 sm:gap-4">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white dark:bg-[#181818] border border-lightBorder dark:border-darkBorder rounded-lg flex-shrink-0 flex items-center justify-center overflow-hidden p-1">
                  {imgUrl ? (
                    <img 
                      src={imgUrl} 
                      alt={item.name} 
                      className="w-full h-full object-contain" 
                      onError={handleProductImageError}
                    />
                  ) : (
                    <span className="text-xs text-lightTextSecondary dark:text-darkTextSecondary">No Img</span>
                  )}
                </div>
                <div className="flex-grow min-w-0">
                  <Link to={`/product/${item.product_id}`} className="font-semibold text-sm sm:text-base text-lightText dark:text-darkText hover:text-darkBlue dark:hover:text-cyan line-clamp-1">
                    {item.name}
                  </Link>
                  {item.variant_name && (
                    <div className="text-xs text-lightTextSecondary dark:text-darkTextSecondary mt-0.5">
                      Variant: <span className="font-semibold text-lightText dark:text-darkText">{item.variant_name}</span>
                    </div>
                  )}
                  <div className="text-darkBlue dark:text-cyan font-bold text-sm sm:text-base mt-1">
                    Rs {item.price}
                  </div>
                </div>
                <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
                  <div className="flex items-center bg-lightBg dark:bg-darkBg rounded border border-lightBorder dark:border-darkBorder text-xs sm:text-sm">
                    <button className="px-2.5 py-1 hover:bg-lightBorder dark:hover:bg-darkBorder font-bold" onClick={() => updateQuantity(cartItemId, item.quantity - 1)}>-</button>
                    <span className="px-2 py-1 font-bold">{item.quantity}</span>
                    <button className="px-2.5 py-1 hover:bg-lightBorder dark:hover:bg-darkBorder font-bold" onClick={() => updateQuantity(cartItemId, item.quantity + 1)}>+</button>
                  </div>
                  <button onClick={() => removeFromCart(cartItemId)} className="text-lightTextSecondary hover:text-error-light dark:hover:text-error-dark p-1.5 transition-colors" title="Remove item">
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Order Summary */}
        <div className="w-full md:w-1/3">
          <div className="card p-5 sm:p-6 sticky top-24">
            <h3 className="text-lg font-bold mb-4 border-b border-lightBorder dark:border-darkBorder pb-2 text-lightText dark:text-darkText">
              Order Summary
            </h3>
            <div className="flex justify-between mb-2 text-sm">
              <span className="text-lightTextSecondary dark:text-darkTextSecondary">Subtotal</span>
              <span className="font-semibold">Rs {cartTotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between mb-4 text-sm">
              <span className="text-lightTextSecondary dark:text-darkTextSecondary">Delivery</span>
              <span className="text-xs font-semibold text-green-600 dark:text-green-400">Calculated on WhatsApp</span>
            </div>
            <div className="flex justify-between items-center border-t border-lightBorder dark:border-darkBorder pt-3 mb-4">
              <span className="font-bold text-sm sm:text-base">Total</span>
              <span className="text-xl sm:text-2xl font-bold text-darkBlue dark:text-cyan">Rs {cartTotal.toLocaleString()}</span>
            </div>

            {/* Minimum Order Warning Alert (only for non-admin) */}
            {!isAdmin && isUnderMinOrder && (
              <div className="text-xs font-semibold text-amber-700 dark:text-amber-300 bg-amber-500/10 rounded-xl p-3 mb-4 border border-amber-500/25">
                ⚠️ <strong>Minimum Delivery Order:</strong> PKR {minOrderAmount.toLocaleString()} required across Rawalpindi &amp; Islamabad. Add <strong>PKR {(minOrderAmount - cartTotal).toLocaleString()}</strong> more to proceed.
              </div>
            )}

            {/* Action Button */}
            {isAdmin ? (
              <button 
                disabled 
                className="btn-primary w-full text-center opacity-50 cursor-not-allowed text-sm"
              >
                Ordering Disabled for Admin
              </button>
            ) : (
              <button 
                onClick={() => navigate('/checkout')}
                disabled={isUnderMinOrder}
                className="btn-primary w-full text-center text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight size={16} />
              </button>
            )}

            <div className="mt-4 pt-3 border-t border-lightBorder/50 dark:border-darkBorder/50 flex items-center justify-center gap-1.5 text-[11px] text-lightTextSecondary dark:text-darkTextSecondary">
              <ShieldCheck size={14} className="text-darkBlue dark:text-cyan" />
              <span>Direct WhatsApp Dispatch &amp; Cash on Delivery</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
