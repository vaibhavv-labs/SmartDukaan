import { Menu, Bell, Search, User } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import insightsData from '../../data/insights.json';

export default function Topbar({ title, titleHi }) {
  const { state, dispatch } = useApp();
  const { language, shopName, sidebarOpen } = state;

  const unreadInsights = insightsData.filter((i) => !i.isRead && !i.isDismissed).length;

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/80 dark:bg-surface-dark/80 backdrop-blur-md border-b border-gray-100 dark:border-gray-800 flex items-center gap-4 px-4 lg:px-6">
      {/* Mobile menu toggle */}
      <button
        onClick={() => dispatch({ type: 'TOGGLE_SIDEBAR' })}
        className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500"
        aria-label="Open menu"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Page title */}
      <div className="flex-1 min-w-0">
        <h1 className="text-lg font-bold text-gray-900 dark:text-white truncate">
          {language === 'hi' ? (titleHi || title) : title}
        </h1>
        <p className="text-xs text-gray-400 dark:text-gray-500 truncate hidden sm:block">
          {shopName}
        </p>
      </div>

      {/* Search bar (desktop) */}
      <div className="hidden md:flex items-center gap-2 bg-gray-50 dark:bg-gray-800 rounded-xl px-3 py-2 w-64 border border-transparent focus-within:border-primary-300 dark:focus-within:border-primary-600 transition-colors">
        <Search className="w-4 h-4 text-gray-400 shrink-0" />
        <input
          type="text"
          placeholder={language === 'hi' ? 'खोजें...' : 'Search...'}
          className="bg-transparent text-sm text-gray-700 dark:text-gray-200 placeholder:text-gray-400 outline-none w-full"
        />
      </div>

      {/* Notification bell */}
      <button className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 transition-colors">
        <Bell className="w-5 h-5" />
        {unreadInsights > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4.5 h-4.5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
            {unreadInsights}
          </span>
        )}
      </button>

      {/* User avatar */}
      <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center">
        <User className="w-4 h-4 text-white" />
      </div>
    </header>
  );
}
