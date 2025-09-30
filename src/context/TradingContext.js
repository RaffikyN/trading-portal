import React, { createContext, useContext, useReducer, useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const TradingContext = createContext();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// ---------------- Reducer ----------------
function tradingReducer(state, action) {
  switch (action.type) {
    case 'SET_CURRENT_CASH':
      return { ...state, currentCash: action.payload };

    case 'ADD_EXPENSE':
      return { ...state, expenses: [...state.expenses, action.payload] };

    case 'UPDATE_EXPENSE':
      return {
        ...state,
        expenses: state.expenses.map((exp) =>
          exp.id === action.payload.id ? action.payload : exp
        ),
      };

    case 'DELETE_EXPENSE':
      return {
        ...state,
        expenses: state.expenses.filter((exp) => exp.id !== action.payload),
      };

    case 'ADD_INCOME':
      return { ...state, incomes: [...state.incomes, action.payload] };

    case 'UPDATE_INCOME':
      return {
        ...state,
        incomes: state.incomes.map((inc) =>
          inc.id === action.payload.id ? action.payload : inc
        ),
      };

    case 'DELETE_INCOME':
      return {
        ...state,
        incomes: state.incomes.filter((inc) => inc.id !== action.payload),
      };

    default:
      return state;
  }
}

const initialState = {
  currentCash: 0,
  expenses: [],
  incomes: [],
};

// ---------------- Provider ----------------
export function TradingProvider({ children }) {
  const loadInitialState = () => {
    if (typeof window === 'undefined') return initialState;
    try {
      const saved = localStorage.getItem('tradingState');
      return saved ? JSON.parse(saved) : initialState;
    } catch (err) {
      console.error('Error loading state from localStorage:', err);
      return initialState;
    }
  };

  const [state, dispatch] = useReducer(tradingReducer, initialState, loadInitialState);
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [offlineMode, setOfflineMode] = useState(false);

  // --- Persist state locally ---
  useEffect(() => {
    try {
      localStorage.setItem('tradingState', JSON.stringify(state));
    } catch (err) {
      console.error('Error saving state to localStorage:', err);
    }
  }, [state]);

  // --- Finance functions with Supabase sync ---
  const setCurrentCash = async (amount) => {
    const parsedAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    const finalAmount = isNaN(parsedAmount) ? 0 : parsedAmount;

    try {
      if (!offlineMode && user?.id && supabase) {
        const { error } = await supabase
          .from('cash_balances')
          .upsert({ user_id: user.id, amount: finalAmount });
        if (error) throw error;
      }
    } catch (err) {
      console.warn('Supabase save failed, keeping local only:', err);
      setOfflineMode(true);
    }

    dispatch({ type: 'SET_CURRENT_CASH', payload: finalAmount });
  };

  const addExpense = async (expense) => {
    let newExpense = {
      ...expense,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };

    try {
      if (!offlineMode && user?.id && supabase) {
        const { data, error } = await supabase
          .from('expenses')
          .insert({ user_id: user.id, ...newExpense })
          .select()
          .single();
        if (error) throw error;
        newExpense = { ...newExpense, id: data.id };
      }
    } catch (err) {
      console.warn('Supabase save failed, keeping local only:', err);
      setOfflineMode(true);
    }

    dispatch({ type: 'ADD_EXPENSE', payload: newExpense });
  };

  const updateExpense = async (expense) => {
    try {
      if (!offlineMode && user?.id && supabase) {
        const { error } = await supabase
          .from('expenses')
          .update(expense)
          .eq('id', expense.id);
        if (error) throw error;
      }
    } catch (err) {
      console.warn('Supabase update failed, local only:', err);
      setOfflineMode(true);
    }

    dispatch({ type: 'UPDATE_EXPENSE', payload: expense });
  };

  const deleteExpense = async (id) => {
    try {
      if (!offlineMode && user?.id && supabase) {
        const { error } = await supabase.from('expenses').delete().eq('id', id);
        if (error) throw error;
      }
    } catch (err) {
      console.warn('Supabase delete failed, local only:', err);
      setOfflineMode(true);
    }

    dispatch({ type: 'DELETE_EXPENSE', payload: id });
  };

  const addIncome = async (income) => {
    let newIncome = {
      ...income,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };

    try {
      if (!offlineMode && user?.id && supabase) {
        const { data, error } = await supabase
          .from('incomes')
          .insert({ user_id: user.id, ...newIncome })
          .select()
          .single();
        if (error) throw error;
        newIncome = { ...newIncome, id: data.id };
      }
    } catch (err) {
      console.warn('Supabase save failed, keeping local only:', err);
      setOfflineMode(true);
    }

    dispatch({ type: 'ADD_INCOME', payload: newIncome });
  };

  const updateIncome = async (income) => {
    try {
      if (!offlineMode && user?.id && supabase) {
        const { error } = await supabase
          .from('incomes')
          .update(income)
          .eq('id', income.id);
        if (error) throw error;
      }
    } catch (err) {
      console.warn('Supabase update failed, local only:', err);
      setOfflineMode(true);
    }

    dispatch({ type: 'UPDATE_INCOME', payload: income });
  };

  const deleteIncome = async (id) => {
    try {
      if (!offlineMode && user?.id && supabase) {
        const { error } = await supabase.from('incomes').delete().eq('id', id);
        if (error) throw error;
      }
    } catch (err) {
      console.warn('Supabase delete failed, local only:', err);
      setOfflineMode(true);
    }

    dispatch({ type: 'DELETE_INCOME', payload: id });
  };

  // --- Derived calculations ---
  const calculateCashFlow = (period = 'month') => {
    const now = new Date();
    let startDate, endDate;

    switch (period) {
      case 'day':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + 1);
        break;
      case 'week':
        startDate = new Date(now);
        startDate.setDate(now.getDate() - now.getDay());
        endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + 7);
        break;
      case 'month':
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);
        break;
    }

    const incomes = state.incomes.filter(
      (i) => new Date(i.date) >= startDate && new Date(i.date) < endDate
    );
    const expenses = state.expenses.filter(
      (e) => new Date(e.dueDate) >= startDate && new Date(e.dueDate) < endDate
    );

    const totalIncome = incomes.reduce((sum, inc) => sum + inc.amount, 0);
    const totalExpense = expenses.reduce((sum, exp) => sum + exp.amount, 0);

    const netCashFlow = totalIncome - totalExpense;
    const projectedCash = state.currentCash + netCashFlow;

    return { netCashFlow, projectedCash };
  };

  const calculateNetWorth = () => {
    const totalIncome = state.incomes.reduce((sum, inc) => sum + inc.amount, 0);
    const totalExpense = state.expenses.reduce((sum, exp) => sum + exp.amount, 0);
    return state.currentCash + totalIncome - totalExpense;
  };

  // --- Supabase auth ---
  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data?.user || null);
      setAuthLoading(false);
    };
    getUser();
    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });
    return () => subscription?.subscription?.unsubscribe();
  }, []);

  const value = {
    ...state,
    user,
    authLoading,
    offlineMode,
    setCurrentCash,
    addExpense,
    updateExpense,
    deleteExpense,
    addIncome,
    updateIncome,
    deleteIncome,
    calculateCashFlow,
    calculateNetWorth,
  };

  return <TradingContext.Provider value={value}>{children}</TradingContext.Provider>;
}

export const useTrading = () => useContext(TradingContext);
