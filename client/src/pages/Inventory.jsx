import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Search, Filter, Package, Edit2, Trash2, X, AlertTriangle, ChevronLeft, ChevronRight,
} from 'lucide-react';
import PageWrapper from '../components/layout/PageWrapper';
import { useApp } from '../context/AppContext';
import inventoryData from '../data/inventory.json';
import { CATEGORIES, STOCK_STATUS } from '../utils/constants';
import {
  formatCurrency, formatDate, getStockStatus, getExpiryStatus, getDaysUntilExpiry,
} from '../utils/formatters';

const ITEMS_PER_PAGE = 10;

export default function Inventory() {
  const { state } = useApp();
  const { language } = state;

  const [products, setProducts] = useState(inventoryData);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [stockFilter, setStockFilter] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [sortDir, setSortDir] = useState('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);

  /* ---- Filtering + Sorting + Pagination ---- */
  const filtered = useMemo(() => {
    let result = [...products];

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter((p) => p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q));
    }
    if (selectedCategory !== 'All') {
      result = result.filter((p) => p.category === selectedCategory);
    }
    if (stockFilter !== 'all') {
      result = result.filter((p) => {
        const status = getStockStatus(p.stock, p.minStock);
        if (stockFilter === 'low') return status === 'LOW' || status === 'OUT';
        if (stockFilter === 'expiring') return p.expiryDate && getDaysUntilExpiry(p.expiryDate) <= 7;
        return true;
      });
    }

    result.sort((a, b) => {
      let valA, valB;
      switch (sortBy) {
        case 'name': valA = a.name.toLowerCase(); valB = b.name.toLowerCase(); break;
        case 'stock': valA = a.stock; valB = b.stock; break;
        case 'price': valA = a.sellPrice; valB = b.sellPrice; break;
        case 'expiry': valA = a.expiryDate ? new Date(a.expiryDate).getTime() : Infinity; valB = b.expiryDate ? new Date(b.expiryDate).getTime() : Infinity; break;
        default: valA = a.name; valB = b.name;
      }
      if (valA < valB) return sortDir === 'asc' ? -1 : 1;
      if (valA > valB) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [products, searchQuery, selectedCategory, stockFilter, sortBy, sortDir]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  /* ---- Stats ---- */
  const totalProducts = products.length;
  const lowStockCount = products.filter((p) => getStockStatus(p.stock, p.minStock) === 'LOW' || getStockStatus(p.stock, p.minStock) === 'OUT').length;
  const expiringCount = products.filter((p) => p.expiryDate && getDaysUntilExpiry(p.expiryDate) <= 7 && getDaysUntilExpiry(p.expiryDate) >= 0).length;
  const totalValue = products.reduce((sum, p) => sum + p.stock * p.costPrice, 0);

  /* ---- Handlers ---- */
  const handleSort = (col) => {
    if (sortBy === col) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else { setSortBy(col); setSortDir('asc'); }
  };

  const handleDelete = (id) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
    setShowDeleteConfirm(null);
  };

  const handleSave = (formData) => {
    if (editProduct) {
      setProducts((prev) => prev.map((p) => (p.id === editProduct.id ? { ...p, ...formData } : p)));
    } else {
      const newId = Math.max(...products.map((p) => p.id)) + 1;
      setProducts((prev) => [...prev, { id: newId, ...formData }]);
    }
    setShowModal(false);
    setEditProduct(null);
  };

  return (
    <PageWrapper title="Inventory" titleHi="इन्वेंटरी">
      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: language === 'hi' ? 'कुल प्रोडक्ट' : 'Total Products', value: totalProducts, color: 'text-primary-600', bg: 'bg-primary-50 dark:bg-primary-900/30' },
          { label: language === 'hi' ? 'कम स्टॉक' : 'Low Stock', value: lowStockCount, color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-900/30' },
          { label: language === 'hi' ? 'एक्सपायरिंग' : 'Expiring Soon', value: expiringCount, color: 'text-red-600', bg: 'bg-red-50 dark:bg-red-900/30' },
          { label: language === 'hi' ? 'स्टॉक मूल्य' : 'Stock Value', value: formatCurrency(totalValue), color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/30' },
        ].map((stat, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className={`${stat.bg} rounded-xl p-3 lg:p-4`}>
            <p className={`text-xl lg:text-2xl font-bold ${stat.color}`}>{stat.value}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="glass-card p-4">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search */}
          <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-800 rounded-xl px-3 py-2 flex-1 border border-transparent focus-within:border-primary-300">
            <Search className="w-4 h-4 text-gray-400 shrink-0" />
            <input
              type="text"
              placeholder={language === 'hi' ? 'प्रोडक्ट खोजें...' : 'Search products...'}
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              className="bg-transparent text-sm outline-none w-full text-gray-700 dark:text-gray-200"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="text-gray-400 hover:text-gray-600"><X className="w-4 h-4" /></button>
            )}
          </div>

          {/* Category filter */}
          <select
            value={selectedCategory}
            onChange={(e) => { setSelectedCategory(e.target.value); setCurrentPage(1); }}
            className="bg-gray-50 dark:bg-gray-800 rounded-xl px-3 py-2 text-sm text-gray-700 dark:text-gray-200 border border-transparent focus:border-primary-300 outline-none"
          >
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>

          {/* Stock filter */}
          <select
            value={stockFilter}
            onChange={(e) => { setStockFilter(e.target.value); setCurrentPage(1); }}
            className="bg-gray-50 dark:bg-gray-800 rounded-xl px-3 py-2 text-sm text-gray-700 dark:text-gray-200 border border-transparent focus:border-primary-300 outline-none"
          >
            <option value="all">{language === 'hi' ? 'सब स्टॉक' : 'All Stock'}</option>
            <option value="low">{language === 'hi' ? 'कम / खत्म' : 'Low / Out'}</option>
            <option value="expiring">{language === 'hi' ? 'एक्सपायरिंग' : 'Expiring ≤7d'}</option>
          </select>

          {/* Add button */}
          <button
            onClick={() => { setEditProduct(null); setShowModal(true); }}
            className="gradient-primary text-white px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 hover:shadow-lg transition-shadow shrink-0"
          >
            <Plus className="w-4 h-4" />
            {language === 'hi' ? 'नया प्रोडक्ट' : 'Add Product'}
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-800">
                {[
                  { key: 'name', label: language === 'hi' ? 'प्रोडक्ट' : 'Product' },
                  { key: 'stock', label: language === 'hi' ? 'स्टॉक' : 'Stock' },
                  { key: 'price', label: language === 'hi' ? 'कीमत' : 'Price' },
                  { key: 'expiry', label: language === 'hi' ? 'एक्सपायरी' : 'Expiry' },
                  { key: 'status', label: language === 'hi' ? 'स्थिति' : 'Status', noSort: true },
                  { key: 'actions', label: '', noSort: true },
                ].map((col) => (
                  <th
                    key={col.key}
                    className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400
                      ${!col.noSort ? 'cursor-pointer hover:text-gray-700 dark:hover:text-gray-200 select-none' : ''}`}
                    onClick={() => !col.noSort && handleSort(col.key)}
                  >
                    <span className="flex items-center gap-1">
                      {col.label}
                      {sortBy === col.key && <span className="text-primary-500">{sortDir === 'asc' ? '↑' : '↓'}</span>}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-gray-400">
                    <Package className="w-10 h-10 mx-auto mb-2 text-gray-300" />
                    <p>{language === 'hi' ? 'कोई प्रोडक्ट नहीं मिला' : 'No products found'}</p>
                  </td>
                </tr>
              ) : (
                paginated.map((product, idx) => {
                  const stockStatus = getStockStatus(product.stock, product.minStock);
                  const statusConfig = STOCK_STATUS[stockStatus];
                  const expiry = getExpiryStatus(product.expiryDate);
                  const margin = product.sellPrice - product.costPrice;

                  return (
                    <motion.tr
                      key={product.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: idx * 0.03 }}
                      className="border-b border-gray-50 dark:border-gray-800/50 hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-medium text-gray-800 dark:text-gray-200">{product.name}</p>
                          <p className="text-[11px] text-gray-400">{product.category} • {product.unit}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-semibold text-gray-800 dark:text-gray-200">{product.stock}</span>
                        <span className="text-gray-400 text-xs ml-1">/ min {product.minStock}</span>
                      </td>
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-semibold text-gray-800 dark:text-gray-200">{formatCurrency(product.sellPrice)}</p>
                          <p className="text-[11px] text-gray-400">Cost: {formatCurrency(product.costPrice)} • +{formatCurrency(margin)}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {product.expiryDate ? (
                          <span className={`badge badge-${expiry.color}`}>
                            {expiry.label}
                          </span>
                        ) : (
                          <span className="text-xs text-gray-400">N/A</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`badge badge-${statusConfig.color}`}>
                          {language === 'hi' ? statusConfig.labelHi : statusConfig.label}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => { setEditProduct(product); setShowModal(true); }}
                            className="p-1.5 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/30 text-gray-400 hover:text-blue-600 transition-colors"
                            aria-label="Edit product"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setShowDeleteConfirm(product)}
                            className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30 text-gray-400 hover:text-red-600 transition-colors"
                            aria-label="Delete product"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 dark:border-gray-800">
            <p className="text-xs text-gray-500">
              {language === 'hi'
                ? `${filtered.length} में से ${(currentPage - 1) * ITEMS_PER_PAGE + 1}-${Math.min(currentPage * ITEMS_PER_PAGE, filtered.length)} दिखा रहे हैं`
                : `Showing ${(currentPage - 1) * ITEMS_PER_PAGE + 1}-${Math.min(currentPage * ITEMS_PER_PAGE, filtered.length)} of ${filtered.length}`}
            </p>
            <div className="flex items-center gap-1">
              <button onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1}
                className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 disabled:opacity-30 disabled:cursor-not-allowed">
                <ChevronLeft className="w-4 h-4" />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button key={page} onClick={() => setCurrentPage(page)}
                  className={`w-8 h-8 rounded-lg text-xs font-medium transition-colors ${page === currentPage ? 'bg-primary-500 text-white' : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400'}`}>
                  {page}
                </button>
              ))}
              <button onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}
                className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 disabled:opacity-30 disabled:cursor-not-allowed">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ===== Add/Edit Modal ===== */}
      <AnimatePresence>
        {showModal && (
          <ProductModal
            product={editProduct}
            onSave={handleSave}
            onClose={() => { setShowModal(false); setEditProduct(null); }}
            language={language}
          />
        )}
      </AnimatePresence>

      {/* ===== Delete Confirm ===== */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setShowDeleteConfirm(null)}>
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
              className="bg-white dark:bg-surface-dark rounded-2xl p-6 max-w-sm w-full shadow-xl" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-xl bg-red-50 dark:bg-red-900/30"><AlertTriangle className="w-5 h-5 text-red-600" /></div>
                <h3 className="font-semibold text-gray-800 dark:text-white">Delete Product?</h3>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-5">
                Are you sure you want to delete <strong>{showDeleteConfirm.name}</strong>? This action cannot be undone.
              </p>
              <div className="flex gap-3 justify-end">
                <button onClick={() => setShowDeleteConfirm(null)}
                  className="px-4 py-2 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">Cancel</button>
                <button onClick={() => handleDelete(showDeleteConfirm.id)}
                  className="px-4 py-2 rounded-xl text-sm font-medium text-white bg-red-600 hover:bg-red-700 transition-colors">Delete</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </PageWrapper>
  );
}

/* ===== Product Add/Edit Modal ===== */
function ProductModal({ product, onSave, onClose, language }) {
  const [form, setForm] = useState({
    name: product?.name || '',
    category: product?.category || 'Grocery',
    stock: product?.stock || 0,
    costPrice: product?.costPrice || 0,
    sellPrice: product?.sellPrice || 0,
    unit: product?.unit || 'pkt',
    expiryDate: product?.expiryDate || '',
    minStock: product?.minStock || 5,
  });

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      ...form,
      stock: Number(form.stock),
      costPrice: Number(form.costPrice),
      sellPrice: Number(form.sellPrice),
      minStock: Number(form.minStock),
      lastSoldDate: product?.lastSoldDate || new Date().toISOString().split('T')[0],
    });
  };

  const fields = [
    { key: 'name', label: 'Product Name', labelHi: 'प्रोडक्ट का नाम', type: 'text', required: true },
    { key: 'category', label: 'Category', labelHi: 'श्रेणी', type: 'select', options: CATEGORIES.filter((c) => c !== 'All') },
    { key: 'stock', label: 'Current Stock', labelHi: 'मौजूदा स्टॉक', type: 'number' },
    { key: 'minStock', label: 'Minimum Stock Level', labelHi: 'न्यूनतम स्टॉक', type: 'number' },
    { key: 'costPrice', label: 'Cost Price (₹)', labelHi: 'लागत मूल्य (₹)', type: 'number' },
    { key: 'sellPrice', label: 'Selling Price (₹)', labelHi: 'बिक्री मूल्य (₹)', type: 'number' },
    { key: 'unit', label: 'Unit', labelHi: 'इकाई', type: 'select', options: ['pkt', 'pc', 'bottle', 'bag', 'jar', 'sachet', 'kg', 'L'] },
    { key: 'expiryDate', label: 'Expiry Date', labelHi: 'एक्सपायरी तारीख', type: 'date' },
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
        className="bg-white dark:bg-surface-dark rounded-2xl p-6 max-w-lg w-full shadow-xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-bold text-gray-800 dark:text-white">
            {product
              ? (language === 'hi' ? 'प्रोडक्ट बदलो' : 'Edit Product')
              : (language === 'hi' ? 'नया प्रोडक्ट जोड़ो' : 'Add New Product')}
          </h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {fields.map((field) => (
            <div key={field.key}>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                {language === 'hi' ? field.labelHi : field.label}
              </label>
              {field.type === 'select' ? (
                <select value={form[field.key]} onChange={(e) => handleChange(field.key, e.target.value)}
                  className="w-full bg-gray-50 dark:bg-gray-800 rounded-xl px-3 py-2.5 text-sm text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-700 outline-none focus:border-primary-400">
                  {field.options.map((o) => <option key={o} value={o}>{o}</option>)}
                </select>
              ) : (
                <input type={field.type} value={form[field.key]} onChange={(e) => handleChange(field.key, e.target.value)}
                  required={field.required}
                  className="w-full bg-gray-50 dark:bg-gray-800 rounded-xl px-3 py-2.5 text-sm text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-700 outline-none focus:border-primary-400" />
              )}
            </div>
          ))}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium text-gray-600 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
              {language === 'hi' ? 'रद्द करें' : 'Cancel'}
            </button>
            <button type="submit"
              className="flex-1 gradient-primary text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:shadow-lg transition-shadow">
              {product ? (language === 'hi' ? 'सेव करो' : 'Save Changes') : (language === 'hi' ? 'जोड़ो' : 'Add Product')}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}
