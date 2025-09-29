import React from 'react';
import Layout from '../components/Layout';
import { useTrading } from '../context/TradingContext';
import { Wallet, TrendingUp, TrendingDown, Activity, AlertCircle } from 'lucide-react';
import Link from 'next/link';

function AccountCard({ account }) {
  const profitPercentage = ((account.totalPL / account.startingBalance) * 100).toFixed(2);
  const isProfit = account.totalPL >= 0;

  return (
    <div className="bg-trading-card/20 backdrop-blur-sm border border-trading-pink/20 rounded-lg p-6 hover:bg-trading-card/30 transition-all duration-300">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-trading-text">{account.id}</h3>
          <p className="text-trading-text-muted text-sm">
            Status: <span className={`font-medium ${
              account.status === 'Active' ? 'text-trading-green' : 'text-trading-red'
            }`}>
              {account.status}
            </span>
          </p>
        </div>
        <div className="p-2 bg-trading-pink/20 rounded-full">
          <Wallet className="h-5 w-5 text-trading-pink" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-trading-text-muted text-sm">Starting Balance</p>
          <p className="text-trading-text font-semibold">
            ${account.startingBalance.toLocaleString()}
          </p>
        </div>
        <div>
          <p className="text-trading-text-muted text-sm">Current Balance</p>
          <p className="text-trading-text font-semibold">
            ${account.currentBalance.toLocaleString()}
          </p>
        </div>
      </div>

      <div className="border-t border-trading-gray/30 pt-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-trading-text-muted text-sm">Total P&L</p>
            <p className={`text-lg font-bold ${isProfit ? 'text-trading-green' : 'text-trading-red'}`}>
              {isProfit ? '+' : ''}${account.totalPL.toLocaleString()}
            </p>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-1">
              {isProfit ? 
                <TrendingUp className="h-4 w-4 text-trading-green" /> : 
                <TrendingDown className="h-4 w-4 text-trading-red" />
              }
              <span className={`text-sm font-medium ${isProfit ? 'text-trading-green' : 'text-trading-red'}`}>
                {isProfit ? '+' : ''}{profitPercentage}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mt-4">
        <div className="flex justify-between text-xs text-trading-text-muted mb-2">
          <span>Performance</span>
          <span>{profitPercentage}%</span>
        </div>
        <div className="w-full bg-trading-gray/30 rounded-full h-2">
          <div 
            className={`h-2 rounded-full transition-all duration-500 ${
              isProfit ? 'bg-trading-green' : 'bg-trading-red'
            }`}
            style={{ width: `${Math.min(Math.abs(parseFloat(profitPercentage)), 100)}%` }}
          />
        </div>
      </div>
    </div>
  );
}

function AccountSummary({ accounts, trades }) {
  const totalAccounts = Object.keys(accounts).length;
  const activeAccounts = Object.values(accounts).filter(acc => acc.status === 'Active').length;
  const totalStartingBalance = Object.values(accounts).reduce((sum, acc) => sum + acc.startingBalance, 0);
  const totalCurrentBalance = Object.values(accounts).reduce((sum, acc) => sum + acc.currentBalance, 0);
  const totalPL = totalCurrentBalance - totalStartingBalance;
  const avgPLPerAccount = totalAccounts > 0 ? totalPL / totalAccounts : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <div className="bg-trading-card/20 backdrop-blur-sm border border-trading-pink/20 rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-trading-text-muted text-sm">Total Accounts</p>
            <p className="text-2xl font-bold text-trading-text">{totalAccounts}</p>
            <p className="text-sm text-trading-green">{activeAccounts} Active</p>
          </div>
          <Activity className="h-8 w-8 text-trading-pink" />
        </div>
      </div>

      <div className="bg-trading-card/20 backdrop-blur-sm border border-trading-pink/20 rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-trading-text-muted text-sm">Total Starting</p>
            <p className="text-2xl font-bold text-trading-text">
              ${totalStartingBalance.toLocaleString()}
            </p>
          </div>
          <Wallet className="h-8 w-8 text-trading-pink" />
        </div>
      </div>

      <div className="bg-trading-card/20 backdrop-blur-sm border border-trading-pink/20 rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-trading-text-muted text-sm">Current Balance</p>
            <p className="text-2xl font-bold text-trading-text">
              ${totalCurrentBalance.toLocaleString()}
            </p>
          </div>
          {totalPL >= 0 ? 
            <TrendingUp className="h-8 w-8 text-trading-green" /> : 
            <TrendingDown className="h-8 w-8 text-trading-red" />
          }
        </div>
      </div>

      <div className="bg-trading-card/20 backdrop-blur-sm border border-trading-pink/20 rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-trading-text-muted text-sm">Avg P&L/Account</p>
            <p className={`text-2xl font-bold ${avgPLPerAccount >= 0 ? 'text-trading-green' : 'text-trading-red'}`}>
              ${avgPLPerAccount.toLocaleString()}
            </p>
          </div>
          <TrendingUp className="h-8 w-8 text-trading-pink" />
        </div>
      </div>
    </div>
  );
}

