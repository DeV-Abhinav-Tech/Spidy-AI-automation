import React from 'react';
import { 
  LayoutDashboard, 
  CheckSquare, 
  Bot, 
  Sliders, 
  Sparkles,
  Zap
} from 'lucide-react';

const Sidebar = ({ activeTab, setActiveTab }) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'tasks', label: 'Tasks', icon: CheckSquare },
    { id: 'ai', label: 'AI Assistant', icon: Bot, badge: 'Smart' },
    { id: 'settings', label: 'Settings', icon: Sliders },
  ];

  return (
    <aside className="w-64 glass-panel border-r border-slate-800 flex flex-col h-screen sticky top-0 z-30">
      {/* Brand Header */}
      <div className="p-6 border-b border-slate-800 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-indigo-500/30">
          <Zap className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="font-bold text-lg text-white leading-tight">Spidy</h1>
          <p className="text-[10px] text-cyan-400 font-bold tracking-wider uppercase">TASK AUTOMATION ASSISTANT</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-gradient-to-r from-indigo-600/90 to-indigo-700/80 text-white shadow-md shadow-indigo-900/40'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span className="px-2 py-0.5 text-[10px] uppercase font-bold tracking-wider rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Quick Prompt AI CTA */}
      <div className="p-4 m-4 rounded-xl glass-card bg-indigo-950/30 border border-indigo-500/20">
        <div className="flex items-center gap-2 text-indigo-400 font-semibold text-xs mb-1">
          <Sparkles className="w-4 h-4" />
          <span>AI Task Copilot</span>
        </div>
        <p className="text-xs text-slate-400 mb-3">Ask AI to break down complex goals into subtasks instantly.</p>
        <button
          onClick={() => setActiveTab('ai')}
          className="w-full py-2 px-3 text-xs bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-200 border border-indigo-500/30 rounded-lg font-medium transition"
        >
          Open AI Assistant
        </button>
      </div>

      {/* User Info */}
      <div className="p-4 border-t border-slate-800/80 flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center font-bold text-xs text-indigo-300 border border-indigo-400/30">
          ST
        </div>
        <div className="flex-1 truncate">
          <p className="text-sm font-semibold text-white truncate">Student User</p>
          <p className="text-xs text-slate-400 truncate">student@example.com</p>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
