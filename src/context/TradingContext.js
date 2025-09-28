import React, { createContext, useContext, useReducer, useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';

const TradingContext = createContext();

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
        ...localData,
        loading: false,
        error: null
      };
      break;
    
    case 'CLEAR_DATA':
      newState = {
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

  // Auth state listener with fallback
  useEffect(() => {
    if (!supabase) {
      console.warn('Supabase not available - using offline mode');
      setOfflineMode(true);
      setAuthLoading(false);
      
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
        const localData = loadLocalStorageData();
        if (localData) {
          dispatch({ type: 'LOAD_LOCALSTORAGE', payload: localData });
        }
      }
      
      setUser(session?.user ?? null);
      setAuthLoading(false);
      
      if (session?.user) {
        loadUserData(session.user.id);
      }
    }).catch((error) => {
      console.error('Failed to get session:', error);
      setOfflineMode(true);
      setAuthLoading(false);
      const localData = loadLocalStorageData();
      if (localData) {
        dispatch({ type: 'LOAD_LOCALSTORAGE', payload: localData });
      }
    });

    // Listen for auth changes
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
  }, []);

  // Load user data from Supabase
  const loadUserData = async (userId) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });

      // Set a timeout to prevent infinite loading
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Request timeout')), 15000)
      );

      // Create user record if it doesn't exist
      const { data: existingUser } = await Promise.race([
        supabase
          .from('users')
          .select('id')
          .eq('id', userId)
          .single(),
        timeoutPromise
      ]);

      if (!existingUser) {
        await Promise.race([
          supabase
            .from('users')
            .insert({ id: userId, email: user?.email || '' }),
          timeoutPromise
        ]);
      }

      // Load all user data with timeout
      const [
        { data: trades, error: tradesError },
        { data: withdrawals, error: withdrawalsError },
        { data: goals, error: goalsError }
      ] = await Promise.race([
        Promise.all([
          supabase.from('trades').select('*').eq('user_id', userId),
          supabase.from('withdrawals').select('*').eq('user_id', userId),
          supabase.from('monthly_goals').select('*').eq('user_id', userId)
        ]),
        timeoutPromise
      ]);

      // Check for errors
      if (tradesError) console.error('Error loading trades:', tradesError);
      if (withdrawalsError) console.error('Error loading withdrawals:', withdrawalsError);
      if (goalsError) console.error('Error loading goals:', goalsError);

      // Always dispatch data (even if empty) to clear loading state
      dispatch({ type: 'LOAD_TRADES', payload: trades || [] });
      dispatch({ type: 'LOAD_WITHDRAWALS', payload: withdrawals || [] });
      dispatch({ type: 'LOAD_GOALS', payload: goals || [] });

      dispatch({ type: 'SET_LOADING', payload: false });

    } catch (error) {
      console.error('Error loading user data:', error);
      dispatch({ type: 'SET_ERROR', payload: error.message || 'Failed to load data' });
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
    if (!user) {
      dispatch({ type: 'SET_ERROR', payload: 'Please sign in to add withdrawals' });
      return;
    }

    try {
      const withdrawalData = {
        user_id: user.id,
        account_name: withdrawal.account,
        amount: withdrawal.amount,
        withdrawal_date: withdrawal.date || new Date().toISOString().split('T')[0],
        description: withdrawal.description || ''
      };

      const { data, error } = await supabase
        .from('withdrawals')
        .insert(withdrawalData)
        .select()
        .single();

      if (error) throw error;

      dispatch({ 
        type: 'ADD_WITHDRAWAL', 
        payload: {
          id: data.id,
          account: data.account_name,
          amount: data.amount,
          date: data.withdrawal_date,
          description: data.description
        }
      });
    } catch (error) {
      console.error('Error adding withdrawal:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to add withdrawal' });
    }
  };

  const setMonthlyGoal = async (month, amount) => {
    if (!user) {
      dispatch({ type: 'SET_ERROR', payload: 'Please sign in to set goals' });
      return;
    }

    try {
      const { data, error } = await supabase
        .from('monthly_goals')
        .upsert({
          user_id: user.id,
          month,
          goal_amount: amount
        });

      if (error) throw error;

      dispatch({ type: 'SET_MONTHLY_GOAL', payload: { month, amount } });
    } catch (error) {
      console.error('Error setting goal:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to set goal' });
    }
  };

  const clearData = async () => {
    if (!user) return;

    try {
      // Delete all user data from Supabase
      await Promise.all([
        supabase.from('trades').delete().eq('user_id', user.id),
        supabase.from('withdrawals').delete().eq('user_id', user.id),
        supabase.from('monthly_goals').delete().eq('user_id', user.id)
      ]);

      dispatch({ type: 'CLEAR_DATA' });
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
      
      // Clear local state immediately
      dispatch({ type: 'CLEAR_DATA' });
      setUser(null);
      setOfflineMode(false);
      
      // Clear localStorage
      if (typeof window !== 'undefined') {
        localStorage.removeItem('tradingPortalData');
      }
      
      // Then sign out from Supabase if available
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
      // Force clear everything even if everything fails
      dispatch({ type: 'CLEAR_DATA' });
      setUser(null);
      setOfflineMode(false);
      if (typeof window !== 'undefined') {
        localStorage.clear();
      }
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  // Computed values
  const totalPL = state.trades.reduce((sum, trade) => sum + trade.profit, 0);
  const totalWithdrawals = state.withdrawals.reduce((sum, w) => sum + w.amount, 0);
  const winningTrades = state.trades.filter(t => t.profit > 0);
  const winRate = state.trades.length > 0 ? (winningTrades.length / state.trades.length) * 100 : 0;
  const activeAccounts = Object.values(state.accounts).filter(acc => acc.status === 'Active').length;

  const value = {
    ...state,
    user: offlineMode ? { email: 'offline@local' } : user, // Show offline user
    authLoading,
    offlineMode,
    importTrades,
    addWithdrawal,
    setMonthlyGoal,
    clearData,
    signOut,
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