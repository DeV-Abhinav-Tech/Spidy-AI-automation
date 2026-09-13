import React from 'react';
import { 
  LayoutDashboard, 
  CheckSquare, 
  Bot, 
  Sliders, 
  Sparkles,
  Zap,
  LogIn,
  ChevronRight,
  Radio
} from 'lucide-react';

const Sidebar = ({ activeTab, setActiveTab, currentUser, onOpenProfile, onOpenUserAuth }) => {
  const navItems = [
    { id: 'dashboard', label: 'Command Hub', icon: LayoutDashboard, badge: 'Live' },
    { id: 'tasks', label: 'Patrol Missions', icon: CheckSquare },
    { id: 'ai', label: 'Suit Copilot AI', icon: Bot, badge: 'Karen' },
    { id: 'settings', label: 'Suit Config', icon: Sliders },
  ];

  const initials = (currentUser?.name || currentUser?.email || 'SP')
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <aside className="w-68 glass-panel border-r border-rose-950/40 flex flex-col h-screen sticky top-0 z-30 bg-[#070b16]/95">
      
      {/* Spider-Man Suit Header & Animated Mask Icon */}
      <div className="p-5 border-b border-rose-500/20 bg-gradient-to-b from-rose-950/30 to-transparent flex items-center gap-3.5">
        {/* Iconic High-Tech Spider Mask Badge */}
        <div className="relative group">
          <div className="absolute -inset-1.5 rounded-2xl bg-gradient-to-r from-rose-600 to-blue-600 opacity-60 blur-sm group-hover:opacity-100 transition duration-300"></div>
          
          <div className="relative w-12 h-12 rounded-2xl bg-gradient-to-br from-rose-700 via-rose-900 to-blue-950 p-2 flex items-center justify-center border border-rose-400/40 shadow-xl overflow-hidden">
            {/* Subtle Web Grid inside badge */}
            <div className="absolute inset-0 opacity-25 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:6px_6px]"></div>
            
            {/* Spider-Man Stylized Mask Eye Lenses */}
            <div className="relative flex items-center justify-center gap-1.5 w-full h-full">
              {/* Left Eye Lens */}
              <div className="w-3.5 h-5 bg-white rounded-tr-md rounded-bl-sm border-2 border-black rotate-[-18deg] shadow-[0_0_8px_#ffffff] animate-pulse"></div>
              {/* Right Eye Lens */}
              <div className="w-3.5 h-5 bg-white rounded-tl-md rounded-br-sm border-2 border-black rotate-[18deg] shadow-[0_0_8px_#ffffff] animate-pulse"></div>
            </div>
          </div>
        </div>

        <div>
          <div className="flex items-center gap-1.5">
            <h1 className="font-black text-xl text-white tracking-tight drop-shadow-[0_2px_8px_rgba(225,29,72,0.6)]">
              SPIDY
            </h1>
            <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-rose-600/30 text-rose-300 border border-rose-500/40">
              SUIT v2.6
            </span>
          </div>
          <p className="text-[10px] font-bold text-sky-400 tracking-wider uppercase flex items-center gap-1 mt-0.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
            <span>TASK AUTOMATION SUIT</span>
          </p>
        </div>
      </div>

      {/* Navigation Sections */}
      <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
        <p className="px-3 text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest mb-2">
          PATROL PROTOCOLS
        </p>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl font-semibold transition-all duration-200 cursor-pointer ${
                isActive
                  ? 'bg-gradient-to-r from-rose-600/90 via-rose-700/80 to-blue-600/80 text-white shadow-lg shadow-rose-900/40 border border-rose-400/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-850/60 hover:border-slate-800'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-rose-400'}`} />
                <span className="text-xs">{item.label}</span>
              </div>
              {item.badge && (
                <span className={`px-2 py-0.5 text-[9px] font-mono font-bold tracking-wider rounded-md uppercase border ${
                  isActive 
                    ? 'bg-white/20 text-white border-white/40' 
                    : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                }`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Spider-Man Suit AI HUD Card (Karen Copilot) */}
      <div className="p-4 m-3 rounded-2xl bg-gradient-to-br from-rose-950/40 via-slate-900 to-blue-950/40 border border-rose-500/30 relative overflow-hidden shadow-inner">
        {/* Subtle Web Texture */}
        <div className="absolute top-0 right-0 w-24 h-24 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:8px_8px] pointer-events-none"></div>

        <div className="flex items-center justify-between text-rose-400 font-bold text-xs mb-1.5">
          <span className="flex items-center gap-1.5">
            <Radio className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
            <span>KAREN SUIT HUD</span>
          </span>
          <span className="text-[9px] font-mono text-sky-400 bg-sky-950/60 px-1.5 py-0.5 rounded border border-sky-800/40">
            ONLINE
          </span>
        </div>
        
        <p className="text-[11px] text-slate-300 mb-3 leading-relaxed">
          Decompose high-level goals into subtasks with autonomous LLM execution.
        </p>

        <button
          onClick={() => setActiveTab('ai')}
          className="w-full py-2 px-3 text-xs bg-rose-600/20 hover:bg-rose-600/40 text-rose-200 border border-rose-500/40 rounded-xl font-bold transition flex items-center justify-center gap-2 cursor-pointer shadow-sm"
        >
          <Sparkles className="w-3.5 h-3.5 text-rose-400" />
          <span>Engage Suit AI</span>
        </button>
      </div>

      {/* Spider-Man Suit User Badge Footer */}
      <div className="p-4 border-t border-rose-900/30 bg-[#050812]">
        {currentUser ? (
          <button
            onClick={onOpenProfile}
            className="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-rose-950/30 border border-transparent hover:border-rose-500/30 transition text-left cursor-pointer group"
          >
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-600 to-blue-600 flex items-center justify-center font-black text-xs text-white shadow-md shadow-rose-600/30 border border-rose-400/40">
                {initials}
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-400 border-2 border-slate-900"></span>
            </div>
            
            <div className="flex-1 truncate">
              <p className="text-xs font-bold text-white truncate group-hover:text-rose-400 transition">
                {currentUser.name || 'Hero User'}
              </p>
              <p className="text-[10px] text-slate-400 truncate font-mono">{currentUser.email}</p>
            </div>

            <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-rose-400 group-hover:translate-x-0.5 transition" />
          </button>
        ) : (
          <button
            onClick={onOpenUserAuth}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-rose-600 to-blue-600 hover:from-rose-500 hover:to-blue-500 text-xs font-bold text-white transition cursor-pointer shadow-lg shadow-rose-900/30"
          >
            <LogIn className="w-4 h-4" />
            <span>Suit Clearance Login</span>
          </button>
        )}
      </div>

    </aside>
  );
};

export default Sidebar;
