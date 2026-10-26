import { useMemo, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  TrendingUp, TrendingDown, IndianRupee, ShoppingCart, Package,
  AlertTriangle, Users, Mic, ScanLine, Receipt, Brain, ArrowRight,
  Clock, Banknote, CreditCard, RefreshCw,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area,
} from 'recharts';
import PageWrapper from '../components/layout/PageWrapper';
import { useApp } from '../context/AppContext';
import salesData from '../data/sales.json';
import inventoryData from '../data/inventory.json';
import customersData from '../data/customers.json';
import insightsData from '../data/insights.json';
import { api } from '../services/api';
import {
  formatCurrency, formatTime, getRelativeTime, getDaysUntilExpiry,
  getDaysSinceLastSold,
} from '../utils/formatters';

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4 },
};

const CHART_COLORS = ['#0f5132', '#3da06a', '#6dbe8e', '#a3d7b7', '#d0ebda'];
const PIE_COLORS = ['#0f5132', '#f59e0b', '#3b82f6', '#8b5cf6', '#ec4899'];

export default function Dashboard() {
  const { state } = useApp();
  const { language } = state;
  const [liveStats, setLiveStats] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;
    api.getDashboardStats()
      .then((data) => {
        if (isMounted) setLiveStats(data);
      })
      .catch((err) => console.log('Dashboard fallback to mock data:', err.message));
    return () => { isMounted = false; };
  }, []);

  /* ---- Computed stats (live backend or fallback) ---- */
  const stats = useMemo(() => {
    if (liveStats) {
      return {
        todayRevenue: liveStats.today_sales,
        todaySales: liveStats.today_orders,
        todayCash: Math.round(liveStats.today_sales * 0.65),
        todayUdhaar: Math.round(liveStats.today_sales * 0.35),
        totalUdhaarPending: liveStats.pending_udhaar,
        highRiskCustomers: 4,
        expiringProducts: liveStats.expiring_soon_count,
        deadStockProducts: 3,
        lowStockProducts: liveStats.low_stock_count,
        activeAlerts: liveStats.critical_alerts,
      };
    }
    const today = new Date().toISOString().split('T')[0];
    const todaySales = salesData.filter((s) => s.timestamp.startsWith(today));
    const todayRevenue = todaySales.reduce((sum, s) => sum + s.totalAmount, 0);
    const todayCash = todaySales.filter((s) => s.paymentMode === 'cash').reduce((sum, s) => sum + s.totalAmount, 0);
    const todayUdhaar = todaySales.filter((s) => s.paymentMode === 'udhaar').reduce((sum, s) => sum + s.totalAmount, 0);
    const totalUdhaarPending = customersData.reduce((sum, c) => sum + c.pendingAmount, 0);
    const highRiskCustomers = customersData.filter((c) => c.riskLevel === 'high').length;
    const expiringProducts = inventoryData.filter((p) => p.expiryDate && getDaysUntilExpiry(p.expiryDate) <= 7 && getDaysUntilExpiry(p.expiryDate) >= 0).length;
    const deadStockProducts = inventoryData.filter((p) => getDaysSinceLastSold(p.lastSoldDate) > 30).length;
    const lowStockProducts = inventoryData.filter((p) => p.stock <= p.minStock * 0.5 && p.stock > 0).length;
    const activeAlerts = insightsData.filter((i) => !i.isDismissed).length;

    return {
      todayRevenue, todaySales: todaySales.length, todayCash, todayUdhaar,
      totalUdhaarPending, highRiskCustomers, expiringProducts,
      deadStockProducts, lowStockProducts, activeAlerts,
    };
  }, [liveStats]);

  /* ---- Chart: daily revenue for last 7 days ---- */
  const revenueChartData = useMemo(() => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const dayLabel = d.toLocaleDateString('en-IN', { weekday: 'short' });
      const daySales = salesData.filter((s) => s.timestamp.startsWith(dateStr));
      const revenue = daySales.reduce((sum, s) => sum + s.totalAmount, 0);
      days.push({ day: dayLabel, revenue, sales: daySales.length });
    }
    return days;
  }, []);

  /* ---- Chart: top 5 products by revenue ---- */
  const topProductsData = useMemo(() => {
    const productRevMap = {};
    salesData.forEach((s) => {
      s.products.forEach((p) => {
        productRevMap[p.name] = (productRevMap[p.name] || 0) + p.qty * p.price;
      });
    });
    return Object.entries(productRevMap)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([name, revenue]) => ({ name: name.length > 15 ? name.slice(0, 14) + '…' : name, revenue }));
  }, []);

  /* ---- Chart: payment mode split ---- */
  const paymentSplit = useMemo(() => {
    const cash = salesData.filter((s) => s.paymentMode === 'cash').reduce((sum, s) => sum + s.totalAmount, 0);
    const udhaar = salesData.filter((s) => s.paymentMode === 'udhaar').reduce((sum, s) => sum + s.totalAmount, 0);
    return [
      { name: 'Cash', value: cash },
      { name: 'Udhaar', value: udhaar },
    ];
  }, []);

  /* ---- Recent activity ---- */
  const recentSales = salesData.slice(0, 6);

  return (
    <PageWrapper title="Dashboard" titleHi="डैशबोर्ड">
      {/* ===== Quick Actions ===== */}
      <div className="grid grid-cols-3 gap-3 lg:hidden">
        {[
          { to: '/voice-billing', icon: Mic, label: 'Voice Bill', labelHi: 'आवाज़ बिल', color: 'bg-primary-500' },
          { to: '/khata-scan', icon: ScanLine, label: 'Scan Khata', labelHi: 'खाता स्कैन', color: 'bg-accent-600' },
          { to: '/bill-scan', icon: Receipt, label: 'Scan Bill', labelHi: 'बिल स्कैन', color: 'bg-blue-600' },
        ].map((a) => (
          <Link key={a.to} to={a.to} className={`${a.color} rounded-2xl p-3 flex flex-col items-center gap-1.5 text-white shadow-md hover:shadow-lg transition-shadow`}>
            <a.icon className="w-6 h-6" />
            <span className="text-xs font-semibold">{language === 'hi' ? a.labelHi : a.label}</span>
          </Link>
        ))}
      </div>

      {/* ===== Stat Cards ===== */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: language === 'hi' ? 'आज की बिक्री' : "Today's Revenue",
            value: formatCurrency(stats.todayRevenue),
            sub: `${stats.todaySales} ${language === 'hi' ? 'बिल' : 'bills'}`,
            icon: IndianRupee, iconBg: 'bg-green-50 dark:bg-green-900/30', iconColor: 'text-green-600 dark:text-green-400',
            trend: '+12%', trendUp: true,
          },
          {
            label: language === 'hi' ? 'कुल उधार बाकी' : 'Total Udhaar Pending',
            value: formatCurrency(stats.totalUdhaarPending),
            sub: `${stats.highRiskCustomers} ${language === 'hi' ? 'ज़्यादा जोखिम' : 'high risk'}`,
            icon: CreditCard, iconBg: 'bg-amber-50 dark:bg-amber-900/30', iconColor: 'text-amber-600 dark:text-amber-400',
            trend: '-5%', trendUp: false,
          },
          {
            label: language === 'hi' ? 'स्टॉक अलर्ट' : 'Stock Alerts',
            value: `${stats.expiringProducts + stats.deadStockProducts + stats.lowStockProducts}`,
            sub: `${stats.expiringProducts} ${language === 'hi' ? 'एक्सपायरी' : 'expiring'}`,
            icon: Package, iconBg: 'bg-red-50 dark:bg-red-900/30', iconColor: 'text-red-600 dark:text-red-400',
          },
          {
            label: language === 'hi' ? 'AI सुझाव' : 'AI Insights',
            value: `${stats.activeAlerts}`,
            sub: language === 'hi' ? 'कार्रवाई ज़रूरी' : 'need action',
            icon: Brain, iconBg: 'bg-purple-50 dark:bg-purple-900/30', iconColor: 'text-purple-600 dark:text-purple-400',
            link: '/insights',
          },
        ].map((card, idx) => (
          <motion.div
            key={idx}
            {...fadeUp}
            transition={{ ...fadeUp.transition, delay: idx * 0.08 }}
            className="glass-card p-4 lg:p-5"
          >
            <div className="flex items-start justify-between mb-3">
              <div className={`p-2 rounded-xl ${card.iconBg}`}>
                <card.icon className={`w-5 h-5 ${card.iconColor}`} />
              </div>
              {card.trend && (
                <span className={`flex items-center gap-0.5 text-xs font-semibold ${card.trendUp ? 'text-green-600' : 'text-red-500'}`}>
                  {card.trendUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  {card.trend}
                </span>
              )}
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{card.value}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{card.label}</p>
            <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-1">{card.sub}</p>
            {card.link && (
              <Link to={card.link} className="text-xs text-primary-600 dark:text-primary-400 font-medium flex items-center gap-1 mt-2 hover:underline">
                {language === 'hi' ? 'देखें' : 'View All'} <ArrowRight className="w-3 h-3" />
              </Link>
            )}
          </motion.div>
        ))}
      </div>

      {/* ===== Charts Row ===== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Revenue Chart */}
        <motion.div {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.3 }} className="lg:col-span-2 glass-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-gray-800 dark:text-gray-200">
              {language === 'hi' ? '📈 हफ्ते की बिक्री' : '📈 Weekly Revenue'}
            </h2>
          </div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueChartData}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0f5132" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#0f5132" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                <XAxis dataKey="day" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${v}`} />
                <Tooltip
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
                  formatter={(value) => [`₹${value}`, 'Revenue']}
                />
                <Area type="monotone" dataKey="revenue" stroke="#0f5132" strokeWidth={2.5} fill="url(#colorRev)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Payment Split */}
        <motion.div {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.4 }} className="glass-card p-5">
          <h2 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-4">
            {language === 'hi' ? '💰 भुगतान बंटवारा' : '💰 Payment Split'}
          </h2>
          <div className="h-44 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={paymentSplit}
                  cx="50%" cy="50%"
                  innerRadius={50} outerRadius={70}
                  paddingAngle={4}
                  dataKey="value"
                  strokeWidth={0}
                >
                  {paymentSplit.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`₹${value}`, '']} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-6 mt-2">
            {paymentSplit.map((item, i) => (
              <div key={item.name} className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                <div className="w-2.5 h-2.5 rounded-full" style={{ background: PIE_COLORS[i] }} />
                {item.name}: {formatCurrency(item.value)}
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* ===== Bottom Row: Top Products + Quick Actions + Activity ===== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Top Products */}
        <motion.div {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.5 }} className="glass-card p-5">
          <h2 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-4">
            {language === 'hi' ? '🏆 टॉप प्रोडक्ट' : '🏆 Top Products'}
          </h2>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topProductsData} layout="vertical" barCategoryGap={8}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${v}`} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} width={100} />
                <Tooltip formatter={(value) => [`₹${value}`, 'Revenue']} contentStyle={{ borderRadius: '10px', border: 'none' }} />
                <Bar dataKey="revenue" fill="#0f5132" radius={[0, 6, 6, 0]} barSize={18} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Quick Actions (Desktop) */}
        <motion.div {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.55 }} className="glass-card p-5 hidden lg:block">
          <h2 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-4">
            {language === 'hi' ? '⚡ त्वरित कार्रवाई' : '⚡ Quick Actions'}
          </h2>
          <div className="space-y-3">
            {[
              { to: '/voice-billing', icon: Mic, label: language === 'hi' ? 'आवाज़ से बिल बनाओ' : 'Create Bill by Voice', desc: language === 'hi' ? 'बोलो, बिल बन जाएगा' : '"Rahul ko ek kurkure udhaar"', color: 'text-primary-600', bg: 'bg-primary-50 dark:bg-primary-900/20' },
              { to: '/khata-scan', icon: ScanLine, label: language === 'hi' ? 'खाता फोटो स्कैन करो' : 'Scan Handwritten Khata', desc: language === 'hi' ? 'फोटो खींचो, AI पढ़ेगा' : 'Photo → Digital records', color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-900/20' },
              { to: '/bill-scan', icon: Receipt, label: language === 'hi' ? 'सप्लायर बिल स्कैन करो' : 'Scan Supplier Bill', desc: language === 'hi' ? 'स्टॉक ऑटो अपडेट' : 'Auto-update inventory', color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20' },
              { to: '/insights', icon: Brain, label: language === 'hi' ? 'AI सुझाव देखो' : 'View AI Insights', desc: `${stats.activeAlerts} ${language === 'hi' ? 'कार्रवाई ज़रूरी' : 'alerts need action'}`, color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-900/20' },
            ].map((action) => (
              <Link
                key={action.to}
                to={action.to}
                className={`flex items-center gap-3 p-3 rounded-xl ${action.bg} hover:shadow-md transition-all group`}
              >
                <action.icon className={`w-5 h-5 ${action.color} shrink-0`} />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">{action.label}</p>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400 truncate">{action.desc}</p>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-300 ml-auto group-hover:text-gray-500 transition-colors shrink-0" />
              </Link>
            ))}
          </div>
        </motion.div>

        {/* Recent Activity */}
        <motion.div {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.6 }} className="glass-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-gray-800 dark:text-gray-200">
              {language === 'hi' ? '🕐 हालिया गतिविधि' : '🕐 Recent Activity'}
            </h2>
            <Link to="/sales" className="text-xs text-primary-600 dark:text-primary-400 hover:underline">
              {language === 'hi' ? 'सब देखें' : 'View All'}
            </Link>
          </div>
          <div className="space-y-3">
            {recentSales.map((sale) => (
              <div key={sale.id} className="flex items-start gap-3 py-2 border-b border-gray-50 dark:border-gray-800 last:border-0">
                <div className={`mt-0.5 p-1.5 rounded-lg ${sale.paymentMode === 'udhaar' ? 'bg-amber-50 dark:bg-amber-900/20' : 'bg-green-50 dark:bg-green-900/20'}`}>
                  {sale.paymentMode === 'udhaar'
                    ? <CreditCard className="w-3.5 h-3.5 text-amber-600" />
                    : <Banknote className="w-3.5 h-3.5 text-green-600" />
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-gray-800 dark:text-gray-200 truncate">
                    {sale.products.map((p) => p.name).join(', ')}
                  </p>
                  <p className="text-[11px] text-gray-400">
                    {sale.customerName || 'Walk-in'} • {getRelativeTime(sale.timestamp)}
                  </p>
                </div>
                <span className={`text-xs font-semibold shrink-0 ${sale.paymentMode === 'udhaar' ? 'text-amber-600' : 'text-green-600'}`}>
                  {formatCurrency(sale.totalAmount)}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </PageWrapper>
  );
}
