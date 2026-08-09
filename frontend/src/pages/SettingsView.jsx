import React, { useEffect, useState } from 'react';
import { ShieldCheck, Server, Cpu, Database, Wrench, CheckCircle2, AlertCircle, UserCheck, Key, TrendingUp, Sparkles, Activity } from 'lucide-react';
import { fetchHealth, fetchUserAnalytics, updateUserCredentials } from '../services/api';

const SettingsView = ({ currentUserEmail, onOpenUserAuth }) => {
  const [health, setHealth] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [newCredentials, setNewCredentials] = useState('');
  const [savingCreds, setSavingCreds] = useState(false);

  const loadData = async () => {
    try {
      const h = await fetchHealth();
      setHealth(h);
      if (currentUserEmail) {
        const a = await fetchUserAnalytics(currentUserEmail);
        setAnalytics(a);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [currentUserEmail]);

  const handleUpdateCreds = async (e) => {
    e.preventDefault();
    if (!currentUserEmail || !newCredentials.trim()) return;
    setSavingCreds(true);
    try {
      await updateUserCredentials(currentUserEmail, newCredentials.trim());
      localStorage.setItem('spidy_gemini_key', newCredentials.trim());
      setNewCredentials('');
      alert('Gemini API credentials saved successfully!');
      loadData();
    } catch (err) {
      alert(`Failed to save credentials: ${err.message}`);
    } finally {
      setSavingCreds(false);
    }
  };

  const registeredTools = [
    { name: 'create_task', desc: 'Create structured task with title, date, priority, category' },
    { name: 'update_task', desc: 'Update existing task fields by task_id' },
    { name: 'delete_task', desc: 'Permanently remove task by task_id' },
    { name: 'complete_task', desc: 'Mark task as completed by task_id' },
    { name: 'get_tasks', desc: 'Query tasks filtered by status, priority, or category' },
    { name: 'search_tasks', desc: 'Full-text search in task titles and descriptions' },
    { name: 'create_subtasks', desc: 'Decompose parent task into child subtask hierarchy' },
    { name: 'search_encyclopedia', desc: 'Query free Wikipedia Encyclopedia API for research context & facts' },
    { name: 'get_weather_info', desc: 'Query free Open-Meteo Weather API for live forecasts' }
  ];

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">System Settings & User Records</h2>
          <p className="text-xs text-slate-400">User Email identity, Gemini LLM credentials, user analytics, and system architecture</p>
        </div>
      </div>

      {/* User Record & Analysis Box */}
      <div className="glass-panel rounded-3xl p-6 border border-cyan-500/30 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">User Record & Analysis Profile</h3>
              <p className="text-xs text-slate-400">Records & LLM execution analytics linked to Email ID</p>
            </div>
          </div>

          <button
            onClick={onOpenUserAuth}
            className="btn-secondary text-xs py-1.5 px-3 flex items-center gap-1.5 border-cyan-500/30 text-cyan-300"
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>Switch User Email</span>
          </button>
        </div>

        {analytics ? (
          <div className="space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 text-xs">
                <span className="text-slate-400 block mb-1">Registered Email</span>
                <span className="font-semibold text-cyan-300 truncate block">{analytics.email}</span>
              </div>
              <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 text-xs">
                <span className="text-slate-400 block mb-1">Completion Score</span>
                <span className="font-bold text-emerald-400 text-base">{analytics.completion_rate_percentage}%</span>
              </div>
              <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 text-xs">
                <span className="text-slate-400 block mb-1">LLM Operations</span>
                <span className="font-bold text-indigo-300 text-base">{analytics.total_llm_operations} Calls</span>
              </div>
              <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 text-xs">
                <span className="text-slate-400 block mb-1">Subtasks Solved</span>
                <span className="font-bold text-cyan-400 text-base">{analytics.total_subtasks_solved} Solved</span>
              </div>
            </div>

            {/* Custom Gemini Credentials Form */}
            <form onSubmit={handleUpdateCreds} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Key className="w-4 h-4 text-indigo-400" /> Custom Gemini API Credentials
                </span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${analytics.has_custom_credentials ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'}`}>
                  {analytics.has_custom_credentials ? 'Custom Key Saved' : 'Using Default Backend Key'}
                </span>
              </div>

              <div className="flex gap-2">
                <input
                  type="password"
                  value={newCredentials}
                  onChange={(e) => setNewCredentials(e.target.value)}
                  placeholder="Enter custom Gemini API key (e.g. AIzaSy...)"
                  className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-indigo-500"
                />
                <button
                  type="submit"
                  disabled={savingCreds || !newCredentials.trim()}
                  className="btn-primary text-xs py-2 px-4 flex items-center gap-1.5"
                >
                  <Key className="w-3.5 h-3.5" />
                  <span>{savingCreds ? 'Saving...' : 'Save Credentials'}</span>
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="p-4 rounded-2xl bg-slate-900 text-xs text-slate-400 flex items-center justify-between">
            <span>No user email set. Click "Switch User Email" to enter your Email ID.</span>
            <button onClick={onOpenUserAuth} className="btn-primary text-xs py-1 px-3">Set Email</button>
          </div>
        )}
      </div>

      {/* Backend Status Box */}
      <div className="p-6 glass-panel rounded-3xl border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">Backend API Server</h3>
              <p className="text-xs text-slate-400">FastAPI REST Server running at http://127.0.0.1:8000</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {health?.status === 'healthy' ? (
              <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" /> Healthy
              </span>
            ) : (
              <span className="px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-semibold flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5" /> Offline / Connecting
              </span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 text-xs">
            <span className="text-slate-400 block mb-1">Database ORM</span>
            <span className="font-semibold text-white flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5 text-cyan-400" /> SQLAlchemy + SQLite
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 text-xs">
            <span className="text-slate-400 block mb-1">AI Service Abstraction</span>
            <span className="font-semibold text-white flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-indigo-400" /> Gemini 2.5 Flash / Fallback
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 text-xs">
            <span className="text-slate-400 block mb-1">Safety Guardrails</span>
            <span className="font-semibold text-white flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Tool Argument Validation
            </span>
          </div>
        </div>
      </div>

      {/* Controlled Tools Registry */}
      <div className="glass-panel rounded-3xl p-6 border border-slate-800 space-y-4">
        <div className="flex items-center gap-2">
          <Wrench className="w-5 h-5 text-indigo-400" />
          <h3 className="font-bold text-white text-base">Registered Function Tools</h3>
        </div>
        <p className="text-xs text-slate-400">The LLM selects from these predefined tools. Raw SQL or code execution is strictly prohibited.</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {registeredTools.map((t) => (
            <div key={t.name} className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
              <span className="font-mono text-xs font-bold text-indigo-300">{t.name}()</span>
              <p className="text-xs text-slate-400 leading-snug">{t.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SettingsView;
