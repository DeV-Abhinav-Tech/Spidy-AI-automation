import React, { useEffect, useState } from 'react';
import { ShieldCheck, Server, Cpu, Database, Wrench, CheckCircle2, AlertCircle, UserCheck, Key, TrendingUp, Sparkles, Activity, Zap } from 'lucide-react';
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
    { name: 'create_task', desc: 'Create structured mission with directive, priority, category' },
    { name: 'update_task', desc: 'Update existing mission directive fields by task_id' },
    { name: 'delete_task', desc: 'Abort mission from active patrol ledger' },
    { name: 'complete_task', desc: 'Mark mission as cleared and resolved' },
    { name: 'get_tasks', desc: 'Query active objectives filtered by status or urgency' },
    { name: 'search_tasks', desc: 'Full-text search in mission titles and tactical descriptions' },
    { name: 'create_subtasks', desc: 'Decompose parent objective into child subtask hierarchy' },
    { name: 'search_encyclopedia', desc: 'Query free Wikipedia Encyclopedia API for research context & facts' },
    { name: 'get_weather_info', desc: 'Query free Open-Meteo Weather API for live forecasts' }
  ];

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8 animate-fade-in text-slate-200">
      
      {/* Settings Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-black text-white tracking-tight">Suit Diagnostics & Identity Hub</h2>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-600/30 text-rose-300 border border-rose-500/40 uppercase">
              SUIT FIRMWARE v2.6
            </span>
          </div>
          <p className="text-xs text-slate-400">User Identity, Gemini LLM credentials, suit analytics, and backend infrastructure</p>
        </div>
      </div>

      {/* User Record & Analysis Box */}
      <div className="glass-panel rounded-3xl p-6 border-2 border-rose-500/30 bg-[#070b16]/90 space-y-6 shadow-2xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-rose-600 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-rose-900/40 border border-rose-400/40">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-white text-base">Hero Record & Intelligence Profile</h3>
              <p className="text-xs text-slate-400">Tactical records & LLM execution analytics linked to Email ID</p>
            </div>
          </div>

          <button
            onClick={onOpenUserAuth}
            className="btn-secondary text-xs py-1.5 px-3 flex items-center gap-1.5 border-rose-500/30 text-rose-300 hover:bg-rose-950/30 cursor-pointer"
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>Switch Identity</span>
          </button>
        </div>

        {analytics ? (
          <div className="space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-4 rounded-2xl bg-slate-950 border border-rose-900/30 text-xs">
                <span className="text-slate-400 block mb-1 font-mono">Hero Email</span>
                <span className="font-bold text-rose-300 truncate block">{analytics.email}</span>
              </div>
              <div className="p-4 rounded-2xl bg-slate-950 border border-rose-900/30 text-xs">
                <span className="text-slate-400 block mb-1 font-mono">Clearance Score</span>
                <span className="font-black text-emerald-400 text-base">{analytics.completion_rate_percentage}%</span>
              </div>
              <div className="p-4 rounded-2xl bg-slate-950 border border-rose-900/30 text-xs">
                <span className="text-slate-400 block mb-1 font-mono">LLM Tool Ops</span>
                <span className="font-black text-sky-400 text-base">{analytics.total_llm_operations} Calls</span>
              </div>
              <div className="p-4 rounded-2xl bg-slate-950 border border-rose-900/30 text-xs">
                <span className="text-slate-400 block mb-1 font-mono">Subtasks Solved</span>
                <span className="font-black text-rose-400 text-base">{analytics.total_subtasks_solved} Solved</span>
              </div>
            </div>

            {/* Custom Gemini Credentials Form */}
            <form onSubmit={handleUpdateCreds} className="p-4 rounded-2xl bg-slate-950/90 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white flex items-center gap-1.5 font-mono">
                  <Key className="w-4 h-4 text-rose-400" /> Custom Gemini API Credentials
                </span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold uppercase border ${analytics.has_custom_credentials ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' : 'bg-amber-500/20 text-amber-300 border-amber-500/30'}`}>
                  {analytics.has_custom_credentials ? 'Custom Key Saved' : 'Using Default Backend Key'}
                </span>
              </div>

              <div className="flex gap-2">
                <input
                  type="password"
                  value={newCredentials}
                  onChange={(e) => setNewCredentials(e.target.value)}
                  placeholder="Enter custom Gemini API key (e.g. AIzaSy...)"
                  className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-rose-500"
                />
                <button
                  type="submit"
                  disabled={savingCreds || !newCredentials.trim()}
                  className="btn-primary text-xs py-2 px-4 flex items-center gap-1.5 cursor-pointer shadow-md shadow-rose-900/30"
                >
                  <Key className="w-3.5 h-3.5" />
                  <span>{savingCreds ? 'Saving...' : 'Save Key'}</span>
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="p-4 rounded-2xl bg-slate-900 text-xs text-slate-400 flex items-center justify-between">
            <span>No hero identity loaded. Click "Switch Identity" to enter credentials.</span>
            <button onClick={onOpenUserAuth} className="btn-primary text-xs py-1 px-3">Set Identity</button>
          </div>
        )}
      </div>

      {/* Backend Status Box */}
      <div className="p-6 glass-panel rounded-3xl border border-blue-500/30 bg-[#070b16]/90 space-y-4 shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-500/10 border border-blue-500/25 flex items-center justify-center text-blue-400 shadow-md">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-white text-base">Backend API Server</h3>
              <p className="text-xs text-slate-400 font-mono">FastAPI Core WSGI Server running at http://127.0.0.1:8000</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {health?.status === 'healthy' ? (
              <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs font-mono font-bold flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" /> ONLINE
              </span>
            ) : (
              <span className="px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/25 text-rose-400 text-xs font-mono font-bold flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5" /> CONNECTING
              </span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs">
            <span className="text-slate-400 block mb-1 font-mono">Data Persistence</span>
            <span className="font-bold text-white flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5 text-blue-400" /> SQLite + SQLAlchemy
            </span>
          </div>
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs">
            <span className="text-slate-400 block mb-1 font-mono">Suit LLM Engine</span>
            <span className="font-bold text-white flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-rose-400" /> Google Gemini 2.5 Flash
            </span>
          </div>
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs">
            <span className="text-slate-400 block mb-1 font-mono">Haptic Scheduler</span>
            <span className="font-bold text-white flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-emerald-400" /> APScheduler Background
            </span>
          </div>
        </div>
      </div>

      {/* Spider-Man Suit Functional Subroutines / Registered Tools */}
      <div className="p-6 glass-panel rounded-3xl border border-rose-900/30 bg-[#070b16]/90 space-y-4 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-rose-500/10 border border-rose-500/25 flex items-center justify-center text-rose-400 shadow-md">
            <Wrench className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-black text-white text-base">Spider-Man Suit Tactical Subroutines ({registeredTools.length})</h3>
            <p className="text-xs text-slate-400 font-mono">Autonomous function definitions registered in Gemini tool dispatcher</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          {registeredTools.map((tool) => (
            <div key={tool.name} className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 hover:border-rose-500/40 transition">
              <p className="font-mono text-xs font-bold text-rose-300">{tool.name}()</p>
              <p className="text-[11px] text-slate-400 mt-1 leading-snug">{tool.desc}</p>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};

export default SettingsView;
