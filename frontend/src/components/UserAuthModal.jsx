import React, { useState } from 'react';
import { X, Mail, Key, ShieldCheck, UserCheck, Sparkles } from 'lucide-react';
import { loginOrRegisterUser } from '../services/api';

const UserAuthModal = ({ isOpen, onClose, onUserAuthenticated, currentUserEmail }) => {
  const [email, setEmail] = useState(currentUserEmail || '');
  const [credentials, setCredentials] = useState(localStorage.getItem('spidy_gemini_key') || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !email.includes('@')) {
      setError('Please enter a valid Email ID (e.g. user@example.com)');
      return;
    }
    setError('');
    setLoading(true);

    try {
      const userProfile = await loginOrRegisterUser(email.trim(), null, credentials.trim() || null);
      localStorage.setItem('spidy_user_email', userProfile.email);
      if (credentials.trim()) {
        localStorage.setItem('spidy_gemini_key', credentials.trim());
      } else {
        localStorage.removeItem('spidy_gemini_key');
      }
      onUserAuthenticated(userProfile);
      onClose();
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'Failed to authenticate user profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-md glass-panel border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-600 to-indigo-600 flex items-center justify-center text-white shadow-lg">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">User Credentials & Identity</h3>
              <p className="text-xs text-slate-400">Enter Email ID & Gemini API key for LLM records</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-300">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Email ID Field */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-cyan-400" />
              <span>User Email ID (Required)</span>
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. abhinav@example.com"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500 transition"
            />
            <p className="text-[10px] text-slate-500">Your tasks, AI subtask solutions, and analytics will be linked to this email.</p>
          </div>

          {/* Gemini API Key Field */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Key className="w-3.5 h-3.5 text-indigo-400" />
              <span>Custom Gemini API Key (Optional)</span>
            </label>
            <input
              type="password"
              value={credentials}
              onChange={(e) => setCredentials(e.target.value)}
              placeholder="e.g. AIzaSy..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-indigo-500 transition"
            />
            <p className="text-[10px] text-slate-500">Optional: Provide your Google Gemini API key or leave blank to use backend default.</p>
          </div>

          <div className="pt-2 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-800 text-xs font-semibold text-slate-300 hover:bg-slate-900 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary py-2.5 px-5 text-xs flex items-center gap-2 bg-gradient-to-r from-cyan-600 to-indigo-600"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>{loading ? 'Saving Profile...' : 'Save & Activate LLM'}</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};

export default UserAuthModal;
