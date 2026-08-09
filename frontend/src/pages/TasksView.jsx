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
  Layers
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
      {/* Header & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 glass-panel p-5 rounded-2xl border border-slate-800">
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-indigo-400" />
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">Filters</h3>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
          </select>

          {/* Priority Filter */}
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
          >
            <option value="all">All Priorities</option>
            <option value="high">High Priority</option>
            <option value="medium">Medium Priority</option>
            <option value="low">Low Priority</option>
          </select>

          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
          >
            <option value="all">All Categories</option>
            <option value="Academic">Academic</option>
            <option value="Project">Project</option>
            <option value="Internship">Internship</option>
            <option value="Personal">Personal</option>
            <option value="Work">Work</option>
          </select>

          <button
            onClick={() => onOpenModal()}
            className="btn-primary text-xs py-1.5 px-3 flex items-center gap-1.5 ml-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Add Task</span>
          </button>
        </div>
      </div>

      {/* Task List Table / Cards */}
      <div className="space-y-3">
        {filteredTasks.length === 0 ? (
          <div className="p-12 text-center glass-panel rounded-2xl">
            <Clock className="w-12 h-12 text-slate-500 mx-auto mb-3 opacity-60" />
            <h4 className="text-base font-semibold text-slate-300">No tasks found</h4>
            <p className="text-xs text-slate-500 mt-1">Try adjusting your filters or click "Add Task" to create one.</p>
          </div>
        ) : (
          filteredTasks.map((task) => {
            const isCompleted = task.status === 'completed';
            const hasSubtasks = task.subtasks && task.subtasks.length > 0;
            const isExpanded = expandedTasks[task.id];

            return (
              <div
                key={task.id}
                className={`glass-card rounded-2xl p-5 border transition-all ${
                  isCompleted ? 'opacity-65 border-slate-800/50 bg-slate-950/40' : 'border-slate-800/80 hover:border-indigo-500/40'
                }`}
              >
                <div className="flex items-center justify-between gap-4">
                  {/* Left: Complete Checkbox + Details */}
                  <div className="flex items-start gap-4 flex-1 min-w-0">
                    <button
                      onClick={() => onComplete(task.id)}
                      className={`mt-1 w-5 h-5 rounded-lg flex items-center justify-center transition border ${
                        isCompleted
                          ? 'bg-emerald-500 border-emerald-500 text-white'
                          : 'border-slate-600 hover:border-emerald-400 text-transparent'
                      }`}
                      title={isCompleted ? 'Mark Pending' : 'Mark Completed'}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    </button>

                    <div className="space-y-1 flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        {hasSubtasks && (
                          <button
                            onClick={() => toggleExpand(task.id)}
                            className="p-0.5 text-slate-400 hover:text-white transition"
                          >
                            {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                          </button>
                        )}
                        <h4 className={`text-base font-bold ${isCompleted ? 'line-through text-slate-400' : 'text-white'}`}>
                          {task.title}
                        </h4>

                        {/* Priority Badge */}
                        <span
                          className={`px-2 py-0.5 text-[10px] uppercase font-bold rounded-md ${
                            task.priority === 'high'
                              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                              : task.priority === 'medium'
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                              : 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          {task.priority}
                        </span>

                        {/* Category Badge */}
                        <span className="px-2 py-0.5 text-[10px] font-medium rounded-md bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                          {task.category || 'General'}
                        </span>

                        {hasSubtasks && (
                          <span className="px-2 py-0.5 text-[10px] font-medium rounded-md bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 flex items-center gap-1">
                            <Layers className="w-3 h-3" />
                            <span>{task.subtasks.length} Subtasks</span>
                          </span>
                        )}
                      </div>

                      {task.description && (
                        <p className="text-xs text-slate-400 leading-relaxed">{task.description}</p>
                      )}

                      {task.due_date && (
                        <div className="flex items-center gap-2 text-xs text-amber-400/90 pt-1">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>Due: {task.due_date} {task.due_time ? `at ${task.due_time}` : ''}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right Actions */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onEdit(task)}
                      className="p-2 rounded-xl text-slate-400 hover:text-indigo-300 hover:bg-indigo-500/10 transition"
                      title="Edit task"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDelete(task.id)}
                      className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition"
                      title="Delete task"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Subtasks Accordion view */}
                {hasSubtasks && isExpanded && (
                  <div className="mt-4 pt-3 border-t border-slate-800/80 space-y-2 pl-8">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs font-semibold text-cyan-400 uppercase tracking-wider">Subtasks Breakdown & AI Solutions</p>
                    </div>

                    {task.subtasks.map((st) => (
                      <div key={st.id} className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2">
                            <CheckCircle2 className={`w-3.5 h-3.5 ${st.status === 'completed' ? 'text-emerald-400' : 'text-slate-600'}`} />
                            <span className={`font-semibold ${st.status === 'completed' ? 'text-slate-300' : 'text-slate-200'}`}>
                              {st.title}
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-400 uppercase">{st.priority}</span>
                        </div>

                        {st.solution_output && (
                          <div className="text-[11px] font-mono text-cyan-200 bg-slate-950 p-2.5 rounded-lg border border-slate-800/80 overflow-x-auto whitespace-pre-wrap mt-1">
                            {st.solution_output}
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
