import React from 'react';
import {
  Bell,
  Lock,
  Eye,
  Languages,
  Smartphone,
  CreditCard,
  HelpCircle,
  ChevronRight,
  ShieldAlert,
  Moon,
  Sun
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';

const SettingItem = ({ icon: Icon, title, description, badge, toggle, action, onClick }) => (
  <div
    onClick={onClick}
    className="flex items-center justify-between p-5 hover:bg-gray-50 dark:hover:bg-[#141414] transition-all cursor-pointer group border-b border-gray-100 dark:border-dark-border last:border-0"
  >
    <div className="flex items-center gap-5">
      <div className="w-12 h-12 rounded-2xl bg-gray-100 dark:bg-dark-border flex items-center justify-center text-gray-500 group-hover:bg-primary-500 group-hover:text-white transition-all duration-300 shadow-sm shadow-black/5">
        <Icon size={22} />
      </div>
      <div>
        <h4 className="font-bold text-gray-900 dark:text-dark-text">{title}</h4>
        <p className="text-sm text-gray-400 font-medium">{description}</p>
      </div>
    </div>
    <div className="flex items-center gap-4">
      {action && action}
      {badge && <span className="px-2.5 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-500 text-[10px] font-bold rounded-lg uppercase tracking-wider">{badge}</span>}
      {toggle && (
        toggle === 'active' || toggle === 'inactive' ? (
          <label className="relative inline-flex items-center cursor-pointer pointer-events-none">
            <input type="checkbox" checked={toggle === 'active'} readOnly className="sr-only peer" />
            <div className="w-10 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-dark-border peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-primary-500"></div>
          </label>
        ) : null
      )}
      {!toggle && !badge && !action && (
        <ChevronRight size={20} className="text-gray-300 group-hover:text-primary-500 transition-all group-hover:translate-x-1" />
      )}
    </div>
  </div>
);

const Settings = () => {
  const { isDarkMode, toggleTheme } = useTheme();
  const { language, changeLanguage, t } = useLanguage();

  return (
    <div className="w-full mx-auto space-y-6 pb-16">
      <div className="border-b border-gray-200 dark:border-dark-border pb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-dark-text">{t('settings.title')}</h1>
        <p className="text-sm text-gray-500 dark:text-dark-muted mt-1">{t('settings.subtitle')}</p>
      </div>

      <div className="space-y-8">
        {/* Appearance */}
        <div className="space-y-4">
          <h3 className="text-xs font-black text-primary-500 uppercase tracking-[0.2em] px-1">{t('settings.appearance')}</h3>
          <div className="card divide-y divide-gray-100 dark:divide-dark-border overflow-hidden">
            <SettingItem
              icon={isDarkMode ? Moon : Sun}
              title={t('settings.dark_mode')}
              description={t('settings.dark_mode_desc')}
              toggle={isDarkMode ? 'active' : 'inactive'}
              onClick={toggleTheme}
            />

            {/* Language Selector */}
            <SettingItem
              icon={Languages}
              title={t('settings.language')}
              description={t('settings.language_desc')}
              action={
                <select
                  value={language}
                  onChange={(e) => changeLanguage(e.target.value)}
                  className="bg-gray-50 dark:bg-dark-bg text-sm font-bold text-gray-900 dark:text-gray-200 py-2 pl-3 pr-8 rounded-lg border border-gray-200 dark:border-dark-border focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none cursor-pointer hover:bg-gray-100 dark:hover:bg-dark-card transition-colors appearance-none"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                    backgroundPosition: 'right 0.5rem center',
                    backgroundRepeat: 'no-repeat',
                    backgroundSize: '1.5em 1.5em',
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <option value="en">English (US)</option>
                  <option value="hi">हिंदी (Hindi)</option>
                  <option value="mr">मराठी (Marathi)</option>
                </select>
              }
            />

            <SettingItem
              icon={Smartphone}
              title={t('settings.interface_scale')}
              description={t('settings.interface_scale_desc')}
              badge="Standard"
            />
          </div>
        </div>

        {/* Security */}
        <div className="space-y-4">
          <h3 className="text-xs font-black text-primary-500 uppercase tracking-[0.2em] px-1">{t('settings.security')}</h3>
          <div className="card divide-y divide-gray-100 dark:divide-dark-border overflow-hidden">
            <SettingItem
              icon={Lock}
              title={t('settings.change_password')}
              description={t('settings.change_password_desc')}
            />
            <SettingItem
              icon={ShieldAlert}
              title={t('settings.two_factor')}
              description={t('settings.two_factor_desc')}
              toggle="inactive"
            />
            <SettingItem
              icon={Eye}
              title={t('settings.privacy')}
              description={t('settings.privacy_desc')}
            />
          </div>
        </div>

        {/* Notifications */}
        <div className="space-y-4">
          <h3 className="text-xs font-black text-primary-500 uppercase tracking-[0.2em] px-1">{t('settings.notifications')}</h3>
          <div className="card divide-y divide-gray-100 dark:divide-dark-border overflow-hidden">
            <SettingItem
              icon={Bell}
              title={t('settings.email_notif')}
              description={t('settings.email_notif_desc')}
              toggle="active"
            />
            <SettingItem
              icon={Smartphone}
              title={t('settings.push_notif')}
              description={t('settings.push_notif_desc')}
              toggle="active"
            />
          </div>
        </div>

        {/* Billing */}
        <div className="space-y-4">
          <h3 className="text-xs font-black text-primary-500 uppercase tracking-[0.2em] px-1">{t('settings.billing')}</h3>
          <div className="card divide-y divide-gray-100 dark:divide-dark-border overflow-hidden">
            <SettingItem
              icon={CreditCard}
              title={t('settings.payment_methods')}
              description={t('settings.payment_methods_desc')}
            />
            <SettingItem
              icon={HelpCircle}
              title={t('settings.subscription')}
              description={t('settings.subscription_desc')}
              badge="Premium"
            />
          </div>
        </div>

        {/* Danger Zone */}
        <div className="pt-8 flex justify-center">
          <button className="text-red-500 font-black text-[10px] uppercase tracking-[0.3em] hover:text-red-600 transition-all border-b-2 border-red-500/0 hover:border-red-500/50 pb-1">
            {t('settings.deactivate')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
