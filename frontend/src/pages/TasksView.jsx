import React, { useState } from 'react';
import { 
  CheckCircle2, 
  Trash2, 
  Edit3, 
  Calendar, 
  Tag, 
  ChevronRight, 
  ChevronDown, 
  Plus, 
  Filter, 
  Clock,
  Layers,
  Sparkles,
  Shield,
  Zap
} from 'lucide-react';

const TasksView = ({ tasks = [], onComplete, onDelete, onEdit, onOpenModal }) => {
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [expandedTasks, setExpandedTasks] = useState({});

  const toggleExpand = (id) => {
    setExpandedTasks(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const filteredTasks = tasks.filter(t => {
    if (statusFilter !== 'all' && t.status !== statusFilter) return false;
    if (priorityFilter !== 'all' && t.priority !== priorityFilter) return false;
    if (categoryFilter !== 'all' && t.category !== categoryFilter) return false;
    return true;
  });

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto animate-fade-in">
      
      {/* Header & Costume Filter Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 glass-panel p-5 rounded-2xl border border-rose-900/40 bg-[#070b16]/90 shadow-xl">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-rose-600/20 border border-rose-500/30 flex items-center justify-center text-rose-400">
            <Filter className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-black text-white uppercase tracking-wider">Patrol Mission Dispatcher</h3>
            <p className="text-[11px] text-slate-400">Filter and organize your city objectives</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-rose-500"
          >
            <option value="all">All Statuses</option>
            <option value="pending">Active Patrols</option>
            <option value="completed">Cleared</option>
          </select>

          {/* Priority Filter */}
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-rose-500"
          >
            <option value="all">All Urgencies</option>
            <option value="high">High (Spider-Sense Alert)</option>
            <option value="medium">Medium Urgency</option>
            <option value="low">Low Urgency</option>
          </select>

          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-rose-500"
          >
            <option value="all">All Categories</option>
            <option value="Academic">Peter's Studies</option>
            <option value="Project">Tech Lab / Project</option>
            <option value="Work">Hero Mission / Work</option>
            <option value="Personal">Daily Life</option>
          </select>

          <button
            onClick={() => onOpenModal()}
            className="btn-primary text-xs py-2 px-3.5 flex items-center gap-1.5 ml-auto shadow-md shadow-rose-900/30"
          >
            <Plus className="w-4 h-4" />
            <span>New Mission</span>
          </button>
        </div>
      </div>

      {/* Task List / Mission Cards */}
      <div className="space-y-3.5">
        {filteredTasks.length === 0 ? (
          <div className="p-12 text-center suit-card rounded-2xl border border-dashed border-rose-500/20">
            <span className="text-4xl block mb-2">🕷️</span>
            <h4 className="text-base font-bold text-slate-200">No matching missions found</h4>
            <p className="text-xs text-slate-400 mt-1">Adjust your filters or dispatch a new mission to begin patrol.</p>
          </div>
        ) : (
          filteredTasks.map((task) => {
            const isCompleted = task.status === 'completed';
            const hasSubtasks = task.subtasks && task.subtasks.length > 0;
            const isExpanded = expandedTasks[task.id];

            return (
              <div
                key={task.id}
                className={`suit-card rounded-2xl p-5 border transition-all ${
                  isCompleted 
                    ? 'opacity-65 border-slate-800/60 bg-[#070a14]/60' 
                    : task.priority === 'high'
                    ? 'border-rose-500/50 hover:border-rose-400 bg-gradient-to-r from-rose-950/20 via-slate-900 to-transparent'
                    : 'border-slate-800/80 hover:border-blue-500/50'
                }`}
              >
                <div className="flex items-center justify-between gap-4">
                  {/* Complete Checkbox + Details */}
                  <div className="flex items-start gap-4 flex-1 min-w-0">
                    <button
                      onClick={() => onComplete(task.id)}
                      className={`mt-1 w-6 h-6 rounded-lg flex items-center justify-center transition border-2 cursor-pointer shrink-0 ${
                        isCompleted
                          ? 'bg-gradient-to-tr from-rose-600 to-blue-600 border-rose-400 text-white shadow-md'
                          : 'border-slate-600 hover:border-rose-400 text-transparent'
                      }`}
                      title={isCompleted ? 'Mission Cleared' : 'Click to Clear Mission'}
                    >
                      <CheckCircle2 className="w-4 h-4" />
                    </button>

                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase border ${
                          task.priority === 'high'
                            ? 'bg-rose-600/30 text-rose-300 border-rose-500/40'
                            : task.priority === 'medium'
                            ? 'bg-blue-600/20 text-blue-300 border-blue-500/40'
                            : 'bg-slate-800 text-slate-400 border-slate-700'
                        }`}>
                          {task.priority === 'high' ? '🚨 CRITICAL' : task.priority}
                        </span>

                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-800/80 text-slate-300 border border-slate-700 uppercase">
                          {task.category || 'General'}
                        </span>

                        {task.due_date && (
                          <span className="text-[11px] text-slate-400 flex items-center gap-1 font-mono">
                            <Calendar className="w-3 h-3 text-rose-400" />
                            <span>{task.due_date}</span>
                          </span>
                        )}
                      </div>

                      <h4 
                        onClick={() => onEdit(task)}
                        className={`text-sm sm:text-base font-bold transition cursor-pointer ${
                          isCompleted ? 'line-through text-slate-500' : 'text-white hover:text-rose-400'
                        }`}
                      >
                        {task.title}
                      </h4>

                      {task.description && (
                        <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                          {task.description}
                        </p>
                      )}

                      {/* Subtasks Accordion Trigger */}
                      {hasSubtasks && (
                        <button
                          onClick={() => toggleExpand(task.id)}
                          className="mt-3 inline-flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 font-bold transition cursor-pointer"
                        >
                          <Layers className="w-3.5 h-3.5 text-blue-400" />
                          <span>
                            {task.subtasks.length} Subtasks ({task.subtasks.filter(s => s.status === 'completed').length} Solved)
                          </span>
                          {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Right Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => onEdit(task)}
                      className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
                      title="Edit Mission"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDelete(task.id)}
                      className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition cursor-pointer"
                      title="Abort Mission"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Expandable Subtask Accordion */}
                {hasSubtasks && isExpanded && (
                  <div className="mt-4 pt-4 border-t border-slate-800/80 space-y-2.5 pl-6 border-l-2 border-l-blue-500/40">
                    {task.subtasks.map((subtask) => (
                      <div 
                        key={subtask.id}
                        className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 flex flex-col gap-1.5 text-xs"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-200">{subtask.title}</span>
                          <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase ${
                            subtask.status === 'completed'
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          }`}>
                            {subtask.status}
                          </span>
                        </div>
                        {subtask.solution_output && (
                          <div className="mt-1 p-2 rounded-lg bg-[#050812] border border-blue-900/30 font-mono text-[11px] text-sky-200/90 whitespace-pre-wrap">
                            {subtask.solution_output}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

              </div>
            );
          })
        )}
      </div>

    </div>
  );
};

export default TasksView;
