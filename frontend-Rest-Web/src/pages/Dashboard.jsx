import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShoppingBag,
  IndianRupee,
  Clock,
  CheckCircle2,
  Package,
  Plus,
  ArrowRight,
  UtensilsCrossed,
  Settings,
  ClipboardList,
  Power
} from 'lucide-react';

// Stats and Recent Orders will be loaded from API
const initialStats = [
  { label: "Today's Orders", value: '...', icon: ShoppingBag, color: 'primary' },
  { label: 'Revenue', value: '...', icon: IndianRupee, color: 'green' },
  { label: 'Active Items', value: '...', icon: UtensilsCrossed, color: 'blue' },
  { label: 'Pending Orders', value: '...', icon: Clock, color: 'yellow' },
];

const QuickActionCard = ({ title, icon: Icon, onClick, color }) => (
  <button
    onClick={onClick}
    className="card p-6 flex items-center gap-4 hover:translate-y-[-4px] group transition-all"
  >
    <div className={`p-4 rounded-2xl bg-${color}-500/10 text-${color}-500 transition-all`}>
      <Icon size={24} />
    </div>
    <div className="text-left">
      <h4 className="font-bold text-gray-900 dark:text-dark-text">{title}</h4>
      <p className="text-xs text-gray-500 dark:text-dark-muted mt-1 flex items-center gap-1 group-hover:text-primary-500">
        Go to Section <ArrowRight size={12} />
      </p>
    </div>
  </button>
);

import api from '../services/api';
import { useLanguage } from '../context/LanguageContext';

const Dashboard = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = useState(true);
  const [loading, setLoading] = useState(true);
  const [statsData, setStatsData] = useState([]);
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const data = await api.getDashboardStats();

        // Update stats with real values
        setStatsData([
          { label: "Today's Orders", value: data.todayOrders.toString(), icon: ShoppingBag, color: 'primary' },
          { label: 'Revenue', value: `₹${data.revenue}`, icon: IndianRupee, color: 'green' },
          { label: 'Active Items', value: data.activeItems.toString(), icon: UtensilsCrossed, color: 'blue' },
          { label: 'Pending Orders', value: data.pendingOrders.toString(), icon: Clock, color: 'yellow' },
        ]);

        setOrders(data.recentOrders);
      } catch (error) {
        console.error("Failed to load dashboard stats", error);
      } finally {
        setLoading(false);
      }
    };
    loadDashboard();
  }, []);

  return (
    <div className="space-y-8 pb-8">
      {/* Header & Status Toggle */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-dark-text">{t('dashboard.title')}</h1>
          <p className="text-gray-500 dark:text-dark-muted mt-1">{t('dashboard.subtitle')}</p>
        </div>
        <div className="flex items-center gap-3">
          <span className={`text-sm font-bold uppercase tracking-wider ${isOpen ? 'text-green-500' : 'text-red-500'}`}>
            {isOpen ? t('dashboard.open') : t('dashboard.closed')}
          </span>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className={`w-14 h-8 rounded-full relative transition-all duration-300 ${isOpen ? 'bg-green-500' : 'bg-red-500'}`}
          >
            <div className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow-md transition-all duration-300 ${isOpen ? 'right-1' : 'left-1'} flex items-center justify-center`}>
              <Power size={14} className={isOpen ? 'text-green-500' : 'text-red-500'} />
            </div>
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsData.map((stat, idx) => (
          <div key={idx} className="card p-6 flex flex-col justify-between hover:translate-y-[-2px]">
            <div className="flex justify-between items-start mb-4">
              <div className={`p-3 rounded-2xl bg-${stat.color === 'primary' ? 'primary' : stat.color}-500/10 text-${stat.color === 'primary' ? 'primary' : stat.color}-500`}>
                <stat.icon size={24} />
              </div>
            </div>
            <div>
              <p className="text-gray-500 dark:text-dark-muted text-sm font-medium">{stat.label}</p>
              <h3 className="text-2xl font-bold mt-1 text-gray-900 dark:text-dark-text">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold">{t('dashboard.quick_actions')}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <QuickActionCard title="Add Food" icon={Plus} color="primary" onClick={() => navigate('/menu')} />
          <QuickActionCard title="View Orders" icon={ClipboardList} color="blue" onClick={() => navigate('/orders')} />
          <QuickActionCard title="Food Items" icon={UtensilsCrossed} color="green" onClick={() => navigate('/menu')} />
          <QuickActionCard title="Settings" icon={Settings} color="purple" onClick={() => navigate('/settings')} />
        </div>
      </div>

      {/* Recent Orders List */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-bold">{t('dashboard.recent_orders')}</h3>
          <button
            onClick={() => navigate('/orders')}
            className="text-primary-500 text-sm font-semibold hover:underline"
          >
            {t('dashboard.view_all')}
          </button>
        </div>
        <div className="card divide-y divide-gray-100 dark:divide-dark-border min-h-[100px]">
          {orders.length === 0 ? (
            <div className="flex items-center justify-center p-8 text-gray-500 dark:text-dark-muted">
              <p>{t('dashboard.no_orders')}</p>
            </div>
          ) : (
            orders.map((order, idx) => (
              <div key={idx} className="flex items-center gap-4 p-5 hover:bg-gray-50 dark:hover:bg-[#141414] transition-colors cursor-pointer group">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0
                  ${order.status === 'Ready' ? 'bg-green-100 text-green-600' :
                    order.status === 'Preparing' ? 'bg-purple-100 text-purple-600' : 'bg-yellow-100 text-yellow-600'}`}>
                  {order.status === 'Ready' ? <CheckCircle2 size={24} /> :
                    order.status === 'Preparing' ? <Package size={24} /> : <Clock size={24} />}
                </div>
                <div className="flex-1 flex justify-between items-center">
                  <div>
                    <p className="font-bold text-gray-900 dark:text-dark-text group-hover:text-primary-500 transition-colors">{order.customer}</p>
                    <p className="text-xs text-gray-500 dark:text-dark-muted mt-1">{order.id} • {order.items} items • {order.time}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900 dark:text-dark-text">₹{order.amount}</p>
                    <span className={`text-[10px] font-black uppercase tracking-wider
                      ${order.status === 'Ready' ? 'text-green-500' : order.status === 'Preparing' ? 'text-purple-500' : 'text-yellow-500'}`}>
                      {order.status}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

    </div>
  );
};

export default Dashboard;
