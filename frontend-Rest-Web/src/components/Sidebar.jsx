import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  UtensilsCrossed,
  ClipboardList,
  UserCircle,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

const SidebarLink = ({ to, icon: Icon, label, collapsed }) => (
  <NavLink
    to={to}
    className={({ isActive }) => `
      flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300
      ${isActive
        ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/30'
        : 'text-gray-600 dark:text-dark-muted hover:bg-gray-100 dark:hover:bg-[#141414] hover:text-primary-500'}
    `}
  >
    <Icon size={22} className="shrink-0" />
    {!collapsed && <span className="font-medium">{label}</span>}
  </NavLink>
);

const Sidebar = ({ collapsed, setCollapsed }) => {
  const { logout, restaurant } = useAuth();
  const { t } = useLanguage();

  return (
    <aside
      className={`
        fixed left-0 top-0 h-screen bg-white dark:bg-dark-bg border-r border-gray-200 dark:border-dark-border
        transition-all duration-300 z-50 flex flex-col
        ${collapsed ? 'w-20' : 'w-64'}
      `}
    >
      {/* Logo Section */}
      <div className="p-6 flex items-center gap-3">
        <div className="w-10 h-10 bg-primary-500 rounded-xl flex items-center justify-center shrink-0">
          <UtensilsCrossed className="text-white" size={24} />
        </div>
        {!collapsed && (
          <span className="text-xl font-bold bg-gradient-to-r from-primary-500 to-primary-700 bg-clip-text text-transparent">
            ResPartner
          </span>
        )}
      </div>

      {/* Toggle Button */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-10 bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border rounded-full p-1 text-gray-400 hover:text-primary-500 shadow-sm"
      >
        {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </button>

      {/* Navigation */}
      <nav className="flex-1 px-4 space-y-2 mt-4 overflow-y-auto">
        <SidebarLink to="/dashboard" icon={LayoutDashboard} label={t('sidebar.dashboard')} collapsed={collapsed} />
        <SidebarLink to="/menu" icon={UtensilsCrossed} label={t('sidebar.menu')} collapsed={collapsed} />
        <SidebarLink to="/orders" icon={ClipboardList} label={t('sidebar.orders')} collapsed={collapsed} />
        <SidebarLink to="/profile" icon={UserCircle} label={t('sidebar.profile')} collapsed={collapsed} />
        <SidebarLink to="/settings" icon={Settings} label={t('sidebar.settings')} collapsed={collapsed} />
      </nav>

      {/* Footer / Logout */}
      <div className="p-4 border-t border-gray-200 dark:border-dark-border">
        {!collapsed && (
          <div className="mb-4 px-2">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Restaurant</p>
            <p className="text-sm font-bold text-gray-900 dark:text-dark-text truncate">{restaurant?.name || 'My Kitchen'}</p>
          </div>
        )}
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 hover:bg-gray-100 dark:hover:bg-[#141414] transition-all duration-300"
        >
          <LogOut size={22} className="shrink-0" />
          {!collapsed && <span className="font-medium">{t('sidebar.logout')}</span>}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
