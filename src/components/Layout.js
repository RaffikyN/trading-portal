import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useTrading } from '../context/TradingContext';
import { 
  LayoutDashboard, 
  BookOpen, 
  Wallet, 
  ArrowDownLeft, 
  Target, 
  TrendingUp,
  Menu,
  X,
  LogOut,
  User
} from 'lucide-react';
import { useState } from 'react';

const navItems = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Trading Journal', href: '/journal', icon: BookOpen },
  { name: 'Account Tracker', href: '/accounts', icon: Wallet },
  { name: 'Withdrawals', href: '/withdrawals', icon: ArrowDownLeft },
  { name: 'Financial Planner', href: '/planner', icon: Target },
  { name: 'Analysis', href: '/analysis', icon: TrendingUp },
];

export default function Layout({ children }) {
  const router = useRouter();
  const { user, signOut, loading, error, offlineMode } = useTrading();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleSignOut = async () => {
    if (window.confirm('Are you sure you want to sign out?')) {
      await signOut();
    }
  };

  const handleEmergencyReset = () => {
    if (window.confirm('This will force reload the page and clear any stuck states. Continue?')) {
      // Clear any stuck state and reload
      localStorage.clear();
      window.location.reload();
    }
  };

  return (
    <div className="min-h-screen bg-trading-bg flex">
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="bg-trading-card p-2 rounded-lg text-trading-text hover:bg-trading-gray transition-colors"
        >
          {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-40 w-64 bg-trading-card transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:relative lg:flex lg:flex-col
      `}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-center h-16 bg-trading-pink/10 border-b border-trading-pink/20">
            <h1 className="text-xl font-bold text-trading-pink">Trading Portal</h1>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = router.pathname === item.href;
              
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`
                    flex items-center px-4 py-3 text-sm rounded-lg transition-colors
                    ${isActive 
                      ? 'bg-trading-pink/20 text-trading-pink border border-trading-pink/30' 
                      : 'text-trading-text hover:bg-trading-pink/10 hover:text-trading-pink'
                    }
                  `}
                  onClick={() => setSidebarOpen(false)}
                >
                  <Icon className="mr-3 h-5 w-5" />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-trading-gray space-y-3">
            <div className="flex items-center gap-2 px-2">
              <User className="h-4 w-4 text-trading-pink" />
              <span className="text-xs text-trading-text truncate">
                {user?.email}
              </span>
            </div>
            <button
              onClick={handleSignOut}
              disabled={loading}
              className="w-full flex items-center gap-2 px-2 py-2 text-xs text-trading-text-muted hover:text-trading-red transition-colors disabled:opacity-50"
            >
              <LogOut className="h-4 w-4" />
              {loading ? 'Signing out...' : 'Sign Out'}
            </button>
            <button
              onClick={handleEmergencyReset}
              className="w-full text-xs text-trading-text-muted hover:text-trading-text underline"
            >
              Emergency Reset
            </button>
            <p className="text-xs text-trading-text-muted text-center">
              Trading Portal v1.0
            </p>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Offline mode banner */}
        {offlineMode && (
          <div className="bg-trading-pink/20 border-b border-trading-pink/30 px-4 py-2">
            <p className="text-trading-pink text-sm text-center">
              📱 Offline Mode - Using local storage (data saved locally)
            </p>
          </div>
        )}
        
        {/* Error banner */}
        {error && (
          <div className="bg-trading-red/20 border-b border-trading-red/30 px-4 py-3">
            <div className="flex items-center justify-between">
              <p className="text-trading-red text-sm">
                Error: {error}
              </p>
              <button 
                onClick={handleEmergencyReset}
                className="text-trading-red hover:text-trading-red/70 text-xs underline"
              >
                Reset App
              </button>
            </div>
          </div>
        )}
        
        {/* Loading overlay */}
        {loading && (
          <div className="bg-trading-bg/80 border-b border-trading-pink/30 px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-trading-pink"></div>
                <p className="text-trading-pink text-sm">Loading...</p>
              </div>
              <button 
                onClick={handleEmergencyReset}
                className="text-trading-text-muted hover:text-trading-text text-xs underline"
              >
                Taking too long? Reset
              </button>
            </div>
          </div>
        )}
        
        <main className="flex-1">
          {children}
        </main>
      </div>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}