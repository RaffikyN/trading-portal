import React, { useState, useRef } from 'react';
import Layout from '../components/Layout';
import { useTrading } from '../context/TradingContext';
import { Upload, FileText, Filter, Download, Trash2 } from 'lucide-react';
import Papa from 'papaparse';

function FileUpload({ onFileUpload, loading }) {
  const fileInputRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);

  const handleFileSelect = (files) => {
    if (files && files[0]) {
      const file = files[0];
      if (file.type === 'text/csv' || file.name.endsWith('.csv')) {
        Papa.parse(file, {
          complete: (results) => {
            onFileUpload(results.data);
          },
          header: true,
          skipEmptyLines: true
        });
      } else {
        alert('Please upload a CSV file');
      }
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  return (
    <div
      className={`
        border-2 border-dashed rounded-lg p-8 text-center transition-colors
        ${dragOver ? 'border-trading-pink bg-trading-pink/5' : 'border-trading-gray hover:border-trading-pink/50'}
        ${loading ? 'opacity-50 pointer-events-none' : ''}
      `}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv"
        onChange={(e) => handleFileSelect(e.target.files)}
        className="hidden"
      />
      
      <div className="flex flex-col items-center space-y-4">
        <div className="p-4 bg-trading-pink/20 rounded-full">
          <Upload className="h-8 w-8 text-trading-pink" />
        </div>
        
        <div>
          <h3 className="text-lg font-semibold text-trading-text mb-2">
            {loading ? 'Processing...' : 'Upload CSV File'}
          </h3>
          <p className="text-trading-text-muted mb-4">
            Drag and drop your Apex Trader Funding export file here, or click to browse
          </p>
          
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={loading}
            className="bg-trading-pink hover:bg-trading-pink-dark disabled:opacity-50 text-white px-6 py-2 rounded-lg font-medium transition-colors"
          >
            {loading ? 'Processing...' : 'Choose File'}
          </button>
        </div>
        
        <p className="text-xs text-trading-text-muted">
          Supports CSV files with columns: name, order_id, symbol, mov_time, mov_type, exec_qty, price_done, points, profit
        </p>
      </div>
    </div>
  );
}

function TradeFilters({ filters, onFiltersChange, accounts }) {
  return (
    <div className="bg-trading-card/20 backdrop-blur-sm border border-trading-pink/20 rounded-lg p-4">
      <div className="flex flex-wrap gap-4">
        <div className="flex-1 min-w-48">
          <label className="block text-sm font-medium text-trading-text mb-2">Date Range</label>
          <div className="flex gap-2">
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => onFiltersChange({ ...filters, startDate: e.target.value })}
              className="bg-trading-card border border-trading-gray rounded-lg px-3 py-2 text-trading-text text-sm focus:border-trading-pink focus:outline-none"
            />
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => onFiltersChange({ ...filters, endDate: e.target.value })}
              className="bg-trading-card border border-trading-gray rounded-lg px-3 py-2 text-trading-text text-sm focus:border-trading-pink focus:outline-none"
            />
          </div>
        </div>
        
        <div className="min-w-32">
          <label className="block text-sm font-medium text-trading-text mb-2">Account</label>
          <select
            value={filters.account}
            onChange={(e) => onFiltersChange({ ...filters, account: e.target.value })}
            className="bg-trading-card border border-trading-gray rounded-lg px-3 py-2 text-trading-text text-sm focus:border-trading-pink focus:outline-none w-full"
          >
            <option value="">All Accounts</option>
            {Object.keys(accounts).map(account => (
              <option key={account} value={account}>{account}</option>
            ))}
          </select>
        </div>
        
        <div className="min-w-32">
          <label className="block text-sm font-medium text-trading-text mb-2">Symbol</label>
          <input
            type="text"
            placeholder="e.g., NQ, ES"
            value={filters.symbol}
            onChange={(e) => onFiltersChange({ ...filters, symbol: e.target.value })}
            className="bg-trading-card border border-trading-gray rounded-lg px-3 py-2 text-trading-text text-sm focus:border-trading-pink focus:outline-none w-full"
          />
        </div>
      </div>
    </div>
  );
}

