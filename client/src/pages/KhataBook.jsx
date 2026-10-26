import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen, Phone, MessageCircle, AlertTriangle, Search,
  X, IndianRupee, TrendingDown, Send, User, Filter,
} from 'lucide-react';
import PageWrapper from '../components/layout/PageWrapper';
import { useApp } from '../context/AppContext';
import customersData from '../data/customers.json';
import { RISK_LEVELS } from '../utils/constants';
import {
  formatCurrency, formatDate, getInitials, getRelativeTime,
  generateReminderMessage,
} from '../utils/formatters';

export default function KhataBook() {
  const { state } = useApp();
  const { language } = state;

  const [customers, setCustomers] = useState(customersData);
  const [searchQuery, setSearchQuery] = useState('');
  const [riskFilter, setRiskFilter] = useState('all');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showReminder, setShowReminder] = useState(null);

  /* Stats */
  const totalPending = customers.reduce((s, c) => s + c.pendingAmount, 0);
  const highRiskCount = customers.filter((c) => c.riskLevel === 'high').length;
  const totalCustomers = customers.length;

  /* Filtered */
  const filtered = useMemo(() => {
    let result = [...customers];
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter((c) => c.name.toLowerCase().includes(q) || c.phone.includes(q));
    }
    if (riskFilter !== 'all') {
      result = result.filter((c) => c.riskLevel === riskFilter);
    }
    return result.sort((a, b) => b.pendingAmount - a.pendingAmount);
  }, [customers, searchQuery, riskFilter]);

  const getOverdueDays = (lastPayment) => {
    return Math.floor((new Date() - new Date(lastPayment)) / 86400000);
  };

  return (
    <PageWrapper title="Khata Book" titleHi="खाता बुक">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          className="bg-amber-50 dark:bg-amber-900/30 rounded-xl p-4">
          <IndianRupee className="w-5 h-5 text-amber-600 mb-1" />
          <p className="text-xl font-bold text-amber-700 dark:text-amber-400">{formatCurrency(totalPending)}</p>
          <p className="text-xs text-gray-500">{language === 'hi' ? 'कुल उधार बाकी' : 'Total Pending'}</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
          className="bg-red-50 dark:bg-red-900/30 rounded-xl p-4">
          <AlertTriangle className="w-5 h-5 text-red-600 mb-1" />
          <p className="text-xl font-bold text-red-700 dark:text-red-400">{highRiskCount}</p>
          <p className="text-xs text-gray-500">{language === 'hi' ? 'ज़्यादा जोखिम' : 'High Risk'}</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="bg-blue-50 dark:bg-blue-900/30 rounded-xl p-4">
          <User className="w-5 h-5 text-blue-600 mb-1" />
          <p className="text-xl font-bold text-blue-700 dark:text-blue-400">{totalCustomers}</p>
          <p className="text-xs text-gray-500">{language === 'hi' ? 'कुल ग्राहक' : 'Customers'}</p>
        </motion.div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-800 rounded-xl px-3 py-2 flex-1 border border-transparent focus-within:border-primary-300">
          <Search className="w-4 h-4 text-gray-400 shrink-0" />
          <input type="text" placeholder={language === 'hi' ? 'ग्राहक खोजें...' : 'Search customers...'}
            value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent text-sm outline-none w-full text-gray-700 dark:text-gray-200" />
          {searchQuery && <button onClick={() => setSearchQuery('')}><X className="w-4 h-4 text-gray-400" /></button>}
        </div>
        <div className="flex bg-gray-100 dark:bg-gray-800 rounded-xl p-1 gap-1 shrink-0">
          {[
            { key: 'all', label: language === 'hi' ? 'सब' : 'All' },
            { key: 'high', label: language === 'hi' ? 'ज़्यादा जोखिम' : 'High Risk' },
            { key: 'moderate', label: language === 'hi' ? 'मध्यम' : 'Moderate' },
            { key: 'low', label: language === 'hi' ? 'कम' : 'Low' },
          ].map((f) => (
            <button key={f.key} onClick={() => setRiskFilter(f.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${riskFilter === f.key ? 'bg-white dark:bg-gray-700 text-gray-800 dark:text-white shadow-sm' : 'text-gray-500'}`}>
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Customer Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.length === 0 ? (
          <div className="col-span-full text-center py-12 text-gray-400">
            <BookOpen className="w-10 h-10 mx-auto mb-2 text-gray-300" />
            <p>{language === 'hi' ? 'कोई ग्राहक नहीं मिला' : 'No customers found'}</p>
          </div>
        ) : (
          filtered.map((customer, idx) => {
            const riskConfig = RISK_LEVELS[customer.riskLevel];
            const overdueDays = getOverdueDays(customer.lastPaymentDate);

            return (
              <motion.div
                key={customer.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.04 }}
                className="glass-card p-4 hover:shadow-lg transition-shadow"
              >
                {/* Header */}
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0 ${
                    customer.riskLevel === 'high' ? 'bg-red-500' : customer.riskLevel === 'moderate' ? 'bg-amber-500' : 'bg-green-500'
                  }`}>
                    {getInitials(customer.name)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-800 dark:text-white truncate">{customer.name}</p>
                    <p className="text-xs text-gray-400 flex items-center gap-1">
                      <Phone className="w-3 h-3" /> {customer.phone}
                    </p>
                  </div>
                  <span className={`badge ${riskConfig.bgClass} shrink-0`}>
                    {language === 'hi' ? riskConfig.labelHi : riskConfig.label}
                  </span>
                </div>

                {/* Amount & Details */}
                <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-3 mb-3">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs text-gray-500">{language === 'hi' ? 'बकाया राशि' : 'Pending Amount'}</span>
                    <span className="text-lg font-bold text-amber-600">{formatCurrency(customer.pendingAmount)}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[11px] text-gray-500">
                    <div>
                      <span className="text-gray-400">{language === 'hi' ? 'आखिरी भुगतान' : 'Last Payment'}:</span>{' '}
                      <span className="font-medium text-gray-600 dark:text-gray-300">{getRelativeTime(customer.lastPaymentDate)}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">{language === 'hi' ? 'कुल लेन-देन' : 'Transactions'}:</span>{' '}
                      <span className="font-medium text-gray-600 dark:text-gray-300">{customer.totalTransactions}</span>
                    </div>
                  </div>
                  {/* Risk Score Bar */}
                  <div className="mt-2">
                    <div className="flex items-center justify-between text-[10px] mb-0.5">
                      <span className="text-gray-400">{language === 'hi' ? 'जोखिम स्कोर' : 'Risk Score'}</span>
                      <span className="font-bold" style={{ color: customer.riskScore > 70 ? '#dc2626' : customer.riskScore > 40 ? '#f59e0b' : '#16a34a' }}>
                        {customer.riskScore}/100
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${customer.riskScore}%`,
                          background: customer.riskScore > 70 ? '#dc2626' : customer.riskScore > 40 ? '#f59e0b' : '#16a34a',
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowReminder(customer)}
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-white bg-green-600 hover:bg-green-700 transition-colors"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    {language === 'hi' ? 'WhatsApp भेजो' : 'Send Reminder'}
                  </button>
                  <button className="px-3 py-2 rounded-xl text-xs font-medium text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 transition-colors">
                    <Phone className="w-3.5 h-3.5" />
                  </button>
                </div>
              </motion.div>
            );
          })
        )}
      </div>

      {/* ===== WhatsApp Reminder Preview Modal ===== */}
      <AnimatePresence>
        {showReminder && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setShowReminder(null)}>
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9 }}
              className="bg-white dark:bg-surface-dark rounded-2xl p-6 max-w-md w-full shadow-xl" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <MessageCircle className="w-5 h-5 text-green-600" />
                  <h3 className="font-bold text-gray-800 dark:text-white">WhatsApp Reminder Preview</h3>
                </div>
                <button onClick={() => setShowReminder(null)}><X className="w-5 h-5 text-gray-400" /></button>
              </div>

              <div className="bg-[#dcf8c6] dark:bg-green-900/30 rounded-2xl rounded-tr-sm p-4 mb-4">
                <p className="text-sm text-gray-800 dark:text-gray-200 leading-relaxed whitespace-pre-wrap">
                  {generateReminderMessage(
                    showReminder.name,
                    showReminder.pendingAmount,
                    Math.floor((new Date() - new Date(showReminder.lastPaymentDate)) / 86400000),
                  )}
                </p>
                <p className="text-[10px] text-gray-500 mt-2 text-right">
                  {language === 'hi' ? 'AI द्वारा जनरेट किया गया — टोन ऑटो-एडजस्ट' : 'AI-generated — tone auto-adjusted based on overdue days'}
                </p>
              </div>

              <div className="flex items-center gap-2 text-xs text-gray-500 mb-4">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                <span>
                  {language === 'hi'
                    ? `${Math.floor((new Date() - new Date(showReminder.lastPaymentDate)) / 86400000)} दिन से बाकी — टोन अपने आप बदल गया है`
                    : `${Math.floor((new Date() - new Date(showReminder.lastPaymentDate)) / 86400000)} days overdue — tone auto-escalated`}
                </span>
              </div>

              <div className="flex gap-3">
                <button onClick={() => setShowReminder(null)}
                  className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium text-gray-600 border border-gray-200 dark:border-gray-700 hover:bg-gray-50">
                  Cancel
                </button>
                <button onClick={() => { alert('WhatsApp reminder sent! (simulated)'); setShowReminder(null); }}
                  className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-green-600 hover:bg-green-700 flex items-center justify-center gap-2">
                  <Send className="w-4 h-4" /> Send via WhatsApp
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </PageWrapper>
  );
}
