import React, { useState } from 'react';
import Layout from '../components/Layout';
import { useTrading } from '../context/TradingContext';
import { TrendingUp, TrendingDown, Users, ArrowDownLeft, Target, Calendar, Wallet, Plus, DollarSign, CreditCard } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';
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
  const { accounts } = useTrading();
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
  // Group trades by date and calculate cumulative P&L
  const dailyData = trades.reduce((acc, trade) => {
    const date = trade.date;
    if (!acc[date]) {
      acc[date] = 0;
    }
    acc[date] += trade.profit;
    return acc;
  }, {});

  // Convert to array and sort by date
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

function TradingCalendar({ trades }) {
  const router = useRouter();
  
  // Group trades by date
  const dailyData = trades.reduce((acc, trade) => {
    const date = trade.date;
    if (!acc[date]) {
      acc[date] = {
        pnl: 0,
        trades: 0
      };
    }
    acc[date].pnl += trade.profit;
    acc[date].trades += 1;
    return acc;
  }, {});

  // Get current month days
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startingDayOfWeek = firstDay.getDay();

  const days = [];
  
  // Add empty cells for days before the first day of the month
  for (let i = 0; i < startingDayOfWeek; i++) {
    days.push(null);
  }
  
  // Add days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const dayData = dailyData[dateStr] || { pnl: 0, trades: 0 };
    days.push({ 
      day, 
      dateStr, 
      pnl: dayData.pnl, 
      trades: dayData.trades,
      hasData: dayData.trades > 0
    });
  }

  const handleDayClick = (dayData) => {
    if (dayData && dayData.hasData) {
      router.push(`/analysis?date=${dayData.dateStr}`);
    }
  };

  return (
    <div className="bg-trading-card/20 backdrop-blur-sm border border-trading-pink/20 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-trading-text mb-4">
        Trading Calendar - {now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
      </h3>
      <div className="grid grid-cols-7 gap-1 text-sm">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="text-center text-trading-text-muted font-medium py-2">
            {day}
          </div>
        ))}
        {days.map((day, index) => (
          <div
            key={index}
            onClick={() => handleDayClick(day)}
            className={`
              aspect-square flex flex-col items-center justify-center text-xs rounded-lg p-1
              ${!day ? 'invisible' : ''}
              ${day && day.hasData ? 'cursor-pointer hover:scale-105 transform transition-all duration-200' : ''}
              ${day && day.pnl > 0 ? 'bg-trading-green/20 text-trading-green border border-trading-green/30 hover:bg-trading-green/30' : 
                day && day.pnl < 0 ? 'bg-trading-red/20 text-trading-red border border-trading-red/30 hover:bg-trading-red/30' :
                day && day.hasData ? 'bg-trading-gray/20 text-trading-text-muted border border-trading-gray/30 hover:bg-trading-gray/30' :
                'bg-trading-card/10 text-trading-text-muted'}
            `}
            title={day && day.hasData ? `${day.trades} trades, ${day.pnl.toLocaleString()}` : ''}
          >
            {day && (
              <>
                <div className="font-medium">{day.day}</div>
                {day.hasData && (
                  <>
                    <div className="text-xs font-bold">
                      ${Math.abs(day.pnl) >= 1000 ? 
                        `${(day.pnl / 1000).toFixed(1)}k` : 
                        day.pnl.toFixed(0)
                      }
                    </div>
                    <div className="text-xs opacity-75">
                      {day.trades}T
                    </div>
                  </>
                )}
              </>
            )}
          </div>
        ))}
      </div>
      <div className="mt-4 text-xs text-trading-text-muted text-center">
        Click on trading days to view detailed analysis
      </div>
    </div>
  );
}

