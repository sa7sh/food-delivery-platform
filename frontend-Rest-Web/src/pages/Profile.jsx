import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  Camera,
  Store,
  Mail,
  Phone,
  MapPin,
  Clock,
  Globe,
  Star,
  ShieldCheck,
  Save,
  X,
  Layers
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Profile = () => {
  const { restaurant } = useAuth();
  const [activeTab, setActiveTab] = useState('Overview');
  const [isStatusOpen, setIsStatusOpen] = useState(true);

  // Image Picker State
  const [profileImage, setProfileImage] = useState(null); // Determine initial state from props or auth context usually
  const [showImageOptions, setShowImageOptions] = useState(false);
  const [isCameraOpen, setIsCameraOpen] = useState(false);

  // Camera Refs
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const pickerRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (pickerRef.current && !pickerRef.current.contains(event.target)) {
        setShowImageOptions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      stopCamera();
    };
  }, []);

  const stats = [
    { label: 'Rating', value: '5.0', icon: Star, color: 'text-yellow-500' },
    { label: 'Total Orders', value: '1,240', icon: Store, color: 'text-primary-500' },
    { label: 'Member Since', value: 'Dec 2024', icon: ShieldCheck, color: 'text-green-500' },
  ];

  // --- Image Handling Logic ---
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result);
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
      canvasRef.current.width = videoRef.current.videoWidth;
      canvasRef.current.height = videoRef.current.videoHeight;
      context.drawImage(videoRef.current, 0, 0);
      const imageDataUrl = canvasRef.current.toDataURL('image/jpeg');
      setProfileImage(imageDataUrl);
      stopCamera();
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header / Cover */}
      <div className="relative group">
        <div className="h-48 w-full bg-gradient-to-r from-primary-500 to-primary-700 rounded-3xl overflow-hidden shadow-lg">
          <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-all duration-500"></div>
          <div className="absolute top-6 right-8 flex items-center gap-3 bg-white/10 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/20">
            <span className={`text-xs font-bold uppercase tracking-wider text-white ${isStatusOpen ? 'animate-pulse' : ''}`}>
              {isStatusOpen ? 'Accepting Orders' : 'Store Closed'}
            </span>
            <button
              onClick={() => setIsStatusOpen(!isStatusOpen)}
              className={`w-10 h-6 rounded-full relative transition-all duration-300 ${isStatusOpen ? 'bg-green-500' : 'bg-red-500'}`}
            >
              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-md transition-all duration-300 ${isStatusOpen ? 'right-1' : 'left-1'}`} />
            </button>
          </div>
        </div>
        <div className="absolute -bottom-12 left-8 flex items-end gap-6">
          <div className="relative" ref={pickerRef}>
            <div className="w-32 h-32 rounded-3xl bg-white dark:bg-dark-card p-1 shadow-xl">
              <div className="w-full h-full rounded-[20px] bg-primary-100 dark:bg-primary-900/20 flex items-center justify-center text-primary-500 overflow-hidden relative">
                {profileImage ? (
                  <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <Store size={48} />
                )}
              </div>
            </div>

            <button
              onClick={() => setShowImageOptions(!showImageOptions)}
              className="absolute -bottom-2 -right-2 p-2 bg-white dark:bg-dark-card rounded-xl shadow-lg border border-gray-100 dark:border-dark-border text-primary-500 hover:scale-110 transition-all cursor-pointer z-30"
            >
              <Camera size={18} />
            </button>

            {/* Options Popover - Positioned absolute to the parent container now */}
            {showImageOptions && (
              <div className="absolute top-full text-left left-0 mt-4 w-40 bg-white dark:bg-dark-card rounded-xl shadow-xl border border-gray-100 dark:border-dark-border overflow-hidden animate-slide-up z-50">
                <label className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-dark-hover cursor-pointer transition-colors text-xs font-bold text-gray-700 dark:text-dark-text">
                  <Layers size={14} className="text-primary-500" />
                  <span>Upload</span>
                  <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
                </label>
                <button
                  onClick={startCamera}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-dark-hover cursor-pointer transition-colors text-xs font-bold text-gray-700 dark:text-dark-text text-left"
                >
                  <Camera size={14} className="text-primary-500" />
                  <span>Camera</span>
                </button>
              </div>
            )}
          </div>
          <div className="mb-14 space-y-1">
            <h1 className="text-3xl font-bold text-white drop-shadow-md">
              {restaurant?.name || 'My Kitchen'}
            </h1>
            <p className="text-white/80 text-sm font-medium flex items-center gap-2">
              <MapPin size={14} className="text-white" />
              New York, United States
            </p>
          </div>
        </div>
      </div>

      <div className="pt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Stats & Info */}
        <div className="space-y-6">
          <div className="grid grid-cols-3 gap-4">
            {stats.map((s, i) => (
              <div key={i} className="card p-4 text-center">
                <s.icon className={`mx-auto mb-2 ${s.color}`} size={20} />
                <p className="text-lg font-bold">{s.value}</p>
                <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider font-montserrat">{s.label}</p>
              </div>
            ))}
          </div>

          <div className="card p-6 space-y-6">
            <h3 className="font-bold border-b border-gray-100 dark:border-dark-border pb-4">Business Info</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-4 text-sm">
                <div className="w-10 h-10 rounded-xl bg-gray-50 dark:bg-dark-bg flex items-center justify-center text-gray-400">
                  <Mail size={18} />
                </div>
                <div>
                  <p className="text-xs text-gray-400">Email Address</p>
                  <p className="font-bold">{restaurant?.email || 'contact@tastybites.com'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Tabs & Forms */}
        <div className="lg:col-span-2 space-y-6">
          <div className="card overflow-hidden">
            <div className="flex border-b border-gray-100 dark:border-dark-border">
              {['Overview', 'Edit Details', 'Operating Hours'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-8 py-4 text-sm font-bold transition-all relative
                    ${activeTab === tab
                      ? 'text-primary-500'
                      : 'text-gray-400 hover:text-gray-600 dark:hover:text-dark-text'}
                  `}
                >
                  {tab}
                  {activeTab === tab && (
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary-500 rounded-full mx-6 animate-scale-in"></div>
                  )}
                </button>
              ))}
            </div>

            <div className="p-8">
              {activeTab === 'Overview' && (
                <div className="space-y-8 animate-fade-in">
                  <div>
                    <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">About Restaurant</h4>
                    <p className="text-gray-600 dark:text-dark-muted leading-relaxed">
                      Tasty Bites has been serving the community with authentic flavors and fresh ingredients since 2010.
                      Our mission is to provide an unforgettable dining experience through our carefully curated menu
                      and warm hospitality. We specialize in contemporary fusion cuisine that combines traditional
                      recipes with modern techniques.
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-8">
                    <div>
                      <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Cuisines</h4>
                      <div className="flex flex-wrap gap-2">
                        {['Indian', 'Chinese', 'Continental', 'Desserts'].map((c, i) => (
                          <span key={i} className="px-3 py-1.5 bg-primary-50 dark:bg-primary-900/10 text-primary-600 dark:text-primary-400 rounded-lg text-xs font-bold ring-1 ring-primary-500/10">
                            {c}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Status</h4>
                      <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold ring-1 
                        ${isStatusOpen
                          ? 'bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-500 ring-green-500/10'
                          : 'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-500 ring-red-500/10'}`}>
                        <div className={`w-2 h-2 rounded-full ${isStatusOpen ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
                        {isStatusOpen ? 'Open for Orders' : 'Temporarily Closed'}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'Edit Details' && (
                <div className="space-y-6 animate-fade-in">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-400 uppercase">Restaurant Name</label>
                      <input type="text" defaultValue={restaurant?.name} className="input-field" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-400 uppercase">Support Email</label>
                      <input type="email" defaultValue={restaurant?.email} className="input-field" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase">Description</label>
                    <textarea rows="4" className="input-field resize-none" defaultValue="Tasty Bites has been serving the community..."></textarea>
                  </div>
                  <div className="flex justify-end pt-4">
                    <button className="btn-primary flex items-center gap-2">
                      <Save size={18} />
                      Save Changes
                    </button>
                  </div>
                </div>
              )}

              {activeTab === 'Operating Hours' && (
                <div className="space-y-4 animate-fade-in">
                  {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => (
                    <div key={day} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-dark-bg/50 rounded-2xl border border-gray-100 dark:border-dark-border">
                      <span className="font-bold text-sm w-24">{day}</span>
                      <div className="flex items-center gap-4">
                        <input type="time" defaultValue="09:00" className="bg-transparent border-none outline-none font-bold text-primary-500" />
                        <span className="text-gray-300">to</span>
                        <input type="time" defaultValue="22:00" className="bg-transparent border-none outline-none font-bold text-primary-500" />
                      </div>
                      <div className="flex items-center gap-4">
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" defaultChecked className="sr-only peer" />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-dark-border peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-500"></div>
                        </label>
                        <span className="text-xs font-bold uppercase text-gray-400 w-12 text-center">Open</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      {/* Camera Portal */}
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

export default Profile;
