/* ===== APP CONSTANTS ===== */

export const APP_NAME = 'KiranaMind AI';
export const APP_TAGLINE = 'Smart Dukan, Smart Decisions';
export const APP_TAGLINE_HI = 'स्मार्ट दुकान, स्मार्ट फैसले';

/* Navigation items */
export const NAV_ITEMS = [
  { key: 'dashboard', label: 'Dashboard', labelHi: 'डैशबोर्ड', path: '/', icon: 'LayoutDashboard' },
  { key: 'inventory', label: 'Inventory', labelHi: 'इन्वेंटरी', path: '/inventory', icon: 'Package' },
  { key: 'sales', label: 'Sales', labelHi: 'बिक्री', path: '/sales', icon: 'ShoppingCart' },
  { key: 'khata', label: 'Khata Book', labelHi: 'खाता बुक', path: '/khata', icon: 'BookOpen' },
  { key: 'insights', label: 'AI Insights', labelHi: 'AI सुझाव', path: '/insights', icon: 'Brain' },
  { key: 'divider1', type: 'divider', label: 'AI Tools' },
  { key: 'voice', label: 'Voice Billing', labelHi: 'आवाज़ बिलिंग', path: '/voice-billing', icon: 'Mic' },
  { key: 'khata-scan', label: 'Khata Scan', labelHi: 'खाता स्कैन', path: '/khata-scan', icon: 'ScanLine' },
  { key: 'bill-scan', label: 'Bill Scan', labelHi: 'बिल स्कैन', path: '/bill-scan', icon: 'Receipt' },
  { key: 'divider2', type: 'divider', label: 'Settings' },
  { key: 'settings', label: 'Settings', labelHi: 'सेटिंग्स', path: '/settings', icon: 'Settings' },
];

/* Product categories */
export const CATEGORIES = [
  'All', 'Biscuits', 'Snacks', 'Dairy', 'Grocery', 'Beverages',
  'Detergent', 'Cleaning', 'Personal Care', 'Bakery', 'Instant Food',
  'Stationery', 'Confectionery',
];

/* Stock statuses */
export const STOCK_STATUS = {
  OUT: { label: 'Out of Stock', labelHi: 'स्टॉक खत्म', color: 'danger', min: 0, max: 0 },
  LOW: { label: 'Low Stock', labelHi: 'कम स्टॉक', color: 'warning' },
  OK: { label: 'In Stock', labelHi: 'स्टॉक में', color: 'success' },
  EXCESS: { label: 'Excess Stock', labelHi: 'ज़्यादा स्टॉक', color: 'info' },
};

/* Payment modes */
export const PAYMENT_MODES = [
  { value: 'cash', label: 'Cash', labelHi: 'नकद', icon: 'Banknote' },
  { value: 'udhaar', label: 'Udhaar (Credit)', labelHi: 'उधार', icon: 'CreditCard' },
  { value: 'upi', label: 'UPI', labelHi: 'UPI', icon: 'Smartphone' },
];

/* Risk levels */
export const RISK_LEVELS = {
  low: { label: 'Low Risk', labelHi: 'कम जोखिम', color: 'success', bgClass: 'bg-green-50 text-green-700' },
  moderate: { label: 'Moderate', labelHi: 'मध्यम जोखिम', color: 'warning', bgClass: 'bg-amber-50 text-amber-700' },
  high: { label: 'High Risk', labelHi: 'ज़्यादा जोखिम', color: 'danger', bgClass: 'bg-red-50 text-red-700' },
};

/* Insight types */
export const INSIGHT_TYPES = {
  'expiry': { label: 'Expiry Alert', icon: 'Clock', color: '#dc2626', bgColor: 'rgba(220, 38, 38, 0.08)' },
  'dead-stock': { label: 'Dead Stock', icon: 'PackageX', color: '#b45309', bgColor: 'rgba(180, 83, 9, 0.08)' },
  'cashflow': { label: 'Cash Flow', icon: 'TrendingDown', color: '#dc2626', bgColor: 'rgba(220, 38, 38, 0.08)' },
  'reorder': { label: 'Reorder', icon: 'RefreshCw', color: '#3b82f6', bgColor: 'rgba(59, 130, 246, 0.08)' },
  'udhaar-risk': { label: 'Udhaar Risk', icon: 'AlertTriangle', color: '#dc2626', bgColor: 'rgba(220, 38, 38, 0.08)' },
};

/* Severity colors */
export const SEVERITY = {
  high: { color: '#dc2626', bg: 'bg-red-50 dark:bg-red-950/30', border: 'border-red-200 dark:border-red-800', dot: 'bg-red-500' },
  medium: { color: '#f59e0b', bg: 'bg-amber-50 dark:bg-amber-950/30', border: 'border-amber-200 dark:border-amber-800', dot: 'bg-amber-500' },
  low: { color: '#3b82f6', bg: 'bg-blue-50 dark:bg-blue-950/30', border: 'border-blue-200 dark:border-blue-800', dot: 'bg-blue-500' },
};
