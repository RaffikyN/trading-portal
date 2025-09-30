const setCurrentCash = (amount) => {
    const parsedAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    const finalAmount = isNaN(parsedAmount) ? 0 : parsedAmount;
    console.log('Setting current cash to:', finalAmount); // Debug log
    dispatch({ type: 'SET_CURRENT_CASH', payload: finalAmount });
  };

  const addExpense = (expense) => {
    const newExpense = {
      ...expense,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    };
    dispatch({ type: 'ADD_EXPENSE', payload: newExpense });
  };

  const updateExpense = (expense) => {
    dispatch({ type: 'UPDATE_EXPENSE', payload: expense });
  };

  const deleteExpense = (expenseId) => {
    dispatch({ type: 'DELETE_EXPENSE', payload: expenseId });
  };

  const addIncome = (income) => {
    const newIncome = {
      ...income,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    };
    dispatch({ type: 'ADD_INCOME', payload: newIncome });
  };

  const updateIncome = (income) => {
    dispatch({ type: 'UPDATE_INCOME', payload: income });
  };

  const deleteIncome = (incomeId) => {
    dispatch({ type: 'DELETE_INCOME', payload: incomeId });
  };import React, { createContext, useContext, useReducer, useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';

const TradingContext = createContext();

// Version: 1.1.0 - Force rebuild
// Fallback to localStorage if Supabase fails
const loadLocalStorageData = () => {
  if (typeof window === 'undefined') return null;
  
  try {
    const saved = localStorage.getItem('tradingPortalData');
    return saved ? JSON.parse(saved) : null;
  } catch (error) {
    console.error('Failed to load localStorage data:', error);
    return null;
  }
};

const saveToLocalStorage = (state) => {
  if (typeof window === 'undefined') return;
  
  try {
    const dataToSave = {
      trades: state.trades,
      accounts: state.accounts,
      withdrawals: state.withdrawals,
      monthlyGoals: state.monthlyGoals,
      expenses: state.expenses,
      incomes: state.incomes,
      currentCash: state.currentCash,
    };
    localStorage.setItem('tradingPortalData', JSON.stringify(dataToSave));
  } catch (error) {
    console.error('Failed to save to localStorage:', error);
  }
};

const initialState = {
  trades: [],
  accounts: {},
  withdrawals: [],
  monthlyGoals: {},
  // Personal Finance Data
  expenses: [],
  incomes: [],
  currentCash: 0,
  loading: false,
  error: null,
};

function tradingReducer(state, action) {
  let newState;
  
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    
    case 'LOAD_TRADES':
      const trades = action.payload;
      const accounts = {};
      
      // Build accounts from trades
      trades.forEach(trade => {
        const accountName = trade.account_name || trade.account;
        if (!accounts[accountName]) {
          accounts[accountName] = {
            id: accountName,
            startingBalance: 100000,
            currentBalance: 100000,
            totalPL: 0,
            status: 'Active'
          };
        }
        accounts[accountName].totalPL += trade.profit;
        accounts[accountName].currentBalance = 
          accounts[accountName].startingBalance + accounts[accountName].totalPL;
      });

      newState = {
        ...state,
        trades: trades.map(trade => ({
          id: trade.trade_id || trade.id,
          account: trade.account_name || trade.account,
          date: trade.trade_date || trade.date,
          symbol: trade.symbol,
          side: trade.side,
          quantity: trade.quantity,
          price: trade.price,
          points: trade.points,
          profit: trade.profit,
          timestamp: new Date(trade.trade_timestamp || trade.timestamp)
        })),
        accounts,
        loading: false,
        error: null
      };
      break;
    
    case 'LOAD_WITHDRAWALS':
      newState = {
        ...state,
        withdrawals: action.payload.map(w => ({
          id: w.id,
          account: w.account_name || w.account,
          amount: w.amount,
          date: w.withdrawal_date || w.date,
          description: w.description
        }))
      };
      break;
    
    case 'LOAD_GOALS':
      const goals = {};
      action.payload.forEach(goal => {
        goals[goal.month] = goal.goal_amount || goal.amount;
      });
      newState = {
        ...state,
        monthlyGoals: goals
      };
      break;
    
    case 'IMPORT_TRADES':
      const newTrades = action.payload;
      const updatedTrades = [...state.trades, ...newTrades];
      const updatedAccounts = { ...state.accounts };
      
      // Update accounts based on trades
      newTrades.forEach(trade => {
        if (!updatedAccounts[trade.account]) {
          updatedAccounts[trade.account] = {
            id: trade.account,
            startingBalance: 100000,
            currentBalance: 100000,
            totalPL: 0,
            status: 'Active'
          };
        }
        updatedAccounts[trade.account].totalPL += trade.profit;
        updatedAccounts[trade.account].currentBalance = 
          updatedAccounts[trade.account].startingBalance + updatedAccounts[trade.account].totalPL;
      });
      
      newState = { 
        ...state, 
        trades: updatedTrades, 
        accounts: updatedAccounts, 
        loading: false,
        error: null 
      };
      break;
    
    case 'ADD_WITHDRAWAL':
      const withdrawal = action.payload;
      const updatedAccountsWithdrawal = { ...state.accounts };
      
      if (updatedAccountsWithdrawal[withdrawal.account]) {
        updatedAccountsWithdrawal[withdrawal.account].currentBalance -= withdrawal.amount;
      }
      
      newState = {
        ...state,
        withdrawals: [...state.withdrawals, withdrawal],
        accounts: updatedAccountsWithdrawal
      };
      break;
    
    case 'SET_MONTHLY_GOAL':
      newState = {
        ...state,
        monthlyGoals: {
          ...state.monthlyGoals,
          [action.payload.month]: action.payload.amount
        }
      };
      break;
    
    case 'LOAD_LOCALSTORAGE':
      const localData = action.payload;
      newState = {
        ...state,
        trades: localData.trades || [],
        accounts: localData.accounts || {},
        withdrawals: localData.withdrawals || [],
        monthlyGoals: localData.monthlyGoals || {},
        expenses: localData.expenses || [],
        incomes: localData.incomes || [],
        currentCash: localData.currentCash || 0,
        loading: false,
        error: null
      };
      break;
    
    case 'ADD_EXPENSE':
      newState = {
        ...state,
        expenses: [...state.expenses, action.payload]
      };
      break;
    
    case 'UPDATE_EXPENSE':
      newState = {
        ...state,
        expenses: state.expenses.map(exp => 
          exp.id === action.payload.id ? action.payload : exp
        )
      };
      break;
    
    case 'DELETE_EXPENSE':
      newState = {
        ...state,
        expenses: state.expenses.filter(exp => exp.id !== action.payload)
      };
      break;
    
    case 'ADD_INCOME':
      newState = {
        ...state,
        incomes: [...state.incomes, action.payload]
      };
      break;
    
    case 'UPDATE_INCOME':
      newState = {
        ...state,
        incomes: state.incomes.map(inc => 
          inc.id === action.payload.id ? action.payload : inc
        )
      };
      break;
    
    case 'DELETE_INCOME':
      newState = {
        ...state,
        incomes: state.incomes.filter(inc => inc.id !== action.payload)
      };
      break;
    
    case 'SET_CURRENT_CASH':
      newState = {
        ...state,
        currentCash: action.payload
      };
      break;
    
    case 'CLEAR_DATA':
      newState = {
        trades: [],
        accounts: {},
        withdrawals: [],
        monthlyGoals: {},
        expenses: [],
        incomes: [],
        currentCash: 0,
        loading: false,
        error: null,
      };
      break;
    
    default:
      return state;
  }

  // Save to localStorage for backup
  if (action.type !== 'SET_LOADING' && action.type !== 'SET_ERROR') {
    saveToLocalStorage(newState);
  }
  
  return newState;
}

