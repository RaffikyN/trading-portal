import React from 'react';
import Layout from '../components/Layout';
import { useTrading } from '../context/TradingContext';
import { TrendingUp, TrendingDown, Users, ArrowDownLeft, Target, Calendar } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';

function StatCard({ title, value, subtitle, icon: Icon, trend }) {
  return (
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
  // Group trades by date
  const dailyPL = trades.reduce((acc, trade) => {
    const date = trade.date;
    if (!acc[date]) {
      acc[date] = 0;
    }
    acc[date] += trade.profit;
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
    const pnl = dailyPL[dateStr] || 0;
    days.push({ day, pnl, dateStr });
  }

  return (
    <div className="bg-trading-card/20 backdrop-blur-sm border border-trading-pink/20 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-trading-text mb-4">
        Trading Calendar - {now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
      </h3>
      <div className="grid grid-cols-7 gap-2 text-sm">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="text-center text-trading-text-muted font-medium py-2">
            {day}
          </div>
        ))}
        {days.map((day, index) => (
          <div
            key={index}
            className={`
              aspect-square flex items-center justify-center text-xs rounded-lg
              ${!day ? 'invisible' : ''}
              ${day && day.pnl > 0 ? 'bg-trading-green/20 text-trading-green' : 
                day && day.pnl < 0 ? 'bg-trading-red/20 text-trading-red' :
                day && day.pnl === 0 && dailyPL[day.dateStr] !== undefined ? 'bg-trading-gray/20 text-trading-text-muted' :
                'bg-trading-card/10 text-trading-text-muted'}
            `}
          >
            {day && day.day}
          </div>
        ))}
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
  const { totalPL, activeAccounts, totalWithdrawals, winRate, trades } = useTrading();

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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Portfolio P&L"
            value={`$${totalPL.toLocaleString()}`}
            subtitle={totalPL >= 0 ? '+' + ((totalPL / 100000) * 100).toFixed(2) + '%' : ((totalPL / 100000) * 100).toFixed(2) + '%'}
            icon={totalPL >= 0 ? TrendingUp : TrendingDown}
            trend={totalPL >= 0 ? 'up' : 'down'}
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

        {/* Weekly Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <WeeklyStats trades={trades} />
          
          <div className="bg-trading-card/20 backdrop-blur-sm border border-trading-pink/20 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-trading-text mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button className="w-full bg-trading-pink/20 hover:bg-trading-pink/30 border border-trading-pink/30 text-trading-pink px-4 py-2 rounded-lg transition-colors">
                Import New Trades
              </button>
              <button className="w-full bg-trading-card hover:bg-trading-gray text-trading-text px-4 py-2 rounded-lg transition-colors">
                Record Withdrawal
              </button>
              <button className="w-full bg-trading-card hover:bg-trading-gray text-trading-text px-4 py-2 rounded-lg transition-colors">
                View Analysis
              </button>
            </div>
          </div>

          <div className="bg-trading-card/20 backdrop-blur-sm border border-trading-pink/20 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-trading-text mb-4">Recent Activity</h3>
            <div className="space-y-3">
              {trades.slice(-3).reverse().map((trade, index) => (
                <div key={index} className="flex justify-between items-center">
                  <div>
                    <p className="text-trading-text text-sm">{trade.symbol}</p>
                    <p className="text-trading-text-muted text-xs">{trade.date}</p>
                  </div>
                  <span className={`text-sm font-medium ${
                    trade.profit >= 0 ? 'text-trading-green' : 'text-trading-red'
                  }`}>
                    ${trade.profit.toLocaleString()}
                  </span>
                </div>
              ))}
              {trades.length === 0 && (
                <p className="text-trading-text-muted text-sm">No recent trades</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}