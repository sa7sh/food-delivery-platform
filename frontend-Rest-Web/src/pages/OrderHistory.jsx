import React, { useState, useMemo, useEffect } from 'react';
import api from '../services/api';
import {
  Search,
  Filter,
  ArrowUpRight,
  ArrowDownLeft,
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  MoreVertical,
  ChevronDown,
  Download,
  Eye,
  Package
} from 'lucide-react';

const OrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [dateFilter, setDateFilter] = useState('All Time');

  // Load orders
  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const data = await api.getOrders();
      setOrders(data);
    } catch (err) {
      console.error("Failed to load orders", err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id, newStatus) => {
    try {
      // Optimistic update
      setOrders(orders.map(order =>
        order.id === id ? { ...order, status: newStatus } : order
      ));
      await api.updateOrderStatus(id, newStatus);
    } catch (err) {
      loadOrders(); // Revert on failure
    }
  };

  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      const matchesSearch =
        (order.id && order.id.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (order.customer && order.customer.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesStatus = statusFilter === 'All' || order.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [orders, searchTerm, statusFilter]);

  // Status Badge Helper
  const getStatusColor = (status) => {
    switch (status) {
      case 'Delivered': return 'bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-500 border-green-200 dark:border-green-500/20';
      case 'Preparing': return 'bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-500 border-blue-200 dark:border-blue-500/20';
      case 'Pending': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-500/10 dark:text-yellow-500 border-yellow-200 dark:border-yellow-500/20';
      case 'Cancelled': return 'bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-500 border-red-200 dark:border-red-500/20';
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-500/10 dark:text-gray-500 border-gray-200 dark:border-gray-500/20';
    }
  };

  const exportToCSV = () => {
    // Define headers
    const headers = ['Order ID', 'Customer', 'Items', 'Amount', 'Status', 'Date'];

    // Map data to CSV rows
    const rows = orders.map(order => [
      order.id,
      order.customer,
      order.items,
      order.amount,
      order.status,
      order.time
    ]);

    // Combine headers and rows
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    // Create and trigger download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', 'order_history.csv');
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-gray-100 dark:border-dark-border pb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-dark-text tracking-tight mb-2">Order History</h1>
          <p className="text-gray-500 dark:text-dark-muted font-medium">Track and manage your restaurant's order fulfillment.</p>
        </div>
        <button onClick={exportToCSV} className="btn-secondary flex items-center gap-2">
          <Download size={18} />
          <span>Export CSV</span>
        </button>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search by Order ID or Customer..."
            className="w-full bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border rounded-xl pl-12 pr-4 h-12 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="relative">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border rounded-xl pl-4 pr-10 h-12 appearance-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all font-medium text-gray-700 dark:text-dark-text"
          >
            <option value="All">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="Preparing">Preparing</option>
            <option value="Delivered">Delivered</option>
            <option value="Cancelled">Cancelled</option>
          </select>
          <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        </div>
        <div className="relative">
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="w-full bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border rounded-xl pl-4 pr-10 h-12 appearance-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all font-medium text-gray-700 dark:text-dark-text"
          >
            <option>All Time</option>
            <option>Today</option>
            <option>Yesterday</option>
            <option>Last 7 Days</option>
          </select>
          <Calendar size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white dark:bg-dark-card rounded-2xl border border-gray-200 dark:border-dark-border overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 dark:bg-dark-bg border-b border-gray-100 dark:border-dark-border">
                <th className="p-6 text-xs font-bold text-gray-500 uppercase tracking-wider">Order ID</th>
                <th className="p-6 text-xs font-bold text-gray-500 uppercase tracking-wider">Customer</th>
                <th className="p-6 text-xs font-bold text-gray-500 uppercase tracking-wider">Items</th>
                <th className="p-6 text-xs font-bold text-gray-500 uppercase tracking-wider">Amount</th>
                <th className="p-6 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="p-6 text-xs font-bold text-gray-500 uppercase tracking-wider">Date</th>
                <th className="p-6 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-dark-border">
              {filteredOrders.length > 0 ? (
                filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-[#141414] transition-colors group">
                    <td className="p-6 font-bold text-primary-500 text-sm">
                      {order.id}
                    </td>
                    <td className="p-6">
                      <div className="font-semibold text-gray-900 dark:text-dark-text text-sm">{order.customer}</div>
                      <div className="text-xs text-gray-400 mt-0.5">Premium Customer</div>
                    </td>
                    <td className="p-6">
                      <div className="text-sm text-gray-600 dark:text-dark-muted font-medium">
                        {order.items} Items
                      </div>
                    </td>
                    <td className="p-6 font-bold text-gray-900 dark:text-dark-text text-sm">
                      ₹{order.amount}
                    </td>
                    <td className="p-6">
                      <select
                        value={order.status}
                        onChange={(e) => handleStatusUpdate(order.id, e.target.value)}
                        className={`text-xs font-bold px-3 py-1.5 rounded-full border border-opacity-20 cursor-pointer appearance-none outline-none transition-all ${getStatusColor(order.status)}`}
                      >
                        <option value="Pending">Pending</option>
                        <option value="Preparing">Preparing</option>
                        <option value="Ready">Ready</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </td>
                    <td className="p-6 text-sm text-gray-500 dark:text-dark-muted font-medium">
                      {order.time}
                    </td>
                    <td className="p-6 text-right">
                      <button className="p-2 hover:bg-gray-100 dark:hover:bg-dark-border rounded-lg text-gray-400 hover:text-primary-500 transition-all">
                        <Eye size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="p-12 text-center text-gray-400">
                    <div className="flex flex-col items-center justify-center">
                      <Package size={32} className="mb-2 opacity-20" />
                      <p>No orders found matching your criteria.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default OrderHistory;
