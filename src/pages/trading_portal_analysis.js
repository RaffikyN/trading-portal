import React from 'react';
import Layout from '../components/Layout';
import { useTrading } from '../context/TradingContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, TrendingDown, Target, Clock, Calendar, DollarSign } from 'lucide-react';

function StatCard({ title, value, subtitle, icon: Icon, trend }) {
  return (
    <div className="bg-trading-card/20 backdrop-blur-sm border border-trading-pink/20 rounded-lg p-6">
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

function InstrumentBreakdown({ trades }) {
  // Group trades by symbol
  const instrumentData = trades.reduce((acc, trade) => {
    if (!acc[trade.symbol]) {
      acc[trade.symbol] = {
        symbol: trade.symbol,
        trades: 0,
        winningTrades: 0,
        totalPL: 0,
        totalVolume: 0
      };
    }
    
    acc[trade.symbol].trades++;
    acc[trade.symbol].totalPL += trade.profit;
    acc[trade.symbol].totalVolume += trade.quantity;
    
    if (trade.profit > 0) {
      acc[trade.symbol].winningTrades++;
    }
    
    return acc;
  }, {});

  const chartData = Object.values(instrumentData)
    .map(item => ({
      ...item,
      winRate: ((item.winningTrades / item.trades) * 100).toFixed(1),
      avgPL: (item.totalPL / item.trades).toFixed(0)
    }))
    .sort((a, b) => b.totalPL - a.totalPL);

  const COLORS = ['#ec4899', '#f472b6', '#10b981', '#3b82f6', '#8b5cf6', '#f59e0b'];

  return (
    <div className="bg-trading-card/20 backdrop-blur-sm border border-trading-pink/20 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-trading-text mb-4">Performance by Instrument</h3>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar Chart */}
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis 
                dataKey="symbol" 
                stroke="#9ca3af"
                fontSize={12}
              />
              <YAxis 
                stroke="#9ca3af"
                fontSize={12}
                tickFormatter={(value) => `$${value}`}
              />
              <Bar 
                dataKey="totalPL" 
                fill="#ec4899"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-trading-gray/30">
                <th className="text-left text-trading-text font-medium py-2">Symbol</th>
                <th className="text-right text-trading-text font-medium py-2">Trades</th>
                <th className="text-right text-trading-text font-medium py-2">Win Rate</th>
                <th className="text-right text-trading-text font-medium py-2">P&L</th>
              </tr>
            </thead>
            <tbody>
              {chartData.map((item, index) => (
                <tr key={item.symbol} className="border-b border-trading-gray/20">
                  <td className="text-trading-text py-2 font-medium">{item.symbol}</td>
                  <td className="text-trading-text-muted text-right py-2">{item.trades}</td>
                  <td className="text-right py-2">
                    <span className={`${parseFloat(item.winRate) >= 50 ? 'text-trading-green' : 'text-trading-red'}`}>
                      {item.winRate}%
                    </span>
                  </td>
                  <td className="text-right py-2">
                    <span className={`font-medium ${item.totalPL >= 0 ? 'text-trading-green' : 'text-trading-red'}`}>
                      ${item.totalPL.toLocaleString()}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function TimeAnalysis({ trades }) {
  // Group trades by hour
  const hourlyData = trades.reduce((acc, trade) => {
    const hour = new Date(trade.timestamp).getHours();
    if (!acc[hour]) {
      acc[hour] = { hour, trades: 0, winningTrades: 0, totalPL: 0 };
    }
    acc[hour].trades++;
    acc[hour].totalPL += trade.profit;
    if (trade.profit > 0) acc[hour].winningTrades++;
    return acc;
  }, {});

  // Group trades by day of week
  const dayOfWeekData = trades.reduce((acc, trade) => {
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const day = dayNames[new Date(trade.timestamp).getDay()];
    if (!acc[day]) {
      acc[day] = { day, trades: 0, winningTrades: 0, totalPL: 0 };
    }
    acc[day].trades++;
    acc[day].totalPL += trade.profit;
    if (trade.profit > 0) acc[day].winningTrades++;
    return acc;
  }, {});

  const hourlyChartData = Object.values(hourlyData)
    .map(item => ({
      ...item,
      winRate: item.trades > 0 ? ((item.winningTrades / item.trades) * 100).toFixed(1) : 0,
      avgPL: item.trades > 0 ? (item.totalPL / item.trades).toFixed(0) : 0,
      time: `${item.hour}:00`
    }))
    .sort((a, b) => a.hour - b.hour);

  const weeklyChartData = Object.values(dayOfWeekData)
    .map(item => ({
      ...item,
      winRate: item.trades > 0 ? ((item.winningTrades / item.trades) * 100).toFixed(1) : 0
    }));

  return (
    <div className="space-y-6">
      {/* Hourly Performance */}
      <div className="bg-trading-card/20 backdrop-blur-sm border border-trading-pink/20 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-trading-text mb-4">Performance by Hour</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={hourlyChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis 
                dataKey="time" 
                stroke="#9ca3af"
                fontSize={12}
              />
              <YAxis 
                stroke="#9ca3af"
                fontSize={12}
                tickFormatter={(value) => `$${value}`}
              />
              <Bar 
                dataKey="totalPL" 
                fill="#ec4899"
                radius={[2, 2, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Daily Performance */}
      <div className="bg-trading-card/20 backdrop-blur-sm border border-trading-pink/20 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-trading-text mb-4">Performance by Day of Week</h3>
        <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
          {weeklyChartData.map((day, index) => (
            <div key={day.day} className="text-center">
              <div className="text-trading-text text-sm font-medium mb-2">{day.day.slice(0, 3)}</div>
              <div className="bg-trading-card/30 rounded-lg p-3 space-y-2">
                <div className="text-xs text-trading-text-muted">Trades: {day.trades}</div>
                <div className={`text-sm font-semibold ${day.totalPL >= 0 ? 'text-trading-green' : 'text-trading-red'}`}>
                  ${day.totalPL.toLocaleString()}
                </div>
                <div className="text-xs text-trading-text-muted">
                  Win: {day.winRate}%
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function WinLossDistribution({ trades }) {
  const winningTrades = trades.filter(t => t.profit > 0);
  const losingTrades = trades.filter(t => t.profit < 0);

  // Categorize by profit ranges
  const profitRanges = {
    'Large Loss (>$500)': trades.filter(t => t.profit < -500).length,
    'Medium Loss ($100-$500)': trades.filter(t => t.profit >= -500 && t.profit < -100).length,
    'Small Loss (<$100)': trades.filter(t => t.profit >= -100 && t.profit < 0).length,
    'Small Win (<$100)': trades.filter(t => t.profit > 0 && t.profit <= 100).length,
    'Medium Win ($100-$500)': trades.filter(t => t.profit > 100 && t.profit <= 500).length,
    'Large Win (>$500)': trades.filter(t => t.profit > 500).length,
  };

  const pieData = Object.entries(profitRanges)
    .filter(([_, count]) => count > 0)
    .map(([range, count]) => ({ name: range, value: count }));

  const COLORS = ['#ef4444', '#f97316', '#f59e0b', '#10b981', '#059669', '#047857'];

  return (
    <div className="bg-trading-card/20 backdrop-blur-sm border border-trading-pink/20 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-trading-text mb-4">Win/Loss Distribution</h3>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie Chart */}
        <div className="h-64 flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Legend and Stats */}
        <div className="space-y-4">
          <div className="space-y-2">
            {pieData.map((entry, index) => (
              <div key={entry.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <span className="text-trading-text text-sm">{entry.name}</span>
                </div>
                <span className="text-trading-text-muted text-sm">{entry.value}</span>
              </div>
            ))}
          </div>

          <div className="pt-4 border-t border-trading-gray/30 space-y-2">
            <div className="flex justify-between">
              <span className="text-trading-text-muted">Avg Win:</span>
              <span className="text-trading-green">
                ${winningTrades.length > 0 ? (winningTrades.reduce((sum, t) => sum + t.profit, 0) / winningTrades.length).toFixed(0) : 0}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-trading-text-muted">Avg Loss:</span>
              <span className="text-trading-red">
                ${losingTrades.length > 0 ? (losingTrades.reduce((sum, t) => sum + t.profit, 0) / losingTrades.length).toFixed(0) : 0}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-trading-text-muted">Profit Factor:</span>
              <span className="text-trading-text">
                {losingTrades.length > 0 ? (
                  Math.abs(winningTrades.reduce((sum, t) => sum + t.profit, 0) / 
                  losingTrades.reduce((sum, t) => sum + t.profit, 0)).toFixed(2)
                ) : 'N/A'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Analysis() {
  const { trades, totalPL, winRate, totalTrades } = useTrading();

  if (trades.length === 0) {
    return (
      <Layout>
        <div className="p-6 lg:p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-trading-text">Analysis</h1>
            <p className="text-trading-text-muted mt-2">
              Detailed performance analysis and trading insights.
            </p>
          </div>

          <div className="bg-trading-card/20 backdrop-blur-sm border border-trading-pink/20 rounded-lg p-12">
            <div className="text-center">
              <TrendingUp className="h-16 w-16 text-trading-text-muted mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-trading-text mb-2">No Data Available</h3>
              <p className="text-trading-text-muted mb-6">
                Import your trading data to see detailed analysis and insights.
              </p>
              <div className="flex justify-center">
                <button className="bg-trading-pink hover:bg-trading-pink-dark text-white px-6 py-3 rounded-lg font-medium transition-colors">
                  Import Trades
                </button>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  // Calculate additional metrics
  const winningTrades = trades.filter(t => t.profit > 0);
  const losingTrades = trades.filter(t => t.profit < 0);
  const avgWin = winningTrades.length > 0 ? winningTrades.reduce((sum, t) => sum + t.profit, 0) / winningTrades.length : 0;
  const avgLoss = losingTrades.length > 0 ? losingTrades.reduce((sum, t) => sum + t.profit, 0) / losingTrades.length : 0;
  const profitFactor = avgLoss !== 0 ? Math.abs(avgWin / avgLoss) : 0;
  const expectancy = (winRate / 100) * avgWin + ((100 - winRate) / 100) * avgLoss;

  return (
    <Layout>
      <div className="p-6 lg:p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-trading-text">Analysis</h1>
          <p className="text-trading-text-muted mt-2">
            Comprehensive performance analysis and trading insights.
          </p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total P&L"
            value={`$${totalPL.toLocaleString()}`}
            subtitle={`From ${totalTrades} trades`}
            icon={totalPL >= 0 ? TrendingUp : TrendingDown}
            trend={totalPL >= 0 ? 'up' : 'down'}
          />
          <StatCard
            title="Win Rate"
            value={`${winRate.toFixed(1)}%`}
            subtitle={`${winningTrades.length}W / ${losingTrades.length}L`}
            icon={Target}
            trend={winRate >= 50 ? 'up' : 'down'}
          />
          <StatCard
            title="Profit Factor"
            value={profitFactor.toFixed(2)}
            subtitle={profitFactor > 1 ? 'Profitable' : 'Unprofitable'}
            icon={DollarSign}
            trend={profitFactor > 1 ? 'up' : 'down'}
          />
          <StatCard
            title="Expectancy"
            value={`$${expectancy.toFixed(0)}`}
            subtitle="Per trade"
            icon={TrendingUp}
            trend={expectancy > 0 ? 'up' : 'down'}
          />
        </div>

        {/* Instrument Breakdown */}
        <div className="mb-8">
          <InstrumentBreakdown trades={trades} />
        </div>

        {/* Time Analysis */}
        <div className="mb-8">
          <TimeAnalysis trades={trades} />
        </div>

        {/* Win/Loss Distribution */}
        <WinLossDistribution trades={trades} />
      </div>
    </Layout>
  );
}