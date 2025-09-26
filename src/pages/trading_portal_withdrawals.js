import React, { useState } from 'react';
import Layout from '../components/Layout';
import { useTrading } from '../context/TradingContext';
import { ArrowDownLeft, Plus, Calendar, DollarSign, Trash2, AlertCircle } from 'lucide-react';

function WithdrawalForm({ accounts, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    account: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    description: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.account || !formData.amount) return;

    onSubmit({
      ...formData,
      amount: parseFloat(formData.amount)
    });

    setFormData({
      account: '',
      amount: '',
      date: new Date().toISOString().split('T')[0],
      description: ''
    });
  };

  return (
    <div className="bg-trading-card/20 backdrop-blur-sm border border-trading-pink/20 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-trading-text mb-4">Record New Withdrawal</h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-trading-text mb-2">Account</label>
            <select
              value={formData.account}
              onChange={(e) => setFormData({ ...formData, account: e.target.value })}
              className="w-full bg-trading-card border border-trading-gray rounded-lg px-3 py-2 text-trading-text focus:border-trading-pink focus:outline-none"
              required
            >
              <option value="">Select Account</option>
              {Object.keys(accounts).map(account => (
                <option key={account} value={account}>{account}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-trading-text mb-2">Amount</label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              className="w-full bg-trading-card border border-trading-gray rounded-lg px-3 py-2 text-trading-text focus:border-trading-pink focus:outline-none"
              placeholder="0.00"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-trading-text mb-2">Date</label>
          <input
            type="date"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            className="w-full bg-trading-card border border-trading-gray rounded-lg px-3 py-2 text-trading-text focus:border-trading-pink focus:outline-none"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-trading-text mb-2">Description (Optional)</label>
          <input
            type="text"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full bg-trading-card border border-trading-gray rounded-lg px-3 py-2 text-trading-text focus:border-trading-pink focus:outline-none"
            placeholder="e.g., Monthly withdrawal, Profit taking"
          />
        </div>

        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            className="bg-trading-pink hover:bg-trading-pink-dark text-white px-6 py-2 rounded-lg font-medium transition-colors"
          >
            Record Withdrawal
          </button>
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="bg-trading-card hover:bg-trading-gray text-trading-text px-6 py-2 rounded-lg transition-colors"
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

function WithdrawalStats({ withdrawals, accounts }) {
  const totalWithdrawn = withdrawals.reduce((sum, w) => sum + w.amount, 0);
  const thisMonthWithdrawals = withdrawals.filter(w => {
    const withdrawalDate = new Date(w.date);
    const now = new Date();
    return withdrawalDate.getMonth() === now.getMonth() && 
           withdrawalDate.getFullYear() === now.getFullYear();
  });
  const thisMonthTotal = thisMonthWithdrawals.reduce((sum, w) => sum + w.amount, 0);
  const avgWithdrawal = withdrawals.length > 0 ? totalWithdrawn / withdrawals.length : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      <div className="bg-trading-card/20 backdrop-blur-sm border border-trading-pink/20 rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-trading-text-muted text-sm">Total Withdrawn</p>
            <p className="text-2xl font-bold text-trading-text">
              ${totalWithdrawn.toLocaleString()}
            </p>
          </div>
          <ArrowDownLeft className="h-8 w-8 text-trading-pink" />
        </div>
      </div>

      <div className="bg-trading-card/20 backdrop-blur-sm border border-trading-pink/20 rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-trading-text-muted text-sm">This Month</p>
            <p className="text-2xl font-bold text-trading-text">
              ${thisMonthTotal.toLocaleString()}
            </p>
          </div>
          <Calendar className="h-8 w-8 text-trading-pink" />
        </div>
      </div>

      <div className="bg-trading-card/20 backdrop-blur-sm border border-trading-pink/20 rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-trading-text-muted text-sm">Total Withdrawals</p>
            <p className="text-2xl font-bold text-trading-text">{withdrawals.length}</p>
          </div>
          <DollarSign className="h-8 w-8 text-trading-pink" />
        </div>
      </div>

      <div className="bg-trading-card/20 backdrop-blur-sm border border-trading-pink/20 rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-trading-text-muted text-sm">Average Amount</p>
            <p className="text-2xl font-bold text-trading-text">
              ${avgWithdrawal.toLocaleString()}
            </p>
          </div>
          <DollarSign className="h-8 w-8 text-trading-pink" />
        </div>
      </div>
    </div>
  );
}

function WithdrawalHistory({ withdrawals }) {
  if (withdrawals.length === 0) {
    return (
      <div className="bg-trading-card/20 backdrop-blur-sm border border-trading-pink/20 rounded-lg p-8">
        <div className="text-center">
          <ArrowDownLeft className="h-12 w-12 text-trading-text-muted mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-trading-text mb-2">No withdrawals recorded</h3>
          <p className="text-trading-text-muted">
            Start tracking your withdrawals by recording them above.
          </p>
        </div>
      </div>
    );
  }

  // Sort withdrawals by date (newest first)
  const sortedWithdrawals = [...withdrawals].sort((a, b) => new Date(b.date) - new Date(a.date));

  return (
    <div className="bg-trading-card/20 backdrop-blur-sm border border-trading-pink/20 rounded-lg overflow-hidden">
      <div className="p-4 border-b border-trading-pink/20">
        <h3 className="text-lg font-semibold text-trading-text">Withdrawal History</h3>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-trading-pink/10 border-b border-trading-pink/20">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-semibold text-trading-text">Date</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-trading-text">Account</th>
              <th className="px-4 py-3 text-right text-sm font-semibold text-trading-text">Amount</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-trading-text">Description</th>
              <th className="px-4 py-3 text-center text-sm font-semibold text-trading-text">Actions</th>
            </tr>
          </thead>
          <tbody>
            {sortedWithdrawals.map((withdrawal, index) => (
              <tr
                key={withdrawal.id || index}
                className="border-b border-trading-gray/30 hover:bg-trading-pink/5 transition-colors"
              >
                <td className="px-4 py-3 text-sm text-trading-text">
                  {new Date(withdrawal.date).toLocaleDateString()}
                </td>
                <td className="px-4 py-3 text-sm text-trading-text-muted">
                  {withdrawal.account}
                </td>
                <td className="px-4 py-3 text-sm text-trading-text text-right font-medium">
                  ${withdrawal.amount.toLocaleString()}
                </td>
                <td className="px-4 py-3 text-sm text-trading-text-muted">
                  {withdrawal.description || '-'}
                </td>
                <td className="px-4 py-3 text-center">
                  <button className="text-trading-red hover:text-trading-red/70 p-1 rounded transition-colors">
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="px-4 py-3 bg-trading-card/10 border-t border-trading-pink/20">
        <div className="flex justify-between items-center text-sm">
          <span className="text-trading-text-muted">
            {withdrawals.length} withdrawal{withdrawals.length !== 1 ? 's' : ''}
          </span>
          <span className="text-trading-text-muted">
            Total: <span className="font-semibold text-trading-text">
              ${withdrawals.reduce((sum, w) => sum + w.amount, 0).toLocaleString()}
            </span>
          </span>
        </div>
      </div>
    </div>
  );
}

export default function WithdrawalTracker() {
  const { withdrawals, accounts, addWithdrawal } = useTrading();
  const [showForm, setShowForm] = useState(false);

  const handleAddWithdrawal = (withdrawalData) => {
    addWithdrawal(withdrawalData);
    setShowForm(false);
  };

  const hasAccounts = Object.keys(accounts).length > 0;

  return (
    <Layout>
      <div className="p-6 lg:p-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-trading-text">Withdrawal Tracker</h1>
            <p className="text-trading-text-muted mt-2">
              Track and manage your trading account withdrawals.
            </p>
          </div>
          
          {hasAccounts && (
            <button
              onClick={() => setShowForm(!showForm)}
              className="flex items-center gap-2 bg-trading-pink hover:bg-trading-pink-dark text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              <Plus size={16} />
              {showForm ? 'Hide Form' : 'Record Withdrawal'}
            </button>
          )}
        </div>

        {!hasAccounts ? (
          <div className="bg-trading-card/20 backdrop-blur-sm border border-trading-pink/20 rounded-lg p-12">
            <div className="text-center">
              <AlertCircle className="h-16 w-16 text-trading-text-muted mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-trading-text mb-2">No Accounts Available</h3>
              <p className="text-trading-text-muted mb-6">
                You need to import trades first to create accounts before recording withdrawals.
              </p>
              <div className="flex justify-center">
                <button className="bg-trading-pink hover:bg-trading-pink-dark text-white px-6 py-3 rounded-lg font-medium transition-colors">
                  Import Trades
                </button>
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Stats */}
            <WithdrawalStats withdrawals={withdrawals} accounts={accounts} />

            {/* Withdrawal Form */}
            {showForm && (
              <div className="mb-8">
                <WithdrawalForm
                  accounts={accounts}
                  onSubmit={handleAddWithdrawal}
                  onCancel={() => setShowForm(false)}
                />
              </div>
            )}

            {/* Withdrawal History */}
            <WithdrawalHistory withdrawals={withdrawals} />
          </>
        )}
      </div>
    </Layout>
  );
}