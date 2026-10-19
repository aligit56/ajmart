import React, { useContext } from 'react';
import { Routes, Route, NavLink, Navigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { Package, ListOrdered, LayoutDashboard, FolderTree, Sliders, Video, Settings as SettingsIcon } from 'lucide-react';
import Products from './Products';
import Orders from './Orders';
import Stats from './Stats';
import Categories from './Categories';
import HeroSlides from './HeroSlides';
import FeaturedVideosAdmin from './FeaturedVideosAdmin';
import SettingsAdmin from './SettingsAdmin';

const AdminDashboard = () => {
  const { user } = useContext(AuthContext);
  const location = useLocation();

  if (!user || user.role !== 'admin') {
    return <Navigate to="/login" replace />;
  }

  const navItems = [
    { name: 'Dashboard', path: '/admin', icon: <LayoutDashboard size={20} /> },
    { name: 'Products', path: '/admin/products', icon: <Package size={20} /> },
    { name: 'Categories', path: '/admin/categories', icon: <FolderTree size={20} /> },
    { name: 'Orders', path: '/admin/orders', icon: <ListOrdered size={20} /> },
    { name: 'Hero Slides', path: '/admin/hero-slides', icon: <Sliders size={20} /> },
    { name: 'Featured Videos', path: '/admin/featured-videos', icon: <Video size={20} /> },
    { name: 'Store Settings', path: '/admin/settings', icon: <SettingsIcon size={20} /> },
  ];

  return (
    <div className="flex flex-col md:flex-row gap-6">
      {/* Sidebar */}
      <div className="w-full md:w-64 bg-lightCard dark:bg-darkCard border border-lightBorder dark:border-darkBorder rounded-2xl p-4 h-fit shadow-sm">
        <h2 className="text-xl font-bold mb-6 text-lightBlue dark:text-aqua border-b border-lightBorder dark:border-darkBorder pb-4">
          Admin Panel
        </h2>
        <nav className="space-y-1.5">
          {navItems.map(item => {
            const isActive = location.pathname === item.path || (item.path !== '/admin' && location.pathname.startsWith(item.path));
            return (
              <NavLink 
                key={item.name} 
                to={item.path}
                end={item.path === '/admin'}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl font-medium text-sm transition-colors ${
                  isActive 
                    ? 'bg-darkBlue dark:bg-cyan/20 text-darkBlue dark:text-cyan font-bold shadow-sm' 
                    : 'text-lightTextSecondary dark:text-darkTextSecondary hover:bg-lightBorder/60 dark:hover:bg-darkBorder/60 hover:text-lightText dark:hover:text-darkText'
                }`}
              >
                {item.icon} {item.name}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-grow">
        <Routes>
          <Route path="/" element={<Stats />} />
          <Route path="/products" element={<Products />} />
          <Route path="/categories" element={<Categories />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/hero-slides" element={<HeroSlides />} />
          <Route path="/featured-videos" element={<FeaturedVideosAdmin />} />
          <Route path="/settings" element={<SettingsAdmin />} />
        </Routes>
      </div>
    </div>
  );
};

export default AdminDashboard;