function AccountPerformanceChart({ accounts }) {
  const accountsArray = Object.values(accounts);
  
  if (accountsArray.length === 0) return null;

  return (
    <div className="bg-trading-card/20 backdrop-blur-sm border border-trading-pink/20 rounded-lg p-6 mb-6">
      <h3 className="text-lg font-semibold text-trading-text mb-4">Account Performance Comparison</h3>
      <div className="space-y-4">
        {accountsArray.map(account => {
          const profitPercentage = (account.totalPL / account.startingBalance) * 100;
          const maxPercent = Math.max(...accountsArray.map(a => Math.abs((a.totalPL / a.startingBalance) * 100)));
          const barWidth = maxPercent > 0 ? (Math.abs(profitPercentage) / maxPercent) * 100 : 0;
          
          return (
            <div key={account.id} className="flex items-center gap-4">
              <div className="w-32 text-sm text-trading-text truncate">{account.id}</div>
              <div className="flex-1 relative">
                <div className="w-full bg-trading-gray/30 rounded-full h-4 flex items-center">
                  <div 
                    className={`h-4 rounded-full transition-all duration-500 flex items-center justify-end pr-2 ${
                      profitPercentage >= 0 ? 'bg-trading-green' : 'bg-trading-red'
                    }`}
                    style={{ width: `${barWidth}%`, minWidth: '40px' }}
                  >
                    <span className="text-xs font-medium text-white">
                      {profitPercentage >= 0 ? '+' : ''}{profitPercentage.toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>
              <div className="w-24 text-right text-sm font-medium">
                <span className={profitPercentage >= 0 ? 'text-trading-green' : 'text-trading-red'}>
                  ${account.totalPL.toLocaleString()}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function AccountTracker() {
  const { accounts, trades } = useTrading();
  const accountsArray = Object.values(accounts);

  return (
    <Layout>
      <div className="p-6 lg:p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-trading-text">Account Tracker</h1>
          <p className="text-trading-text-muted mt-2">
            Monitor your trading accounts and their performance.
          </p>
        </div>

        {accountsArray.length > 0 ? (
          <>
            {/* Summary Stats */}
            <AccountSummary accounts={accounts} trades={trades} />

            {/* Performance Chart */}
            <AccountPerformanceChart accounts={accounts} />

            {/* Account Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {accountsArray.map(account => (
                <AccountCard key={account.id} account={account} />
              ))}
            </div>
          </>
        ) : (
          <div className="bg-trading-card/20 backdrop-blur-sm border border-trading-pink/20 rounded-lg p-12">
            <div className="text-center">
              <AlertCircle className="h-16 w-16 text-trading-text-muted mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-trading-text mb-2">No Accounts Found</h3>
              <p className="text-trading-text-muted mb-6">
                Accounts will automatically appear here when you import trades from your CSV files.
              </p>
              <div className="flex justify-center">
                <Link 
                  href="/journal"
                  className="bg-trading-pink hover:bg-trading-pink-dark text-white px-6 py-3 rounded-lg font-medium transition-colors"
                >
                  Import Trades
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Account Management Section */}
        {accountsArray.length > 0 && (
          <div className="mt-8 bg-trading-card/20 backdrop-blur-sm border border-trading-pink/20 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-trading-text mb-4">Account Management</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button className="bg-trading-pink/20 hover:bg-trading-pink/30 border border-trading-pink/30 text-trading-pink px-4 py-2 rounded-lg transition-colors">
                Add Manual Account
              </button>
              <button className="bg-trading-card hover:bg-trading-gray text-trading-text px-4 py-2 rounded-lg transition-colors">
                Export Account Data
              </button>
              <button className="bg-trading-card hover:bg-trading-gray text-trading-text px-4 py-2 rounded-lg transition-colors">
                Account Settings
              </button>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}