import React, { useEffect, useState } from 'react';
import api from '../../api/axios';
import { 
  Loader2, CheckCircle2, XCircle, Clock, Truck, Package, 
  Phone, Mail, MapPin, Eye, Search, Filter, AlertCircle, 
  X, User, Calendar, ExternalLink, RefreshCw
} from 'lucide-react';
import { WhatsAppIcon } from '../../components/SocialIcons';
import toast from 'react-hot-toast';

const STATUS_CONFIG = {
  'Pending': {
    label: 'Pending',
    color: 'bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800/60',
    icon: Clock
  },
  'Confirmed': {
    label: 'Confirmed',
    color: 'bg-blue-100 text-blue-900 border-blue-300 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800/60',
    icon: CheckCircle2
  },
  'Processing': {
    label: 'Processing',
    color: 'bg-indigo-100 text-indigo-900 border-indigo-300 dark:bg-indigo-950/60 dark:text-indigo-300 dark:border-indigo-800/60',
    icon: Package
  },
  'Out for Delivery': {
    label: 'Out for Delivery',
    color: 'bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800/60',
    icon: Truck
  },
  'Delivered': {
    label: 'Delivered',
    color: 'bg-emerald-100 text-emerald-900 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800/60',
    icon: CheckCircle2
  },
  'Cancelled': {
    label: 'Cancelled',
    color: 'bg-rose-100 text-rose-900 border-rose-300 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800/60',
    icon: XCircle
  }
};

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await api.get('/orders');
      setOrders(res.data || []);
      // If modal is open, refresh selected order
      if (selectedOrder) {
        const updated = (res.data || []).find(o => o.id === selectedOrder.id);
        if (updated) setSelectedOrder(updated);
      }
    } catch (err) {
      console.error('Failed to fetch orders:', err);
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const updateStatus = async (id, newStatus) => {
    try {
      setUpdatingId(id);
      await api.put(`/orders/${id}/status`, { status: newStatus });
      toast.success(`Order #${id} marked as ${newStatus}`);
      await fetchOrders();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.error || "Failed to update order status");
    } finally {
      setUpdatingId(null);
    }
  };

  // Filter orders by status and search
  const filteredOrders = orders.filter(o => {
    const matchesStatus = statusFilter === 'All' || o.status === statusFilter;
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch = !query || 
      o.id.toString().includes(query) ||
      (o.customer_name || o.user_name || '').toLowerCase().includes(query) ||
      (o.customer_phone || o.phone || '').includes(query) ||
      (o.customer_email || '').toLowerCase().includes(query) ||
      (o.delivery_address || '').toLowerCase().includes(query);
    return matchesStatus && matchesSearch;
  });

  // Calculate order counts for stat tabs
  const stats = {
    all: orders.length,
    pending: orders.filter(o => o.status === 'Pending').length,
    confirmed: orders.filter(o => o.status === 'Confirmed' || o.status === 'Processing').length,
    outForDelivery: orders.filter(o => o.status === 'Out for Delivery').length,
    delivered: orders.filter(o => o.status === 'Delivered').length,
    cancelled: orders.filter(o => o.status === 'Cancelled').length
  };

  const getCleanPhone = (phone) => {
    if (!phone) return '';
    return phone.replace(/\D/g, '').replace(/^0/, '92');
  };

  return (
    <div className="space-y-6">
      {/* Header with Title and Refresh */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-lightText dark:text-darkText tracking-tight">
            Order Management & Dispatch
          </h2>
          <p className="text-xs sm:text-sm text-lightTextSecondary dark:text-darkTextSecondary mt-0.5">
            Review customer orders, confirm dispatch, update delivery statuses, and notify customers.
          </p>
        </div>
        <button
          onClick={fetchOrders}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-lightBorder dark:border-[#333] hover:bg-lightBg dark:hover:bg-[#222] text-xs font-bold text-lightText dark:text-darkText transition-colors self-start sm:self-auto"
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          <span>Refresh Orders</span>
        </button>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <button
          onClick={() => setStatusFilter('All')}
          className={`p-3 rounded-2xl border text-left transition-all ${
            statusFilter === 'All'
              ? 'bg-darkBlue/10 dark:bg-cyan/15 border-darkBlue dark:border-cyan shadow-sm'
              : 'bg-lightCard dark:bg-darkCard border-lightBorder dark:border-darkBorder hover:border-darkBlue/50'
          }`}
        >
          <div className="text-[11px] font-bold uppercase tracking-wider text-lightTextSecondary dark:text-darkTextSecondary">All Orders</div>
          <div className="text-2xl font-black text-lightText dark:text-darkText mt-0.5">{stats.all}</div>
        </button>

        <button
          onClick={() => setStatusFilter('Pending')}
          className={`p-3 rounded-2xl border text-left transition-all ${
            statusFilter === 'Pending'
              ? 'bg-amber-500/15 border-amber-500 shadow-sm'
              : 'bg-lightCard dark:bg-darkCard border-lightBorder dark:border-darkBorder hover:border-amber-500/50'
          }`}
        >
          <div className="text-[11px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 flex items-center gap-1">
            <Clock size={12} /> Pending
          </div>
          <div className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-0.5">{stats.pending}</div>
        </button>

        <button
          onClick={() => setStatusFilter('Confirmed')}
          className={`p-3 rounded-2xl border text-left transition-all ${
            statusFilter === 'Confirmed'
              ? 'bg-blue-500/15 border-blue-500 shadow-sm'
              : 'bg-lightCard dark:bg-darkCard border-lightBorder dark:border-darkBorder hover:border-blue-500/50'
          }`}
        >
          <div className="text-[11px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 flex items-center gap-1">
            <CheckCircle2 size={12} /> Confirmed
          </div>
          <div className="text-2xl font-black text-blue-600 dark:text-blue-400 mt-0.5">{stats.confirmed}</div>
        </button>

        <button
          onClick={() => setStatusFilter('Out for Delivery')}
          className={`p-3 rounded-2xl border text-left transition-all ${
            statusFilter === 'Out for Delivery'
              ? 'bg-amber-100 dark:bg-amber-950/60 border-amber-500 shadow-sm'
              : 'bg-lightCard dark:bg-darkCard border-lightBorder dark:border-darkBorder hover:border-amber-500/50'
          }`}
        >
          <div className="text-[11px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400 flex items-center gap-1">
            <Truck size={12} /> Dispatch
          </div>
          <div className="text-2xl font-black text-amber-700 dark:text-amber-400 mt-0.5">{stats.outForDelivery}</div>
        </button>

        <button
          onClick={() => setStatusFilter('Delivered')}
          className={`p-3 rounded-2xl border text-left transition-all ${
            statusFilter === 'Delivered'
              ? 'bg-emerald-500/15 border-emerald-500 shadow-sm'
              : 'bg-lightCard dark:bg-darkCard border-lightBorder dark:border-darkBorder hover:border-emerald-500/50'
          }`}
        >
          <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
            <CheckCircle2 size={12} /> Delivered
          </div>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-0.5">{stats.delivered}</div>
        </button>

        <button
          onClick={() => setStatusFilter('Cancelled')}
          className={`p-3 rounded-2xl border text-left transition-all ${
            statusFilter === 'Cancelled'
              ? 'bg-rose-500/15 border-rose-500 shadow-sm'
              : 'bg-lightCard dark:bg-darkCard border-lightBorder dark:border-darkBorder hover:border-rose-500/50'
          }`}
        >
          <div className="text-[11px] font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400 flex items-center gap-1">
            <XCircle size={12} /> Cancelled
          </div>
          <div className="text-2xl font-black text-rose-600 dark:text-rose-400 mt-0.5">{stats.cancelled}</div>
        </button>
      </div>

      {/* Search & Status Filter Bar */}
      <div className="bg-lightCard dark:bg-darkCard p-4 rounded-2xl border border-lightBorder dark:border-darkBorder flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 shadow-sm">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search by Order #, Customer Name, Phone, Email, or Address..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-field pl-10 pr-4 py-2 text-sm w-full rounded-xl"
          />
          <Search className="absolute left-3.5 top-3 text-lightTextSecondary dark:text-darkTextSecondary" size={16} />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-2.5 text-xs text-lightTextSecondary hover:text-lightText"
            >
              Clear
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Filter size={15} className="text-lightTextSecondary dark:text-darkTextSecondary hidden sm:block" />
          <span className="text-xs font-bold text-lightTextSecondary dark:text-darkTextSecondary hidden sm:block">Filter:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-lightBg dark:bg-darkBg border border-lightBorder dark:border-darkBorder rounded-xl px-3 py-2 text-xs font-semibold text-lightText dark:text-darkText outline-none focus:border-darkBlue dark:focus:border-cyan"
          >
            <option value="All">All Statuses ({stats.all})</option>
            <option value="Pending">Pending ({stats.pending})</option>
            <option value="Confirmed">Confirmed ({stats.confirmed})</option>
            <option value="Processing">Processing</option>
            <option value="Out for Delivery">Out for Delivery ({stats.outForDelivery})</option>
            <option value="Delivered">Delivered ({stats.delivered})</option>
            <option value="Cancelled">Cancelled ({stats.cancelled})</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin text-darkBlue dark:text-cyan" size={40} />
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="card p-12 text-center text-lightTextSecondary dark:text-darkTextSecondary space-y-2">
          <Package size={48} className="mx-auto text-gray-400 dark:text-gray-600 mb-2" />
          <p className="font-bold text-base text-lightText dark:text-darkText">No matching orders found</p>
          <p className="text-xs">Try selecting another status tab or clearing your search query.</p>
        </div>
      ) : (
        <div className="card overflow-x-auto shadow-sm">
          <table className="w-full text-left border-collapse min-w-[760px]">
            <thead>
              <tr className="bg-lightBg/60 dark:bg-darkBg/60 border-b border-lightBorder dark:border-darkBorder text-xs uppercase tracking-wider text-lightTextSecondary dark:text-darkTextSecondary font-bold">
                <th className="p-4">Order ID & Date</th>
                <th className="p-4">Customer Details</th>
                <th className="p-4">Items Preview</th>
                <th className="p-4">Total (PKR)</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Admin Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-lightBorder dark:divide-darkBorder text-sm">
              {filteredOrders.map(o => {
                const cfg = STATUS_CONFIG[o.status] || STATUS_CONFIG['Pending'];
                const StatusIcon = cfg.icon;
                const cleanPhone = getCleanPhone(o.customer_phone || o.phone);

                return (
                  <tr key={o.id} className="hover:bg-lightBg/50 dark:hover:bg-[#1a1a1a] transition-colors">
                    {/* Order ID & Date */}
                    <td className="p-4 align-top">
                      <div className="font-black text-darkBlue dark:text-cyan text-base">#{o.id}</div>
                      <div className="text-[11px] text-lightTextSecondary dark:text-darkTextSecondary flex items-center gap-1 mt-0.5">
                        <Calendar size={11} />
                        <span>{new Date(o.created_at).toLocaleDateString()}</span>
                      </div>
                      <div className="text-[10px] text-lightTextSecondary dark:text-darkTextSecondary">
                        {new Date(o.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </td>

                    {/* Customer Info */}
                    <td className="p-4 align-top">
                      <div className="flex items-center gap-1.5 font-bold text-lightText dark:text-darkText">
                        <span>{o.customer_name || o.user_name || 'Guest Customer'}</span>
                        {o.user_id ? (
                          <span className="text-[9px] font-black uppercase px-1.5 py-0.2 rounded bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                            Member
                          </span>
                        ) : (
                          <span className="text-[9px] font-black uppercase px-1.5 py-0.2 rounded bg-gray-500/10 text-gray-500 border border-gray-500/20">
                            Guest
                          </span>
                        )}
                      </div>

                      {/* Phone */}
                      <div className="text-xs text-lightTextSecondary dark:text-darkTextSecondary flex items-center gap-2 mt-1">
                        <span className="font-medium">{o.customer_phone || o.phone || 'N/A'}</span>
                        {cleanPhone && (
                          <a
                            href={`https://wa.me/${cleanPhone}?text=Hello%20${encodeURIComponent(o.customer_name || o.user_name || 'Customer')},%20this%20is%20AJMart%20regarding%20your%20Order%20%23${o.id}.`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[#25D366] hover:opacity-80 transition-opacity"
                            title="Message customer on WhatsApp"
                          >
                            <WhatsAppIcon size={14} />
                          </a>
                        )}
                      </div>

                      {/* Email if registered */}
                      {o.customer_email && (
                        <div className="text-[11px] text-lightTextSecondary dark:text-darkTextSecondary truncate max-w-[180px]">
                          {o.customer_email}
                        </div>
                      )}
                    </td>

                    {/* Items Preview */}
                    <td className="p-4 align-top">
                      {o.items && o.items.length > 0 ? (
                        <div className="space-y-1 max-w-[200px]">
                          <div className="text-xs font-semibold text-lightText dark:text-darkText line-clamp-1">
                            {o.items[0].product_name}
                            {o.items.length > 1 && <span className="text-lightTextSecondary"> +{o.items.length - 1} more</span>}
                          </div>
                          <div className="text-[11px] text-lightTextSecondary dark:text-darkTextSecondary">
                            {o.items.reduce((sum, it) => sum + it.quantity, 0)} total unit(s)
                          </div>
                        </div>
                      ) : (
                        <span className="text-xs text-lightTextSecondary">Standard Order</span>
                      )}
                    </td>

                    {/* Total Amount */}
                    <td className="p-4 align-top font-black text-darkBlue dark:text-cyan text-base">
                      PKR {o.total_price.toLocaleString()}
                    </td>

                    {/* Status Badge & Select */}
                    <td className="p-4 align-top">
                      <div className="space-y-1.5">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold border ${cfg.color}`}>
                          <StatusIcon size={12} />
                          <span>{o.status}</span>
                        </span>

                        <div>
                          <select
                            value={o.status}
                            disabled={updatingId === o.id}
                            onChange={(e) => updateStatus(o.id, e.target.value)}
                            className="bg-lightBg dark:bg-darkBg border border-lightBorder dark:border-darkBorder rounded-lg px-2 py-1 text-xs font-semibold outline-none focus:border-darkBlue dark:focus:border-cyan cursor-pointer disabled:opacity-50"
                          >
                            <option value="Pending">Pending</option>
                            <option value="Confirmed">Confirmed</option>
                            <option value="Processing">Processing</option>
                            <option value="Out for Delivery">Out for Delivery</option>
                            <option value="Delivered">Delivered</option>
                            <option value="Cancelled">Cancelled</option>
                          </select>
                        </div>
                      </div>
                    </td>

                    {/* Action Buttons */}
                    <td className="p-4 align-top text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Quick Confirm button if pending */}
                        {o.status === 'Pending' && (
                          <button
                            onClick={() => updateStatus(o.id, 'Confirmed')}
                            title="Confirm this order"
                            className="p-1.5 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 border border-blue-500/30 transition-colors"
                          >
                            <CheckCircle2 size={16} />
                          </button>
                        )}

                        {/* Quick Cancel button if not cancelled or delivered */}
                        {o.status !== 'Cancelled' && o.status !== 'Delivered' && (
                          <button
                            onClick={() => {
                              if (window.confirm(`Are you sure you want to cancel Order #${o.id}?`)) {
                                updateStatus(o.id, 'Cancelled');
                              }
                            }}
                            title="Cancel this order"
                            className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/30 transition-colors"
                          >
                            <XCircle size={16} />
                          </button>
                        )}

                        {/* View Full Order Details */}
                        <button
                          onClick={() => setSelectedOrder(o)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-lightBg dark:bg-darkBg hover:bg-darkBlue hover:text-white dark:hover:bg-cyan dark:hover:text-black border border-lightBorder dark:border-darkBorder text-xs font-bold transition-all"
                        >
                          <Eye size={13} />
                          <span>Details</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Complete Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-lightCard dark:bg-[#161616] border border-lightBorder dark:border-[#333] rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto z-50 flex flex-col">
            
            {/* Modal Header */}
            <div className="p-5 border-b border-lightBorder dark:border-[#2a2a2a] flex items-center justify-between sticky top-0 bg-lightCard dark:bg-[#161616] z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-darkBlue dark:bg-cyan text-white dark:text-black flex items-center justify-center font-black">
                  #{selectedOrder.id}
                </div>
                <div>
                  <h3 className="font-black text-lg text-lightText dark:text-darkText">
                    Order Details #{selectedOrder.id}
                  </h3>
                  <div className="text-xs text-lightTextSecondary dark:text-darkTextSecondary">
                    Placed on {new Date(selectedOrder.created_at).toLocaleString()}
                  </div>
                </div>
              </div>

              <button
                onClick={() => setSelectedOrder(null)}
                className="p-2 rounded-xl text-lightTextSecondary hover:text-lightText hover:bg-lightBg dark:hover:bg-[#252525] transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">
              
              {/* Status Update Banner */}
              <div className="p-4 rounded-2xl border border-lightBorder dark:border-[#333] bg-lightBg/50 dark:bg-[#1f1f1f] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-lightTextSecondary dark:text-darkTextSecondary">
                    Current Order Status
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black border ${STATUS_CONFIG[selectedOrder.status]?.color}`}>
                      {selectedOrder.status}
                    </span>
                  </div>
                </div>

                {/* Quick Status Changers */}
                <div className="flex flex-wrap items-center gap-2">
                  {selectedOrder.status !== 'Confirmed' && selectedOrder.status !== 'Delivered' && (
                    <button
                      onClick={() => updateStatus(selectedOrder.id, 'Confirmed')}
                      className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-colors flex items-center gap-1"
                    >
                      <CheckCircle2 size={13} /> Confirm
                    </button>
                  )}
                  {selectedOrder.status !== 'Out for Delivery' && selectedOrder.status !== 'Delivered' && selectedOrder.status !== 'Cancelled' && (
                    <button
                      onClick={() => updateStatus(selectedOrder.id, 'Out for Delivery')}
                      className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs transition-colors flex items-center gap-1 shadow-sm"
                    >
                      <Truck size={13} /> Dispatch
                    </button>
                  )}
                  {selectedOrder.status !== 'Delivered' && selectedOrder.status !== 'Cancelled' && (
                    <button
                      onClick={() => updateStatus(selectedOrder.id, 'Delivered')}
                      className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors flex items-center gap-1"
                    >
                      <CheckCircle2 size={13} /> Mark Delivered
                    </button>
                  )}
                  {selectedOrder.status !== 'Cancelled' && selectedOrder.status !== 'Delivered' && (
                    <button
                      onClick={() => {
                        if (window.confirm(`Cancel order #${selectedOrder.id}?`)) {
                          updateStatus(selectedOrder.id, 'Cancelled');
                        }
                      }}
                      className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs transition-colors flex items-center gap-1"
                    >
                      <XCircle size={13} /> Cancel
                    </button>
                  )}
                </div>
              </div>

              {/* Customer Dossier Card */}
              <div className="p-4 rounded-2xl border border-lightBorder dark:border-[#333] space-y-3">
                <div className="text-xs font-bold uppercase tracking-wider text-lightTextSecondary dark:text-darkTextSecondary border-b border-lightBorder dark:border-[#2a2a2a] pb-2 flex items-center justify-between">
                  <span>Customer Identification</span>
                  <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-darkBlue/10 dark:bg-cyan/15 text-darkBlue dark:text-cyan">
                    {selectedOrder.user_id ? `Registered Member (ID: ${selectedOrder.user_id})` : 'Guest Order'}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-xs text-lightTextSecondary dark:text-darkTextSecondary block">Customer Name</span>
                    <strong className="text-lightText dark:text-darkText font-bold text-base">
                      {selectedOrder.customer_name || selectedOrder.user_name || 'Guest Customer'}
                    </strong>
                  </div>

                  <div>
                    <span className="text-xs text-lightTextSecondary dark:text-darkTextSecondary block">WhatsApp Phone</span>
                    <div className="flex items-center gap-2 mt-0.5">
                      <strong className="text-lightText dark:text-darkText font-bold">
                        {selectedOrder.customer_phone || selectedOrder.phone || 'N/A'}
                      </strong>
                      {getCleanPhone(selectedOrder.customer_phone || selectedOrder.phone) && (
                        <a
                          href={`https://wa.me/${getCleanPhone(selectedOrder.customer_phone || selectedOrder.phone)}?text=Hello%20${encodeURIComponent(selectedOrder.customer_name || selectedOrder.user_name || 'Customer')},%20this%20is%20AJMart%20updating%20you%20that%20your%20Order%20%23${selectedOrder.id}%20is%20currently%20*${selectedOrder.status}*.`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#25D366] text-white text-[10px] font-bold shadow-xs hover:bg-[#20ba5a]"
                        >
                          <WhatsAppIcon size={12} />
                          <span>WhatsApp</span>
                        </a>
                      )}
                    </div>
                  </div>

                  {selectedOrder.customer_email && (
                    <div className="sm:col-span-2">
                      <span className="text-xs text-lightTextSecondary dark:text-darkTextSecondary block">Email Address</span>
                      <span className="text-lightText dark:text-darkText font-medium">
                        {selectedOrder.customer_email}
                      </span>
                    </div>
                  )}

                  <div className="sm:col-span-2 pt-1 border-t border-lightBorder/50 dark:border-[#222]">
                    <span className="text-xs text-lightTextSecondary dark:text-darkTextSecondary block">Delivery Address</span>
                    <div className="flex items-start gap-1.5 mt-1 text-lightText dark:text-darkText font-medium">
                      <MapPin size={15} className="text-darkBlue dark:text-cyan flex-shrink-0 mt-0.5" />
                      <span>{selectedOrder.delivery_address || 'No address provided'}</span>
                    </div>
                  </div>

                  {selectedOrder.notes && (
                    <div className="sm:col-span-2 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs">
                      <span className="font-bold text-amber-700 dark:text-amber-400 block mb-0.5">Customer Delivery Notes:</span>
                      <p className="text-lightText dark:text-darkText italic">"{selectedOrder.notes}"</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Items in Order */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-lightTextSecondary dark:text-darkTextSecondary">
                  Purchased Grocery Items ({selectedOrder.items?.length || 0})
                </h4>

                {selectedOrder.items && selectedOrder.items.length > 0 ? (
                  <div className="divide-y divide-lightBorder dark:divide-[#2a2a2a] border border-lightBorder dark:border-[#2a2a2a] rounded-2xl overflow-hidden">
                    {selectedOrder.items.map((item, idx) => (
                      <div key={idx} className="p-3 bg-lightCard dark:bg-[#1a1a1a] flex items-center justify-between gap-3 text-sm">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-12 h-12 rounded-xl bg-lightBg dark:bg-black p-1 flex items-center justify-center overflow-hidden flex-shrink-0 border border-lightBorder dark:border-[#333]">
                            {item.image_url ? (
                              <img src={item.image_url} alt={item.product_name} className="w-full h-full object-contain" />
                            ) : (
                              <Package size={20} className="text-gray-400" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <div className="font-bold text-lightText dark:text-darkText truncate">{item.product_name}</div>
                            {item.variant_name && (
                              <div className="text-xs text-lightTextSecondary dark:text-darkTextSecondary">
                                Size / Variant: {item.variant_name}
                              </div>
                            )}
                            <div className="text-xs text-lightTextSecondary dark:text-darkTextSecondary">
                              PKR {item.price} × {item.quantity}
                            </div>
                          </div>
                        </div>

                        <div className="font-black text-right text-darkBlue dark:text-cyan">
                          PKR {(item.price * item.quantity).toLocaleString()}
                        </div>
                      </div>
                    ))}

                    {/* Total Summary Row */}
                    <div className="p-4 bg-lightBg/80 dark:bg-black/40 flex items-center justify-between font-black text-base">
                      <span>Grand Total Payable:</span>
                      <span className="text-xl text-darkBlue dark:text-cyan">
                        PKR {selectedOrder.total_price.toLocaleString()}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 rounded-xl bg-lightBg dark:bg-darkBg text-xs text-lightTextSecondary">
                    No itemized product lines attached to this order. Total: PKR {selectedOrder.total_price}
                  </div>
                )}
              </div>

            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-lightBorder dark:border-[#2a2a2a] bg-lightBg/50 dark:bg-[#111] flex items-center justify-between">
              <span className="text-xs text-lightTextSecondary dark:text-darkTextSecondary">
                Order status updates are immediately visible to logged-in customers.
              </span>
              <button
                onClick={() => setSelectedOrder(null)}
                className="px-4 py-2 rounded-xl bg-darkBlue dark:bg-cyan text-white dark:text-black font-bold text-xs"
              >
                Done
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;
