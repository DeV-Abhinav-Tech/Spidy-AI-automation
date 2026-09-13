import React, { useState, useEffect } from 'react';
import { 
  X, User, Mail, Shield, Key, CheckCircle2, 
  BarChart3, Bot, LogOut, Lock, AlertCircle, Save 
} from 'lucide-react';
import { fetchUserAnalytics, changeUserPassword, updateUserCredentials } from '../services/api';

const UserProfileModal = ({ isOpen, onClose, currentUser, onLogout, onProfileUpdated }) => {
  const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'security', 'api_key'
  const [analytics, setAnalytics] = useState(null);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);

  // Change Password state
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passwordMsg, setPasswordMsg] = useState({ text: '', type: '' });
  const [savingPassword, setSavingPassword] = useState(false);

  // API Key state
  const [apiKey, setApiKey] = useState(localStorage.getItem('spidy_gemini_key') || '');
  const [keyMsg, setKeyMsg] = useState({ text: '', type: '' });
  const [savingKey, setSavingKey] = useState(false);

  useEffect(() => {
    if (isOpen && currentUser?.email) {
      setLoadingAnalytics(true);
      fetchUserAnalytics(currentUser.email)
        .then((data) => setAnalytics(data))
        .catch((err) => console.error('Failed to load analytics:', err))
        .finally(() => setLoadingAnalytics(false));
    }
  }, [isOpen, currentUser]);

  if (!isOpen || !currentUser) return null;

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (!oldPassword || !newPassword) return;
    if (newPassword.length < 6) {
      setPasswordMsg({ text: 'New password must be at least 6 characters.', type: 'error' });
      return;
    }
    setSavingPassword(true);
    setPasswordMsg({ text: '', type: '' });
    try {
      await changeUserPassword(currentUser.email, oldPassword, newPassword);
      setPasswordMsg({ text: 'Password changed successfully!', type: 'success' });
      setOldPassword('');
      setNewPassword('');
    } catch (err) {
      const errDetail = err.response?.data?.detail || err.message || 'Failed to update password.';
      setPasswordMsg({ text: errDetail, type: 'error' });
    } finally {
      setSavingPassword(false);
    }
  };

  const handleApiKeyUpdate = async (e) => {
    e.preventDefault();
    setSavingKey(true);
    setKeyMsg({ text: '', type: '' });
    try {
      await updateUserCredentials(currentUser.email, apiKey.trim());
      if (apiKey.trim()) {
        localStorage.setItem('spidy_gemini_key', apiKey.trim());
      } else {
        localStorage.removeItem('spidy_gemini_key');
      }
      setKeyMsg({ text: 'Gemini API Key saved successfully!', type: 'success' });
      if (onProfileUpdated) onProfileUpdated();
    } catch (err) {
      setKeyMsg({ text: err.response?.data?.detail || 'Failed to update credentials.', type: 'error' });
    } finally {
      setSavingKey(false);
    }
  };

  const initials = (currentUser.name || currentUser.email || 'U')
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-lg bg-[#070b16] border-2 border-rose-500/40 rounded-3xl shadow-2xl overflow-hidden flex flex-col text-slate-200 max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="p-6 border-b border-rose-900/30 flex items-center justify-between bg-gradient-to-r from-rose-950/50 via-slate-900 to-blue-950/40">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-rose-600 to-blue-600 flex items-center justify-center font-black text-white text-xl shadow-lg shadow-rose-900/40 border border-rose-400/40">
              {initials}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-white text-lg">{currentUser.name || 'Hero Profile'}</h3>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-mono font-bold uppercase">
                  ACTIVE
                </span>
              </div>
              <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5 font-mono">
                <Mail className="w-3.5 h-3.5 text-rose-400" />
                <span>{currentUser.email}</span>
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

        {/* Tab Navigation */}
        <div className="flex border-b border-rose-900/30 px-6 bg-slate-950 text-xs font-bold font-mono">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-3 px-4 border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'overview'
                ? 'border-rose-500 text-rose-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Patrol Intel</span>
          </button>
          <button
            onClick={() => setActiveTab('security')}
            className={`py-3 px-4 border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'security'
                ? 'border-rose-500 text-rose-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Shield className="w-4 h-4" />
            <span>Suit Clearance</span>
          </button>
          <button
            onClick={() => setActiveTab('api_key')}
            className={`py-3 px-4 border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'api_key'
                ? 'border-rose-500 text-rose-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Key className="w-4 h-4" />
            <span>Gemini Key</span>
          </button>
        </div>

        {/* Tab Contents */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          
          {/* 1. OVERVIEW TAB */}
          {activeTab === 'overview' && (
            <div className="space-y-4 animate-fade-in">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
                  <p className="text-[11px] font-semibold text-slate-400">Total Tasks</p>
                  <p className="text-2xl font-bold text-white mt-1">{analytics?.total_tasks ?? '...'}</p>
                  <p className="text-[10px] text-slate-500 mt-1">Across all categories</p>
                </div>
                <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
                  <p className="text-[11px] font-semibold text-slate-400">Completion Rate</p>
                  <p className="text-2xl font-bold text-emerald-400 mt-1">
                    {analytics ? `${analytics.completion_rate_percentage}%` : '...'}
                  </p>
                  <p className="text-[10px] text-slate-500 mt-1">{analytics?.completed_tasks ?? 0} finished</p>
                </div>
                <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
                  <p className="text-[11px] font-semibold text-slate-400">LLM Tool Ops</p>
                  <p className="text-2xl font-bold text-cyan-400 mt-1">{analytics?.total_llm_operations ?? 0}</p>
                  <p className="text-[10px] text-slate-500 mt-1">AI Assistant queries</p>
                </div>
                <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
                  <p className="text-[11px] font-semibold text-slate-400">Subtasks Solved</p>
                  <p className="text-2xl font-bold text-indigo-400 mt-1">{analytics?.total_subtasks_solved ?? 0}</p>
                  <p className="text-[10px] text-slate-500 mt-1">Autonomous Gemini agent</p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950/40 border border-slate-800 text-xs space-y-2">
                <div className="flex justify-between text-slate-400">
                  <span>Custom Gemini Credentials:</span>
                  <span className={analytics?.has_custom_credentials ? 'text-emerald-400 font-semibold' : 'text-slate-500'}>
                    {analytics?.has_custom_credentials ? 'Configured ✓' : 'Using Server Default'}
                  </span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Member Since:</span>
                  <span className="text-slate-200">
                    {analytics?.created_at ? new Date(analytics.created_at).toLocaleDateString() : 'Active User'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* 2. SECURITY / CHANGE PASSWORD TAB */}
          {activeTab === 'security' && (
            <form onSubmit={handlePasswordChange} className="space-y-4 animate-fade-in">
              {passwordMsg.text && (
                <div className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                  passwordMsg.type === 'success'
                    ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-300'
                    : 'bg-rose-500/10 border border-rose-500/20 text-rose-300'
                }`}>
                  {passwordMsg.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                  <span>{passwordMsg.text}</span>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Current Password</span>
                </label>
                <input
                  type="password"
                  required
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  placeholder="Enter existing password"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-cyan-400" />
                  <span>New Password</span>
                </label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Minimum 6 characters"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
                />
              </div>

              <button
                type="submit"
                disabled={savingPassword}
                className="btn-primary py-2.5 px-5 text-xs flex items-center justify-center gap-2 w-full shadow-lg shadow-indigo-600/30"
              >
                <Save className="w-4 h-4" />
                <span>{savingPassword ? 'Updating...' : 'Update Password'}</span>
              </button>
            </form>
          )}

          {/* 3. GEMINI KEY TAB */}
          {activeTab === 'api_key' && (
            <form onSubmit={handleApiKeyUpdate} className="space-y-4 animate-fade-in">
              {keyMsg.text && (
                <div className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                  keyMsg.type === 'success'
                    ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-300'
                    : 'bg-rose-500/10 border border-rose-500/20 text-rose-300'
                }`}>
                  {keyMsg.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                  <span>{keyMsg.text}</span>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Google Gemini API Key</span>
                </label>
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="AIzaSy..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-indigo-500"
                />
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Your custom key will be used for your natural language task requests and autonomous subtask solvers.
                </p>
              </div>

              <button
                type="submit"
                disabled={savingKey}
                className="btn-primary py-2.5 px-5 text-xs flex items-center justify-center gap-2 w-full shadow-lg shadow-indigo-600/30"
              >
                <Save className="w-4 h-4" />
                <span>{savingKey ? 'Saving...' : 'Save Gemini API Key'}</span>
              </button>
            </form>
          )}

        </div>

        {/* Footer with Sign Out */}
        <div className="p-4 border-t border-slate-800 flex items-center justify-between bg-slate-950/80">
          <button
            type="button"
            onClick={onLogout}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-rose-400 hover:bg-rose-500/10 border border-rose-500/20 transition cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-800 text-xs font-semibold text-slate-300 hover:bg-slate-900 transition"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};

export default UserProfileModal;
