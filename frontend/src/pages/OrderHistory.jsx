import React, { useEffect, useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { AuthContext } from '../context/AuthContext';
import { 
  Loader2, Package, Clock, CheckCircle2, Truck, XCircle, 
  MapPin, Calendar, RefreshCw, ShoppingBag, ArrowRight
} from 'lucide-react';
import { WhatsAppIcon } from '../components/SocialIcons';
import toast from 'react-hot-toast';

const STATUS_MAP = {
  'Pending': {
    label: 'Order Placed',
    desc: 'We have received your order. Aqib will confirm shortly.',
    badgeClass: 'bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800/60',
    icon: Clock,
    step: 1
  },
  'Confirmed': {
    label: 'Order Confirmed',
    desc: 'Aqib has confirmed your order. It is now being prepared.',
    badgeClass: 'bg-blue-100 text-blue-900 border-blue-300 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800/60',
    icon: CheckCircle2,
    step: 2
  },
  'Processing': {
    label: 'Packing & Preparing',
    desc: 'Items are being packed and weighed for dispatch.',
    badgeClass: 'bg-indigo-100 text-indigo-900 border-indigo-300 dark:bg-indigo-950/60 dark:text-indigo-300 dark:border-indigo-800/60',
    icon: Package,
    step: 2
  },
  'Out for Delivery': {
    label: 'Out for Delivery',
    desc: 'Your grocery parcel is with the rider and on its way to your address.',
    badgeClass: 'bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800/60',
    icon: Truck,
    step: 3
  },
  'Delivered': {
    label: 'Delivered & Completed',
    desc: 'Order successfully delivered. Thank you for shopping with AJMart!',
    badgeClass: 'bg-emerald-100 text-emerald-900 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800/60',
    icon: CheckCircle2,
    step: 4
  },
  'Cancelled': {
    label: 'Order Cancelled',
    desc: 'This order was cancelled. You may re-order anytime.',
    badgeClass: 'bg-rose-100 text-rose-900 border-rose-300 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800/60',
    icon: XCircle,
    step: 0
  }
};

const OrderHistory = () => {
  const { user } = useContext(AuthContext);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState(null);
  const [settings, setSettings] = useState({});

  const fetchOrders = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const [ordersRes, settingsRes] = await Promise.all([
        api.get('/orders/me'),
        api.get('/settings').catch(() => ({ data: {} }))
      ]);
      setOrders(ordersRes.data || []);
      setSettings(settingsRes.data || {});
    } catch (err) {
      console.error('Failed to load orders:', err);
      toast.error('Failed to load your orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [user]);

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm(`Are you sure you want to cancel Order #${orderId}?`)) return;

    try {
      setCancellingId(orderId);
      await api.put(`/orders/${orderId}/cancel`);
      toast.success(`Order #${orderId} has been cancelled`);
      await fetchOrders();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.error || "Failed to cancel order");
    } finally {
      setCancellingId(null);
    }
  };

  const aqibPhone = settings.owner_aqib || settings.whatsapp_number || '0335-7727555';
  const cleanAqibPhone = aqibPhone.replace(/\D/g, '').replace(/^0/, '92') || '923357727555';

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-3">
        <Loader2 className="animate-spin text-darkBlue dark:text-cyan" size={40} />
        <span className="text-sm font-semibold text-lightTextSecondary dark:text-darkTextSecondary">
          Loading your order history...
        </span>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-lightText dark:text-darkText border-l-4 border-darkBlue dark:border-cyan pl-3">
            My Orders & Delivery Tracking
          </h1>
          <p className="text-xs sm:text-sm text-lightTextSecondary dark:text-darkTextSecondary pl-4 mt-0.5">
            Track real-time status updates and order history from AJMart Wholesale Desk.
          </p>
        </div>

        <button
          onClick={fetchOrders}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-lightBorder dark:border-[#333] hover:bg-lightBg dark:hover:bg-[#222] text-xs font-bold text-lightText dark:text-darkText transition-colors self-start sm:self-auto"
        >
          <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
          <span>Refresh Status</span>
        </button>
      </div>

      {orders.length === 0 ? (
        <div className="card p-12 text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-darkBlue/10 dark:bg-cyan/15 text-darkBlue dark:text-cyan flex items-center justify-center mx-auto">
            <ShoppingBag size={32} />
          </div>
          <div>
            <h3 className="font-bold text-lg text-lightText dark:text-darkText">No orders placed yet</h3>
            <p className="text-xs text-lightTextSecondary dark:text-darkTextSecondary mt-1 max-w-sm mx-auto">
              Explore our wholesale pulses, premium rice, cooking oils, and everyday grocery catalog.
            </p>
          </div>
          <Link to="/products" className="btn-primary inline-flex items-center gap-2 text-xs py-2.5 px-5">
            <span>Browse Products</span>
            <ArrowRight size={14} />
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map(order => {
            const statusInfo = STATUS_MAP[order.status] || STATUS_MAP['Pending'];
            const StatusIcon = statusInfo.icon;
            const isCancelled = order.status === 'Cancelled';
            const currentStep = statusInfo.step;

            return (
              <div 
                key={order.id} 
                className="bg-lightCard dark:bg-darkCard rounded-3xl border border-lightBorder dark:border-darkBorder shadow-md overflow-hidden transition-all hover:shadow-lg"
              >
                {/* Order Card Header */}
                <div className="p-5 bg-lightBg/50 dark:bg-[#1a1a1a] border-b border-lightBorder dark:border-darkBorder flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-darkBlue dark:bg-cyan text-white dark:text-black flex items-center justify-center font-black text-sm shadow-sm">
                      #{order.id}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-black text-base text-lightText dark:text-darkText">
                          Order #{order.id}
                        </h3>
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-black border ${statusInfo.badgeClass}`}>
                          <StatusIcon size={12} />
                          <span>{order.status}</span>
                        </span>
                      </div>
                      <div className="text-xs text-lightTextSecondary dark:text-darkTextSecondary flex items-center gap-2 mt-0.5">
                        <span className="flex items-center gap-1">
                          <Calendar size={12} />
                          <span>{new Date(order.created_at).toLocaleDateString()}</span>
                        </span>
                        <span>•</span>
                        <span>{new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right flex sm:flex-col items-center sm:items-end justify-between sm:justify-center border-t sm:border-t-0 pt-2 sm:pt-0 border-lightBorder/60">
                    <span className="text-xs text-lightTextSecondary dark:text-darkTextSecondary block">Total Amount</span>
                    <span className="text-lg font-black text-darkBlue dark:text-cyan">
                      PKR {order.total_price.toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Status Progress Stepper (if not cancelled) */}
                {!isCancelled ? (
                  <div className="px-4 sm:px-6 py-5 bg-slate-50/80 dark:bg-black/30 border-b border-lightBorder/80 dark:border-[#222]">
                    <div className="relative max-w-xl mx-auto">
                      {/* Connecting Line Track */}
                      <div className="absolute top-4 left-[12%] right-[12%] h-1 bg-slate-200 dark:bg-zinc-800 rounded-full z-0">
                        <div 
                          className="h-full bg-gradient-to-r from-blue-600 via-indigo-600 to-amber-500 rounded-full transition-all duration-500"
                          style={{
                            width: currentStep <= 1 ? '0%' : currentStep === 2 ? '33.3%' : currentStep === 3 ? '66.6%' : '100%'
                          }}
                        />
                      </div>

                      {/* Step Nodes */}
                      <div className="relative z-10 grid grid-cols-4 gap-1 text-center">
                        {/* Step 1: Placed */}
                        <div className="flex flex-col items-center space-y-1.5">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs transition-all shadow-xs ${
                            currentStep >= 1
                              ? 'bg-blue-600 text-white ring-4 ring-blue-500/20'
                              : 'bg-slate-200 dark:bg-zinc-800 text-slate-500 dark:text-zinc-400 border border-slate-300 dark:border-zinc-700'
                          }`}>
                            ✓
                          </div>
                          <span className={`text-[11px] font-bold ${
                            currentStep >= 1 ? 'text-blue-700 dark:text-blue-400' : 'text-slate-400 dark:text-zinc-500'
                          }`}>
                            Order Placed
                          </span>
                        </div>

                        {/* Step 2: Confirmed */}
                        <div className="flex flex-col items-center space-y-1.5">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs transition-all shadow-xs ${
                            currentStep >= 2
                              ? 'bg-indigo-600 text-white ring-4 ring-indigo-500/20'
                              : 'bg-slate-200 dark:bg-zinc-800 text-slate-500 dark:text-zinc-400 border border-slate-300 dark:border-zinc-700'
                          }`}>
                            {currentStep >= 2 ? '✓' : '2'}
                          </div>
                          <span className={`text-[11px] font-bold ${
                            currentStep >= 2 ? 'text-indigo-700 dark:text-indigo-400' : 'text-slate-400 dark:text-zinc-500'
                          }`}>
                            Confirmed
                          </span>
                        </div>

                        {/* Step 3: Out for Delivery */}
                        <div className="flex flex-col items-center space-y-1.5">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs transition-all shadow-xs ${
                            currentStep >= 3
                              ? 'bg-amber-500 text-white ring-4 ring-amber-500/20'
                              : 'bg-slate-200 dark:bg-zinc-800 text-slate-500 dark:text-zinc-400 border border-slate-300 dark:border-zinc-700'
                          }`}>
                            {currentStep >= 3 ? '✓' : '3'}
                          </div>
                          <span className={`text-[11px] font-bold ${
                            currentStep >= 3 ? 'text-amber-700 dark:text-amber-400' : 'text-slate-400 dark:text-zinc-500'
                          }`}>
                            Out for Delivery
                          </span>
                        </div>

                        {/* Step 4: Delivered */}
                        <div className="flex flex-col items-center space-y-1.5">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs transition-all shadow-xs ${
                            currentStep >= 4
                              ? 'bg-emerald-600 text-white ring-4 ring-emerald-500/20'
                              : 'bg-slate-200 dark:bg-zinc-800 text-slate-500 dark:text-zinc-400 border border-slate-300 dark:border-zinc-700'
                          }`}>
                            {currentStep >= 4 ? '✓' : '4'}
                          </div>
                          <span className={`text-[11px] font-bold ${
                            currentStep >= 4 ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-400 dark:text-zinc-500'
                          }`}>
                            Delivered
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Status explanation pill */}
                    <div className="mt-4 max-w-xl mx-auto text-xs text-center font-medium py-2 px-3.5 rounded-xl bg-white dark:bg-[#1a1a1a] border border-lightBorder/80 dark:border-[#2a2a2a] text-slate-700 dark:text-zinc-300 shadow-2xs">
                      {statusInfo.desc}
                    </div>
                  </div>
                ) : (
                  <div className="px-6 py-3 bg-rose-500/10 border-b border-rose-500/20 text-xs font-semibold text-rose-600 dark:text-rose-400 flex items-center justify-center gap-1.5">
                    <XCircle size={15} />
                    <span>This order has been cancelled.</span>
                  </div>
                )}

                {/* Order Details Body */}
                <div className="p-5 space-y-4">
                  {/* Items List */}
                  {order.items && order.items.length > 0 && (
                    <div>
                      <div className="text-[11px] font-bold uppercase tracking-wider text-lightTextSecondary dark:text-darkTextSecondary mb-2">
                        Ordered Items ({order.items.length})
                      </div>
                      <div className="divide-y divide-lightBorder/60 dark:divide-[#252525] border border-lightBorder dark:border-[#252525] rounded-2xl overflow-hidden">
                        {order.items.map((it, idx) => (
                          <div key={idx} className="p-3 bg-lightBg/30 dark:bg-[#181818] flex items-center justify-between gap-3 text-xs">
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="w-10 h-10 rounded-lg bg-lightBg dark:bg-black p-1 flex items-center justify-center overflow-hidden flex-shrink-0 border border-lightBorder dark:border-[#333]">
                                {it.image_url ? (
                                  <img src={it.image_url} alt={it.product_name} className="w-full h-full object-contain" />
                                ) : (
                                  <Package size={16} className="text-gray-400" />
                                )}
                              </div>
                              <div className="min-w-0">
                                <div className="font-bold text-lightText dark:text-darkText truncate">{it.product_name}</div>
                                {it.variant_name && (
                                  <div className="text-[11px] text-lightTextSecondary dark:text-darkTextSecondary">
                                    Size: {it.variant_name}
                                  </div>
                                )}
                                <div className="text-[11px] text-lightTextSecondary dark:text-darkTextSecondary">
                                  PKR {it.price} × {it.quantity}
                                </div>
                              </div>
                            </div>

                            <div className="font-bold text-right text-darkBlue dark:text-cyan">
                              PKR {(it.price * it.quantity).toLocaleString()}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Delivery Address & Notes */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-lightBg/40 dark:bg-[#181818] p-3.5 rounded-2xl border border-lightBorder/60 dark:border-[#252525]">
                    <div>
                      <span className="font-bold text-lightTextSecondary dark:text-darkTextSecondary block mb-1 flex items-center gap-1">
                        <MapPin size={12} className="text-darkBlue dark:text-cyan" /> Delivery Destination:
                      </span>
                      <p className="text-lightText dark:text-darkText font-medium">
                        {order.delivery_address || 'Address registered on profile'}
                      </p>
                    </div>

                    {order.notes && (
                      <div>
                        <span className="font-bold text-lightTextSecondary dark:text-darkTextSecondary block mb-1">
                          Delivery Instructions:
                        </span>
                        <p className="text-lightText dark:text-darkText italic">
                          "{order.notes}"
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Footer Actions */}
                <div className="p-4 bg-lightBg/30 dark:bg-[#141414] border-t border-lightBorder dark:border-darkBorder flex flex-wrap items-center justify-between gap-3">
                  {/* WhatsApp Support button for this specific order */}
                  <a
                    href={`https://wa.me/${cleanAqibPhone}?text=Hello%20Aqib,%20I%20am%20inquiring%20about%20my%20Order%20%23${order.id}%20(Total:%20PKR%20${order.total_price}).`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#25D366] hover:bg-[#20ba5a] text-white font-bold text-xs shadow-xs transition-colors"
                  >
                    <WhatsAppIcon size={14} />
                    <span>Ask Aqib on WhatsApp</span>
                  </a>

                  {/* Cancel button if order is still Pending */}
                  {order.status === 'Pending' && (
                    <button
                      onClick={() => handleCancelOrder(order.id)}
                      disabled={cancellingId === order.id}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-rose-500/30 hover:bg-rose-500/10 text-rose-600 dark:text-rose-400 font-bold text-xs transition-colors disabled:opacity-50"
                    >
                      {cancellingId === order.id ? (
                        <>
                          <Loader2 size={12} className="animate-spin" />
                          <span>Cancelling...</span>
                        </>
                      ) : (
                        <>
                          <XCircle size={13} />
                          <span>Cancel Order</span>
                        </>
                      )}
                    </button>
                  )}
                </div>

              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default OrderHistory;