function WeeklyStats({ trades }) {
  // Get this week's trades
  const now = new Date();
  const weekStart = new Date(now.setDate(now.getDate() - now.getDay()));
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 6);

  const thisWeekTrades = trades.filter(trade => {
    const tradeDate = new Date(trade.date);
    return tradeDate >= weekStart && tradeDate <= weekEnd;
  });

  const weeklyPL = thisWeekTrades.reduce((sum, trade) => sum + trade.profit, 0);
  const weeklyTrades = thisWeekTrades.length;

  return (
    <div className="bg-trading-card/20 backdrop-blur-sm border border-trading-pink/20 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-trading-text mb-4">This Week</h3>
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-trading-text-muted">P&L</span>
          <span className={`font-semibold ${weeklyPL >= 0 ? 'text-trading-green' : 'text-trading-red'}`}>
            ${weeklyPL.toLocaleString()}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-trading-text-muted">Trades</span>
          <span className="text-trading-text font-semibold">{weeklyTrades}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-trading-text-muted">Avg per Trade</span>
          <span className={`font-semibold ${
            weeklyTrades > 0 ? (weeklyPL / weeklyTrades >= 0 ? 'text-trading-green' : 'text-trading-red') : 'text-trading-text-muted'
          }`}>
            {weeklyTrades > 0 ? `$${(weeklyPL / weeklyTrades).toLocaleString()}` : '$0'}
          </span>
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
    addExpense,
    addIncome 
  } = useTrading();

  const [showModal, setShowModal] = useState(null);

  const handleAddExpense = (expense) => {
    addExpense(expense);
  };

  const handleAddIncome = (income) => {
    addIncome(income);
  };

  return (
    <Layout>
      <div className="p-6 lg:p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-trading-text">Dashboard</h1>
          <p className="text-trading-text-muted mt-2">
            Welcome back! Here's your trading overview.
          </p>
        </div>

        {/* Stats Grid */}
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
          />
          <StatCard
            title="Total Withdrawals"
            value={`$${totalWithdrawals.toLocaleString()}`}
            subtitle="Withdrawn to Date"
            icon={ArrowDownLeft}
          />
          <StatCard
            title="Win Rate"
            value={`${winRate.toFixed(1)}%`}
            subtitle={`${trades.filter(t => t.profit > 0).length} of ${trades.length} trades`}
            icon={Target}
            trend={winRate >= 50 ? 'up' : 'down'}
          />
        </div>

        {/* Charts and Calendar */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <PerformanceChart trades={trades} />
          <TradingCalendar trades={trades} />
        </div>

        {/* Weekly Stats and Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <WeeklyStats trades={trades} />
          
          <div className="bg-trading-card/20 backdrop-blur-sm border border-trading-pink/20 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-trading-text mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <Link href="/journal">
                <a className="w-full bg-trading-pink/20 hover:bg-trading-pink/30 border border-trading-pink/30 text-trading-pink px-4 py-2 rounded-lg transition-colors block text-center">
                  Import New Trades
                </a>
              </Link>
              <Link href="/withdrawals">
                <a className="w-full bg-trading-card hover:bg-trading-gray text-trading-text px-4 py-2 rounded-lg transition-colors block text-center">
                  Record Withdrawal
                </a>
              </Link>
              <Link href="/analysis">
                <a className="w-full bg-trading-card hover:bg-trading-gray text-trading-text px-4 py-2 rounded-lg transition-colors block text-center">
                  View Analysis
                </a>
              </Link>
            </div>
          </div>

          <div className="bg-trading-card/20 backdrop-blur-sm border border-trading-pink/20 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-trading-text mb-4">Financial Planner</h3>
            <div className="space-y-3">
              <button
                onClick={() => setShowModal('expense')}
                className="w-full flex items-center justify-center gap-2 bg-trading-pink/20 hover:bg-trading-pink/30 border border-trading-pink/30 text-trading-pink px-4 py-2 rounded-lg transition-colors"
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
              <Link href="/planner">
                <a className="w-full bg-trading-card hover:bg-trading-gray text-trading-text px-4 py-2 rounded-lg transition-colors block text-center">
                  View Full Planner
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
            onSubmit={showModal === 'expense' ? handleAddExpense : handleAddIncome}
          />
        )}
      </div>
    </Layout>
  );
}