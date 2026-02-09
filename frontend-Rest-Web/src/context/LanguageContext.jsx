import React, { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext();

export const translations = {
  en: {
    sidebar: {
      dashboard: "Dashboard",
      orders: "Orders",
      menu: "Menu Management",
      profile: "Your Profile",
      settings: "Settings",
      logout: "Log Out",
      ready_for_orders: "Ready for Orders"
    },
    settings: {
      title: "Settings",
      subtitle: "Configure your application preferences and security.",
      appearance: "Appearance",
      dark_mode: "Dark Mode",
      dark_mode_desc: "Customize your interface color scheme",
      language: "Language",
      language_desc: "Select your preferred language",
      interface_scale: "Interface Scale",
      interface_scale_desc: "Adjust the size of layout elements",
      security: "Security & Privacy",
      change_password: "Change Password",
      change_password_desc: "Keep your account secure with a strong password",
      two_factor: "Two-Factor Authentication",
      two_factor_desc: "Add an extra layer of security",
      privacy: "Privacy Settings",
      privacy_desc: "Manage how your data is shared",
      notifications: "Notifications",
      email_notif: "Email Notifications",
      email_notif_desc: "Receive updates about orders via email",
      push_notif: "Push Notifications",
      push_notif_desc: "Instant alerts on your browser",
      billing: "Billing & Subscription",
      payment_methods: "Payment Methods",
      payment_methods_desc: "Manage your credit cards and billing info",
      subscription: "Subscription Plan",
      subscription_desc: "You are currently on the Premium Plan",
      deactivate: "Deactivate Account"
    },
    dashboard: {
      title: "Dashboard",
      subtitle: "Manage your restaurant operations today.",
      open: "Open for Orders",
      closed: "Store Closed",
      quick_actions: "Quick Actions",
      recent_orders: "Recent Orders",
      view_all: "View All Orders",
      no_orders: "No recent orders found."
    },
    menu: {
      title: "Food Items",
      subtitle: "Manage your complete menu catalog.",
      add_item: "Add New Item",
      search_placeholder: "Search items by name...",
      product: "Product",
      category: "Category",
      price: "Price",
      status: "Status",
      actions: "Actions",
      categories: {
        All: "All",
        Starter: "Starter",
        "Main Course": "Main Course",
        Breads: "Breads",
        Beverages: "Beverages",
        Desserts: "Desserts"
      },
      statuses: {
        Available: "Available",
        "Out of Stock": "Out of Stock"
      },
      modal: {
        new: "New Menu Item",
        edit: "Edit Item",
        item_name: "Item Name",
        upload_photo: "Upload Photo",
        take_photo: "Take Photo",
        save: "Save Changes",
        add: "Add Item",
        cancel: "Cancel"
      }
    },
    profile: {
      accepting_orders: "Accepting Orders",
      store_closed: "Store Closed",
      upload: "Upload",
      camera: "Camera",
      stats: {
        rating: "Rating",
        orders: "Total Orders",
        member_since: "Member Since"
      },
      business_info: "Business Info",
      email_address: "Email Address",
      tabs: {
        overview: "Overview",
        edit: "Edit Details",
        hours: "Operating Hours"
      },
      overview: {
        about: "About Restaurant",
        description: "Tasty Bites has been serving the community with authentic flavors...",
        cuisines: "Cuisines",
        status: "Status",
        open: "Open for Orders",
        temp_closed: "Temporarily Closed"
      },
      edit: {
        name: "Restaurant Name",
        email: "Support Email",
        description: "Description",
        save: "Save Changes"
      },
      hours: {
        open: "Open",
        to: "to"
      }
    }
  },
  hi: {
    sidebar: {
      dashboard: "डैशबोर्ड",
      orders: "ऑर्डर",
      menu: "मेनू प्रबंधन",
      profile: "आपकी प्रोफाइल",
      settings: "सेटिंग्स",
      logout: "लॉग आउट",
      ready_for_orders: "ऑर्डर के लिए तैयार"
    },
    settings: {
      title: "सेटिंग्स",
      subtitle: "अपनी एप्लिकेशन प्राथमिकताएं कॉन्फ़िगर करें।",
      appearance: "दिखावट (Appearance)",
      dark_mode: "डार्क मोड",
      dark_mode_desc: "इंटरफ़ेस रंग योजना अनुकूलित करें",
      language: "भाषा (Language)",
      language_desc: "अपनी पसंदीदा भाषा चुनें",
      interface_scale: "इंटरफ़ेस स्केल",
      interface_scale_desc: "लेआउट तत्वों का आकार समायोजित करें",
      security: "सुरक्षा और गोपनीयता",
      change_password: "पासवर्ड बदलें",
      change_password_desc: "मजबूत पासवर्ड से खाता सुरक्षित रखें",
      two_factor: "टू-फैक्टर ऑथेंटिकेशन",
      two_factor_desc: "सुरक्षा की एक अतिरिक्त परत जोड़ें",
      privacy: "गोपनीयता सेटिंग्स",
      privacy_desc: "डेटा शेयरिंग प्रबंधित करें",
      notifications: "सूचनाएं (Notifications)",
      email_notif: "ईमेल सूचनाएं",
      email_notif_desc: "ईमेल के माध्यम से ऑर्डर अपडेट प्राप्त करें",
      push_notif: "पुश सूचनाएं",
      push_notif_desc: "ब्राउज़र पर तुरंत अलर्ट",
      billing: "बिलिंग और सदस्यता",
      payment_methods: "भुगतान विधियां",
      payment_methods_desc: "क्रेडिट कार्ड और बिलिंग जानकारी प्रबंधित करें",
      subscription: "सदस्यता योजना",
      subscription_desc: "आप वर्तमान में प्रीमियम योजना पर हैं",
      deactivate: "खाता निष्क्रिय करें"
    },
    dashboard: {
      title: "डैशबोर्ड",
      subtitle: "आज ही अपने रेस्तरां का प्रबंधन करें।",
      open: "ऑर्डर के लिए खुला",
      closed: "दुकान बंद है",
      quick_actions: "त्वरित कार्रवाई",
      recent_orders: "हाल के ऑर्डर",
      view_all: "सभी ऑर्डर देखें",
      no_orders: "कोई हालिया ऑर्डर नहीं मिला।"
    },
    menu: {
      title: "खाद्य पदार्थ",
      subtitle: "अपना पूरा मेनू कैटलॉग प्रबंधित करें।",
      add_item: "नया आइटम जोड़ें",
      search_placeholder: "नाम से आइटम खोजें...",
      product: "उत्पाद",
      category: "श्रेणी",
      price: "कीमत",
      status: "स्थिति",
      actions: "कार्रवाई",
      categories: {
        All: "सभी",
        Starter: "हल्का नाश्ता",
        "Main Course": "मुख्य भोजन",
        Breads: "रोटियां",
        Beverages: "पेय पदार्थ",
        Desserts: "मिठाइयाँ"
      },
      statuses: {
        Available: "उपलब्ध",
        "Out of Stock": "स्टॉक में नहीं"
      },
      modal: {
        new: "नया मेनू आइटम",
        edit: "आइटम संपादित करें",
        item_name: "आइटम का नाम",
        upload_photo: "फोटो अपलोड करें",
        take_photo: "फोटो लें",
        save: "परिवर्तन सहेजें",
        add: "आइटम जोड़ें",
        cancel: "रद्द करें"
      }
    },
    profile: {
      accepting_orders: "ऑर्डर स्वीकार कर रहे हैं",
      store_closed: "दुकान बंद है",
      upload: "अपलोड करें",
      camera: "कैमरा",
      stats: {
        rating: "रेटिंग",
        orders: "कुल ऑर्डर",
        member_since: "सदस्यता तिथि"
      },
      business_info: "व्यापार जानकारी",
      email_address: "ईमेल पता",
      tabs: {
        overview: "अवलोकन",
        edit: "विवरण संपादित करें",
        hours: "परिचालन घंटे"
      },
      overview: {
        about: "रेस्तरां के बारे में",
        description: "टेस्टी बाइट्स 2010 से प्रामाणिक स्वादों के साथ समुदाय की सेवा कर रहा है...",
        cuisines: "व्यंजन",
        status: "स्थिति",
        open: "ऑर्डर के लिए खुला",
        temp_closed: "अस्थायी रूप से बंद"
      },
      edit: {
        name: "रेस्तरां का नाम",
        email: "समर्थन ईमेल",
        description: "विवरण",
        save: "परिवर्तन सहेजें"
      },
      hours: {
        open: "खुला",
        to: "से"
      }
    }
  },
  mr: {
    sidebar: {
      dashboard: "डॅशबोर्ड",
      orders: "ऑर्डर्स",
      menu: "मेनू व्यवस्थापन",
      profile: "तुमची प्रोफाइल",
      settings: "सेटिंग्ज",
      logout: "लॉग आउट",
      ready_for_orders: "ऑर्डरसाठी तयार"
    },
    settings: {
      title: "सेटिंग्ज",
      subtitle: "तुमची ऍप्लिकेशन प्राधान्ये कॉन्फिगर करा.",
      appearance: "दिसणे (Appearance)",
      dark_mode: "डार्क मोड",
      dark_mode_desc: "इंटरफेस रंग योजना सानुकूलित करा",
      language: "भाषा (Language)",
      language_desc: "तुमची पसंतीची भाषा निवडा",
      interface_scale: "इंटरफेस स्केल",
      interface_scale_desc: "लेआउट घटकांचा आकार समायोजित करा",
      security: "सुरक्षा आणि गोपनीयता",
      change_password: "पासवर्ड बदला",
      change_password_desc: "मजबूत पासवर्डसह खाते सुरक्षित ठेवा",
      two_factor: "टू-फॅक्टर ऑथेंटिकेशन",
      two_factor_desc: "सुरक्षेचा अतिरिक्त थर जोडा",
      privacy: "गोपनीयता सेटिंग्ज",
      privacy_desc: "डेटा शेअरिंग व्यवस्थापित करा",
      notifications: "सूचना (Notifications)",
      email_notif: "ईमेल सूचना",
      email_notif_desc: "ईमेलद्वारे ऑर्डर अपडेट्स मिळवा",
      push_notif: "पुश सूचना",
      push_notif_desc: "ब्राउझरवर त्वरित सूचना",
      billing: "बिलिंग आणि सदस्यता",
      payment_methods: "पेमेंट पद्धती",
      payment_methods_desc: "क्रेडिट कार्ड आणि बिलिंग माहिती व्यवस्थापित करा",
      subscription: "सदस्यता योजना",
      subscription_desc: "तुम्ही सध्या प्रीमियम योजनेवर आहात",
      deactivate: "खाते निष्क्रिय करा"
    },
    dashboard: {
      title: "डॅशबोर्ड",
      subtitle: "आजच तुमचे रेस्टॉरंट कामकाज व्यवस्थापित करा.",
      open: "ऑर्डरसाठी उघडे",
      closed: "दुकान बंद आहे",
      quick_actions: "त्वरित कृती",
      recent_orders: "अलीकडील ऑर्डर्स",
      view_all: "सर्व ऑर्डर्स पहा",
      no_orders: "कोणतीही अलीकडील ऑर्डर सापडली नाही."
    },
    menu: {
      title: "खाद्यपदार्थ",
      subtitle: "तुमची संपूर्ण मेनू सूची व्यवस्थापित करा.",
      add_item: "नवीन आयटम जोडा",
      search_placeholder: "नावावर आयटम शोधा...",
      product: "उत्पादन",
      category: "श्रेणी",
      price: "किंमत",
      status: "स्थिती",
      actions: "कृती",
      categories: {
        All: "सर्व",
        Starter: "स्टार्टर",
        "Main Course": "मुख्य कोर्स",
        Breads: "ब्रेड्स",
        Beverages: "पेये",
        Desserts: "मिठाई"
      },
      statuses: {
        Available: "उपलब्ध",
        "Out of Stock": "स्टॉक संपला"
      },
      modal: {
        new: "नवीन मेनू आयटम",
        edit: "आयटम संपादित करा",
        item_name: "आयटमचे नाव",
        upload_photo: "फोटो अपलोड करा",
        take_photo: "फोटो घ्या",
        save: "बदल जतन करा",
        add: "आयटम जोडा",
        cancel: "रद्द करा"
      }
    },
    profile: {
      accepting_orders: "ऑर्डर स्वीकारत आहे",
      store_closed: "दुकान बंद आहे",
      upload: "अपलोड करा",
      camera: "कॅमेरा",
      stats: {
        rating: "रेटिंग",
        orders: "एकूण ऑर्डर्स",
        member_since: "सदस्यता तारीख"
      },
      business_info: "व्यवसाय माहिती",
      email_address: "ईमेल पत्ता",
      tabs: {
        overview: "आढावा",
        edit: "तपशील संपादित करा",
        hours: "कामाचे तास"
      },
      overview: {
        about: "रेस्टॉरंटबद्दल",
        description: "टेस्टी बाइट्स 2010 पासून अस्सल चवींसह समाजाची सेवा करत आहे...",
        cuisines: "पाककृती",
        status: "स्थिती",
        open: "ऑर्डरसाठी उघडे",
        temp_closed: "तात्पुरते बंद"
      },
      edit: {
        name: "रेस्टॉरंटचे नाव",
        email: "सपोर्ट ईमेल",
        description: "वर्णन",
        save: "बदल जतन करा"
      },
      hours: {
        open: "उघडे",
        to: "ते"
      }
    }
  }
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('rp_language') || 'en';
  });

  const changeLanguage = (lang) => {
    setLanguage(lang);
    localStorage.setItem('rp_language', lang);
  };

  const t = (key) => {
    const keys = key.split('.');
    let value = translations[language];
    for (const k of keys) {
      value = value?.[k];
    }
    return value || key;
  };

  return (
    <LanguageContext.Provider value={{ language, changeLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
