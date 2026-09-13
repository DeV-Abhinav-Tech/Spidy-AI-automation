import React from 'react';
import { 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Sparkles, 
  Plus, 
  ArrowRight,
  TrendingUp,
  FolderGit2,
  Calendar,
  Zap,
  Shield,
  Radio
} from 'lucide-react';

const DashboardView = ({ tasks = [], onComplete, onOpenModal, onSwitchToAI, onEditTask }) => {
  const pendingTasks = tasks.filter(t => t.status === 'pending');
  const completedTasks = tasks.filter(t => t.status === 'completed');
  const highPriorityTasks = pendingTasks.filter(t => t.priority === 'high');
  const completionRate = tasks.length > 0 ? Math.round((completedTasks.length / tasks.length) * 100) : 0;

  return (
    <div className="p-8 space-y-8 animate-fade-in max-w-7xl mx-auto">
      
      {/* Spider-Man Costume Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl p-8 border-2 border-rose-500/30 bg-gradient-to-r from-rose-950/70 via-slate-950 to-blue-950/60 shadow-2xl web-pattern-bg">
        {/* Glowing Background Radial Webs */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-rose-600/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-600/20 border border-rose-500/40 text-rose-300 text-xs font-mono font-bold mb-3 shadow-sm">
              <Zap className="w-3.5 h-3.5 text-rose-400" />
              <span>SPIDER-SENSE PATROL ONLINE</span>
            </div>
            
            <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              Friendly Neighborhood <span className="gradient-text">Task Command</span> 🕷️
            </h1>
            
            <p className="text-slate-300 text-sm mt-1 max-w-2xl leading-relaxed">
              <em>"With great power comes great productivity."</em> You have{' '}
              <strong className="text-rose-400 font-bold">{pendingTasks.length} active patrols</strong> queued today. 
              Deploy your AI Suit Copilot to decompose goals into subtasks and conquer your daily missions.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => onSwitchToAI("Decompose my highest priority goals into subtasks and solve them")}
              className="btn-primary text-xs py-2.5 px-4 flex items-center gap-2 shadow-lg shadow-rose-900/40"
            >
              <Sparkles className="w-4 h-4 text-white" />
              <span>Deploy Suit AI</span>
            </button>
            <button
              onClick={() => onOpenModal()}
              className="btn-secondary text-xs py-2.5 px-4 flex items-center gap-2 hover:border-blue-500/50"
            >
              <Plus className="w-4 h-4 text-sky-400" />
              <span>Dispatch Mission</span>
            </button>
          </div>
        </div>
      </div>

      {/* Spider-Man Costume Suit Metric Modules */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* 1. Active Patrols */}
        <div className="p-5 suit-card rounded-2xl flex items-center justify-between border-l-4 border-l-rose-500">
          <div>
            <p className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider">Active Patrols</p>
            <h3 className="text-2xl font-black text-white mt-1">{pendingTasks.length}</h3>
            <span className="text-xs text-rose-400 font-semibold flex items-center gap-1 mt-1">
              <Clock className="w-3 h-3" /> In Progress
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 shadow-md shadow-rose-900/20">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        {/* 2. Missions Cleared */}
        <div className="p-5 suit-card rounded-2xl flex items-center justify-between border-l-4 border-l-blue-500">
          <div>
            <p className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider">Missions Cleared</p>
            <h3 className="text-2xl font-black text-white mt-1">{completedTasks.length}</h3>
            <span className="text-xs text-blue-400 font-semibold flex items-center gap-1 mt-1">
              <CheckCircle2 className="w-3 h-3" /> Resolved
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 shadow-md shadow-blue-900/20">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        {/* 3. Spider-Sense Alerts (High Priority) */}
        <div className={`p-5 suit-card rounded-2xl flex items-center justify-between border-l-4 border-l-amber-400 ${highPriorityTasks.length > 0 ? 'spider-sense-pulse' : ''}`}>
          <div>
            <p className="text-[11px] font-mono font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1">
              <Radio className="w-3 h-3 text-amber-400 animate-pulse" />
              <span>Spider-Sense</span>
            </p>
            <h3 className="text-2xl font-black text-white mt-1">{highPriorityTasks.length}</h3>
            <span className="text-xs text-amber-400 font-semibold flex items-center gap-1 mt-1">
              <AlertTriangle className="w-3 h-3" /> High Urgency
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-md shadow-amber-900/20">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>

        {/* 4. Webbed Progress Gauge */}
        <div className="p-5 suit-card rounded-2xl flex items-center justify-between border-l-4 border-l-cyan-400">
          <div>
            <p className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider">Suit Power Rate</p>
            <h3 className="text-2xl font-black text-white mt-1">{completionRate}%</h3>
            <span className="text-xs text-cyan-400 font-semibold flex items-center gap-1 mt-1">
              <TrendingUp className="w-3 h-3" /> Objective progress
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-md shadow-cyan-900/20">
            <span className="font-mono font-black text-sm">🕸️</span>
          </div>
        </div>

      </div>

      {/* Spider-Sense Urgent Missions Section */}
      {highPriorityTasks.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-black text-white flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping"></span>
              <span>Spider-Sense Critical Alerts ({highPriorityTasks.length})</span>
            </h3>
            <button
              onClick={() => onSwitchToAI("Prioritize my critical high urgency tasks and recommend action order")}
              className="text-xs text-rose-400 hover:text-rose-300 font-bold flex items-center gap-1 transition cursor-pointer"
            >
              <span>Analyze with Suit AI</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {highPriorityTasks.slice(0, 3).map((task) => (
              <div 
                key={task.id}
                className="p-5 rounded-2xl bg-gradient-to-br from-rose-950/40 via-slate-900 to-[#070b16] border border-rose-500/40 hover:border-rose-400 transition shadow-lg relative group overflow-hidden"
              >
                {/* Spider Accent Corner */}
                <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-rose-600/20 to-transparent pointer-events-none"></div>

                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-600/30 text-rose-300 border border-rose-500/40 uppercase">
                      CRITICAL PRIORITY
                    </span>
                    <h4 
                      onClick={() => onEditTask(task)}
                      className="text-sm font-bold text-white mt-2 group-hover:text-rose-300 transition cursor-pointer line-clamp-1"
                    >
                      {task.title}
                    </h4>
                    <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                      {task.description || 'No specific mission intel provided.'}
                    </p>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-rose-900/30 flex items-center justify-between text-xs">
                  <span className="text-[11px] text-slate-400 flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-rose-400" />
                    <span>{task.due_date || 'No deadline'}</span>
                  </span>
                  
                  <button
                    onClick={() => onComplete(task.id)}
                    className="px-3 py-1 rounded-lg bg-rose-600/20 hover:bg-rose-600 text-rose-200 hover:text-white border border-rose-500/40 text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Resolve</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Missions Feed & Quick AI Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Active Patrol Log (2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-black text-white flex items-center gap-2">
              <Shield className="w-4 h-4 text-blue-400" />
              <span>Active Patrol Roster</span>
            </h3>
            <span className="text-xs font-mono text-slate-400">{pendingTasks.length} queued</span>
          </div>

          <div className="space-y-3">
            {pendingTasks.slice(0, 5).map((task) => (
              <div 
                key={task.id}
                className="p-4 rounded-2xl suit-card flex items-center justify-between gap-4 border border-slate-800/80 hover:border-blue-500/40 transition group"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  {/* Webbed Check Trigger Button */}
                  <button
                    onClick={() => onComplete(task.id)}
                    className="w-6 h-6 rounded-lg border-2 border-slate-700 hover:border-rose-500 flex items-center justify-center text-transparent hover:text-rose-400 transition cursor-pointer shrink-0"
                    title="Mark Mission Cleared"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                  </button>

                  <div className="min-w-0">
                    <h4 
                      onClick={() => onEditTask(task)}
                      className="text-xs sm:text-sm font-bold text-white group-hover:text-blue-300 transition cursor-pointer truncate"
                    >
                      {task.title}
                    </h4>
                    <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-400 font-mono">
                      <span className="text-rose-400 font-bold uppercase">{task.category || 'General'}</span>
                      <span>•</span>
                      <span>{task.due_date || 'Ongoing'}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase ${
                    task.priority === 'high' 
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' 
                      : task.priority === 'medium'
                      ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                      : 'bg-slate-800 text-slate-300 border border-slate-700'
                  }`}>
                    {task.priority}
                  </span>
                </div>
              </div>
            ))}

            {pendingTasks.length === 0 && (
              <div className="p-8 text-center rounded-2xl suit-card border border-dashed border-slate-800">
                <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-2" />
                <h4 className="text-sm font-bold text-white">All Patrols Cleared!</h4>
                <p className="text-xs text-slate-400 mt-1">New York City is safe. Great job, hero!</p>
              </div>
            )}
          </div>
        </div>

        {/* Side AI Web-Decomposition Card */}
        <div className="space-y-4">
          <h3 className="text-base font-black text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-rose-400" />
            <span>Spider-Sense AI Copilot</span>
          </h3>

          <div className="p-6 rounded-3xl bg-gradient-to-br from-rose-950/40 via-slate-900 to-blue-950/40 border border-rose-500/30 space-y-4 shadow-xl">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-rose-600 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-rose-900/40">
              <span className="text-lg">🕸️</span>
            </div>

            <div>
              <h4 className="font-black text-white text-base">Goal Web-Weaving</h4>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                Describe any project or exam in natural language. Suit AI will break it down into atomic subtasks and solve each one automatically.
              </p>
            </div>

            <div className="space-y-2 pt-2">
              <button
                onClick={() => onSwitchToAI("Break down my Machine Learning semester project into 5 actionable subtasks")}
                className="w-full text-left p-3 rounded-xl bg-slate-950/70 hover:bg-rose-950/40 border border-slate-800 hover:border-rose-500/40 text-xs text-slate-200 transition group cursor-pointer"
              >
                <p className="font-bold text-white group-hover:text-rose-400 transition">💡 ML Project Decomposition</p>
                <p className="text-[10px] text-slate-500 font-mono mt-0.5">5 subtasks with code deliverables</p>
              </button>

              <button
                onClick={() => onSwitchToAI("Organize my college club hackathon schedule and prep tasks")}
                className="w-full text-left p-3 rounded-xl bg-slate-950/70 hover:bg-blue-950/40 border border-slate-800 hover:border-blue-500/40 text-xs text-slate-200 transition group cursor-pointer"
              >
                <p className="font-bold text-white group-hover:text-blue-400 transition">💡 Club Hackathon Schedule</p>
                <p className="text-[10px] text-slate-500 font-mono mt-0.5">Sponsorship, logistics & judging</p>
              </button>
            </div>

            <button
              onClick={() => onSwitchToAI()}
              className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-rose-600 to-blue-600 hover:from-rose-500 hover:to-blue-500 text-xs font-bold text-white shadow-lg shadow-rose-900/30 transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Launch Suit Copilot</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </div>

    </div>
  );
};

export default DashboardView;
