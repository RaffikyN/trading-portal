import React, { createContext, useContext, useReducer, useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';

const TradingContext = createContext();

const initialState = {
  trades: [],
  accounts: {},
  withdrawals: [],
  monthlyGoals: {},
  loading: false,
  error: null,
};

function tradingReducer(state, action) {
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
        if (!accounts[trade.account_name]) {
          accounts[trade.account_name] = {
            id: trade.account_name,
            startingBalance: 100000,
            currentBalance: 100000,
            totalPL: 0,
            status: 'Active'
          };
        }
        accounts[trade.account_name].totalPL += trade.profit;
        accounts[trade.account_name].currentBalance = 
          accounts[trade.account_name].startingBalance + accounts[trade.account_name].totalPL;
      });

      return {
        ...state,
        trades: trades.map(trade => ({
          id: trade.trade_id,
          account: trade.account_name,
          date: trade.trade_date,
          symbol: trade.symbol,
          side: trade.side,
          quantity: trade.quantity,
          price: trade.price,
          points: trade.points,
          profit: trade.profit,
          timestamp: new Date(trade.trade_timestamp)
        })),
        accounts,
        loading: false,
        error: null
      };
    
    case 'LOAD_WITHDRAWALS':
      return {
        ...state,
        withdrawals: action.payload.map(w => ({
          id: w.id,
          account: w.account_name,
          amount: w.amount,
          date: w.withdrawal_date,
          description: w.description
        }))
      };
    
    case 'LOAD_GOALS':
      const goals = {};
      action.payload.forEach(goal => {
        goals[goal.month] = goal.goal_amount;
      });
      return {
        ...state,
        monthlyGoals: goals
      };
    
    case 'ADD_WITHDRAWAL':
      const withdrawal = action.payload;
      const updatedAccounts = { ...state.accounts };
      
      if (updatedAccounts[withdrawal.account]) {
        updatedAccounts[withdrawal.account].currentBalance -= withdrawal.amount;
      }
      
      return {
        ...state,
        withdrawals: [...state.withdrawals, withdrawal],
        accounts: updatedAccounts
      };
    
    case 'SET_MONTHLY_GOAL':
      return {
        ...state,
        monthlyGoals: {
          ...state.monthlyGoals,
          [action.payload.month]: action.payload.amount
        }
      };
    
    case 'CLEAR_DATA':
      return initialState;
    
    default:
      return state;
  }
}

export function TradingProvider({ children }) {
  const [state, dispatch] = useReducer(tradingReducer, initialState);
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Auth state listener
  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setAuthLoading(false);
      
      if (session?.user) {
        loadUserData(session.user.id);
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

      // Create user record if it doesn't exist
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('id', userId)
        .single();

      if (!existingUser) {
        await supabase
          .from('users')
          .insert({ id: userId, email: user?.email || '' });
      }

      // Load all user data
      const [
        { data: trades },
        { data: withdrawals },
        { data: goals }
      ] = await Promise.all([
        supabase.from('trades').select('*').eq('user_id', userId),
        supabase.from('withdrawals').select('*').eq('user_id', userId),
        supabase.from('monthly_goals').select('*').eq('user_id', userId)
      ]);

      dispatch({ type: 'LOAD_TRADES', payload: trades || [] });
      dispatch({ type: 'LOAD_WITHDRAWALS', payload: withdrawals || [] });
      dispatch({ type: 'LOAD_GOALS', payload: goals || [] });

    } catch (error) {
      console.error('Error loading user data:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to load data' });
    }
  };

  const importTrades = async (csvData) => {
    if (!user) {
      dispatch({ type: 'SET_ERROR', payload: 'Please sign in to import trades' });
      return;
    }

    dispatch({ type: 'SET_LOADING', payload: true });
    
    try {
      // Transform CSV data
      const trades = csvData
        .filter(row => row.profit && parseFloat(row.profit) !== 0)
        .map((row, index) => ({
          user_id: user.id,
          trade_id: row.order_id || `trade_${Date.now()}_${index}`,
          account_name: row.name || 'Default Account',
          symbol: row.symbol || '',
          side: parseFloat(row.mov_type || 0) > 0 ? 'Long' : 'Short',
          quantity: Math.abs(parseFloat(row.exec_qty || 0)),
          price: parseFloat(row.price_done || 0),
          points: parseFloat(row.points || 0),
          profit: parseFloat(row.profit || 0),
          trade_date: new Date(row.mov_time || Date.now()).toISOString().split('T')[0],
          trade_timestamp: new Date(row.mov_time || Date.now()).toISOString()
        }));

      // Save to Supabase
      const { data, error } = await supabase
        .from('trades')
        .insert(trades)
        .select();

      if (error) throw error;

      // Reload data to get fresh state
      await loadUserData(user.id);
      
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
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Error signing out:', error);
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
    user,
    authLoading,
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