import React, { useState } from 'react';
import Layout from '../components/Layout';
import { useTrading } from '../context/TradingContext';
import { Target, TrendingUp, TrendingDown, Calendar, Plus, Edit, Check, X } from 'lucide-react';

function GoalCard({ month, goal, actual, onEdit, onDelete }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(goal);

  const handleSave = () => {
    if (editValue && parseFloat(editValue) > 0) {
      onEdit(month, parseFloat(editValue));
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setEditValue(goal);
    setIsEditing(false);
  };

  const difference = actual - goal;
  const percentageAchieved = goal > 0 ? (actual / goal) * 100 : 0;
  const isAchieved = actual >= goal;

  return (
    <div className="bg-trading-card/20 backdrop-blur-sm border border-trading-pink/20 rounded-lg p-6 hover:bg-trading-card/30 transition-all duration-300">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-trading-text">{month}</h3>
          <p className="text-trading-text-muted text-sm">
            Monthly Target
          </p>
        </div>
        <div className="p-2 bg-trading-pink/20 rounded-full">
          <Target className="h-5 w-5 text-trading-pink" />
        </div>
      </div>

      <div className="space-y-4">
        {/* Goal Amount */}
        <div className="flex items-center justify-between">
          <span className="text-trading-text-muted">Goal:</span>
          {isEditing ? (
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                className="bg-trading-card border border-trading-gray rounded px-2 py-1 text-trading-text text-sm w-24 focus:border-trading-pink focus:outline-none"
                step="100"
                min="0"
              />
              <button onClick={handleSave} className="text-trading-green hover:text-trading-green/70 p-1">
                <Check size={16} />
              </button>
              <button onClick={handleCancel} className="text-trading-red hover:text-trading-red/70 p-1">
                <X size={16} />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-trading-text font-semibold">${goal.toLocaleString()}</span>
              <button 
                onClick={() => setIsEditing(true)}
                className="text-trading-pink hover:text-trading-pink/70 p-1"
              >
                <Edit size={14} />
              </button>
            </div>
          )}
        </div>

        {/* Actual Amount */}
        <div className="flex items-center justify-between">
          <span className="text-trading-text-muted">Actual:</span>
          <span className={`font-semibold ${actual >= 0 ? 'text-trading-green' : 'text-trading-red'}`}>
            ${actual.toLocaleString()}
          </span>
        </div>

        {/* Difference */}
        <div className="flex items-center justify-between">
          <span className="text-trading-text-muted">Difference:</span>
          <span className={`font-semibold ${difference >= 0 ? 'text-trading-green' : 'text-trading-red'}`}>
            {difference >= 0 ? '+' : ''}${difference.toLocaleString()}
          </span>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-trading-text-muted">
            <span>Progress</span>
            <span>{percentageAchieved.toFixed(1)}%</span>
          </div>
          <div className="w-full bg-trading-gray/30 rounded-full h-3">
            <div 
              className={`h-3 rounded-full transition-all duration-500 ${
                isAchieved ? 'bg-trading-green' : percentageAchieved > 80 ? 'bg-trading-pink' : 'bg-trading-red'
              }`}
              style={{ width: `${Math.min(percentageAchieved, 100)}%` }}
            />
          </div>
        </div>

        {/* Status */}
        <div className="flex items-center justify-center pt-2">
          <div className={`px-3 py-1 rounded-full text-xs font-medium ${
            isAchieved ? 'bg-trading-green/20 text-trading-green' : 
            percentageAchieved > 80 ? 'bg-trading-pink/20 text-trading-pink' :
            'bg-trading-red/20 text-trading-red'
          }`}>
            {isAchieved ? 'Goal Achieved!' : 
             percentageAchieved > 80 ? 'Close to Goal' : 
             'Below Target'}
          </div>
        </div>
      </div>
    </div>
  );
}

function NewGoalForm({ onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    month: '',
    amount: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.month || !formData.amount) return;

    onSubmit(formData.month, parseFloat(formData.amount));
    setFormData({ month: '', amount: '' });
  };

  // Generate month options for current year and next year
  const generateMonthOptions = () => {
    const options = [];
    const currentYear = new Date().getFullYear();
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];

    for (let year = currentYear; year <= currentYear + 1; year++) {
      months.forEach((month, index) => {
        const key = `${month} ${year}`;
        options.push({ key, value: key });
      });
    }

    return options;
  };

  return (
    <div className="bg-trading-card/20 backdrop-blur-sm border border-trading-pink/20 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-trading-text mb-4">Set New Monthly Goal</h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-trading-text mb-2">Month</label>
            <select
              value={formData.month}
              onChange={(e) => setFormData({ ...formData, month: e.target.value })}
              className="w-full bg-trading-card border border-trading-gray rounded-lg px-3 py-2 text-trading-text focus:border-trading-pink focus:outline-none"
              required
            >
              <option value="">Select Month</option>
              {generateMonthOptions().map(option => (
                <option key={option.key} value={option.value}>{option.value}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-trading-text mb-2">Target Amount</label>
            <input
              type="number"
              step="100"
              min="0"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              className="w-full bg-trading-card border border-trading-gray rounded-lg px-3 py-2 text-trading-text focus:border-trading-pink focus:outline-none"
              placeholder="10000"
              required
            />
          </div>
        </div>

        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            className="bg-trading-pink hover:bg-trading-pink-dark text-white px-6 py-2 rounded-lg font-medium transition-colors"
          >
            Set Goal
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

function PlannerStats({ monthlyGoals, trades }) {
  const totalGoals = Object.keys(monthlyGoals).length;
  const totalTargetAmount = Object.values(monthlyGoals).reduce((sum, goal) => sum + goal, 0);
  
  // Calculate actual amounts by month
  const monthlyActuals = {};
  trades.forEach(trade => {
    const date = new Date(trade.date);
    const monthKey = `${date.toLocaleString('en-US', { month: 'long' })} ${date.getFullYear()}`;
    if (!monthlyActuals[monthKey]) {
      monthlyActuals[monthKey] = 0;
    }
    monthlyActuals[monthKey] += trade.profit;
  });

  let achievedGoals = 0;
  Object.keys(monthlyGoals).forEach(month => {
    const actual = monthlyActuals[month] || 0;
    if (actual >= monthlyGoals[month]) {
      achievedGoals++;
    }
  });

  const achievementRate = totalGoals > 0 ? (achievedGoals / totalGoals) * 100 : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      <div className="bg-trading-card/20 backdrop-blur-sm border border-trading-pink/20 rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-trading-text-muted text-sm">Total Goals</p>
            <p className="text-2xl font-bold text-trading-text">{totalGoals}</p>
          </div>
          <Target className="h-8 w-8 text-trading-pink" />
        </div>
      </div>

      <div className="bg-trading-card/20 backdrop-blur-sm border border-trading-pink/20 rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-trading-text-muted text-sm">Goals Achieved</p>
            <p className="text-2xl font-bold text-trading-green">{achievedGoals}</p>
          </div>
          <TrendingUp className="h-8 w-8 text-trading-green" />
        </div>
      </div>

      <div className="bg-trading-card/20 backdrop-blur-sm border border-trading-pink/20 rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-trading-text-muted text-sm">Achievement Rate</p>
            <p className="text-2xl font-bold text-trading-text">{achievementRate.toFixed(1)}%</p>
          </div>
          <Calendar className="h-8 w-8 text-trading-pink" />
        </div>
      </div>

      <div className="bg-trading-card/20 backdrop-blur-sm border border-trading-pink/20 rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-trading-text-muted text-sm">Total Target</p>
            <p className="text-2xl font-bold text-trading-text">${totalTargetAmount.toLocaleString()}</p>
          </div>
          <TrendingUp className="h-8 w-8 text-trading-pink" />
        </div>
      </div>
    </div>
  );
}

export default function FinancialPlanner() {
  const { monthlyGoals, setMonthlyGoal, trades } = useTrading();
  const [showForm, setShowForm] = useState(false);

  const handleSetGoal = (month, amount) => {
    setMonthlyGoal(month, amount);
    setShowForm(false);
  };

  // Calculate actual amounts by month for comparison
  const monthlyActuals = {};
  trades.forEach(trade => {
    const date = new Date(trade.date);
    const monthKey = `${date.toLocaleString('en-US', { month: 'long' })} ${date.getFullYear()}`;
    if (!monthlyActuals[monthKey]) {
      monthlyActuals[monthKey] = 0;
    }
    monthlyActuals[monthKey] += trade.profit;
  });

  const hasGoals = Object.keys(monthlyGoals).length > 0;

  return (
    <Layout>
      <div className="p-6 lg:p-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-trading-text">Financial Planner</h1>
            <p className="text-trading-text-muted mt-2">
              Set and track your monthly trading goals and targets.
            </p>
          </div>
          
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 bg-trading-pink hover:bg-trading-pink-dark text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            <Plus size={16} />
            {showForm ? 'Hide Form' : 'Set New Goal'}
          </button>
        </div>

        {/* Stats */}
        {hasGoals && <PlannerStats monthlyGoals={monthlyGoals} trades={trades} />}

        {/* New Goal Form */}
        {showForm && (
          <div className="mb-8">
            <NewGoalForm
              onSubmit={handleSetGoal}
              onCancel={() => setShowForm(false)}
            />
          </div>
        )}

        {/* Goals Grid */}
        {hasGoals ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {Object.entries(monthlyGoals).map(([month, goal]) => (
              <GoalCard
                key={month}
                month={month}
                goal={goal}
                actual={monthlyActuals[month] || 0}
                onEdit={setMonthlyGoal}
                onDelete={() => {
                  // TODO: Implement delete functionality
                  console.log('Delete goal for', month);
                }}
              />
            ))}
          </div>
        ) : (
          <div className="bg-trading-card/20 backdrop-blur-sm border border-trading-pink/20 rounded-lg p-12">
            <div className="text-center">
              <Target className="h-16 w-16 text-trading-text-muted mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-trading-text mb-2">No Goals Set</h3>
              <p className="text-trading-text-muted mb-6">
                Start planning your trading success by setting monthly profit goals.
              </p>
              <div className="flex justify-center">
                <button 
                  onClick={() => setShowForm(true)}
                  className="bg-trading-pink hover:bg-trading-pink-dark text-white px-6 py-3 rounded-lg font-medium transition-colors"
                >
                  Set Your First Goal
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tips Section */}
        <div className="mt-8 bg-trading-card/20 backdrop-blur-sm border border-trading-pink/20 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-trading-text mb-4">Goal Setting Tips</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-trading-text mb-2">SMART Goals</h4>
              <ul className="text-trading-text-muted text-sm space-y-1">
                <li>• Specific: Clear profit targets</li>
                <li>• Measurable: Dollar amounts or percentages</li>
                <li>• Achievable: Based on your track record</li>
                <li>• Relevant: Aligned with your trading strategy</li>
                <li>• Time-bound: Monthly deadlines</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-trading-text mb-2">Best Practices</h4>
              <ul className="text-trading-text-muted text-sm space-y-1">
                <li>• Start with conservative goals</li>
                <li>• Review and adjust monthly</li>
                <li>• Consider market conditions</li>
                <li>• Factor in risk management</li>
                <li>• Track progress regularly</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}