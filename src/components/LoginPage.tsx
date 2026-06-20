import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mail, Lock, AlertCircle, RefreshCw, Key, Database, ArrowRight, Eye, EyeOff, CheckCircle } from 'lucide-react';
import { supabase, isConfigured, saveCredentialsToLocal, clearCredentialsFromLocal, getSupabaseCredentials, refreshSupabaseClient } from '../supabaseClient';

interface LoginPageProps {
  onLoginSuccess: () => void;
}

export const LoginPage = ({ onLoginSuccess }: LoginPageProps) => {
  const [activeTab, setActiveTab] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Manual configuration state
  const [configured, setConfigured] = useState(isConfigured());
  const [manualUrl, setManualUrl] = useState('');
  const [manualKey, setManualKey] = useState('');
  const [showManualForm, setShowManualForm] = useState(false);

  useEffect(() => {
    // If we have active credentials, pre-populate manual fields just in case
    const creds = getSupabaseCredentials();
    if (creds && creds.source === 'local') {
      setManualUrl(creds.url);
      setManualKey(creds.key);
    }
  }, []);

  const handleManualConnect = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!manualUrl.trim() || !manualKey.trim()) {
      setErrorMessage('Please fill in both the Supabase URL and Anon Key.');
      return;
    }

    try {
      // Validate structure roughly
      if (!manualUrl.startsWith('http://') && !manualUrl.startsWith('https://')) {
        setErrorMessage('URL must start with http:// or https://');
        return;
      }

      saveCredentialsToLocal(manualUrl.trim(), manualKey.trim());
      const nowConfigured = isConfigured();
      setConfigured(nowConfigured);

      if (nowConfigured) {
        setSuccessMessage('Supabase connected successfully! You can now sign in or register.');
        setShowManualForm(false);
      } else {
        setErrorMessage('Failed to initialize Supabase client. Check your credentials.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Error configuring client.');
    }
  };

  const clearCredentials = () => {
    clearCredentialsFromLocal();
    setConfigured(false);
    setErrorMessage('Credentials cleared.');
    setSuccessMessage(null);
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const client = supabase || refreshSupabaseClient();
    if (!client) {
      setErrorMessage('Supabase is not configured yet. Please configure the URL and Key.');
      return;
    }

    if (!email.trim() || !password.trim()) {
      setErrorMessage('Please enter email and password.');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }

    if (activeTab === 'signup' && password !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      if (activeTab === 'signin') {
        const { data, error } = await client.auth.signInWithPassword({
          email: email.trim(),
          password: password,
        });

        if (error) throw error;
        if (data.session) {
          setSuccessMessage('Successfully signed in!');
          setTimeout(() => {
            onLoginSuccess();
          }, 600);
        }
      } else {
        const { data, error } = await client.auth.signUp({
          email: email.trim(),
          password: password,
          options: {
            emailRedirectTo: window.location.origin,
          },
        });

        if (error) throw error;

        // In Supabase, if email confirmation is turned on, password logins are disabled until confirmed, 
        // but often the session is returned directly if automations are set or confirmation is disabled.
        if (data.user && !data.session) {
          setSuccessMessage('Registration successful! Please check your email inbox to confirm your account, then sign in.');
          setActiveTab('signin');
        } else if (data.session) {
          setSuccessMessage('Registration successful! Session started.');
          setTimeout(() => {
            onLoginSuccess();
          }, 600);
        } else {
          setSuccessMessage('Registration successful! Try signing in.');
          setActiveTab('signin');
        }
      }
    } catch (err: any) {
      console.error('Auth error:', err);
      setErrorMessage(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="login-container" className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md bg-white border border-slate-100 rounded-3xl shadow-xl overflow-hidden p-8">
        
        {/* Branding Head */}
        <div className="text-center mb-8">
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center justify-center bg-orange-100 text-orange-600 rounded-2xl p-4 mb-4"
          >
            <Database size={32} className="stroke-[2.5]" />
          </motion.div>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Food<span className="text-orange-500">Fix</span> Authentication
          </h2>
          <p className="text-slate-500 text-sm mt-1">
            Secure food ordering dashboard powered by Supabase
          </p>
        </div>

        {/* Configurations Banner & Control */}
        {!configured ? (
          <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-2xl flex flex-col gap-3">
            <div className="flex gap-2.5 items-start text-amber-800">
              <AlertCircle size={20} className="shrink-0 mt-0.5 text-amber-600" />
              <div className="text-xs font-medium">
                <p className="font-bold mb-1">Supabase Credentials Needed</p>
                Please set up <code className="bg-amber-100 text-amber-900 px-1 py-0.5 rounded">VITE_SUPABASE_URL</code> and <code className="bg-amber-100 text-amber-900 px-1 py-0.5 rounded">VITE_SUPABASE_ANON_KEY</code> in your Environment panel.
              </div>
            </div>
            
            {!showManualForm ? (
              <button 
                onClick={() => setShowManualForm(true)}
                className="w-full text-center bg-amber-600/10 hover:bg-amber-600/20 text-amber-800 text-xs font-bold py-2 px-3 rounded-xl transition flex justify-center items-center gap-1"
              >
                <Key size={14} /> Enter credentials manually to bypass
              </button>
            ) : (
              <form onSubmit={handleManualConnect} className="flex flex-col gap-2 mt-1">
                <div className="text-[10px] font-bold text-amber-700 uppercase tracking-widest">Manual Setup</div>
                <input
                  type="text"
                  placeholder="Supabase Project URL (https://...)"
                  value={manualUrl}
                  onChange={(e) => setManualUrl(e.target.value)}
                  className="w-full text-xs p-2.5 bg-white border border-amber-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-amber-500 font-mono"
                />
                <input
                  type="password"
                  placeholder="Supabase Project Anon Key"
                  value={manualKey}
                  onChange={(e) => setManualKey(e.target.value)}
                  className="w-full text-xs p-2.5 bg-white border border-amber-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-amber-500 font-mono"
                />
                <div className="flex gap-2 justify-end mt-1">
                  <button
                    type="button"
                    onClick={() => setShowManualForm(false)}
                    className="text-xs font-semibold px-3 py-1.5 text-slate-500 hover:text-slate-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="text-xs font-bold px-4 py-1.5 bg-amber-600 text-white rounded-xl hover:bg-amber-700 transition"
                  >
                    Connect Client
                  </button>
                </div>
              </form>
            )}
          </div>
        ) : (
          <div className="mb-6 px-4 py-2 bg-emerald-50 border border-emerald-100 rounded-full flex justify-between items-center text-xs text-emerald-800 font-medium">
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Supabase database active
            </span>
            {getSupabaseCredentials()?.source === 'local' && (
              <button 
                onClick={clearCredentials}
                className="text-[10px] font-bold text-red-500 hover:underline"
                title="Disconnect local client override"
              >
                Clear Manual URL
              </button>
            )}
          </div>
        )}

        {/* Display Alert Messages */}
        <AnimatePresence mode="wait">
          {errorMessage && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="mb-4 overflow-hidden"
            >
              <div className="bg-red-50 border border-red-200 text-red-800 text-xs font-medium p-3 rounded-2xl flex items-start gap-2">
                <AlertCircle size={16} className="shrink-0 text-red-600 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            </motion.div>
          )}

          {successMessage && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="mb-4 overflow-hidden"
            >
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-medium p-3 rounded-2xl flex items-start gap-2">
                <CheckCircle size={16} className="shrink-0 text-emerald-600 mt-0.5" />
                <span>{successMessage}</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tab Selection */}
        {configured && (
          <div className="flex bg-slate-100 rounded-xl p-1 mb-6">
            <button
              onClick={() => { setActiveTab('signin'); setErrorMessage(null); }}
              className={`flex-1 text-center py-2 text-sm font-bold rounded-lg transition ${activeTab === 'signin' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
            >
              Sign In
            </button>
            <button
              onClick={() => { setActiveTab('signup'); setErrorMessage(null); }}
              className={`flex-1 text-center py-2 text-sm font-bold rounded-lg transition ${activeTab === 'signup' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
            >
              Register Account
            </button>
          </div>
        )}

        {/* Auth Forms */}
        {configured && (
          <form onSubmit={handleAuth} className="space-y-4">
            {/* Email Field */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Mail size={16} />
                </div>
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 pl-10 pr-4 py-3 rounded-2xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock size={16} />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 pl-10 pr-10 py-3 rounded-2xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Confirm Password (only for registration) */}
            {activeTab === 'signup' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="space-y-1"
              >
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Confirm Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Lock size={16} />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 pl-10 pr-4 py-3 rounded-2xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition"
                  />
                </div>
              </motion.div>
            )}

            {/* Submit Action */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white font-bold py-3 px-4 rounded-2xl flex justify-center items-center gap-2 shadow-lg shadow-orange-500/10 hover:shadow-orange-500/25 transition duration-150 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {loading ? (
                <RefreshCw size={18} className="animate-spin" />
              ) : (
                <>
                  <span>{activeTab === 'signin' ? 'Sign In' : 'Create Account'}</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>
        )}

        {/* Guidelines / Help */}
        <div className="mt-8 pt-6 border-t border-slate-100 text-center">
          <p className="text-[11px] text-slate-400">
            For secure login, configure active email verification or disable it in your Supabase Auth Providers Settings.
          </p>
        </div>

      </div>
    </div>
  );
};
