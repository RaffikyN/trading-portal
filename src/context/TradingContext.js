import React, { createContext, useContext, useReducer, useEffect, useState } from 'react';
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
            status: 'Active',
            availableDrawdown: 0
          };
        }
        accounts[accountName].totalPL += trade.profit;
        accounts[accountName].currentBalance = 
          accounts[accountName].startingBalance + accounts[accountName].totalPL;
        
        // Calculate available drawdown
        const isPA = accountName.includes('PA');
        const calculatedDrawdown = accounts[accountName].currentBalance - 3000;
        
        if (isPA) {
          // PA accounts: cap at 100,100
          accounts[accountName].availableDrawdown = Math.min(calculatedDrawdown, 100100);
        } else {
          // Regular accounts: always balance - 3k
          accounts[accountName].availableDrawdown = calculatedDrawdown;
        }
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
            status: 'Active',
            availableDrawdown: 0
          };
        }
        updatedAccounts[trade.account].totalPL += trade.profit;
        updatedAccounts[trade.account].currentBalance = 
          updatedAccounts[trade.account].startingBalance + updatedAccounts[trade.account].totalPL;
        
        // Calculate available drawdown
        const isPA = trade.account.includes('PA');
        const calculatedDrawdown = updatedAccounts[trade.account].currentBalance - 3000;
        
        if (isPA) {
          // PA accounts: cap at 100,100
          updatedAccounts[trade.account].availableDrawdown = Math.min(calculatedDrawdown, 100100);
        } else {
          // Regular accounts: always balance - 3k
          updatedAccounts[trade.account].availableDrawdown = calculatedDrawdown;
        }
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
    
    case 'LOAD_EXPENSES':
      newState = {
        ...state,
        expenses: action.payload.map(exp => ({
          id: exp.id,
          category: exp.category,
          description: exp.description,
          amount: parseFloat(exp.amount),
          dueDate: exp.due_date,
          isPaid: exp.is_paid,
          isRecurring: exp.is_recurring,
          createdAt: exp.created_at
        }))
      };
      break;
    
    case 'LOAD_INCOMES':
      newState = {
        ...state,
        incomes: action.payload.map(inc => ({
          id: inc.id,
          category: inc.category,
          description: inc.description,
          amount: parseFloat(inc.amount),
          date: inc.date,
          isPaid: inc.is_paid,
          isRecurring: inc.is_recurring,
          createdAt: inc.created_at
        }))
      };
      break;
    
    case 'ADD_EXPENSE':
      newState = {
        ...state,
        expenses: [...state.expenses, action.payload],
        currentCash: state.currentCash - action.payload.amount
      };
      break;
    
    case 'UPDATE_EXPENSE':
      const oldExpense = state.expenses.find(exp => exp.id === action.payload.id);
      const cashDifference = oldExpense ? oldExpense.amount - action.payload.amount : 0;
      newState = {
        ...state,
        expenses: state.expenses.map(exp => 
          exp.id === action.payload.id ? action.payload : exp
        ),
        currentCash: state.currentCash + cashDifference
      };
      break;
    
    case 'DELETE_EXPENSE':
      const deletedExpense = state.expenses.find(exp => exp.id === action.payload);
      newState = {
        ...state,
        expenses: state.expenses.filter(exp => exp.id !== action.payload),
        currentCash: deletedExpense ? state.currentCash + deletedExpense.amount : state.currentCash
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
    
    case 'CLEAR_TRADING_DATA':
      newState = {
        ...state,
        trades: [],
        accounts: {},
        withdrawals: [],
        monthlyGoals: {},
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

  // Personal Finance Functions - DEFINED INSIDE COMPONENT
  const setCurrentCash = async (amount) => {
    const parsedAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    const finalAmount = isNaN(parsedAmount) ? 0 : parsedAmount;
    console.log('Setting current cash to:', finalAmount);
    
    dispatch({ type: 'SET_CURRENT_CASH', payload: finalAmount });
    
    // Sync to Supabase if online
    if (!offlineMode && user && user.id && supabase) {
      try {
        const { error } = await supabase
          .from('user_settings')
          .upsert({
            user_id: user.id,
            current_cash: finalAmount,
            updated_at: new Date().toISOString()
          });
        
        if (error) throw error;
      } catch (error) {
        console.warn('Failed to sync cash to Supabase:', error);
      }
    }
  };

  const addExpense = async (expense) => {
    const newExpense = {
      ...expense,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    };
    
    dispatch({ type: 'ADD_EXPENSE', payload: newExpense });
    
    // Calculate new cash after expense
    const newCash = state.currentCash - expense.amount;
    
    // Sync to Supabase if online
    if (!offlineMode && user && user.id && supabase) {
      try {
        // Insert expense and update cash in parallel
        await Promise.all([
          supabase.from('expenses').insert({
            id: newExpense.id,
            user_id: user.id,
            category: newExpense.category,
            description: newExpense.description,
            amount: newExpense.amount,
            due_date: newExpense.dueDate,
            is_paid: newExpense.isPaid,
            is_recurring: newExpense.isRecurring,
            created_at: newExpense.createdAt
          }),
          supabase.from('user_settings').upsert({
            user_id: user.id,
            current_cash: newCash,
            updated_at: new Date().toISOString()
          })
        ]);
      } catch (error) {
        console.warn('Failed to sync expense to Supabase:', error);
      }
    }
  };

  const updateExpense = async (expense) => {
    // Find the old expense to calculate cash difference
    const oldExpense = state.expenses.find(exp => exp.id === expense.id);
    const cashDifference = oldExpense ? oldExpense.amount - expense.amount : 0;
    const newCash = state.currentCash + cashDifference;
    
    dispatch({ type: 'UPDATE_EXPENSE', payload: expense });
    
    // Sync to Supabase if online
    if (!offlineMode && user && user.id && supabase) {
      try {
        await Promise.all([
          supabase.from('expenses').update({
            category: expense.category,
            description: expense.description,
            amount: expense.amount,
            due_date: expense.dueDate,
            is_paid: expense.isPaid,
            is_recurring: expense.isRecurring
          }).eq('id', expense.id).eq('user_id', user.id),
          supabase.from('user_settings').upsert({
            user_id: user.id,
            current_cash: newCash,
            updated_at: new Date().toISOString()
          })
        ]);
      } catch (error) {
        console.warn('Failed to update expense in Supabase:', error);
      }
    }
  };

  const deleteExpense = async (expenseId) => {
    // Find the expense to add its amount back to cash
    const deletedExpense = state.expenses.find(exp => exp.id === expenseId);
    const newCash = deletedExpense ? state.currentCash + deletedExpense.amount : state.currentCash;
    
    dispatch({ type: 'DELETE_EXPENSE', payload: expenseId });
    
    // Sync to Supabase if online
    if (!offlineMode && user && user.id && supabase) {
      try {
        await Promise.all([
          supabase.from('expenses').delete().eq('id', expenseId).eq('user_id', user.id),
          supabase.from('user_settings').upsert({
            user_id: user.id,
            current_cash: newCash,
            updated_at: new Date().toISOString()
          })
        ]);
      } catch (error) {
        console.warn('Failed to delete expense from Supabase:', error);
      }
    }
  };

  const addIncome = async (income) => {
    const newIncome = {
      ...income,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    };
    
    dispatch({ type: 'ADD_INCOME', payload: newIncome });
    
    // Sync to Supabase if online
    if (!offlineMode && user && user.id && supabase) {
      try {
        const { error } = await supabase
          .from('incomes')
          .insert({
            id: newIncome.id,
            user_id: user.id,
            category: newIncome.category,
            description: newIncome.description,
            amount: newIncome.amount,
            date: newIncome.date,
            is_paid: newIncome.isPaid,
            is_recurring: newIncome.isRecurring,
            created_at: newIncome.createdAt
          });
        
        if (error) throw error;
      } catch (error) {
        console.warn('Failed to sync income to Supabase:', error);
      }
    }
  };

  const updateIncome = async (income) => {
    dispatch({ type: 'UPDATE_INCOME', payload: income });
    
    // Sync to Supabase if online
    if (!offlineMode && user && user.id && supabase) {
      try {
        const { error } = await supabase
          .from('incomes')
          .update({
            category: income.category,
            description: income.description,
            amount: income.amount,
            date: income.date,
            is_paid: income.isPaid,
            is_recurring: income.isRecurring
          })
          .eq('id', income.id)
          .eq('user_id', user.id);
        
        if (error) throw error;
      } catch (error) {
        console.warn('Failed to update income in Supabase:', error);
      }
    }
  };

  const deleteIncome = async (incomeId) => {
    dispatch({ type: 'DELETE_INCOME', payload: incomeId });
    
    // Sync to Supabase if online
    if (!offlineMode && user && user.id && supabase) {
      try {
        const { error } = await supabase
          .from('incomes')
          .delete()
          .eq('id', incomeId)
          .eq('user_id', user.id);
        
        if (error) throw error;
      } catch (error) {
        console.warn('Failed to delete income from Supabase:', error);
      }
    }
  };

  // Load localStorage data on mount (before auth check)
  useEffect(() => {
    const localData = loadLocalStorageData();
    if (localData) {
      console.log('Loading data from localStorage:', localData);
      dispatch({ type: 'LOAD_LOCALSTORAGE', payload: localData });
    }
  }, []);

  // Auth state listener with fallback
  useEffect(() => {
    if (!supabase) {
      console.warn('Supabase not available - using offline mode');
      setOfflineMode(true);
      setAuthLoading(false);
      setUser({ email: 'offline@local' }); // Set offline user
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

    try {
      dispatch({ type: 'SET_LOADING', payload: true });

      // Reduced timeout to 5 seconds (was 15)
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Connection timeout - switching to offline mode')), 5000)
      );

      // Create user record if it doesn't exist
      try {
        const { data: existingUser, error: userError } = await Promise.race([
          supabase
            .from('users')
            .select('id')
            .eq('id', userId)
            .single(),
          timeoutPromise
        ]);

        if (userError && userError.code !== 'PGRST116') { // PGRST116 = row not found
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

      // Load all user data with shorter timeout
      const [
        { data: trades, error: tradesError },
        { data: withdrawals, error: withdrawalsError },
        { data: goals, error: goalsError },
        { data: expenses, error: expensesError },
        { data: incomes, error: incomesError },
        { data: settings, error: settingsError }
      ] = await Promise.race([
        Promise.all([
          supabase.from('trades').select('*').eq('user_id', userId).limit(1000),
          supabase.from('withdrawals').select('*').eq('user_id', userId).limit(100),
          supabase.from('monthly_goals').select('*').eq('user_id', userId).limit(50),
          supabase.from('expenses').select('*').eq('user_id', userId).limit(500),
          supabase.from('incomes').select('*').eq('user_id', userId).limit(500),
          supabase.from('user_settings').select('*').eq('user_id', userId).single()
        ]),
        timeoutPromise
      ]);

      // Check for errors but don't fail completely
      if (tradesError) console.warn('Error loading trades:', tradesError);
      if (withdrawalsError) console.warn('Error loading withdrawals:', withdrawalsError);
      if (goalsError) console.warn('Error loading goals:', goalsError);
      if (expensesError) console.warn('Error loading expenses:', expensesError);
      if (incomesError) console.warn('Error loading incomes:', incomesError);
      if (settingsError) console.warn('Error loading settings:', settingsError);

      // Always dispatch data (even if empty) to clear loading state
      dispatch({ type: 'LOAD_TRADES', payload: trades || [] });
      dispatch({ type: 'LOAD_WITHDRAWALS', payload: withdrawals || [] });
      dispatch({ type: 'LOAD_GOALS', payload: goals || [] });
      dispatch({ type: 'LOAD_EXPENSES', payload: expenses || [] });
      dispatch({ type: 'LOAD_INCOMES', payload: incomes || [] });
      dispatch({ type: 'SET_CURRENT_CASH', payload: settings?.current_cash || 0 });

      dispatch({ type: 'SET_LOADING', payload: false });

    } catch (error) {
      console.error('Error loading user data:', error);
      
      // Retry once before falling back
      if (retryCount === 0) {
        console.log('Retrying data load...');
        setTimeout(() => loadUserData(userId, 1), 1000);
        return;
      }
      
      // Fall back to offline mode if retries fail
      console.warn('Switching to offline mode due to connection issues');
      setOfflineMode(true);
      const localData = loadLocalStorageData();
      if (localData) {
        dispatch({ type: 'LOAD_LOCALSTORAGE', payload: localData });
      }
      dispatch({ type: 'SET_ERROR', payload: 'Connection timeout - using offline mode' });
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
    try {
      // Try to delete from Supabase if available and online
      if (!offlineMode && user && user.id && supabase) {
        try {
          await Promise.all([
            supabase.from('trades').delete().eq('user_id', user.id),
            supabase.from('withdrawals').delete().eq('user_id', user.id),
            supabase.from('monthly_goals').delete().eq('user_id', user.id),
            supabase.from('expenses').delete().eq('user_id', user.id),
            supabase.from('incomes').delete().eq('user_id', user.id),
            supabase.from('user_settings').delete().eq('user_id', user.id)
          ]);
        } catch (error) {
          console.warn('Failed to clear Supabase data:', error);
        }
      }

      // Always clear local data
      dispatch({ type: 'CLEAR_DATA' });
      
      // Clear localStorage
      if (typeof window !== 'undefined') {
        localStorage.removeItem('tradingPortalData');
      }
    } catch (error) {
      console.error('Error clearing data:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to clear data' });
    }
  };

  const signOut = async () => {
    try {
      // Force clear loading state and show sign out is happening
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      
      // DON'T clear any data - keep everything in localStorage
      setUser(null);
      setOfflineMode(false);
      
      // Sign out from Supabase if available
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
      setUser(null);
      setOfflineMode(false);
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
        // Try to reconnect if offline
        const isOnline = await checkConnection();
        if (isOnline) {
          console.log('Connection restored - switching back to online mode');
          setOfflineMode(false);
          dispatch({ type: 'SET_ERROR', payload: null });
        }
      }
    }, 30000); // Check every 30 seconds

    return () => clearInterval(connectionChecker);
  }, [offlineMode]);

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