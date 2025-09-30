import React, { useState } from 'react';
import Layout from '../components/Layout';
import { useTrading } from '../context/TradingContext';
import { TrendingUp, TrendingDown, Users, ArrowDownLeft, Target, Calendar, Wallet, Plus, DollarSign, CreditCard, Shield, AlertTriangle, CheckCircle, BarChart3, TrendingUp as TrendingUpIcon } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import Link from 'next/link';
import { useRouter } from 'next/router';

function StatCard({ title, value, subtitle, icon: Icon, trend, href }) {
  const content = (
    <div className="bg-trading-card/20 backdrop-blur-sm border border-trading-pink/20 rounded-lg p-6 hover:bg-trading-card/30 transition-all duration-300">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-trading-text-muted text-sm font-medium">{title}</p>
          <p className="text-2xl font-bold text-trading-text mt-1">{value}</p>
          {subtitle && (
            <p className={`text-sm mt-1 ${
              trend === 'up' ? 'text-trading-green' : 
              trend === 'down' ? 'text-trading-red' : 
              'text-trading-text-muted'
            }`}>
              {subtitle}
            </p>
          )}
        </div>
        <div className="p-3 bg-trading-pink/20 rounded-full">
          <Icon className="h-6 w-6 text-trading-pink" />
        </div>
      </div>
    </div>
  );

  if (href) {
    return (
      <Link href={href}>
        <a>{content}</a>
      </Link>
    );
  }

  return content;
}

