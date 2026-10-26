import { useState, useMemo } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Package, ShoppingCart, BookOpen, Brain,
  Mic, ScanLine, Receipt, Settings, Menu, X, ChevronLeft,
  Sun, Moon, Globe, Bell, Search,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { APP_NAME, NAV_ITEMS } from '../../utils/constants';

const iconMap = {
  LayoutDashboard, Package, ShoppingCart, BookOpen, Brain,
  Mic, ScanLine, Receipt, Settings,
};

export default function Sidebar() {
  const { state, dispatch } = useApp();
  const { sidebarOpen, darkMode, language } = state;
  const location = useLocation();

  const toggle = () => dispatch({ type: 'TOGGLE_SIDEBAR' });

  return (
    <>
      {/* Mobile overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 z-40 lg:hidden"
            onClick={toggle}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 z-50 h-full flex flex-col
          bg-white dark:bg-surface-dark border-r border-gray-100 dark:border-gray-800
          transition-all duration-300 ease-in-out
          ${sidebarOpen ? 'w-64' : 'w-[72px]'}
          lg:relative
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Header / Logo */}
        <div className="flex items-center gap-3 px-4 h-16 border-b border-gray-100 dark:border-gray-800 shrink-0">
          <div className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center shrink-0">
            <Brain className="w-5 h-5 text-white" />
          </div>
          {sidebarOpen && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex flex-col min-w-0"
            >
              <span className="text-sm font-bold text-primary-600 dark:text-primary-300 truncate">
                {APP_NAME}
              </span>
              <span className="text-[10px] text-gray-400 dark:text-gray-500 truncate">
                Smart Dukan
              </span>
            </motion.div>
          )}
          {/* Collapse button (desktop) */}
          <button
            onClick={toggle}
            className="ml-auto p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hidden lg:flex"
            aria-label="Toggle sidebar"
          >
            <ChevronLeft className={`w-4 h-4 transition-transform ${!sidebarOpen ? 'rotate-180' : ''}`} />
          </button>
          {/* Close button (mobile) */}
          <button
            onClick={toggle}
            className="ml-auto p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 lg:hidden"
            aria-label="Close sidebar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {NAV_ITEMS.map((item) => {
            if (item.type === 'divider') {
              return sidebarOpen ? (
                <div key={item.key} className="pt-4 pb-1 px-3">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-600">
                    {item.label}
                  </span>
                </div>
              ) : (
                <div key={item.key} className="pt-3 pb-1 flex justify-center">
                  <div className="w-6 h-px bg-gray-200 dark:bg-gray-700" />
                </div>
              );
            }

            const Icon = iconMap[item.icon];
            const isActive = location.pathname === item.path;

            return (
              <NavLink
                key={item.key}
                to={item.path}
                className={`
                  group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
                  transition-all duration-200
                  ${isActive
                    ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-300 shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50 hover:text-gray-900 dark:hover:text-gray-200'
                  }
                  ${!sidebarOpen ? 'justify-center' : ''}
                `}
                title={item.label}
              >
                {Icon && (
                  <Icon
                    className={`w-5 h-5 shrink-0 transition-colors ${
                      isActive ? 'text-primary-500' : 'text-gray-400 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-300'
                    }`}
                  />
                )}
                {sidebarOpen && (
                  <span className="truncate">
                    {language === 'hi' ? item.labelHi : item.label}
                  </span>
                )}
                {isActive && sidebarOpen && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary-500" />
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Bottom controls */}
        <div className="px-3 py-3 border-t border-gray-100 dark:border-gray-800 space-y-2 shrink-0">
          {/* Dark mode toggle */}
          <button
            onClick={() => dispatch({ type: 'TOGGLE_DARK_MODE' })}
            className={`
              flex items-center gap-3 w-full px-3 py-2 rounded-xl text-sm
              text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50
              transition-colors ${!sidebarOpen ? 'justify-center' : ''}
            `}
          >
            {darkMode ? <Sun className="w-4.5 h-4.5 text-amber-500" /> : <Moon className="w-4.5 h-4.5 text-gray-400" />}
            {sidebarOpen && <span>{darkMode ? 'Light Mode' : 'Dark Mode'}</span>}
          </button>

          {/* Language toggle */}
          <button
            onClick={() => dispatch({ type: 'SET_LANGUAGE', payload: language === 'en' ? 'hi' : 'en' })}
            className={`
              flex items-center gap-3 w-full px-3 py-2 rounded-xl text-sm
              text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50
              transition-colors ${!sidebarOpen ? 'justify-center' : ''}
            `}
          >
            <Globe className="w-4.5 h-4.5" />
            {sidebarOpen && <span>{language === 'en' ? 'हिंदी' : 'English'}</span>}
          </button>
        </div>
      </aside>
    </>
  );
}
