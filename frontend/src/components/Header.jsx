import React from 'react';
import { Search, Bell, Plus, CheckCircle2, Clock, ShieldCheck, UserCheck, Key } from 'lucide-react';

const Header = ({ title, onOpenNewTask, searchQuery, setSearchQuery, stats = {}, currentUserEmail, onOpenUserAuth }) => {
  return (
    <header className="px-8 py-5 border-b border-slate-800/80 flex items-center justify-between gap-4 sticky top-0 glass-panel z-20">
      {/* Title & Stats Badges */}
      <div className="flex items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">{title}</h2>
          <p className="text-xs text-slate-400">Manage tasks visually or via natural language AI commands</p>
        </div>

        <div className="hidden md:flex items-center gap-2 ml-4 pl-4 border-l border-slate-800">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-medium">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{stats.completed || 0} Done</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs font-medium">
            <Clock className="w-3.5 h-3.5" />
            <span>{stats.pending || 0} Pending</span>
          </div>

          {/* User Email Identity Badge */}
          <button
            onClick={onOpenUserAuth}
            className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 text-xs font-medium hover:bg-cyan-500/20 transition cursor-pointer"
            title="Manage Email & Gemini Credentials"
          >
            <UserCheck className="w-3.5 h-3.5 text-cyan-400" />
            <span>{currentUserEmail || 'Set Email ID'}</span>
          </button>
        </div>
      </div>

      {/* Actions & Search */}
      <div className="flex items-center gap-3">
        <div className="relative w-64 hidden sm:block">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tasks..."
            className="w-full bg-slate-900/80 border border-slate-700/60 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 transition"
          />
        </div>

        <button
          onClick={onOpenNewTask}
          className="btn-primary flex items-center gap-2 text-xs py-2 px-4 shadow-lg shadow-indigo-600/30"
        >
          <Plus className="w-4 h-4" />
          <span>New Task</span>
        </button>
      </div>
    </header>
  );
};

export default Header;
