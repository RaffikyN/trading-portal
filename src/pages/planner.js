import React, { useState } from 'react';
import Layout from '../components/Layout';
import { useTrading } from '../context/TradingContext';
import { 
  Target, 
  TrendingUp, 
  TrendingDown, 
  Calendar, 
  Plus, 
  Edit, 
  Trash2,
  DollarSign,
  CreditCard,
  Wallet,
  PiggyBank,
  Brain,
  CheckCircle,
  XCircle,
  Calculator,
  BarChart3
} from 'lucide-react';

// Expense Categories
const EXPENSE_CATEGORIES = [
  'Housing', 'Transportation', 'Food & Dining', 'Utilities', 'Healthcare',
  'Entertainment', 'Shopping', 'Personal Care', 'Education', 'Insurance',
  'Credit Cards', 'Loans', 'Investments', 'Other'
];

// Income Categories  
const INCOME_CATEGORIES = [
  'Salary', 'Freelance', 'Business', 'Investments', 'Trading', 'Rental', 'Other'
];

function CashCalculator({ calculateCashFlow, currentCash, setCurrentCash }) {
  const [showCalculator, setShowCalculator] = useState(false);
  const [tempCash, setTempCash] = useState(currentCash.toString());
  const [justUpdated, setJustUpdated] = useState(false);

  // Update tempCash when currentCash changes
  React.useEffect(() => {
    setTempCash(currentCash.toString());
  }, [currentCash]);

  const dailyCash = calculateCashFlow('day');
  const weeklyCash = calculateCashFlow('week');  
  const monthlyCash = calculateCashFlow('month');

  const handleUpdateCash = () => {
    const amount = parseFloat(tempCash) || 0;
    console.log('Updating cash to:', amount, 'from tempCash:', tempCash); // Debug log
    setCurrentCash(amount);
    setShowCalculator(false);
    setJustUpdated(true);
    setTimeout(() => setJustUpdated(false), 2000);
  };

  const handleCancel = () => {
    setTempCash(currentCash.toString());
    setShowCalculator(false);
  };

  return (
    <div className="bg-trading-card/20 backdrop-blur-sm border border-trading-pink/20 rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-trading-text flex items-center gap-2">
          <Calculator className="h-5 w-5 text-trading-pink" />
          Cash Calculator
        </h3>
        <button
          onClick={() => setShowCalculator(!showCalculator)}
          className="text-trading-pink hover:text-trading-pink-light text-sm"
        >
          Update Cash
        </button>
      </div>

      {showCalculator && (
        <div className="mb-6 p-4 bg-trading-card/30 rounded-lg border border-trading-pink/10">
          <label className="block text-sm font-medium text-trading-text mb-2">
            Current Cash on Hand
          </label>
          <div className="flex gap-2">
            <input
              type="number"
              step="0.01"
              value={tempCash}
              onChange={(e) => setTempCash(e.target.value)}
              className="flex-1 bg-trading-card border border-trading-gray rounded-lg px-3 py-2 text-trading-text focus:border-trading-pink focus:outline-none"
              placeholder="0.00"
            />
            <button
              type="button"
              onClick={handleUpdateCash}
              className="bg-trading-pink hover:bg-trading-pink-dark text-white px-4 py-2 rounded-lg transition-colors"
            >
              Update
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className="bg-trading-card hover:bg-trading-gray text-trading-text px-4 py-2 rounded-lg transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="text-center p-4 bg-trading-card/20 rounded-lg">
          <div className="text-sm text-trading-text-muted">Today</div>
          <div className="text-lg font-bold text-trading-text">${dailyCash.projectedCash.toLocaleString()}</div>
          <div className={`text-sm ${dailyCash.netCashFlow >= 0 ? 'text-trading-green' : 'text-trading-red'}`}>
            {dailyCash.netCashFlow >= 0 ? '+' : ''}${dailyCash.netCashFlow.toLocaleString()}
          </div>
        </div>

        <div className="text-center p-4 bg-trading-card/20 rounded-lg">
          <div className="text-sm text-trading-text-muted">This Week</div>
          <div className="text-lg font-bold text-trading-text">${weeklyCash.projectedCash.toLocaleString()}</div>
          <div className={`text-sm ${weeklyCash.netCashFlow >= 0 ? 'text-trading-green' : 'text-trading-red'}`}>
            {weeklyCash.netCashFlow >= 0 ? '+' : ''}${weeklyCash.netCashFlow.toLocaleString()}
          </div>
        </div>

        <div className="text-center p-4 bg-trading-card/20 rounded-lg">
          <div className="text-sm text-trading-text-muted">This Month</div>
          <div className="text-lg font-bold text-trading-text">${monthlyCash.projectedCash.toLocaleString()}</div>
          <div className={`text-sm ${monthlyCash.netCashFlow >= 0 ? 'text-trading-green' : 'text-trading-red'}`}>
            {monthlyCash.netCashFlow >= 0 ? '+' : ''}${monthlyCash.netCashFlow.toLocaleString()}
          </div>
        </div>
      </div>

      <div className="mt-4 text-center">
        <div className={`text-2xl font-bold text-trading-text transition-all ${
          justUpdated ? 'scale-110 text-trading-green' : ''
        }`}>
          Current Cash: ${currentCash.toLocaleString()}
        </div>
        {justUpdated && (
          <div className="text-sm text-trading-green mt-1">✓ Updated!</div>
        )}
      </div>
    </div>
  );
}

function ExpenseForm({ onSubmit, onCancel, editingExpense }) {
  const [formData, setFormData] = useState(editingExpense || {
    category: '',
    description: '',
    amount: '',
    dueDate: new Date().toISOString().split('T')[0],
    isPaid: false,
    isRecurring: false
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.category || !formData.description || !formData.amount) return;

    onSubmit({
      ...formData,
      amount: parseFloat(formData.amount)
    });
  };

  return (
    <div className="bg-trading-card/20 backdrop-blur-sm border border-trading-pink/20 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-trading-text mb-4">
        {editingExpense ? 'Edit Expense' : 'Add New Expense'}
      </h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-trading-text mb-2">Category</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full bg-trading-card border border-trading-gray rounded-lg px-3 py-2 text-trading-text focus:border-trading-pink focus:outline-none"
              required
            >
              <option value="">Select Category</option>
              {EXPENSE_CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
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
          <label className="block text-sm font-medium text-trading-text mb-2">Description</label>
          <input
            type="text"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full bg-trading-card border border-trading-gray rounded-lg px-3 py-2 text-trading-text focus:border-trading-pink focus:outline-none"
            placeholder="e.g., Bank of America Credit Card"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-trading-text mb-2">Due Date</label>
          <input
            type="date"
            value={formData.dueDate}
            onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
            className="w-full bg-trading-card border border-trading-gray rounded-lg px-3 py-2 text-trading-text focus:border-trading-pink focus:outline-none"
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
            <span className="text-trading-text">Paid?</span>
          </label>

          <label className="flex items-center">
            <input
              type="checkbox"
              checked={formData.isRecurring}
              onChange={(e) => setFormData({ ...formData, isRecurring: e.target.checked })}
              className="mr-2 accent-trading-pink"
            />
            <span className="text-trading-text">Recurring?</span>
          </label>
        </div>

        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            className="bg-trading-pink hover:bg-trading-pink-dark text-white px-6 py-2 rounded-lg font-medium transition-colors"
          >
            {editingExpense ? 'Update' : 'Add'} Expense
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

function IncomeForm({ onSubmit, onCancel, editingIncome }) {
  const [formData, setFormData] = useState(editingIncome || {
    category: '',
    description: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    isPaid: false,
    isRecurring: false
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.category || !formData.description || !formData.amount) return;

    onSubmit({
      ...formData,
      amount: parseFloat(formData.amount)
    });
  };

  return (
    <div className="bg-trading-card/20 backdrop-blur-sm border border-trading-pink/20 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-trading-text mb-4">
        {editingIncome ? 'Edit Income' : 'Add New Income'}
      </h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-trading-text mb-2">Category</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full bg-trading-card border border-trading-gray rounded-lg px-3 py-2 text-trading-text focus:border-trading-pink focus:outline-none"
              required
            >
              <option value="">Select Category</option>
              {INCOME_CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
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
          <label className="block text-sm font-medium text-trading-text mb-2">Description</label>
          <input
            type="text"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full bg-trading-card border border-trading-gray rounded-lg px-3 py-2 text-trading-text focus:border-trading-pink focus:outline-none"
            placeholder="e.g., Centauro Salary"
            required
          />
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

        <div className="flex gap-6">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={formData.isPaid}
              onChange={(e) => setFormData({ ...formData, isPaid: e.target.checked })}
              className="mr-2 accent-trading-pink"
            />
            <span className="text-trading-text">Received?</span>
          </label>

          <label className="flex items-center">
            <input
              type="checkbox"
              checked={formData.isRecurring}
              onChange={(e) => setFormData({ ...formData, isRecurring: e.target.checked })}
              className="mr-2 accent-trading-pink"
            />
            <span className="text-trading-text">Recurring?</span>
          </label>
        </div>

        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            className="bg-trading-green hover:bg-trading-green/80 text-white px-6 py-2 rounded-lg font-medium transition-colors"
          >
            {editingIncome ? 'Update' : 'Add'} Income
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

function SmartInvestor({ netWorth, calculateCashFlow }) {
  const monthlyCashFlow = calculateCashFlow('month');
  const availableCash = Math.max(0, monthlyCashFlow.projectedCash - 1000); // Keep $1000 buffer

  const getInvestmentSuggestions = () => {
    const suggestions = [];

    if (availableCash < 500) {
      suggestions.push({
        type: 'Emergency Fund',
        suggestion: 'Focus on building an emergency fund of 3-6 months of expenses before investing.',
        priority: 'High'
      });
    } else if (availableCash < 2000) {
      suggestions.push({
        type: 'High-Yield Savings',
        suggestion: 'Consider a high-yield savings account or money market fund for liquidity.',
        priority: 'Medium'
      });
    } else {
      suggestions.push({
        type: 'Index Funds',
        suggestion: 'Consider low-cost index funds (S&P 500) for long-term growth.',
        priority: 'High'
      });
      suggestions.push({
        type: 'Trading Capital',
        suggestion: 'Allocate some funds to expand your trading accounts for higher returns.',
        priority: 'Medium'
      });
    }

    if (netWorth > 10000) {
      suggestions.push({
        type: 'Diversification',
        suggestion: 'Consider diversifying with bonds, REITs, or international funds.',
        priority: 'Medium'
      });
    }

    return suggestions;
  };

  const suggestions = getInvestmentSuggestions();

  return (
    <div className="bg-trading-card/20 backdrop-blur-sm border border-trading-pink/20 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-trading-text mb-4 flex items-center gap-2">
        <Brain className="h-5 w-5 text-trading-pink" />
        Smart Investor
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="text-center p-4 bg-trading-card/30 rounded-lg">
          <div className="text-sm text-trading-text-muted">Net Worth</div>
          <div className="text-2xl font-bold text-trading-green">${netWorth.toLocaleString()}</div>
        </div>
        <div className="text-center p-4 bg-trading-card/30 rounded-lg">
          <div className="text-sm text-trading-text-muted">Available to Invest</div>
          <div className="text-2xl font-bold text-trading-pink">${availableCash.toLocaleString()}</div>
        </div>
      </div>

      <div className="space-y-4">
        <h4 className="font-semibold text-trading-text">Investment Recommendations:</h4>
        {suggestions.map((suggestion, index) => (
          <div key={index} className="p-4 bg-trading-card/30 rounded-lg border-l-4 border-trading-pink/50">
            <div className="flex justify-between items-start mb-2">
              <h5 className="font-medium text-trading-text">{suggestion.type}</h5>
              <span className={`px-2 py-1 rounded-full text-xs ${
                suggestion.priority === 'High' ? 'bg-trading-red/20 text-trading-red' :
                suggestion.priority === 'Medium' ? 'bg-trading-pink/20 text-trading-pink' :
                'bg-trading-gray/20 text-trading-text-muted'
              }`}>
                {suggestion.priority} Priority
              </span>
            </div>
            <p className="text-trading-text-muted text-sm">{suggestion.suggestion}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function FinancialPlanner() {
  const { 
    expenses, 
    incomes, 
    currentCash,
    addExpense,
    updateExpense,
    deleteExpense,
    addIncome,
    updateIncome,
    deleteIncome,
    setCurrentCash,
    calculateCashFlow,
    calculateNetWorth
  } = useTrading();

  const [activeTab, setActiveTab] = useState('overview');
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [showIncomeForm, setShowIncomeForm] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [editingIncome, setEditingIncome] = useState(null);

  const netWorth = calculateNetWorth();

  const handleAddExpense = (expense) => {
    if (editingExpense) {
      updateExpense({ ...expense, id: editingExpense.id });
      setEditingExpense(null);
    } else {
      addExpense(expense);
    }
    setShowExpenseForm(false);
  };

  const handleAddIncome = (income) => {
    if (editingIncome) {
      updateIncome({ ...income, id: editingIncome.id });
      setEditingIncome(null);
    } else {
      addIncome(income);
    }
    setShowIncomeForm(false);
  };

  const handleEditExpense = (expense) => {
    setEditingExpense(expense);
    setShowExpenseForm(true);
  };

  const handleEditIncome = (income) => {
    setEditingIncome(income);
    setShowIncomeForm(true);
  };

  const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const totalIncome = incomes.reduce((sum, inc) => sum + inc.amount, 0);

  return (
    <Layout>
      <div className="p-6 lg:p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-trading-text">Financial Planner</h1>
          <p className="text-trading-text-muted mt-2">
            Complete personal finance management and investment planning.
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap gap-2 mb-8">
          {[
            { id: 'overview', label: 'Overview', icon: BarChart3 },
            { id: 'expenses', label: 'Expenses', icon: CreditCard },
            { id: 'income', label: 'Income', icon: DollarSign },
            { id: 'calculator', label: 'Cash Calculator', icon: Calculator },
            { id: 'investor', label: 'Smart Investor', icon: Brain }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-trading-pink/20 text-trading-pink border border-trading-pink/30'
                    : 'text-trading-text-muted hover:text-trading-text hover:bg-trading-card/30'
                }`}
              >
                <Icon size={16} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-trading-card/20 backdrop-blur-sm border border-trading-pink/20 rounded-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-trading-text-muted text-sm">Net Worth</p>
                    <p className="text-2xl font-bold text-trading-green">${netWorth.toLocaleString()}</p>
                  </div>
                  <PiggyBank className="h-8 w-8 text-trading-green" />
                </div>
              </div>

              <div className="bg-trading-card/20 backdrop-blur-sm border border-trading-pink/20 rounded-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-trading-text-muted text-sm">Current Cash</p>
                    <p className="text-2xl font-bold text-trading-text">${currentCash.toLocaleString()}</p>
                  </div>
                  <Wallet className="h-8 w-8 text-trading-pink" />
                </div>
              </div>

              <div className="bg-trading-card/20 backdrop-blur-sm border border-trading-pink/20 rounded-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-trading-text-muted text-sm">Monthly Income</p>
                    <p className="text-2xl font-bold text-trading-green">${totalIncome.toLocaleString()}</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-trading-green" />
                </div>
              </div>

              <div className="bg-trading-card/20 backdrop-blur-sm border border-trading-pink/20 rounded-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-trading-text-muted text-sm">Monthly Expenses</p>
                    <p className="text-2xl font-bold text-trading-red">${totalExpenses.toLocaleString()}</p>
                  </div>
                  <TrendingDown className="h-8 w-8 text-trading-red" />
                </div>
              </div>
            </div>

            {/* Cash Calculator */}
            <CashCalculator 
              calculateCashFlow={calculateCashFlow}
              currentCash={currentCash}
              setCurrentCash={setCurrentCash}
            />

            {/* Smart Investor */}
            <SmartInvestor 
              netWorth={netWorth}
              calculateCashFlow={calculateCashFlow}
            />
          </div>
        )}

        {/* Expenses Tab */}
        {activeTab === 'expenses' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-trading-text">Manage Expenses</h2>
              <button
                onClick={() => {
                  setEditingExpense(null);
                  setShowExpenseForm(!showExpenseForm);
                }}
                className="flex items-center gap-2 bg-trading-pink hover:bg-trading-pink-dark text-white px-4 py-2 rounded-lg transition-colors"
              >
                <Plus size={16} />
                Add Expense
              </button>
            </div>

            {showExpenseForm && (
              <ExpenseForm
                onSubmit={handleAddExpense}
                onCancel={() => {
                  setShowExpenseForm(false);
                  setEditingExpense(null);
                }}
                editingExpense={editingExpense}
              />
            )}

            {/* Expenses List */}
            <div className="bg-trading-card/20 backdrop-blur-sm border border-trading-pink/20 rounded-lg overflow-hidden">
              <div className="p-4 border-b border-trading-pink/20">
                <h3 className="text-lg font-semibold text-trading-text">Expenses List</h3>
              </div>
              
              {expenses.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-trading-pink/10 border-b border-trading-pink/20">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-trading-text">Category</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-trading-text">Description</th>
                        <th className="px-4 py-3 text-right text-sm font-semibold text-trading-text">Amount</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-trading-text">Due Date</th>
                        <th className="px-4 py-3 text-center text-sm font-semibold text-trading-text">Status</th>
                        <th className="px-4 py-3 text-center text-sm font-semibold text-trading-text">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {expenses.map((expense) => (
                        <tr key={expense.id} className="border-b border-trading-gray/30 hover:bg-trading-pink/5 transition-colors">
                          <td className="px-4 py-3 text-sm text-trading-text">{expense.category}</td>
                          <td className="px-4 py-3 text-sm text-trading-text">{expense.description}</td>
                          <td className="px-4 py-3 text-sm text-trading-red text-right font-medium">
                            ${expense.amount.toLocaleString()}
                          </td>
                          <td className="px-4 py-3 text-sm text-trading-text-muted">
                            {new Date(expense.dueDate).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <div className="flex items-center justify-center gap-2">
                              {expense.isPaid ? (
                                <CheckCircle className="h-4 w-4 text-trading-green" />
                              ) : (
                                <XCircle className="h-4 w-4 text-trading-red" />
                              )}
                              {expense.isRecurring && (
                                <div className="w-2 h-2 bg-trading-pink rounded-full" title="Recurring" />
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <div className="flex items-center justify-center gap-1">
                              <button 
                                onClick={() => handleEditExpense(expense)}
                                className="text-trading-pink hover:text-trading-pink/70 p-1"
                              >
                                <Edit size={14} />
                              </button>
                              <button 
                                onClick={() => deleteExpense(expense.id)}
                                className="text-trading-red hover:text-trading-red/70 p-1"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-8 text-center">
                  <CreditCard className="h-12 w-12 text-trading-text-muted mx-auto mb-4" />
                  <p className="text-trading-text-muted">No expenses added yet.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Income Tab */}
        {activeTab === 'income' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-trading-text">Manage Income</h2>
              <button
                onClick={() => {
                  setEditingIncome(null);
                  setShowIncomeForm(!showIncomeForm);
                }}
                className="flex items-center gap-2 bg-trading-green hover:bg-trading-green/80 text-white px-4 py-2 rounded-lg transition-colors"
              >
                <Plus size={16} />
                Add Income
              </button>
            </div>

            {showIncomeForm && (
              <IncomeForm
                onSubmit={handleAddIncome}
                onCancel={() => {
                  setShowIncomeForm(false);
                  setEditingIncome(null);
                }}
                editingIncome={editingIncome}
              />
            )}

            {/* Income List */}
            <div className="bg-trading-card/20 backdrop-blur-sm border border-trading-pink/20 rounded-lg overflow-hidden">
              <div className="p-4 border-b border-trading-pink/20">
                <h3 className="text-lg font-semibold text-trading-text">Income List</h3>
              </div>
              
              {incomes.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-trading-green/10 border-b border-trading-green/20">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-trading-text">Category</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-trading-text">Description</th>
                        <th className="px-4 py-3 text-right text-sm font-semibold text-trading-text">Amount</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-trading-text">Date</th>
                        <th className="px-4 py-3 text-center text-sm font-semibold text-trading-text">Status</th>
                        <th className="px-4 py-3 text-center text-sm font-semibold text-trading-text">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {incomes.map((income) => (
                        <tr key={income.id} className="border-b border-trading-gray/30 hover:bg-trading-green/5 transition-colors">
                          <td className="px-4 py-3 text-sm text-trading-text">{income.category}</td>
                          <td className="px-4 py-3 text-sm text-trading-text">{income.description}</td>
                          <td className="px-4 py-3 text-sm text-trading-green text-right font-medium">
                            +${income.amount.toLocaleString()}
                          </td>
                          <td className="px-4 py-3 text-sm text-trading-text-muted">
                            {new Date(income.date).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <div className="flex items-center justify-center gap-2">
                              {income.isPaid ? (
                                <CheckCircle className="h-4 w-4 text-trading-green" />
                              ) : (
                                <XCircle className="h-4 w-4 text-trading-red" />
                              )}
                              {income.isRecurring && (
                                <div className="w-2 h-2 bg-trading-pink rounded-full" title="Recurring" />
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <div className="flex items-center justify-center gap-1">
                              <button 
                                onClick={() => handleEditIncome(income)}
                                className="text-trading-pink hover:text-trading-pink/70 p-1"
                              >
                                <Edit size={14} />
                              </button>
                              <button 
                                onClick={() => deleteIncome(income.id)}
                                className="text-trading-red hover:text-trading-red/70 p-1"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-8 text-center">
                  <DollarSign className="h-12 w-12 text-trading-text-muted mx-auto mb-4" />
                  <p className="text-trading-text-muted">No income sources added yet.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Cash Calculator Tab */}
        {activeTab === 'calculator' && (
          <CashCalculator 
            calculateCashFlow={calculateCashFlow}
            currentCash={currentCash}
            setCurrentCash={setCurrentCash}
          />
        )}

        {/* Smart Investor Tab */}
        {activeTab === 'investor' && (
          <SmartInvestor 
            netWorth={netWorth}
            calculateCashFlow={calculateCashFlow}
          />
        )}
      </div>
    </Layout>
  );
}