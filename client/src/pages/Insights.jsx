import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Brain, AlertTriangle, Clock, PackageX, TrendingDown, RefreshCw,
  Check, X, Bell, ChevronDown, ChevronUp, Zap, Volume2,
} from 'lucide-react';
import PageWrapper from '../components/layout/PageWrapper';
import { useApp } from '../context/AppContext';
import insightsData from '../data/insights.json';
import { INSIGHT_TYPES, SEVERITY } from '../utils/constants';
import { formatCurrency } from '../utils/formatters';

const iconMap = {
  Clock, PackageX, TrendingDown, RefreshCw, AlertTriangle,
};

export default function Insights() {
  const { state } = useApp();
  const { language } = state;

  const [insights, setInsights] = useState(insightsData);
  const [filterType, setFilterType] = useState('all');
  const [expandedId, setExpandedId] = useState(null);

  const filtered = useMemo(() => {
    if (filterType === 'all') return insights.filter((i) => !i.isDismissed);
    return insights.filter((i) => i.type === filterType && !i.isDismissed);
  }, [insights, filterType]);

  const activeCount = insights.filter((i) => !i.isDismissed).length;
  const highCount = insights.filter((i) => i.severity === 'high' && !i.isDismissed).length;
  const totalCapitalAtRisk = insights.filter((i) => !i.isDismissed).reduce((s, i) => s + i.capitalAtRisk, 0);

  const handleDismiss = (id) => {
    setInsights((prev) => prev.map((i) => (i.id === id ? { ...i, isDismissed: true } : i)));
  };

  const handleMarkRead = (id) => {
    setInsights((prev) => prev.map((i) => (i.id === id ? { ...i, isRead: true } : i)));
  };

  return (
    <PageWrapper title="AI Insights" titleHi="AI सुझाव">
      {/* ===== Hero Banner ===== */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="gradient-hero rounded-2xl p-5 lg:p-6 text-white relative overflow-hidden"
      >
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, white 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-xl bg-white/20 backdrop-blur-sm">
              <Brain className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold">
                {language === 'hi' ? 'प्रोएक्टिव बिज़नेस इंटेलिजेंस' : 'Proactive Business Intelligence'}
              </h2>
              <p className="text-sm text-white/80">
                {language === 'hi' ? 'KiranaMind AI आपके लिए सोचता है — आपसे पहले' : 'KiranaMind AI thinks for you — before you ask'}
              </p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4 mt-4">
            <div className="bg-white/15 backdrop-blur-sm rounded-xl p-3 text-center">
              <p className="text-2xl font-bold">{activeCount}</p>
              <p className="text-xs text-white/80">{language === 'hi' ? 'सक्रिय सुझाव' : 'Active Alerts'}</p>
            </div>
            <div className="bg-white/15 backdrop-blur-sm rounded-xl p-3 text-center">
              <p className="text-2xl font-bold">{highCount}</p>
              <p className="text-xs text-white/80">{language === 'hi' ? 'गंभीर' : 'Critical'}</p>
            </div>
            <div className="bg-white/15 backdrop-blur-sm rounded-xl p-3 text-center">
              <p className="text-2xl font-bold">{formatCurrency(totalCapitalAtRisk)}</p>
              <p className="text-xs text-white/80">{language === 'hi' ? 'पूंजी जोखिम' : 'Capital at Risk'}</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ===== Nightly Briefing Card ===== */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="glass-card p-5 border-l-4 border-primary-500"
      >
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-xl bg-primary-50 dark:bg-primary-900/30 shrink-0">
            <Volume2 className="w-5 h-5 text-primary-600" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-gray-800 dark:text-white text-sm">
                {language === 'hi' ? '🌙 रात का ब्रीफिंग' : '🌙 Nightly Briefing'}
              </h3>
              <span className="badge badge-success">
                <Zap className="w-3 h-3" /> AI Generated
              </span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
              {language === 'hi'
                ? '"आज ₹1,203 की बिक्री हुई, 8 बिल बने। Parle-G और Maggi सबसे ज़्यादा बिके। ₹630 उधार में गया — Ramesh Kaka ₹480 और Sunita Devi ₹150। 2 प्रोडक्ट्स (Amul Milk, Bread) 3-4 दिन में एक्सपायर हो रहे हैं — जल्दी बेचने का प्लान बनाओ। कल आटा ऑर्डर करना न भूलना, 2-3 दिन का ही स्टॉक बचा है।"'
                : '"Today\'s revenue was ₹1,203 across 8 bills. Parle-G and Maggi were top sellers. ₹630 went on credit — Ramesh Kaka ₹480 and Sunita Devi ₹150. Two items (Amul Milk, Bread) are expiring in 3-4 days — plan a quick sale. Don\'t forget to order Atta tomorrow, only 2-3 days stock left."'}
            </p>
            <button className="mt-3 flex items-center gap-2 text-sm text-primary-600 dark:text-primary-400 font-medium hover:underline">
              <Volume2 className="w-4 h-4" />
              {language === 'hi' ? 'आवाज़ में सुनो' : 'Listen as Voice'}
            </button>
          </div>
        </div>
      </motion.div>

      {/* ===== Filter Tabs ===== */}
      <div className="flex gap-2 flex-wrap">
        {[
          { key: 'all', label: language === 'hi' ? 'सब' : 'All', count: activeCount },
          { key: 'expiry', label: language === 'hi' ? 'एक्सपायरी' : 'Expiry' },
          { key: 'dead-stock', label: language === 'hi' ? 'डेड स्टॉक' : 'Dead Stock' },
          { key: 'cashflow', label: language === 'hi' ? 'कैश फ्लो' : 'Cash Flow' },
          { key: 'reorder', label: language === 'hi' ? 'रीऑर्डर' : 'Reorder' },
          { key: 'udhaar-risk', label: language === 'hi' ? 'उधार जोखिम' : 'Udhaar Risk' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilterType(tab.key)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all
              ${filterType === tab.key
                ? 'bg-primary-500 text-white shadow-md'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
          >
            {tab.label}
            {tab.count != null && (
              <span className="ml-1.5 bg-white/20 rounded-full px-1.5 text-[10px]">{tab.count}</span>
            )}
          </button>
        ))}
      </div>

      {/* ===== Insight Cards ===== */}
      <div className="space-y-3">
        <AnimatePresence>
          {filtered.length === 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12 text-gray-400">
              <Brain className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p className="font-medium">{language === 'hi' ? 'कोई सुझाव नहीं' : 'No insights right now'}</p>
              <p className="text-sm mt-1">{language === 'hi' ? 'सब ठीक चल रहा है!' : 'Everything looks good!'}</p>
            </motion.div>
          ) : (
            filtered.map((insight, idx) => {
              const typeConfig = INSIGHT_TYPES[insight.type];
              const sevConfig = SEVERITY[insight.severity];
              const Icon = iconMap[typeConfig.icon] || AlertTriangle;
              const isExpanded = expandedId === insight.id;

              return (
                <motion.div
                  key={insight.id}
                  layout
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  transition={{ delay: idx * 0.05 }}
                  className={`glass-card p-4 border-l-4 ${sevConfig.border} ${!insight.isRead ? 'ring-1 ring-primary-200 dark:ring-primary-800' : ''}`}
                >
                  <div className="flex items-start gap-3">
                    {/* Icon */}
                    <div className="p-2 rounded-xl shrink-0" style={{ background: typeConfig.bgColor }}>
                      <Icon className="w-5 h-5" style={{ color: typeConfig.color }} />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-sm text-gray-800 dark:text-white truncate">
                          {language === 'hi' ? insight.titleHi : insight.title}
                        </h3>
                        {!insight.isRead && <div className={`pulse-dot ${sevConfig.dot}`} />}
                        <span className={`badge ${insight.severity === 'high' ? 'badge-danger' : insight.severity === 'medium' ? 'badge-warning' : 'badge-info'} ml-auto shrink-0`}>
                          {insight.severity.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                        {language === 'hi' ? insight.descriptionHi : insight.description}
                      </p>

                      {/* Capital at risk */}
                      {insight.capitalAtRisk > 0 && (
                        <div className="mt-2 flex items-center gap-1.5 text-xs font-medium text-red-600 dark:text-red-400">
                          <TrendingDown className="w-3.5 h-3.5" />
                          {language === 'hi' ? `पूंजी जोखिम: ${formatCurrency(insight.capitalAtRisk)}` : `Capital at Risk: ${formatCurrency(insight.capitalAtRisk)}`}
                        </div>
                      )}

                      {/* Action buttons */}
                      <div className="flex items-center gap-2 mt-3">
                        <button className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white gradient-primary hover:shadow-md transition-shadow flex items-center gap-1.5">
                          <Zap className="w-3 h-3" />
                          {language === 'hi' ? insight.actionLabelHi : insight.actionLabel}
                        </button>
                        {!insight.isRead && (
                          <button onClick={() => handleMarkRead(insight.id)}
                            className="px-3 py-1.5 rounded-lg text-xs font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex items-center gap-1.5">
                            <Check className="w-3 h-3" />
                            {language === 'hi' ? 'पढ़ा' : 'Mark Read'}
                          </button>
                        )}
                        <button onClick={() => handleDismiss(insight.id)}
                          className="px-3 py-1.5 rounded-lg text-xs font-medium text-gray-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 transition-colors flex items-center gap-1.5 ml-auto">
                          <X className="w-3 h-3" />
                          {language === 'hi' ? 'हटाओ' : 'Dismiss'}
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </div>
    </PageWrapper>
  );
}