function QuickAddModal({ type, onClose, onSubmit }) {
  const [formData, setFormData] = useState({
    category: '',
    description: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    dueDate: new Date().toISOString().split('T')[0],
    isPaid: false,
    isRecurring: false
  });

  const categories = type === 'expense' 
    ? ['Housing', 'Transportation', 'Food & Dining', 'Utilities', 'Healthcare', 'Entertainment', 'Shopping', 'Personal Care', 'Education', 'Insurance', 'Credit Cards', 'Loans', 'Investments', 'Other']
    : ['Salary', 'Freelance', 'Business', 'Investments', 'Trading', 'Rental', 'Other'];

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      amount: parseFloat(formData.amount)
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-trading-card border border-trading-pink/20 rounded-lg p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
        <h3 className="text-lg font-semibold text-trading-text mb-4">
          Add {type === 'expense' ? 'Expense' : 'Income'}
        </h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-trading-text mb-2">Category</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full bg-trading-bg border border-trading-gray rounded-lg px-3 py-2 text-trading-text focus:border-trading-pink focus:outline-none"
              required
            >
              <option value="">Select Category</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-trading-text mb-2">Description</label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full bg-trading-bg border border-trading-gray rounded-lg px-3 py-2 text-trading-text focus:border-trading-pink focus:outline-none"
              placeholder="e.g., Rent, Salary"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-trading-text mb-2">Amount</label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              className="w-full bg-trading-bg border border-trading-gray rounded-lg px-3 py-2 text-trading-text focus:border-trading-pink focus:outline-none"
              placeholder="0.00"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-trading-text mb-2">
              {type === 'expense' ? 'Due Date' : 'Date'}
            </label>
            <input
              type="date"
              value={type === 'expense' ? formData.dueDate : formData.date}
              onChange={(e) => setFormData({ 
                ...formData, 
                [type === 'expense' ? 'dueDate' : 'date']: e.target.value 
              })}
              className="w-full bg-trading-bg border border-trading-gray rounded-lg px-3 py-2 text-trading-text focus:border-trading-pink focus:outline-none"
              required
            />
          </div>

          <div className="flex gap-6">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.isPaid}
                onChange={(e) => setFormData({ ...formData, isPaid: e.target.checked })}
                className="mr-2 accent-trading-pink"
              />
              <span className="text-trading-text text-sm">
                {type === 'expense' ? 'Paid?' : 'Received?'}
              </span>
            </label>

            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.isRecurring}
                onChange={(e) => setFormData({ ...formData, isRecurring: e.target.checked })}
                className="mr-2 accent-trading-pink"
              />
              <span className="text-trading-text text-sm">Recurring?</span>
            </label>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              className={`flex-1 ${
                type === 'expense' 
                  ? 'bg-trading-pink hover:bg-trading-pink-dark' 
                  : 'bg-trading-green hover:bg-trading-green/80'
              } text-white px-4 py-2 rounded-lg font-medium transition-colors`}
            >
              Add {type === 'expense' ? 'Expense' : 'Income'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="bg-trading-card hover:bg-trading-gray text-trading-text px-4 py-2 rounded-lg transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function PerformanceChart({ trades }) {
  const dailyData = trades.reduce((acc, trade) => {
    const date = trade.date;
    if (!acc[date]) {
      acc[date] = 0;
    }
    acc[date] += trade.profit;
    return acc;
  }, {});

  let cumulativePL = 0;
  const chartData = Object.keys(dailyData)
    .sort()
    .map(date => {
      cumulativePL += dailyData[date];
      return {
        date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        pnl: cumulativePL,
        daily: dailyData[date]
      };
    });

  return (
    <div className="bg-trading-card/20 backdrop-blur-sm border border-trading-pink/20 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-trading-text mb-4">Performance Over Time</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis 
              dataKey="date" 
              stroke="#9ca3af"
              fontSize={12}
            />
            <YAxis 
              stroke="#9ca3af"
              fontSize={12}
              tickFormatter={(value) => `$${value.toLocaleString()}`}
            />
            <Line 
              type="monotone" 
              dataKey="pnl" 
              stroke="#ec4899" 
              strokeWidth={2}
              dot={{ fill: '#ec4899', strokeWidth: 2, r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function TopInstruments({ trades }) {
  const instrumentData = trades.reduce((acc, trade) => {
    if (!acc[trade.symbol]) {
      acc[trade.symbol] = { symbol: trade.symbol, totalPL: 0, trades: 0 };
    }
    acc[trade.symbol].totalPL += trade.profit;
    acc[trade.symbol].trades++;
    return acc;
  }, {});

  const topInstruments = Object.values(instrumentData)
    .sort((a, b) => b.totalPL - a.totalPL)
    .slice(0, 5);

  return (
    <div className="bg-trading-card/20 backdrop-blur-sm border border-trading-pink/20 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-trading-text mb-4">Top Instruments</h3>
      <div className="space-y-3">
        {topInstruments.length > 0 ? (
          topInstruments.map((instrument, index) => (
            <div key={instrument.symbol} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-trading-pink/20 rounded-full flex items-center justify-center text-trading-pink font-semibold text-sm">
                  {index + 1}
                </div>
                <div>
                  <div className="text-trading-text font-medium">{instrument.symbol}</div>
                  <div className="text-xs text-trading-text-muted">{instrument.trades} trades</div>
                </div>
              </div>
              <div className={`font-semibold ${instrument.totalPL >= 0 ? 'text-trading-green' : 'text-trading-red'}`}>
                ${instrument.totalPL.toLocaleString()}
              </div>
            </div>
          ))
        ) : (
          <p className="text-trading-text-muted text-center py-4">No trading data yet</p>
        )}
      </div>
    </div>
  );
}

function AccountsOverview({ accounts }) {
  const accountsArray = Object.values(accounts);
  const fundedAccounts = accountsArray.filter(acc => acc.id.includes('PA')).length;
  const evaluationAccounts = accountsArray.length - fundedAccounts;

  return (
    <div className="bg-trading-card/20 backdrop-blur-sm border border-trading-pink/20 rounded-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-trading-text">Accounts Overview</h3>
        <Link href="/accounts">
          <a className="text-trading-pink hover:text-trading-pink/70 text-sm">View All →</a>
        </Link>
      </div>
      
      {accountsArray.length > 0 ? (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-trading-green/10 rounded-lg">
              <div className="text-2xl font-bold text-trading-green">{fundedAccounts}</div>
              <div className="text-xs text-trading-text-muted">Funded (PA)</div>
            </div>
            <div className="text-center p-3 bg-trading-pink/10 rounded-lg">
              <div className="text-2xl font-bold text-trading-pink">{evaluationAccounts}</div>
              <div className="text-xs text-trading-text-muted">Evaluation</div>
            </div>
          </div>
          
          <div className="space-y-2">
            {accountsArray.slice(0, 3).map(account => {
              const isProfit = account.totalPL >= 0;
              return (
                <div key={account.id} className="flex items-center justify-between p-2 bg-trading-card/20 rounded">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-trading-pink" />
                    <span className="text-sm text-trading-text truncate max-w-[120px]">{account.id}</span>
                  </div>
                  <span className={`text-sm font-semibold ${isProfit ? 'text-trading-green' : 'text-trading-red'}`}>
                    {isProfit ? '+' : ''}${account.totalPL.toLocaleString()}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <p className="text-trading-text-muted text-center py-4">No accounts yet</p>
      )}
    </div>
  );
}

function UpcomingExpenses({ expenses }) {
  const upcoming = expenses
    .filter(exp => !exp.isPaid)
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
    .slice(0, 5);

  const totalUpcoming = upcoming.reduce((sum, exp) => sum + exp.amount, 0);

  return (
    <div className="bg-trading-card/20 backdrop-blur-sm border border-trading-pink/20 rounded-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-trading-text">Upcoming Expenses</h3>
        <Link href="/planner?tab=expenses">
          <a className="text-trading-pink hover:text-trading-pink/70 text-sm">View All →</a>
        </Link>
      </div>
      
      {upcoming.length > 0 ? (
        <>
          <div className="mb-4 p-3 bg-trading-red/10 rounded-lg">
            <div className="text-sm text-trading-text-muted">Total Due</div>
            <div className="text-2xl font-bold text-trading-red">${totalUpcoming.toLocaleString()}</div>
          </div>
          
          <div className="space-y-2">
            {upcoming.map(expense => {
              const daysUntilDue = Math.ceil((new Date(expense.dueDate) - new Date()) / (1000 * 60 * 60 * 24));
              const isOverdue = daysUntilDue < 0;
              const isDueSoon = daysUntilDue <= 7 && daysUntilDue >= 0;
              
              return (
                <div key={expense.id} className="flex items-center justify-between p-2 bg-trading-card/20 rounded">
                  <div className="flex items-center gap-2">
                    {isOverdue ? (
                      <AlertTriangle className="h-4 w-4 text-trading-red" />
                    ) : isDueSoon ? (
                      <AlertTriangle className="h-4 w-4 text-yellow-500" />
                    ) : (
                      <CreditCard className="h-4 w-4 text-trading-pink" />
                    )}
                    <div>
                      <div className="text-sm text-trading-text">{expense.description}</div>
                      <div className="text-xs text-trading-text-muted">
                        {isOverdue ? 'Overdue' : isDueSoon ? `Due in ${daysUntilDue}d` : new Date(expense.dueDate).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <span className="text-sm font-semibold text-trading-red">${expense.amount.toLocaleString()}</span>
                </div>
              );
            })}
          </div>
        </>
      ) : (
        <div className="text-center py-8">
          <CheckCircle className="h-12 w-12 text-trading-green mx-auto mb-2" />
          <p className="text-trading-text-muted">All expenses paid!</p>
        </div>
      )}
    </div>
  );
}

function RecentWithdrawals({ withdrawals }) {
  const recent = withdrawals
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5);

  const totalThisMonth = withdrawals.filter(w => {
    const withdrawalDate = new Date(w.date);
    const now = new Date();
    return withdrawalDate.getMonth() === now.getMonth() && 
           withdrawalDate.getFullYear() === now.getFullYear();
  }).reduce((sum, w) => sum + w.amount, 0);

  return (
    <div className="bg-trading-card/20 backdrop-blur-sm border border-trading-pink/20 rounded-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-trading-text">Recent Withdrawals</h3>
        <Link href="/withdrawals">
          <a className="text-trading-pink hover:text-trading-pink/70 text-sm">View All →</a>
        </Link>
      </div>
      
      {recent.length > 0 ? (
        <>
          <div className="mb-4 p-3 bg-trading-pink/10 rounded-lg">
            <div className="text-sm text-trading-text-muted">This Month</div>
            <div className="text-2xl font-bold text-trading-pink">${totalThisMonth.toLocaleString()}</div>
          </div>
          
          <div className="space-y-2">
            {recent.map(withdrawal => (
              <div key={withdrawal.id} className="flex items-center justify-between p-2 bg-trading-card/20 rounded">
                <div className="flex items-center gap-2">
                  <ArrowDownLeft className="h-4 w-4 text-trading-pink" />
                  <div>
                    <div className="text-sm text-trading-text">{withdrawal.account}</div>
                    <div className="text-xs text-trading-text-muted">
                      {new Date(withdrawal.date).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <span className="text-sm font-semibold text-trading-pink">${withdrawal.amount.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </>
      ) : (
        <p className="text-trading-text-muted text-center py-8">No withdrawals yet</p>
      )}
    </div>
  );
}

function CashFlowSummary({ calculateCashFlow, currentCash }) {
  const monthly = calculateCashFlow('month');

  return (
    <div className="bg-trading-card/20 backdrop-blur-sm border border-trading-pink/20 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-trading-text mb-4">Cash Flow (This Month)</h3>
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-trading-text-muted">Current Cash</span>
          <span className="text-trading-text font-semibold">${currentCash.toLocaleString()}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-trading-text-muted">Income</span>
          <span className="text-trading-green font-semibold">+${monthly.income.toLocaleString()}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-trading-text-muted">Expenses</span>
          <span className="text-trading-red font-semibold">-${monthly.expenses.toLocaleString()}</span>
        </div>
        <div className="pt-3 border-t border-trading-gray/30">
          <div className="flex justify-between items-center">
            <span className="text-trading-text font-medium">Net Cash Flow</span>
            <span className={`text-lg font-bold ${monthly.netCashFlow >= 0 ? 'text-trading-green' : 'text-trading-red'}`}>
              {monthly.netCashFlow >= 0 ? '+' : ''}${monthly.netCashFlow.toLocaleString()}
            </span>
          </div>
          <div className="mt-2 text-xs text-trading-text-muted text-right">
            Projected: ${monthly.projectedCash.toLocaleString()}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { 
    totalPL, 
    activeAccounts, 
    totalWithdrawals, 
    winRate, 
    trades, 
    currentCash,
    accounts,
    withdrawals,
    expenses,
    addExpense,
    addIncome,
    calculateCashFlow
  } = useTrading();

  const [showModal, setShowModal] = useState(null);

  return (
    <Layout>
      <div className="p-6 lg:p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-trading-text">Dashboard</h1>
          <p className="text-trading-text-muted mt-2">
            Complete overview of your trading and finances.
          </p>
        </div>

        {/* Top Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <StatCard
            title="Total Portfolio P&L"
            value={`$${totalPL.toLocaleString()}`}
            subtitle={totalPL >= 0 ? '+' + ((totalPL / 100000) * 100).toFixed(2) + '%' : ((totalPL / 100000) * 100).toFixed(2) + '%'}
            icon={totalPL >= 0 ? TrendingUp : TrendingDown}
            trend={totalPL >= 0 ? 'up' : 'down'}
          />
          <StatCard
            title="Available Cash"
            value={`$${currentCash.toLocaleString()}`}
            subtitle="Personal Finance"
            icon={Wallet}
            href="/planner"
          />
          <StatCard
            title="Active Accounts"
            value={activeAccounts}
            subtitle="Accounts Trading"
            icon={Users}
            href="/accounts"
          />
          <StatCard
            title="Total Withdrawals"
            value={`$${totalWithdrawals.toLocaleString()}`}
            subtitle="Withdrawn to Date"
            icon={ArrowDownLeft}
            href="/withdrawals"
          />
          <StatCard
            title="Win Rate"
            value={`${winRate.toFixed(1)}%`}
            subtitle={`${trades.filter(t => t.profit > 0).length} of ${trades.length} trades`}
            icon={Target}
            trend={winRate >= 50 ? 'up' : 'down'}
            href="/analysis"
          />
        </div>

        {/* Main Chart */}
        <div className="mb-8">
          <PerformanceChart trades={trades} />
        </div>

        {/* Widgets Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <TopInstruments trades={trades} />
          <AccountsOverview accounts={accounts} />
          <CashFlowSummary calculateCashFlow={calculateCashFlow} currentCash={currentCash} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <UpcomingExpenses expenses={expenses} />
          <RecentWithdrawals withdrawals={withdrawals} />
          
          <div className="bg-trading-card/20 backdrop-blur-sm border border-trading-pink/20 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-trading-text mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <Link href="/journal">
                <a className="w-full bg-trading-pink/20 hover:bg-trading-pink/30 border border-trading-pink/30 text-trading-pink px-4 py-2 rounded-lg transition-colors block text-center">
                  Import New Trades
                </a>
              </Link>
              <button
                onClick={() => setShowModal('expense')}
                className="w-full flex items-center justify-center gap-2 bg-trading-red/20 hover:bg-trading-red/30 border border-trading-red/30 text-trading-red px-4 py-2 rounded-lg transition-colors"
              >
                <Plus size={16} />
                Add Expense
              </button>
              <button
                onClick={() => setShowModal('income')}
                className="w-full flex items-center justify-center gap-2 bg-trading-green/20 hover:bg-trading-green/30 border border-trading-green/30 text-trading-green px-4 py-2 rounded-lg transition-colors"
              >
                <Plus size={16} />
                Add Income
              </button>
              <Link href="/analysis">
                <a className="w-full bg-trading-card hover:bg-trading-gray text-trading-text px-4 py-2 rounded-lg transition-colors block text-center">
                  View Analysis
                </a>
              </Link>
            </div>
          </div>
        </div>

        {/* Modals */}
        {showModal && (
          <QuickAddModal
            type={showModal}
            onClose={() => setShowModal(null)}
            onSubmit={showModal === 'expense' ? addExpense : addIncome}
          />
        )}
      </div>
    </Layout>
  );
}