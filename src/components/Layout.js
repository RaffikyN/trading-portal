import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { 
  LayoutDashboard, 
  BookOpen, 
  Wallet, 
  ArrowDownLeft, 
  Target, 
  TrendingUp,
  Menu,
  X
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
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
          <div className="p-4 border-t border-trading-gray">
            <p className="text-xs text-trading-text-muted text-center">
              Trading Portal v1.0
            </p>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
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