export function TradingProvider({ children }) {
  const [state, dispatch] = useReducer(tradingReducer, initialState);
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [offlineMode, setOfflineMode] = useState(false);

  // Auth state listener with fallback
  useEffect(() => {
    if (!supabase) {
      console.warn('Supabase not available - using offline mode');
      setOfflineMode(true);
      setAuthLoading(false);
      setUser({ email: 'offline@local' }); // Set offline user
      
      // Load from localStorage as fallback
      const localData = loadLocalStorageData();
      if (localData) {
        dispatch({ type: 'LOAD_LOCALSTORAGE', payload: localData });
      }
      return;
    }

    // Get initial session
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        console.error('Auth session error:', error);
        setOfflineMode(true);
        setUser({ email: 'offline@local' });
        const localData = loadLocalStorageData();
        if (localData) {
          dispatch({ type: 'LOAD_LOCALSTORAGE', payload: localData });
        }
      } else {
        setUser(session?.user ?? null);
        if (session?.user) {
          loadUserData(session.user.id);
        }
      }
      setAuthLoading(false);
    }).catch((error) => {
      console.error('Failed to get session:', error);
      setOfflineMode(true);
      setAuthLoading(false);
      setUser({ email: 'offline@local' });
      const localData = loadLocalStorageData();
      if (localData) {
        dispatch({ type: 'LOAD_LOCALSTORAGE', payload: localData });
      }
    });

    // Listen for auth changes
    try {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (event, session) => {
          setUser(session?.user ?? null);
          setAuthLoading(false);
          
          if (session?.user) {
            await loadUserData(session.user.id);
          } else {
            dispatch({ type: 'CLEAR_DATA' });
          }
        }
      );

      return () => subscription?.unsubscribe();
    } catch (error) {
      console.error('Failed to set up auth listener:', error);
      setOfflineMode(true);
      setUser({ email: 'offline@local' });
    }
  }, []);

  // Load user data from Supabase with retry logic
  const loadUserData = async (userId, retryCount = 0) => {
    if (!supabase) {
      console.warn('Supabase not available for loading data');
      return;
    }

    // Don't try to load from Supabase if already in offline mode
    if (offlineMode && retryCount === 0) {
      console.log('Already in offline mode, skipping Supabase load');
      return;
    }

    try {
      dispatch({ type: 'SET_LOADING', payload: true });

      // Increased timeout to 10 seconds for initial load
      const timeoutMs = retryCount === 0 ? 10000 : 5000;
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Connection timeout - switching to offline mode')), timeoutMs)
      );

      // Create user record if it doesn't exist (only on first try)
      if (retryCount === 0) {
        try {
          const { data: existingUser, error: userError } = await Promise.race([
            supabase
              .from('users')
              .select('id')
              .eq('id', userId)
              .single(),
            timeoutPromise
          ]);

          if (userError && userError.code !== 'PGRST116') {
            throw userError;
          }

          if (!existingUser) {
            await Promise.race([
              supabase
                .from('users')
                .insert({ id: userId, email: user?.email || '' }),
              timeoutPromise
            ]);
          }
        } catch (userCreationError) {
          console.warn('User creation failed, continuing with data load:', userCreationError);
        }
      }

      // Load all user data with timeout
      const [
        { data: trades, error: tradesError },
        { data: withdrawals, error: withdrawalsError },
        { data: goals, error: goalsError }
      ] = await Promise.race([
        Promise.all([
          supabase.from('trades').select('*').eq('user_id', userId).limit(1000),
          supabase.from('withdrawals').select('*').eq('user_id', userId).limit(100),
          supabase.from('monthly_goals').select('*').eq('user_id', userId).limit(50)
        ]),
        timeoutPromise
      ]);

      // Check for errors but don't fail completely
      if (tradesError) console.warn('Error loading trades:', tradesError);
      if (withdrawalsError) console.warn('Error loading withdrawals:', withdrawalsError);
      if (goalsError) console.warn('Error loading goals:', goalsError);

      // Always dispatch data (even if empty) to clear loading state
      dispatch({ type: 'LOAD_TRADES', payload: trades || [] });
      dispatch({ type: 'LOAD_WITHDRAWALS', payload: withdrawals || [] });
      dispatch({ type: 'LOAD_GOALS', payload: goals || [] });

      dispatch({ type: 'SET_LOADING', payload: false });
      
      // Clear error on successful load
      dispatch({ type: 'SET_ERROR', payload: null });

    } catch (error) {
      console.error('Error loading user data:', error);
      
      // Only retry once
      if (retryCount === 0) {
        console.log('Retrying data load once more...');
        setTimeout(() => loadUserData(userId, 1), 2000);
        return;
      }
      
      // After retry fails, switch to offline mode
      console.warn('Switching to offline mode - using local data');
      setOfflineMode(true);
      
      // Load from localStorage as fallback
      const localData = loadLocalStorageData();
      if (localData) {
        console.log('Loading data from localStorage backup');
        dispatch({ type: 'LOAD_LOCALSTORAGE', payload: localData });
      }
      
      dispatch({ type: 'SET_ERROR', payload: 'Using offline mode - data saved locally' });
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const importTrades = async (csvData) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    
    try {
      // Transform CSV data
      const trades = csvData
        .filter(row => row.profit && parseFloat(row.profit) !== 0)
        .map((row, index) => ({
          id: row.order_id || `trade_${Date.now()}_${index}`,
          account: row.name || 'Default Account',
          date: new Date(row.mov_time || Date.now()).toISOString().split('T')[0],
          symbol: row.symbol || '',
          side: parseFloat(row.mov_type || 0) > 0 ? 'Long' : 'Short',
          quantity: Math.abs(parseFloat(row.exec_qty || 0)),
          price: parseFloat(row.price_done || 0),
          points: parseFloat(row.points || 0),
          profit: parseFloat(row.profit || 0),
          timestamp: new Date(row.mov_time || Date.now())
        }));

      // Try to save to Supabase if available
      if (!offlineMode && user && supabase) {
        try {
          const supabaseTrades = trades.map(trade => ({
            user_id: user.id,
            trade_id: trade.id,
            account_name: trade.account,
            symbol: trade.symbol,
            side: trade.side,
            quantity: trade.quantity,
            price: trade.price,
            points: trade.points,
            profit: trade.profit,
            trade_date: trade.date,
            trade_timestamp: trade.timestamp.toISOString()
          }));

          const { error } = await supabase
            .from('trades')
            .insert(supabaseTrades);

          if (error) throw error;
        } catch (error) {
          console.warn('Failed to save to Supabase, using local storage:', error);
          setOfflineMode(true);
        }
      }

      // Always update local state
      dispatch({ type: 'IMPORT_TRADES', payload: trades });
      
    } catch (error) {
      console.error('Error importing trades:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to import trades' });
    }
  };

  const addWithdrawal = async (withdrawal) => {
    try {
      const withdrawalData = {
        id: Date.now().toString(),
        account: withdrawal.account,
        amount: withdrawal.amount,
        date: withdrawal.date || new Date().toISOString().split('T')[0],
        description: withdrawal.description || ''
      };

      // Try to save to Supabase if available and online
      if (!offlineMode && user && user.id && supabase) {
        try {
          const supabaseWithdrawal = {
            user_id: user.id,
            account_name: withdrawal.account,
            amount: withdrawal.amount,
            withdrawal_date: withdrawal.date || new Date().toISOString().split('T')[0],
            description: withdrawal.description || ''
          };

          const { data, error } = await supabase
            .from('withdrawals')
            .insert(supabaseWithdrawal)
            .select()
            .single();

          if (error) throw error;
          
          withdrawalData.id = data.id;
        } catch (error) {
          console.warn('Failed to save withdrawal to Supabase, using local storage:', error);
          setOfflineMode(true);
        }
      }

      dispatch({ type: 'ADD_WITHDRAWAL', payload: withdrawalData });
    } catch (error) {
      console.error('Error adding withdrawal:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to add withdrawal' });
    }
  };

  const setMonthlyGoal = async (month, amount) => {
    try {
      // Try to save to Supabase if available and online
      if (!offlineMode && user && user.id && supabase) {
        try {
          const { data, error } = await supabase
            .from('monthly_goals')
            .upsert({
              user_id: user.id,
              month,
              goal_amount: amount
            });

          if (error) throw error;
        } catch (error) {
          console.warn('Failed to save goal to Supabase, using local storage:', error);
          setOfflineMode(true);
        }
      }

      dispatch({ type: 'SET_MONTHLY_GOAL', payload: { month, amount } });
    } catch (error) {
      console.error('Error setting goal:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to set goal' });
    }
  };

  const clearData = async () => {
    if (!window.confirm('Are you sure you want to delete ALL data? This cannot be undone.')) {
      return;
    }
    
    try {
      // Clear local state
      dispatch({ type: 'CLEAR_DATA' });
      
      // Clear localStorage
      if (typeof window !== 'undefined') {
        localStorage.removeItem('tradingPortalData');
      }
      
      console.log('All data cleared successfully');
    } catch (error) {
      console.error('Error clearing data:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to clear data' });
    }
  };

  const signOut = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      
      // Don't clear any data - keep everything in localStorage
      // Just sign out from Supabase
      setUser(null);
      setOfflineMode(false);
      
      if (supabase) {
        try {
          const { error } = await supabase.auth.signOut();
          if (error) {
            console.error('Supabase sign out error:', error);
          }
        } catch (error) {
          console.error('Supabase sign out failed:', error);
        }
      }
      
      dispatch({ type: 'SET_LOADING', payload: false });
    } catch (error) {
      console.error('Error signing out:', error);
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  // Computed values
  const totalPL = state.trades.reduce((sum, trade) => sum + trade.profit, 0);
  const totalWithdrawals = state.withdrawals.reduce((sum, w) => sum + w.amount, 0);
  const winningTrades = state.trades.filter(t => t.profit > 0);
  const winRate = state.trades.length > 0 ? (winningTrades.length / state.trades.length) * 100 : 0;
  const activeAccounts = Object.values(state.accounts).filter(acc => acc.status === 'Active').length;

  // Personal Finance Calculations
  const calculateCashFlow = (period = 'month') => {
    const now = new Date();
    let startDate, endDate;

    switch (period) {
      case 'day':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
        break;
      case 'week':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay());
        endDate = new Date(startDate.getTime() + 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        break;
    }

    // Calculate expenses in period
    const periodExpenses = state.expenses
      .filter(exp => {
        const expenseDate = new Date(exp.dueDate);
        return expenseDate >= startDate && expenseDate <= endDate;
      })
      .reduce((sum, exp) => sum + exp.amount, 0);

    // Calculate income in period
    const periodIncome = state.incomes
      .filter(inc => {
        const incomeDate = new Date(inc.date);
        return incomeDate >= startDate && incomeDate <= endDate;
      })
      .reduce((sum, inc) => sum + inc.amount, 0);

    // Add trading withdrawals as income
    const tradingIncome = state.withdrawals
      .filter(w => {
        const withdrawalDate = new Date(w.date);
        return withdrawalDate >= startDate && withdrawalDate <= endDate;
      })
      .reduce((sum, w) => sum + w.amount, 0);

    return {
      income: periodIncome + tradingIncome,
      expenses: periodExpenses,
      netCashFlow: (periodIncome + tradingIncome) - periodExpenses,
      projectedCash: state.currentCash + (periodIncome + tradingIncome) - periodExpenses
    };
  };

  const calculateNetWorth = () => {
    const cashOnHand = state.currentCash;
    const tradingAccountValue = Object.values(state.accounts).reduce((sum, acc) => sum + acc.currentBalance, 0);
    const pendingWithdrawals = state.withdrawals.reduce((sum, w) => sum + w.amount, 0);
    
    return cashOnHand + tradingAccountValue - pendingWithdrawals;
  };

  // Add connection status checker
  const checkConnection = async () => {
    if (!supabase || offlineMode) return false;
    
    try {
      await Promise.race([
        supabase.from('users').select('id').limit(1),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Connection test timeout')), 3000))
      ]);
      return true;
    } catch (error) {
      console.warn('Connection check failed:', error);
      return false;
    }
  };

  // Periodically check connection and switch modes
  useEffect(() => {
    if (!supabase) return;

    const connectionChecker = setInterval(async () => {
      if (offlineMode) {
        // Try to reconnect if offline (check every 60 seconds)
        const isOnline = await checkConnection();
        if (isOnline && user && user.id) {
          console.log('Connection restored - attempting to reload data');
          setOfflineMode(false);
          dispatch({ type: 'SET_ERROR', payload: null });
          // Try to reload user data
          loadUserData(user.id, 0);
        }
      }
    }, 60000); // Check every 60 seconds instead of 30

    return () => clearInterval(connectionChecker);
  }, [offlineMode, user]);

  const value = {
    ...state,
    user: offlineMode ? { email: 'offline@local' } : user,
    authLoading,
    offlineMode,
    importTrades,
    addWithdrawal,
    setMonthlyGoal,
    clearData,
    signOut,
    // Personal Finance Functions - exported from context
    setCurrentCash,
    addExpense,
    updateExpense,
    deleteExpense,
    addIncome,
    updateIncome,
    deleteIncome,
    calculateCashFlow,
    calculateNetWorth,
    // Computed values
    totalPL,
    totalWithdrawals,
    winRate,
    activeAccounts,
    winningTrades: winningTrades.length,
    totalTrades: state.trades.length,
  };

  return (
    <TradingContext.Provider value={value}>
      {children}
    </TradingContext.Provider>
  );
}

export function useTrading() {
  const context = useContext(TradingContext);
  if (!context) {
    throw new Error('useTrading must be used within a TradingProvider');
  }
  return context;
}