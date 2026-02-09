import React, { useState, useMemo, useEffect } from 'react';
import { createPortal } from 'react-dom';
import api from '../services/api';
import {
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  Star,
  X,
  Camera,
  ChevronDown,
  AlertCircle,
  MoreVertical,
  Layers,
  MoreHorizontal
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const MenuManagement = () => {
  const { t } = useLanguage();
  const categories = ['All', 'Starter', 'Main Course', 'Breads', 'Beverages', 'Desserts'];

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [showImageOptions, setShowImageOptions] = useState(false);

  const [editingItem, setEditingItem] = useState(null);
  const [newItem, setNewItem] = useState({
    name: '',
    category: 'Starter',
    price: '',
    status: 'Available',
    image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=120&h=120'
  });

  // Camera Refs
  const videoRef = React.useRef(null);
  const canvasRef = React.useRef(null);
  const streamRef = React.useRef(null);

  // Load items
  useEffect(() => {
    loadItems();
    return () => stopCamera(); // Cleanup on unmount
  }, []);

  const loadItems = async () => {
    setLoading(true);
    try {
      const data = await api.getMenuItems();
      setItems(data);
    } catch (err) {
      console.error("Failed to load items", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredItems = useMemo(() => {
    return items.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [items, searchTerm, selectedCategory]);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      await api.deleteMenuItem(id);
      loadItems();
    }
  };

  const handleToggleStatus = async (id, currentStatus) => {
    try {
      const newStatus = currentStatus === 'Available' ? 'Out of Stock' : 'Available';
      setItems(items.map(item => item.id === id ? { ...item, status: newStatus } : item));
      await api.updateMenuItem(id, { status: newStatus });
    } catch (err) {
      loadItems();
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (editingItem) {
        await api.updateMenuItem(editingItem.id, newItem);
      } else {
        await api.addMenuItem({ ...newItem, rating: 0 });
      }
      closeModal();
      loadItems();
    } catch (err) {
      console.error("Failed to save", err);
      const startMessage = "Failed to save item. ";
      const specificError = err.response?.data?.message || err.message || "Unknown error";
      alert(startMessage + specificError);
    }
  };

  const openModal = (item = null) => {
    if (item) {
      setEditingItem(item);
      setNewItem(item);
    } else {
      setEditingItem(null);
      setNewItem({
        name: '',
        category: 'Starter',
        price: '',
        status: 'Available',
        image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=120&h=120'
      });
    }
    setIsModalOpen(true);
    setShowImageOptions(false);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
    setShowImageOptions(false);
    stopCamera();
  };

  // --- Image Handling Logic ---

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewItem(prev => ({ ...prev, image: reader.result }));
        setShowImageOptions(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const startCamera = async () => {
    try {
      setShowImageOptions(false);
      setIsCameraOpen(true);
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      alert("Unable to access camera. Please check permissions.");
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCameraOpen(false);
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      // Set canvas dimensions to match video
      canvasRef.current.width = videoRef.current.videoWidth;
      canvasRef.current.height = videoRef.current.videoHeight;
      // Draw video frame to canvas
      context.drawImage(videoRef.current, 0, 0);
      // Convert to data URL
      const imageDataUrl = canvasRef.current.toDataURL('image/jpeg');
      setNewItem(prev => ({ ...prev, image: imageDataUrl }));
      stopCamera();
    }
  };

  return (
    <div className="max-w-[1200px] mx-auto space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-gray-200 dark:border-dark-border pb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-dark-text">{t('menu.title')}</h1>
          <p className="text-sm text-gray-500 dark:text-dark-muted mt-1">{t('menu.subtitle')}</p>
        </div>
        <button
          onClick={() => openModal()}
          className="bg-primary-500 hover:bg-primary-600 text-white px-5 py-2.5 rounded-lg flex items-center gap-2 font-medium transition-all shadow-sm active:scale-95 text-sm"
        >
          <Plus size={18} />
          <span>{t('menu.add_item')}</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col lg:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input
            type="text"
            placeholder={t('menu.search_placeholder')}
            className="w-full bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border rounded-lg pl-10 pr-4 h-10 focus:ring-2 focus:ring-primary-500/10 focus:border-primary-500 transition-all text-sm text-gray-700 dark:text-dark-text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="relative min-w-[180px]">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full appearance-none bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border rounded-lg pl-3.5 pr-10 h-10 focus:ring-2 focus:ring-primary-500/10 focus:border-primary-500 transition-all text-sm font-medium text-gray-700 dark:text-dark-text cursor-pointer"
          >
            {categories.map(cat => <option key={cat} value={cat}>{t(`menu.categories.${cat}`) || cat}</option>)}
          </select>
          <ChevronDown size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white dark:bg-dark-card rounded-lg border border-gray-200 dark:border-dark-border overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50 dark:bg-dark-bg border-b border-gray-200 dark:border-dark-border">
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider w-[400px]">{t('menu.product')}</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('menu.category')}</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('menu.price')}</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('menu.status')}</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">{t('menu.actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-dark-border">
              {filteredItems.map((item) => (
                <tr
                  key={item.id}
                  className="hover:bg-gray-50 dark:hover:bg-[#141414] transition-colors group"
                >
                  <td className="px-6 py-3">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-dark-bg border border-gray-200 dark:border-dark-border overflow-hidden shrink-0">
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900 dark:text-dark-text text-sm">{item.name}</div>
                        <div className="flex items-center gap-1 mt-0.5">
                          <Star size={10} className="text-amber-500" fill="currentColor" />
                          <span className="text-xs text-gray-500 dark:text-dark-muted font-medium">{item.rating || 'New'}</span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-3">
                    <span className="text-xs font-medium text-gray-600 dark:text-dark-muted px-2.5 py-1 bg-gray-100 dark:bg-dark-bg rounded-full border border-gray-200 dark:border-dark-border">
                      {t(`menu.categories.${item.category}`) || item.category}
                    </span>
                  </td>
                  <td className="px-6 py-3">
                    <span className="font-semibold text-gray-900 dark:text-dark-text text-sm">₹{item.price}</span>
                  </td>
                  <td className="px-6 py-3">
                    <button
                      onClick={() => handleToggleStatus(item.id, item.status)}
                      className={`text-[10px] font-bold tracking-wide uppercase px-2.5 py-1 rounded-full border transition-all
                        ${item.status === 'Available'
                          ? 'border-green-200 bg-green-50 text-green-700 dark:border-green-500/20 dark:bg-green-500/10 dark:text-green-500'
                          : 'border-red-200 bg-red-50 text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-500'}`}
                    >
                      {t(`menu.statuses.${item.status}`) || item.status}
                    </button>
                  </td>
                  <td className="px-6 py-3 text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => openModal(item)}
                        className="p-1.5 text-gray-400 hover:text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-500/10 rounded-md transition-all"
                        title="Edit"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-md transition-all"
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {filteredItems.length === 0 && (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center text-gray-400 dark:text-dark-muted">
                      <AlertCircle size={32} className="mb-3 opacity-50" />
                      <p className="text-sm font-medium">No items found matching your filters</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit/Add Modal (Portal) */}
      {isModalOpen && !isCameraOpen && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 backdrop-blur-sm bg-black/40 animate-fade-in">
          <div className="bg-white dark:bg-dark-card w-full max-w-lg rounded-xl shadow-2xl overflow-visible animate-scale-up border border-gray-100 dark:border-dark-border relative">
            <div className="px-6 py-4 flex justify-between items-center border-b border-gray-100 dark:border-dark-border">
              <h2 className="text-lg font-bold text-gray-900 dark:text-dark-text">
                {editingItem ? t('menu.modal.edit') : t('menu.modal.new')}
              </h2>
              <button onClick={closeModal} className="p-1.5 text-gray-400 hover:bg-gray-100 dark:hover:bg-dark-bg rounded-lg transition-all">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-5">
              <div className="flex items-start gap-5">
                {/* Image Picker */}
                <div className="relative shrink-0 group z-20">
                  <div
                    onClick={() => setShowImageOptions(!showImageOptions)}
                    className="relative cursor-pointer"
                  >
                    <img src={newItem.image} className="w-20 h-20 rounded-lg object-cover ring-1 ring-gray-200 dark:ring-dark-border" alt="Preview" />
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all rounded-lg">
                      <Camera size={18} className="text-white" />
                    </div>
                  </div>

                  {showImageOptions && (
                    <div className="absolute top-full left-0 mt-2 w-48 bg-white dark:bg-dark-card rounded-lg shadow-xl border border-gray-100 dark:border-dark-border overflow-hidden animate-slide-up origin-top-left z-50">
                      <label className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-dark-hover cursor-pointer transition-colors text-xs font-medium text-gray-700 dark:text-dark-text">
                        <Layers size={14} className="text-primary-500" />
                        <span>{t('menu.modal.upload_photo')}</span>
                        <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
                      </label>
                      <button
                        type="button"
                        onClick={startCamera}
                        className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-dark-hover cursor-pointer transition-colors text-xs font-medium text-gray-700 dark:text-dark-text text-left"
                      >
                        <Camera size={14} className="text-primary-500" />
                        <span>{t('menu.modal.take_photo')}</span>
                      </button>
                    </div>
                  )}
                </div>

                <div className="flex-1 space-y-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">{t('menu.modal.item_name')}</label>
                    <input
                      required
                      type="text"
                      className="w-full h-9 bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-dark-border rounded-lg px-3 focus:ring-2 focus:ring-primary-500/10 focus:border-primary-500 transition-all font-medium text-sm"
                      value={newItem.name}
                      onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">{t('menu.price')} (₹)</label>
                    <input
                      required
                      type="number"
                      className="w-full h-9 bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-dark-border rounded-lg px-3 focus:ring-2 focus:ring-primary-500/10 focus:border-primary-500 transition-all font-medium text-sm"
                      value={newItem.price}
                      onChange={(e) => setNewItem({ ...newItem, price: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">{t('menu.category')}</label>
                  <div className="relative">
                    <select
                      className="w-full h-9 bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-dark-border rounded-lg px-3 appearance-none focus:ring-2 focus:ring-primary-500/10 focus:border-primary-500 transition-all font-medium text-sm"
                      value={newItem.category}
                      onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                    >
                      {categories.filter(c => c !== 'All').map(cat => <option key={cat} value={cat}>{t(`menu.categories.${cat}`) || cat}</option>)}
                    </select>
                    <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">{t('menu.status')}</label>
                  <div className="relative">
                    <select
                      className="w-full h-9 bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-dark-border rounded-lg px-3 appearance-none focus:ring-2 focus:ring-primary-500/10 focus:border-primary-500 transition-all font-medium text-sm"
                      value={newItem.status}
                      onChange={(e) => setNewItem({ ...newItem, status: e.target.value })}
                    >
                      <option value="Available">{t('menu.statuses.Available')}</option>
                      <option value="Out of Stock">{t('menu.statuses.Out of Stock')}</option>
                    </select>
                    <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 h-10 rounded-lg font-bold text-sm text-gray-500 hover:bg-gray-50 dark:hover:bg-dark-bg transition-all"
                >
                  {t('menu.modal.cancel')}
                </button>
                <button
                  type="submit"
                  className="flex-[2] h-10 bg-primary-500 hover:bg-primary-600 text-white rounded-lg font-bold text-sm shadow-sm transition-all active:scale-95"
                >
                  {editingItem ? t('menu.modal.save') : t('menu.modal.add')}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* Camera (Portal) */}
      {isCameraOpen && createPortal(
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/90 animate-fade-in">
          <div className="relative w-full max-w-2xl bg-black rounded-xl overflow-hidden shadow-2xl ring-1 ring-gray-800">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="w-full h-auto aspect-video bg-black"
            />
            <canvas ref={canvasRef} className="hidden" />

            <div className="absolute bottom-6 left-0 right-0 flex items-center justify-center gap-6">
              <button
                onClick={stopCamera}
                className="p-4 rounded-full bg-white/10 text-white hover:bg-white/20 transition-all backdrop-blur-md"
              >
                <X size={24} />
              </button>
              <button
                onClick={capturePhoto}
                className="p-5 rounded-full bg-primary-500 text-white hover:bg-primary-600 shadow-lg shadow-primary-500/50 hover:scale-105 transition-all"
              >
                <Camera size={28} />
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default MenuManagement;
