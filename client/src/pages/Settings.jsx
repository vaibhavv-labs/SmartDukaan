import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Settings, Store, User, Phone, Moon, Sun, Globe, Bell, Save, Check,
} from 'lucide-react';
import PageWrapper from '../components/layout/PageWrapper';
import { useApp } from '../context/AppContext';

export default function SettingsPage() {
  const { state, dispatch } = useApp();
  const { language, darkMode, shopName, ownerName, ownerPhone } = state;
  const [saved, setSaved] = useState(false);

  const [form, setForm] = useState({
    shopName, ownerName, ownerPhone,
    deadStockDays: 30,
    expiryWarningDays: 7,
    lowStockThreshold: 50,
  });

  const handleSave = () => {
    dispatch({ type: 'UPDATE_SETTINGS', payload: { shopName: form.shopName, ownerName: form.ownerName, ownerPhone: form.ownerPhone } });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <PageWrapper title="Settings" titleHi="सेटिंग्स">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Shop Info */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-5">
          <div className="flex items-center gap-2 mb-4">
            <Store className="w-5 h-5 text-primary-600" />
            <h2 className="font-semibold text-gray-800 dark:text-white">
              {language === 'hi' ? 'दुकान की जानकारी' : 'Shop Information'}
            </h2>
          </div>
          <div className="space-y-4">
            {[
              { key: 'shopName', label: language === 'hi' ? 'दुकान का नाम' : 'Shop Name', icon: Store },
              { key: 'ownerName', label: language === 'hi' ? 'मालिक का नाम' : 'Owner Name', icon: User },
              { key: 'ownerPhone', label: language === 'hi' ? 'फोन नंबर' : 'Phone Number', icon: Phone },
            ].map((field) => (
              <div key={field.key}>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">{field.label}</label>
                <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-800 rounded-xl px-3 py-2.5 border border-gray-200 dark:border-gray-700 focus-within:border-primary-400">
                  <field.icon className="w-4 h-4 text-gray-400 shrink-0" />
                  <input type="text" value={form[field.key]} onChange={(e) => setForm((f) => ({ ...f, [field.key]: e.target.value }))}
                    className="bg-transparent text-sm outline-none w-full text-gray-700 dark:text-gray-200" />
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Alert Preferences */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-5">
          <div className="flex items-center gap-2 mb-4">
            <Bell className="w-5 h-5 text-amber-500" />
            <h2 className="font-semibold text-gray-800 dark:text-white">
              {language === 'hi' ? 'अलर्ट प्राथमिकताएं' : 'Alert Preferences'}
            </h2>
          </div>
          <div className="space-y-4">
            {[
              { key: 'deadStockDays', label: language === 'hi' ? 'डेड स्टॉक थ्रेसहोल्ड (दिन)' : 'Dead Stock Threshold (days)', suffix: 'days' },
              { key: 'expiryWarningDays', label: language === 'hi' ? 'एक्सपायरी चेतावनी (दिन पहले)' : 'Expiry Warning (days before)', suffix: 'days' },
              { key: 'lowStockThreshold', label: language === 'hi' ? 'कम स्टॉक अलर्ट (%)' : 'Low Stock Alert (%)', suffix: '%' },
            ].map((field) => (
              <div key={field.key}>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">{field.label}</label>
                <div className="flex items-center gap-2">
                  <input type="range" min={field.suffix === '%' ? 10 : 1} max={field.suffix === '%' ? 100 : 90}
                    value={form[field.key]} onChange={(e) => setForm((f) => ({ ...f, [field.key]: Number(e.target.value) }))}
                    className="flex-1 accent-primary-500" />
                  <span className="text-sm font-semibold text-gray-800 dark:text-white w-16 text-right">
                    {form[field.key]} {field.suffix}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Display Preferences */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card p-5">
          <div className="flex items-center gap-2 mb-4">
            <Settings className="w-5 h-5 text-blue-500" />
            <h2 className="font-semibold text-gray-800 dark:text-white">
              {language === 'hi' ? 'डिस्प्ले' : 'Display'}
            </h2>
          </div>
          <div className="space-y-4">
            {/* Dark Mode */}
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
              <div className="flex items-center gap-3">
                {darkMode ? <Moon className="w-5 h-5 text-indigo-500" /> : <Sun className="w-5 h-5 text-amber-500" />}
                <div>
                  <p className="text-sm font-medium text-gray-800 dark:text-white">
                    {language === 'hi' ? 'डार्क मोड' : 'Dark Mode'}
                  </p>
                  <p className="text-xs text-gray-400">{darkMode ? 'On' : 'Off'}</p>
                </div>
              </div>
              <button onClick={() => dispatch({ type: 'TOGGLE_DARK_MODE' })}
                className={`w-12 h-7 rounded-full flex items-center px-1 transition-colors ${darkMode ? 'bg-primary-500' : 'bg-gray-300'}`}>
                <div className={`w-5 h-5 rounded-full bg-white shadow transition-transform ${darkMode ? 'translate-x-5' : 'translate-x-0'}`} />
              </button>
            </div>

            {/* Language */}
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
              <div className="flex items-center gap-3">
                <Globe className="w-5 h-5 text-green-500" />
                <div>
                  <p className="text-sm font-medium text-gray-800 dark:text-white">
                    {language === 'hi' ? 'भाषा' : 'Language'}
                  </p>
                  <p className="text-xs text-gray-400">{language === 'en' ? 'English' : 'हिंदी'}</p>
                </div>
              </div>
              <div className="flex bg-gray-200 dark:bg-gray-700 rounded-lg p-0.5">
                <button onClick={() => dispatch({ type: 'SET_LANGUAGE', payload: 'en' })}
                  className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${language === 'en' ? 'bg-white dark:bg-gray-600 text-gray-800 dark:text-white shadow-sm' : 'text-gray-500'}`}>
                  EN
                </button>
                <button onClick={() => dispatch({ type: 'SET_LANGUAGE', payload: 'hi' })}
                  className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${language === 'hi' ? 'bg-white dark:bg-gray-600 text-gray-800 dark:text-white shadow-sm' : 'text-gray-500'}`}>
                  हिंदी
                </button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Save Button */}
        <button onClick={handleSave}
          className={`w-full px-4 py-3 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2 transition-all ${saved ? 'bg-green-500' : 'gradient-primary hover:shadow-lg'}`}>
          {saved ? <><Check className="w-4 h-4" /> {language === 'hi' ? 'सेव हो गया!' : 'Saved!'}</> : <><Save className="w-4 h-4" /> {language === 'hi' ? 'सेटिंग्स सेव करो' : 'Save Settings'}</>}
        </button>
      </div>
    </PageWrapper>
  );
}
