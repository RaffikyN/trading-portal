import React, { createContext, useContext, useReducer } from 'react';

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
      
      return { 
        ...state, 
        trades: updatedTrades, 
        accounts: updatedAccounts, 
        loading: false,
        error: null 
      };
    
    case 'ADD_WITHDRAWAL':
      const withdrawal = action.payload;
      const updatedAccountsWithdrawal = { ...state.accounts };
      
      if (updatedAccountsWithdrawal[withdrawal.account]) {
        updatedAccountsWithdrawal[withdrawal.account].currentBalance -= withdrawal.amount;
      }
      
      return {
        ...state,
        withdrawals: [...state.withdrawals, withdrawal],
        accounts: updatedAccountsWithdrawal
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