function TradeTable({ trades, loading }) {
  if (loading) {
    return (
      <div className="bg-trading-card/20 backdrop-blur-sm border border-trading-pink/20 rounded-lg p-8">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-trading-pink"></div>
          <span className="ml-2 text-trading-text">Loading trades...</span>
        </div>
      </div>
    );
  }

  if (trades.length === 0) {
    return (
      <div className="bg-trading-card/20 backdrop-blur-sm border border-trading-pink/20 rounded-lg p-8">
        <div className="text-center">
          <FileText className="h-12 w-12 text-trading-text-muted mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-trading-text mb-2">No trades found</h3>
          <p className="text-trading-text-muted">
            Upload a CSV file to see your trades here.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-trading-card/20 backdrop-blur-sm border border-trading-pink/20 rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-trading-pink/10 border-b border-trading-pink/20">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-semibold text-trading-text">Date</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-trading-text">Account</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-trading-text">Symbol</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-trading-text">Side</th>
              <th className="px-4 py-3 text-right text-sm font-semibold text-trading-text">Quantity</th>
              <th className="px-4 py-3 text-right text-sm font-semibold text-trading-text">Price</th>
              <th className="px-4 py-3 text-right text-sm font-semibold text-trading-text">Points</th>
              <th className="px-4 py-3 text-right text-sm font-semibold text-trading-text">P&L</th>
            </tr>
          </thead>
          <tbody>
            {trades.map((trade, index) => (
              <tr
                key={trade.id || index}
                className="border-b border-trading-gray/30 hover:bg-trading-pink/5 transition-colors"
              >
                <td className="px-4 py-3 text-sm text-trading-text">
                  {new Date(trade.date).toLocaleDateString()}
                </td>
                <td className="px-4 py-3 text-sm text-trading-text-muted">
                  {trade.account}
                </td>
                <td className="px-4 py-3 text-sm text-trading-text font-medium">
                  {trade.symbol}
                </td>
                <td className="px-4 py-3 text-sm">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    trade.side === 'Long' ? 'bg-trading-green/20 text-trading-green' : 'bg-trading-red/20 text-trading-red'
                  }`}>
                    {trade.side}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-trading-text text-right">
                  {trade.quantity}
                </td>
                <td className="px-4 py-3 text-sm text-trading-text text-right">
                  ${trade.price.toFixed(2)}
                </td>
                <td className="px-4 py-3 text-sm text-trading-text text-right">
                  {trade.points.toFixed(2)}
                </td>
                <td className="px-4 py-3 text-sm text-right font-medium">
                  <span className={trade.profit >= 0 ? 'text-trading-green' : 'text-trading-red'}>
                    ${trade.profit.toLocaleString()}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="px-4 py-3 bg-trading-card/10 border-t border-trading-pink/20">
        <div className="flex justify-between items-center text-sm">
          <span className="text-trading-text-muted">
            Showing {trades.length} trades
          </span>
          <div className="flex gap-4">
            <span className="text-trading-text-muted">
              Total P&L: <span className={`font-semibold ${
                trades.reduce((sum, t) => sum + t.profit, 0) >= 0 ? 'text-trading-green' : 'text-trading-red'
              }`}>
                ${trades.reduce((sum, t) => sum + t.profit, 0).toLocaleString()}
              </span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function TradingJournal() {
  const { trades, accounts, importTrades, loading, clearData } = useTrading();
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    account: '',
    symbol: ''
  });

  // Apply filters
  const filteredTrades = trades.filter(trade => {
    if (filters.startDate && trade.date < filters.startDate) return false;
    if (filters.endDate && trade.date > filters.endDate) return false;
    if (filters.account && trade.account !== filters.account) return false;
    if (filters.symbol && !trade.symbol.toLowerCase().includes(filters.symbol.toLowerCase())) return false;
    return true;
  });

  const handleClearData = () => {
    if (window.confirm('Are you sure you want to clear all trading data? This action cannot be undone.')) {
      clearData();
    }
  };

  return (
    <Layout>
      <div className="p-6 lg:p-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-trading-text">Trading Journal</h1>
            <p className="text-trading-text-muted mt-2">
              Import and manage your trading data from CSV exports.
            </p>
          </div>
          
          <div className="flex gap-3">
            <button className="flex items-center gap-2 bg-trading-card hover:bg-trading-gray text-trading-text px-4 py-2 rounded-lg transition-colors">
              <Download size={16} />
              Export
            </button>
            {trades.length > 0 && (
              <button
                onClick={handleClearData}
                className="flex items-center gap-2 bg-trading-red/20 hover:bg-trading-red/30 text-trading-red px-4 py-2 rounded-lg transition-colors"
              >
                <Trash2 size={16} />
                Clear Data
              </button>
            )}
          </div>
        </div>

        {/* Upload Section */}
        <div className="mb-6">
          <FileUpload onFileUpload={importTrades} loading={loading} />
        </div>

        {/* Filters */}
        {trades.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-4">
              <Filter className="h-5 w-5 text-trading-pink" />
              <h2 className="text-lg font-semibold text-trading-text">Filters</h2>
            </div>
            <TradeFilters 
              filters={filters} 
              onFiltersChange={setFilters}
              accounts={accounts}
            />
          </div>
        )}

        {/* Trade Table */}
        <div>
          <TradeTable trades={filteredTrades} loading={loading} />
        </div>
      </div>
    </Layout>
  );
}