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
  Calendar
} from 'lucide-react';

const DashboardView = ({ tasks = [], onComplete, onOpenModal, onSwitchToAI, onEditTask }) => {
  const pendingTasks = tasks.filter(t => t.status === 'pending');
  const completedTasks = tasks.filter(t => t.status === 'completed');
  const highPriorityTasks = pendingTasks.filter(t => t.priority === 'high');
  const completionRate = tasks.length > 0 ? Math.round((completedTasks.length / tasks.length) * 100) : 0;

  return (
    <div className="p-8 space-y-8 animate-fade-in max-w-7xl mx-auto">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl p-8 glass-panel border border-indigo-500/20 bg-gradient-to-r from-indigo-950/60 via-slate-900 to-cyan-950/40">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-semibold mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI Automation Ready</span>
            </div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">
              Good day, <span className="gradient-text">Student Leader</span> 👋
            </h1>
            <p className="text-slate-300 text-sm mt-1 max-w-2xl">
              You have <strong className="text-white">{pendingTasks.length} pending tasks</strong> today. High-priority items are highlighted below. Ask the AI Assistant to break down high-level goals into actionable steps.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => onSwitchToAI("Break down my final year project into manageable subtasks")}
              className="btn-primary text-xs py-2.5 px-4 flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>AI Task Breakdown</span>
            </button>
            <button
              onClick={() => onOpenModal()}
              className="btn-secondary text-xs py-2.5 px-4 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Add Task</span>
            </button>
          </div>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="p-5 glass-card rounded-2xl flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Pending Tasks</p>
            <h3 className="text-2xl font-bold text-white mt-1">{pendingTasks.length}</h3>
            <span className="text-xs text-amber-400 font-medium flex items-center gap-1 mt-1">
              <Clock className="w-3 h-3" /> Active workload
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 glass-card rounded-2xl flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Completed</p>
            <h3 className="text-2xl font-bold text-white mt-1">{completedTasks.length}</h3>
            <span className="text-xs text-emerald-400 font-medium flex items-center gap-1 mt-1">
              <CheckCircle2 className="w-3 h-3" /> {completionRate}% finished
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 glass-card rounded-2xl flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">High Priority</p>
            <h3 className="text-2xl font-bold text-rose-400 mt-1">{highPriorityTasks.length}</h3>
            <span className="text-xs text-rose-300 font-medium flex items-center gap-1 mt-1">
              <AlertTriangle className="w-3 h-3" /> Action required
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 glass-card rounded-2xl flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Progress Score</p>
            <h3 className="text-2xl font-bold text-indigo-400 mt-1">{completionRate}%</h3>
            <div className="w-28 bg-slate-800 rounded-full h-1.5 mt-2 overflow-hidden">
              <div className="bg-indigo-500 h-full rounded-full transition-all duration-500" style={{ width: `${completionRate}%` }}></div>
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Main Grid: Today's Tasks & AI Quick Launcher */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Today's Priority Tasks */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-indigo-400" />
              <span>Today's Urgent Tasks</span>
            </h3>
            <span className="text-xs text-slate-400 font-medium">Top Priority Items</span>
          </div>

          <div className="space-y-3">
            {pendingTasks.length === 0 ? (
              <div className="p-8 text-center glass-card rounded-2xl">
                <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-2 opacity-80" />
                <p className="text-sm text-slate-300 font-medium">All tasks completed! Great job 🎉</p>
                <p className="text-xs text-slate-500 mt-1">Use the AI Assistant to create new tasks or break down projects.</p>
              </div>
            ) : (
              pendingTasks.slice(0, 5).map((task) => (
                <div
                  key={task.id}
                  className="p-4 glass-card rounded-2xl flex items-center justify-between gap-4 group transition"
                >
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <button
                      onClick={() => onComplete(task.id)}
                      className="mt-0.5 w-5 h-5 rounded-lg border border-slate-600 group-hover:border-emerald-500 flex items-center justify-center transition"
                      title="Mark complete"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-transparent group-hover:text-emerald-400 transition" />
                    </button>
                    <div className="truncate">
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-semibold text-white group-hover:text-indigo-300 transition truncate">
                          {task.title}
                        </h4>
                        {task.priority === 'high' && (
                          <span className="px-2 py-0.5 text-[10px] uppercase font-bold rounded-md bg-rose-500/20 text-rose-300 border border-rose-500/30">
                            High
                          </span>
                        )}
                        <span className="px-2 py-0.5 text-[10px] font-medium rounded-md bg-slate-800 text-slate-300">
                          {task.category || 'General'}
                        </span>
                      </div>
                      {task.description && (
                        <p className="text-xs text-slate-400 truncate mt-0.5">{task.description}</p>
                      )}
                      {task.due_date && (
                        <div className="flex items-center gap-1.5 text-[11px] text-amber-400/90 mt-1.5">
                          <Calendar className="w-3 h-3" />
                          <span>Due: {task.due_date} {task.due_time ? `at ${task.due_time}` : ''}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => onEditTask(task)}
                    className="text-xs text-indigo-400 hover:text-indigo-300 font-medium px-3 py-1.5 rounded-lg hover:bg-indigo-500/10 transition"
                  >
                    Edit
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Col: AI Copilot Assistant Prompts */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-cyan-400" />
              <span>AI Automations</span>
            </h3>
          </div>

          <div className="glass-panel rounded-2xl p-5 border border-slate-800 space-y-3">
            <p className="text-xs text-slate-400 leading-relaxed">
              Execute controlled natural language actions safely through structured tools:
            </p>

            <button
              onClick={() => onSwitchToAI("Remind me to submit my internship application tomorrow at 6 PM")}
              className="w-full text-left p-3 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-indigo-500/50 flex items-center justify-between group transition"
            >
              <div>
                <p className="text-xs font-semibold text-indigo-300">Create Task Command</p>
                <p className="text-[11px] text-slate-400 italic">"Remind me to submit application tomorrow"</p>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-indigo-400 group-hover:translate-x-0.5 transition" />
            </button>

            <button
              onClick={() => onSwitchToAI("Break my machine learning project into smaller tasks")}
              className="w-full text-left p-3 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-cyan-500/50 flex items-center justify-between group transition"
            >
              <div>
                <p className="text-xs font-semibold text-cyan-300">Goal Breakdown</p>
                <p className="text-[11px] text-slate-400 italic">"Break down machine learning project"</p>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 group-hover:translate-x-0.5 transition" />
            </button>

            <button
              onClick={() => onSwitchToAI("Which tasks should I focus on today?")}
              className="w-full text-left p-3 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-amber-500/50 flex items-center justify-between group transition"
            >
              <div>
                <p className="text-xs font-semibold text-amber-300">AI Task Prioritization</p>
                <p className="text-[11px] text-slate-400 italic">"Which tasks should I focus on today?"</p>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-amber-400 group-hover:translate-x-0.5 transition" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardView;
