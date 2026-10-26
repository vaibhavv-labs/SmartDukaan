import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  ShoppingCart, IndianRupee, CreditCard, Banknote, Calendar,
  Filter, Download, TrendingUp, ChevronLeft, ChevronRight,
} from 'lucide-react';
import PageWrapper from '../components/layout/PageWrapper';
import { useApp } from '../context/AppContext';
import salesData from '../data/sales.json';
import { formatCurrency, formatDate, formatTime, getRelativeTime } from '../utils/formatters';

const ITEMS_PER_PAGE = 12;

export default function Sales() {
  const { state } = useApp();
  const { language } = state;

  const [paymentFilter, setPaymentFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);

  /* ---- Stats ---- */
  const stats = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const todaySales = salesData.filter((s) => s.timestamp.startsWith(today));
    const totalRevenue = salesData.reduce((sum, s) => sum + s.totalAmount, 0);
    const totalCash = salesData.filter((s) => s.paymentMode === 'cash').reduce((sum, s) => sum + s.totalAmount, 0);
    const totalUdhaar = salesData.filter((s) => s.paymentMode === 'udhaar').reduce((sum, s) => sum + s.totalAmount, 0);
    return {
      todayRevenue: todaySales.reduce((sum, s) => sum + s.totalAmount, 0),
      todayCount: todaySales.length,
      totalRevenue,
      totalCash,
      totalUdhaar,
      totalBills: salesData.length,
    };
  }, []);

  /* ---- Filtering + Pagination ---- */
  const filtered = useMemo(() => {
    if (paymentFilter === 'all') return salesData;
    return salesData.filter((s) => s.paymentMode === paymentFilter);
  }, [paymentFilter]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  return (
    <PageWrapper title="Sales" titleHi="बिक्री">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: language === 'hi' ? 'आज की बिक्री' : "Today's Revenue", value: formatCurrency(stats.todayRevenue), sub: `${stats.todayCount} bills`, icon: IndianRupee, bg: 'bg-green-50 dark:bg-green-900/30', color: 'text-green-600' },
          { label: language === 'hi' ? 'कुल बिक्री' : 'Total Revenue', value: formatCurrency(stats.totalRevenue), sub: `${stats.totalBills} bills`, icon: TrendingUp, bg: 'bg-blue-50 dark:bg-blue-900/30', color: 'text-blue-600' },
          { label: language === 'hi' ? 'नकद' : 'Cash', value: formatCurrency(stats.totalCash), icon: Banknote, bg: 'bg-emerald-50 dark:bg-emerald-900/30', color: 'text-emerald-600' },
          { label: language === 'hi' ? 'उधार' : 'Udhaar', value: formatCurrency(stats.totalUdhaar), icon: CreditCard, bg: 'bg-amber-50 dark:bg-amber-900/30', color: 'text-amber-600' },
        ].map((s, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className={`${s.bg} rounded-xl p-4`}>
            <s.icon className={`w-5 h-5 ${s.color} mb-2`} />
            <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{s.label}</p>
            {s.sub && <p className="text-[11px] text-gray-400 mt-0.5">{s.sub}</p>}
          </motion.div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex bg-gray-100 dark:bg-gray-800 rounded-xl p-1 gap-1">
          {[
            { key: 'all', label: language === 'hi' ? 'सब' : 'All' },
            { key: 'cash', label: language === 'hi' ? 'नकद' : 'Cash' },
            { key: 'udhaar', label: language === 'hi' ? 'उधार' : 'Udhaar' },
          ].map((f) => (
            <button key={f.key} onClick={() => { setPaymentFilter(f.key); setCurrentPage(1); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${paymentFilter === f.key ? 'bg-white dark:bg-gray-700 text-gray-800 dark:text-white shadow-sm' : 'text-gray-500'}`}>
              {f.label}
            </button>
          ))}
        </div>
        <button className="ml-auto px-3 py-2 rounded-xl text-xs font-medium text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 flex items-center gap-1.5">
          <Download className="w-3.5 h-3.5" />
          Export CSV
        </button>
      </div>

      {/* Sales List */}
      <div className="space-y-3">
        {paginated.map((sale, idx) => (
          <motion.div
            key={sale.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.03 }}
            className="glass-card p-4"
          >
            <div className="flex items-start gap-3">
              {/* Payment icon */}
              <div className={`mt-0.5 p-2 rounded-xl shrink-0 ${sale.paymentMode === 'udhaar' ? 'bg-amber-50 dark:bg-amber-900/20' : 'bg-green-50 dark:bg-green-900/20'}`}>
                {sale.paymentMode === 'udhaar'
                  ? <CreditCard className="w-4 h-4 text-amber-600" />
                  : <Banknote className="w-4 h-4 text-green-600" />}
              </div>

              {/* Details */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-gray-800 dark:text-white truncate">
                    #{sale.id} — {sale.customerName || (language === 'hi' ? 'वॉक-इन ग्राहक' : 'Walk-in Customer')}
                  </p>
                  <span className={`text-sm font-bold shrink-0 ${sale.paymentMode === 'udhaar' ? 'text-amber-600' : 'text-green-600'}`}>
                    {formatCurrency(sale.totalAmount)}
                  </span>
                </div>

                {/* Products */}
                <div className="flex flex-wrap gap-1.5 mt-1.5">
                  {sale.products.map((p, pi) => (
                    <span key={pi} className="text-[11px] bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 px-2 py-0.5 rounded-full">
                      {p.name} ×{p.qty}
                    </span>
                  ))}
                </div>

                {/* Meta */}
                <div className="flex items-center gap-3 mt-2 text-[11px] text-gray-400">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {formatDate(sale.timestamp)} • {formatTime(sale.timestamp)}
                  </span>
                  <span className={`badge ${sale.paymentMode === 'udhaar' ? 'badge-warning' : 'badge-success'}`}>
                    {sale.paymentMode === 'udhaar' ? (language === 'hi' ? 'उधार' : 'Udhaar') : (language === 'hi' ? 'नकद' : 'Cash')}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 disabled:opacity-30">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-sm text-gray-500">{currentPage} / {totalPages}</span>
          <button onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 disabled:opacity-30">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </PageWrapper>
  );
}
