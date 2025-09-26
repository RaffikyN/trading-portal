import React, { createContext, useContext, useReducer, useEffect } from 'react';

const TradingContext = createContext();

// Load initial state from localStorage
const loadInitialState = () => {
  if (typeof window === 'undefined') {
    // Server-side rendering - return default state
    return {
      trades: [],
      accounts: {},
      withdrawals: [],
      monthlyGoals: {},
      loading: false,
      error: null,
    };
  }

  try {
    const saved = localStorage.getItem('tradingPortalData');
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        ...parsed,
        loading: false,
        error: null,
      };
    }
  } catch (error) {
    console.error('Failed to load data from localStorage:', error);
  }

  return {
    trades: [],
    accounts: {},
    withdrawals: [],
    monthlyGoals: {},
    loading: false,
    error: null,
  };
};

const initialState = loadInitialState();

// Save state to localStorage (excluding loading and error)
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
    console.error('Failed to save data to localStorage:', error);
  }
};

function tradingReducer(state, action) {
  let newState;
  
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    
    case 'IMPORT_TRADES':
      const newTrades = action.payload;
      const updatedTrades = [...state.trades, ...newTrades];
      const updatedAccounts = { ...state.accounts };
      
      // Update accounts based on trades
      newTrades.forEach(trade => {
        if (!updatedAccounts[trade.account]) {
          updatedAccounts[trade.account] = {
            id: trade.account,
            startingBalance: 100000, // Default starting balance
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

  // Save to localStorage after state changes (except for loading/error states)
  if (action.type !== 'SET_LOADING' && action.type !== 'SET_ERROR') {
    saveToLocalStorage(newState);
  }
  
  return newState;
}

export function TradingProvider({ children }) {
  const [state, dispatch] = useReducer(tradingReducer, initialState);

  // Load data on mount (client-side only)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const loadedState = loadInitialState();
      if (loadedState.trades.length > 0 || Object.keys(loadedState.accounts).length > 0) {
        // If we have data in localStorage that's different from initial state, update it
        if (JSON.stringify(loadedState) !== JSON.stringify(state)) {
          // Dispatch each piece of data to rebuild state properly
          if (loadedState.trades.length > 0) {
            dispatch({ type: 'IMPORT_TRADES', payload: loadedState.trades });
          }
          if (loadedState.withdrawals.length > 0) {
            loadedState.withdrawals.forEach(withdrawal => {
              dispatch({ type: 'ADD_WITHDRAWAL', payload: withdrawal });
            });
          }
          Object.entries(loadedState.monthlyGoals).forEach(([month, amount]) => {
            dispatch({ type: 'SET_MONTHLY_GOAL', payload: { month, amount } });
          });
        }
      }
    }
  }, []);

  const importTrades = (csvData) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      // Parse CSV data and transform it
      const trades = csvData
        .filter(row => row.profit && parseFloat(row.profit) !== 0)
        .map((row, index) => ({
          id: row.order_id || `trade_${index}`,
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
      
      dispatch({ type: 'IMPORT_TRADES', payload: trades });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to import trades' });
    }
  };

  const addWithdrawal = (withdrawal) => {
    dispatch({ 
      type: 'ADD_WITHDRAWAL', 
      payload: {
        ...withdrawal,
        id: Date.now().toString(),
        date: new Date().toISOString().split('T')[0]
      }
    });
  };

  const setMonthlyGoal = (month, amount) => {
    dispatch({ type: 'SET_MONTHLY_GOAL', payload: { month, amount } });
  };

  const clearData = () => {
    dispatch({ type: 'CLEAR_DATA' });
    // Also clear localStorage
    if (typeof window !== 'undefined') {
      localStorage.removeItem('tradingPortalData');
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
    importTrades,
    addWithdrawal,
    setMonthlyGoal,
    clearData,
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