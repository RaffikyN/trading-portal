import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { LogIn, UserPlus, Eye, EyeOff } from 'lucide-react';

export default function Auth() {
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password
        });
        
        if (error) throw error;
        
        if (data.user && !data.user.email_confirmed_at) {
          alert('Please check your email and click the confirmation link!');
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password
        });
        
        if (error) throw error;
      }
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-trading-bg flex items-center justify-center p-6">
      <div className="max-w-md w-full">
        <div className="bg-trading-card/20 backdrop-blur-sm border border-trading-pink/20 rounded-lg p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-trading-pink mb-2">Trading Portal</h1>
            <p className="text-trading-text-muted">
              {isSignUp ? 'Create your account to get started' : 'Sign in to your account'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-trading-text mb-2">
                Email Address
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full bg-trading-card border border-trading-gray rounded-lg px-4 py-3 text-trading-text focus:border-trading-pink focus:outline-none"
                placeholder="your@email.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-trading-text mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full bg-trading-card border border-trading-gray rounded-lg px-4 py-3 text-trading-text focus:border-trading-pink focus:outline-none pr-12"
                  placeholder="••••••••"
                  minLength="6"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-trading-text-muted hover:text-trading-text"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-trading-pink hover:bg-trading-pink-dark disabled:opacity-50 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                <>
                  {isSignUp ? <UserPlus size={20} /> : <LogIn size={20} />}
                  {isSignUp ? 'Create Account' : 'Sign In'}
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-trading-pink hover:text-trading-pink-light transition-colors"
            >
              {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}