import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import { Loader2, Tag } from 'lucide-react';

const Stats = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [ordersRes, productsRes, discountsRes] = await Promise.all([
          api.get('/orders'),
          api.get('/products'),
          api.get('/admin/discounts').catch(() => ({ data: [] }))
        ]);
        
        const orders = ordersRes.data || [];
        const products = productsRes.data || [];
        const discounts = discountsRes.data || [];
        
        const todayOrders = orders.filter(o => new Date(o.created_at).toDateString() === new Date().toDateString());
        const revenue = todayOrders.reduce((sum, o) => sum + o.total_price, 0);
        const lowStock = products.filter(p => p.stock < 5);
        const activeOffers = discounts.filter(d => d.is_active === 1 && (!d.valid_until || new Date(d.valid_until) >= new Date()));
        
        setStats({
          todayCount: todayOrders.length,
          revenue,
          pendingCount: orders.filter(o => o.status === 'Pending').length,
          lowStock: lowStock.length,
          lowStockItems: lowStock,
          activeOffersCount: activeOffers.length
        });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-darkBlue dark:text-cyan" size={40} /></div>;

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6 text-lightText dark:text-darkText">Dashboard Overview</h2>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <div className="card p-5 border-t-4 border-t-brand-cyan">
          <h3 className="text-lightTextSecondary dark:text-darkTextSecondary text-xs font-semibold uppercase tracking-wider">Today's Orders</h3>
          <p className="text-2xl font-bold mt-2 text-lightText dark:text-darkText">{stats.todayCount}</p>
        </div>
        <div className="card p-5 border-t-4 border-t-success-light dark:border-t-success-dark">
          <h3 className="text-lightTextSecondary dark:text-darkTextSecondary text-xs font-semibold uppercase tracking-wider">Today's Revenue</h3>
          <p className="text-2xl font-bold mt-2 text-lightText dark:text-darkText">Rs {stats.revenue.toLocaleString()}</p>
        </div>
        <div className="card p-5 border-t-4 border-t-yellow-500">
          <h3 className="text-lightTextSecondary dark:text-darkTextSecondary text-xs font-semibold uppercase tracking-wider">Pending Orders</h3>
          <p className="text-2xl font-bold mt-2 text-lightText dark:text-darkText">{stats.pendingCount}</p>
        </div>
        <div className="card p-5 border-t-4 border-t-error-light dark:border-t-error-dark">
          <h3 className="text-lightTextSecondary dark:text-darkTextSecondary text-xs font-semibold uppercase tracking-wider">Low Stock Alerts</h3>
          <p className="text-2xl font-bold mt-2 text-error-light dark:text-error-dark">{stats.lowStock}</p>
        </div>
        <Link to="/admin/offers" className="card p-5 border-t-4 border-t-brandGold hover:shadow-md transition-all group cursor-pointer">
          <div className="flex items-center justify-between">
            <h3 className="text-lightTextSecondary dark:text-darkTextSecondary text-xs font-semibold uppercase tracking-wider group-hover:text-brandGold transition-colors">Offers & Discounts</h3>
            <Tag size={16} className="text-brandGold" />
          </div>
          <p className="text-2xl font-bold mt-2 text-lightText dark:text-darkText">{stats.activeOffersCount}</p>
          <span className="text-[11px] font-bold text-brandGold group-hover:underline mt-1 inline-block">Manage Offers &rarr;</span>
        </Link>
      </div>
      
      {stats.lowStockItems.length > 0 && (
        <div className="card p-6 border-l-4 border-l-error-light dark:border-l-error-dark">
          <h3 className="text-xl font-bold text-error-light dark:text-error-dark mb-4">Low Stock Items</h3>
          <ul className="space-y-2">
            {stats.lowStockItems.map(item => (
              <li key={item.id} className="flex justify-between border-b border-lightBorder dark:border-darkBorder pb-2">
                <span>{item.name}</span>
                <span className="font-bold text-error-light dark:text-error-dark">{item.stock} left</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default Stats;
