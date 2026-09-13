import React from 'react';
import { Search, Plus, CheckCircle2, Clock, User, ChevronDown, Radio, AlertTriangle } from 'lucide-react';

const Header = ({ 
  title, 
  onOpenNewTask, 
  searchQuery, 
  setSearchQuery, 
  stats = {}, 
  currentUser, 
  onOpenUserAuth,
  onOpenProfile,
  onTriggerWebIntro 
}) => {
  const initials = (currentUser?.name || currentUser?.email || 'SP')
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <header className="px-8 py-4.5 border-b border-rose-950/40 flex items-center justify-between gap-4 sticky top-0 glass-panel z-20 bg-[#070b16]/90">
      
      {/* Title & Spider-Sense Patrol Badges */}
      <div className="flex items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg sm:text-xl font-black text-white tracking-tight flex items-center gap-2">
              <span>{title}</span>
            </h2>
            <span className="hidden lg:inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-600/20 text-rose-300 border border-rose-500/30 text-[10px] font-mono font-bold uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping"></span>
              <span>PATROL ACTIVE</span>
            </span>
          </div>
          <p className="text-xs text-slate-400">Autonomous superhero task orchestration & AI tool-calling</p>
        </div>

        <div className="hidden md:flex items-center gap-2.5 ml-4 pl-4 border-l border-slate-800">
          {/* Completed Missions Badge */}
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 text-xs font-bold shadow-sm">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{stats.completed || 0} Cleared</span>
          </div>

          {/* Active Workload / Pending Badge */}
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/10 text-rose-300 border border-rose-500/30 text-xs font-bold shadow-sm">
            <Clock className="w-3.5 h-3.5 text-rose-400" />
            <span>{stats.pending || 0} Patrols</span>
          </div>

          {/* User Suit Identity Pill */}
          {currentUser ? (
            <button
              onClick={onOpenProfile}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/90 border border-rose-500/30 text-xs font-medium hover:border-rose-400 hover:bg-slate-800 transition cursor-pointer group shadow-sm"
              title="Spider Suit Profile & Settings"
            >
              <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-rose-600 to-blue-600 flex items-center justify-center text-[10px] font-black text-white shadow-sm border border-rose-400/30">
                {initials}
              </div>
              <span className="text-slate-200 group-hover:text-white font-bold max-w-[120px] truncate">
                {currentUser.name || currentUser.email.split('@')[0]}
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              <ChevronDown className="w-3 h-3 text-slate-400 group-hover:text-rose-400" />
            </button>
          ) : (
            <button
              onClick={onOpenUserAuth}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-rose-600 to-blue-600 text-white text-xs font-bold hover:opacity-95 transition cursor-pointer shadow-md shadow-rose-900/30"
            >
              <User className="w-3.5 h-3.5" />
              <span>Suit Login</span>
            </button>
          )}
        </div>
      </div>

      {/* Actions & Spider Search */}
      <div className="flex items-center gap-3">
        {/* Spider-Man Web Shooter Trigger Button */}
        {onTriggerWebIntro && (
          <button
            onClick={onTriggerWebIntro}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-rose-950/60 to-blue-950/60 border border-rose-500/40 text-xs font-bold text-rose-200 hover:text-white hover:border-rose-400 hover:shadow-[0_0_15px_rgba(225,29,72,0.4)] transition cursor-pointer group"
            title="Deploy Spider-Man Web Blast"
          >
            <span className="text-sm group-hover:scale-125 transition-transform">🕸️</span>
            <span className="hidden sm:inline">Web Shooter</span>
          </button>
        )}

        {/* Search Bar with Spidy Accent */}
        <div className="relative w-56 hidden sm:block">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search missions..."
            className="w-full bg-slate-900/90 border border-slate-700/70 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-200 focus:outline-none focus:border-rose-500 transition"
          />
        </div>

        {/* Add Mission / Task Button */}
        <button
          onClick={onOpenNewTask}
          className="btn-primary flex items-center gap-2 text-xs py-2 px-4 shadow-lg shadow-rose-900/30"
        >
          <Plus className="w-4 h-4" />
          <span>New Mission</span>
        </button>
      </div>
    </header>
  );
};

export default Header;
