import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Bell, Moon, Sun, Menu } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const Navbar = ({ onMenuClick }) => {
  const navigate = useNavigate();
  const { isDarkMode, toggleTheme } = useTheme();
  const [showNotifications, setShowNotifications] = useState(false);

  const notifications = [
    { id: 1, title: 'New Order #1234', desc: 'New order received from Alex Johnson', time: '2 mins ago' },
    { id: 2, title: 'Low Stock Alert', desc: 'Butter Chicken is running low on stock', time: '1 hour ago' },
    { id: 3, title: 'Order Delivered', desc: 'Order #1230 has been successfully delivered', time: '3 hours ago' },
  ];

  const notificationRef = React.useRef(null);

  React.useEffect(() => {
    function handleClickOutside(event) {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <header className="sticky top-0 w-full h-16 bg-white/80 dark:bg-[#222222]/90 backdrop-blur-md border-b border-gray-200 dark:border-dark-border z-40 transition-all duration-300">
      <div className="h-full px-6 flex items-center justify-between">
        {/* Mobile Menu Toggle */}
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 text-gray-600 dark:text-dark-muted hover:bg-gray-100 dark:hover:bg-dark-border rounded-lg"
        >
          <Menu size={24} />
        </button>

        {/* Search Bar */}
        <div className="hidden md:flex items-center flex-1 max-w-md bg-gray-100 dark:bg-dark-bg px-4 py-2 rounded-xl border border-transparent focus-within:border-primary-500/30 transition-all">
          <Search size={18} className="text-gray-400" />
          <input
            type="text"
            placeholder="Search orders, dishes..."
            className="ml-3 bg-transparent border-none outline-none text-gray-900 dark:text-dark-text w-full placeholder:text-gray-400"
          />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2.5 text-gray-600 dark:text-dark-muted hover:bg-gray-100 dark:hover:bg-[#141414] rounded-xl transition-all"
            title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>

          {/* Notifications */}
          <div className="relative" ref={notificationRef}>
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2.5 text-gray-600 dark:text-dark-muted hover:bg-gray-100 dark:hover:bg-[#141414] rounded-xl transition-all"
            >
              <Bell size={20} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-primary-500 rounded-full border-2 border-white dark:border-dark-card"></span>
            </button>

            {/* Notification Dropdown */}
            {showNotifications && (
              <div className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-dark-card rounded-xl shadow-xl border border-gray-100 dark:border-dark-border overflow-hidden animate-slide-up z-50">
                <div className="p-4 border-b border-gray-100 dark:border-dark-border flex justify-between items-center">
                  <h3 className="font-bold text-gray-900 dark:text-dark-text">Notifications</h3>
                  <span className="text-xs font-medium text-primary-500 cursor-pointer">Mark all read</span>
                </div>
                <div className="max-h-[300px] overflow-y-auto">
                  {notifications.map((notif) => (
                    <div key={notif.id} className="p-4 hover:bg-gray-50 dark:hover:bg-[#141414] transition-colors cursor-pointer border-b border-gray-50 dark:border-dark-border last:border-0">
                      <div className="flex gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/20 flex items-center justify-center shrink-0 text-primary-500">
                          <Bell size={18} />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900 dark:text-dark-text">{notif.title}</p>
                          <p className="text-xs text-gray-500 dark:text-dark-muted mt-0.5">{notif.desc}</p>
                          <p className="text-[10px] text-gray-400 mt-2">{notif.time}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="p-3 text-center border-t border-gray-100 dark:border-dark-border bg-gray-50 dark:bg-dark-bg/50">
                  <span className="text-xs font-bold text-gray-500 cursor-pointer hover:text-primary-500 transition-colors">View All Notifications</span>
                </div>
              </div>
            )}
          </div>

          {/* Profile Quick Access */}
          <div className="ml-2 pl-4 border-l border-gray-200 dark:border-dark-border flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-semibold text-primary-500">Online</p>
              <p className="text-sm font-bold text-gray-900 dark:text-dark-text">Admin Panel</p>
            </div>
            <button
              onClick={() => navigate('/profile')}
              className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-500 font-bold cursor-pointer hover:bg-primary-200 dark:hover:bg-primary-900/50 transition-all"
            >
              A
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
