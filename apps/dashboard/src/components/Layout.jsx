import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Users, HeadphonesIcon, BarChart3, CreditCard,
  Activity, FileText, LogOut, Menu, X, Bell, Settings, Shield
} from 'lucide-react';
import { useAuth } from '../lib/auth';

const navItems = [
  { path: '/', label: 'Overview', icon: LayoutDashboard, roles: ['admin', 'support', 'marketing', 'accounting'] },
  { path: '/users', label: 'Users', icon: Users, roles: ['admin', 'support'] },
  { path: '/tickets', label: 'Support Tickets', icon: HeadphonesIcon, roles: ['admin', 'support'] },
  { path: '/analytics', label: 'Analytics', icon: BarChart3, roles: ['admin', 'marketing'] },
  { path: '/billing', label: 'Billing', icon: CreditCard, roles: ['admin', 'accounting'] },
  { path: '/system', label: 'System Health', icon: Activity, roles: ['admin'] },
  { path: '/audit', label: 'Audit Logs', icon: FileText, roles: ['admin'] },
];

export default function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();
  const { profile, signOut } = useAuth();

  const userRole = profile?.role || 'admin';
  const visibleNav = navItems.filter(item => item.roles.includes(userRole));

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-950">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-16'} transition-all duration-300 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col shadow-sm`}>
        {/* Logo */}
        <div className="flex items-center gap-3 p-4 border-b border-gray-100 dark:border-gray-800">
          <div className="w-8 h-8 rounded-lg gradient-bg flex items-center justify-center flex-shrink-0">
            <Shield className="w-4 h-4 text-white" />
          </div>
          {sidebarOpen && (
            <div>
              <p className="font-bold text-gray-900 dark:text-white text-sm">Shiftly Health</p>
              <p className="text-xs text-gray-500">Admin Dashboard</p>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {visibleNav.map(({ path, label, icon: Icon }) => {
            const active = location.pathname === path;
            return (
              <Link
                key={path}
                to={path}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  active
                    ? 'bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-400'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                {sidebarOpen && <span>{label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* User */}
        <div className="p-3 border-t border-gray-100 dark:border-gray-800">
          {sidebarOpen ? (
            <div className="flex items-center gap-3 px-3 py-2">
              <div className="w-8 h-8 rounded-full gradient-bg flex items-center justify-center flex-shrink-0">
                <span className="text-white text-xs font-bold">
                  {profile?.full_name?.[0] || profile?.email?.[0] || 'A'}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {profile?.full_name || 'Admin'}
                </p>
                <p className="text-xs text-gray-500 capitalize">{userRole}</p>
              </div>
              <button onClick={signOut} className="text-gray-400 hover:text-red-500 transition-colors" title="Sign out">
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button onClick={signOut} className="w-full flex items-center justify-center p-2 text-gray-400 hover:text-red-500 transition-colors">
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="h-14 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 flex items-center gap-4 px-4 shadow-sm">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <div className="flex-1" />
          <button className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white relative">
            <Bell className="w-5 h-5" />
            <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-red-500 rounded-full text-white text-xs flex items-center justify-center">3</span>
          </button>
          <button className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white">
            <Settings className="w-5 h-5" />
          </button>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6 animate-fade-in">
          {children}
        </main>
      </div>
    </div>
  );
}
