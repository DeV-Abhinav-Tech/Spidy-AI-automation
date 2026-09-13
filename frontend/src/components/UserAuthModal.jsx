import React, { useState } from 'react';
import { 
  X, Mail, Lock, Eye, EyeOff, User, Key, 
  ShieldCheck, UserCheck, Sparkles, ChevronDown, 
  ChevronUp, AlertCircle, ArrowRight, Zap 
} from 'lucide-react';
import { loginUser, registerUser } from '../services/api';

const UserAuthModal = ({ isOpen, onClose, onUserAuthenticated, currentUserEmail }) => {
  const [mode, setMode] = useState('login'); // 'login' or 'register'
  const [name, setName] = useState('');
  const [email, setEmail] = useState(currentUserEmail || '');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [credentials, setCredentials] = useState(localStorage.getItem('spidy_gemini_key') || '');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  // Calculate live password strength (0 to 100)
  const getPasswordStrength = (pwd) => {
    if (!pwd) return { score: 0, label: 'None', color: 'bg-slate-700' };
    let score = 0;
    if (pwd.length >= 6) score += 30;
    if (pwd.length >= 10) score += 20;
    if (/[A-Z]/.test(pwd)) score += 20;
    if (/[0-9]/.test(pwd)) score += 15;
    if (/[^A-Za-z0-9]/.test(pwd)) score += 15;

    if (score < 40) return { score: Math.min(score, 35), label: 'Weak', color: 'bg-rose-500', text: 'text-rose-400' };
    if (score < 75) return { score: Math.min(score, 70), label: 'Medium', color: 'bg-amber-500', text: 'text-amber-400' };
    return { score: 100, label: 'Strong', color: 'bg-emerald-500', text: 'text-emerald-400' };
  };

  const strength = getPasswordStrength(password);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !email.includes('@')) {
      setError('Please enter a valid email address (e.g. name@domain.com)');
      return;
    }
    if (mode === 'register' && !name.trim()) {
      setError('Please provide your full name');
      return;
    }
    if (password && password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setError('');
    setLoading(true);

    try {
      let userProfile;
      if (mode === 'register') {
        userProfile = await registerUser(
          name.trim(),
          email.trim(),
          password.trim(),
          credentials.trim() || null
        );
      } else {
        userProfile = await loginUser(
          email.trim(),
          password.trim() || null,
          credentials.trim() || null
        );
      }

      // Store identity & token in local storage
      localStorage.setItem('spidy_user_email', userProfile.email);
      localStorage.setItem('spidy_user_name', userProfile.name);
      if (userProfile.token) {
        localStorage.setItem('spidy_auth_token', userProfile.token);
      }
      if (credentials.trim()) {
        localStorage.setItem('spidy_gemini_key', credentials.trim());
      } else {
        localStorage.removeItem('spidy_gemini_key');
      }

      onUserAuthenticated(userProfile);
      onClose();
    } catch (err) {
      const msg = err.response?.data?.detail || err.message || 'Authentication failed. Please check credentials.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  // Quick 1-click test logins
  const handleQuickLogin = (demoEmail, demoPass, demoName) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setName(demoName);
    setError('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-md bg-[#070b16] border-2 border-rose-500/40 rounded-3xl p-6 sm:p-7 shadow-2xl space-y-5 text-slate-200">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-rose-900/30 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-rose-600 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-rose-900/40 border border-rose-400/40">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-black text-white text-base tracking-tight">
                {mode === 'login' ? 'Suit Clearance Login' : 'Enlist Hero Profile'}
              </h3>
              <p className="text-[11px] text-slate-400 font-mono">
                {mode === 'login' ? 'Authenticate for Spider-Sense Task Command' : 'Initialize Stark Industries task protocol'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-rose-950/40 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selector: Sign In vs Sign Up */}
        <div className="flex p-1 bg-slate-950 border border-rose-900/30 rounded-2xl">
          <button
            type="button"
            onClick={() => { setMode('login'); setError(''); }}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              mode === 'login'
                ? 'bg-gradient-to-r from-rose-600 to-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => { setMode('register'); setError(''); }}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              mode === 'register'
                ? 'bg-gradient-to-r from-rose-600 to-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Create Hero Profile
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-300 flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Full Name Field (Sign Up mode only) */}
          {mode === 'register' && (
            <div className="space-y-1.5 animate-fade-in">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-indigo-400" />
                <span>Full Name</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Abhinav Sharma"
                className="w-full bg-slate-950/90 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500 transition"
              />
            </div>
          )}

          {/* Email Address Field */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-cyan-400" />
              <span>Email Address</span>
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. user@example.com"
              className="w-full bg-slate-950/90 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500 transition"
            />
          </div>

          {/* Password Field */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-indigo-400" />
                <span>Password</span>
              </label>
              {mode === 'register' && password && (
                <span className={`text-[11px] font-medium ${strength.text}`}>
                  {strength.label}
                </span>
              )}
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={mode === 'register' ? 'Minimum 6 characters' : 'Enter your password'}
                className="w-full bg-slate-950/90 border border-slate-800 rounded-xl pl-4 pr-10 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500 transition font-mono"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4 text-slate-400" />}
              </button>
            </div>

            {/* Live Password Strength Meter (Sign Up mode) */}
            {mode === 'register' && password.length > 0 && (
              <div className="pt-1 space-y-1">
                <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-300 ${strength.color}`} 
                    style={{ width: `${strength.score}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Collapsible Advanced AI Settings Accordion */}
          <div className="pt-1">
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center justify-between w-full text-[11px] font-medium text-slate-400 hover:text-slate-200 transition py-1"
            >
              <span className="flex items-center gap-1.5">
                <Key className="w-3 h-3 text-cyan-400" />
                <span>Custom Gemini API Key (Optional)</span>
              </span>
              {showAdvanced ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>

            {showAdvanced && (
              <div className="mt-2 space-y-1.5 animate-fade-in p-3 rounded-2xl bg-slate-950/60 border border-slate-800/80">
                <input
                  type="password"
                  value={credentials}
                  onChange={(e) => setCredentials(e.target.value)}
                  placeholder="AIzaSy..."
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-indigo-500"
                />
                <p className="text-[10px] text-slate-500">
                  Optional: Provide your own Google Gemini API key or leave blank to use the server's default configuration.
                </p>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3 px-5 text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition cursor-pointer disabled:opacity-50"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>
                {loading ? 'Authenticating...' : mode === 'login' ? 'Authorize Suit Access' : 'Register Hero Clearance'}
              </span>
            </button>
          </div>
        </form>

        {/* 1-Click Fast Testing Demo Accounts */}
        <div className="pt-2 border-t border-rose-900/30">
          <p className="text-[11px] font-mono font-bold text-slate-400 mb-2 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-rose-400" />
            <span>INSTANT SUIT PRESET LOGINS:</span>
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleQuickLogin('demo@spidy.ai', 'demo123', 'Spider Hero')}
              className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 hover:border-rose-500/60 text-left transition group cursor-pointer shadow-sm"
            >
              <p className="text-xs font-bold text-slate-200 group-hover:text-rose-400">🕷️ Spider Hero</p>
              <p className="text-[10px] text-slate-500 font-mono">demo@spidy.ai</p>
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin('student@example.com', 'student123', 'Peter Parker')}
              className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 hover:border-blue-500/60 text-left transition group cursor-pointer shadow-sm"
            >
              <p className="text-xs font-bold text-slate-200 group-hover:text-blue-400">🎒 Peter Parker</p>
              <p className="text-[10px] text-slate-500 font-mono">student@example.com</p>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default UserAuthModal;
