/* ===== FORMATTERS & HELPERS ===== */

/**
 * Format a number as Indian Rupee currency.
 * e.g., 12500 -> "₹12,500"
 */
export function formatCurrency(amount) {
  if (amount == null || isNaN(amount)) return '₹0';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format a date string to a human-readable format.
 * e.g., "2026-10-23" -> "23 Oct 2026"
 */
export function formatDate(dateStr) {
  if (!dateStr) return '—';
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

/**
 * Format a datetime to time string.
 * e.g., "2026-10-23T09:15:00" -> "9:15 AM"
 */
export function formatTime(dateStr) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleTimeString('en-IN', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

/**
 * Get relative time label.
 * e.g., "2 days ago", "Just now", "5 hours ago"
 */
export function getRelativeTime(dateStr) {
  if (!dateStr) return '';
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return formatDate(dateStr);
}

/**
 * Get days until expiry from a date string.
 * Returns negative number if already expired.
 */
export function getDaysUntilExpiry(dateStr) {
  if (!dateStr) return Infinity;
  const now = new Date();
  const expiry = new Date(dateStr);
  return Math.ceil((expiry - now) / 86400000);
}

/**
 * Get days since last sold.
 */
export function getDaysSinceLastSold(dateStr) {
  if (!dateStr) return Infinity;
  const now = new Date();
  const lastSold = new Date(dateStr);
  return Math.floor((now - lastSold) / 86400000);
}

/**
 * Calculate stock status based on current stock and minimum stock level.
 */
export function getStockStatus(currentStock, minStock) {
  if (currentStock === 0) return 'OUT';
  if (currentStock <= minStock * 0.5) return 'LOW';
  if (currentStock >= minStock * 3) return 'EXCESS';
  return 'OK';
}

/**
 * Calculate expiry status.
 */
export function getExpiryStatus(expiryDate) {
  if (!expiryDate) return { status: 'none', label: 'No Expiry', color: 'neutral' };
  const days = getDaysUntilExpiry(expiryDate);
  if (days < 0) return { status: 'expired', label: 'Expired', color: 'danger' };
  if (days <= 7) return { status: 'critical', label: `${days}d left`, color: 'danger' };
  if (days <= 30) return { status: 'warning', label: `${days}d left`, color: 'warning' };
  return { status: 'ok', label: `${days}d left`, color: 'success' };
}

/**
 * Get the initials from a name for avatar display.
 * e.g., "Rahul Sharma" -> "RS"
 */
export function getInitials(name) {
  if (!name) return '?';
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

/**
 * Format number in Indian number system.
 * e.g., 1250000 -> "12.5L"
 */
export function formatCompactNumber(num) {
  if (num >= 10000000) return `${(num / 10000000).toFixed(1)}Cr`;
  if (num >= 100000) return `${(num / 100000).toFixed(1)}L`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
}

/**
 * Calculate profit margin percentage.
 */
export function getProfitMargin(costPrice, sellPrice) {
  if (!costPrice || !sellPrice || costPrice === 0) return 0;
  return Math.round(((sellPrice - costPrice) / costPrice) * 100);
}

/**
 * Generate a simulated WhatsApp reminder message with tone adjustment based on overdue days.
 */
export function generateReminderMessage(customerName, amount, overdueDays) {
  if (overdueDays <= 7) {
    return `🙏 Namaste ${customerName} ji, yeh ek friendly reminder hai ki ₹${amount} ka udhaar baaki hai. Jab bhi convenient ho, please clear kar dijiye. Dhanyavaad! — KiranaMind AI`;
  }
  if (overdueDays <= 21) {
    return `Namaste ${customerName} ji, aapka ₹${amount} ka udhaar ${overdueDays} din se pending hai. Request hai ki jald se jald payment kar dijiye. Dhanyavaad. — KiranaMind AI`;
  }
  return `${customerName} ji, aapke ₹${amount} ka payment ${overdueDays} din se baaki hai. Yeh amount bahut dino se pending hai. Kripya jald se jald payment kare. — KiranaMind AI`;
}
