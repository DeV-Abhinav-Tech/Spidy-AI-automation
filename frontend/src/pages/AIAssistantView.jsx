import React, { useState } from 'react';
import { 
  Bot, 
  Send, 
  Sparkles, 
  Wrench, 
  CheckCircle2, 
  ListTree, 
  Target, 
  ArrowRight, 
  ShieldCheck, 
  Layers,
  TrendingUp,
  AlertCircle,
  Cpu,
  Check
} from 'lucide-react';
import { sendChatMessage, generateTaskBreakdown, acceptTaskBreakdown, prioritizeTasks, autoExecuteGoal } from '../services/api';

const AIAssistantView = ({ onTaskUpdated, initialPrompt = '' }) => {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Hello! I am your Spidy Task Automation Assistant. Equipped with specialized AI Agents (Task Manager, Free Encyclopedia Knowledge Agent, Open-Meteo Weather Agent, and LLM Subtask Solver Agent), I can execute tools, break down goals, solve subtasks autonomously, and track model execution. What would you like to accomplish today?',
      tool: null
    }
  ]);
  const [inputMessage, setInputMessage] = useState(initialPrompt);
  const [loading, setLoading] = useState(false);

  // Task Breakdown state
  const [breakdownGoal, setBreakdownGoal] = useState('');
  const [breakdownResult, setBreakdownResult] = useState(null);
  const [breakdownLoading, setBreakdownLoading] = useState(false);
  const [savingBreakdown, setSavingBreakdown] = useState(false);

  // Autonomous Subtask Solver state
  const [autoSolveResult, setAutoSolveResult] = useState(null);
  const [autoSolving, setAutoSolving] = useState(false);

  // Priority Engine state
  const [priorityResult, setPriorityResult] = useState(null);
  const [priorityLoading, setPriorityLoading] = useState(false);

  const handleAutoSolveGoal = async () => {
    if (!breakdownGoal.trim() || autoSolving) return;
    setAutoSolving(true);
    try {
      const data = await autoExecuteGoal(breakdownGoal, 'Project');
      setAutoSolveResult(data);
      onTaskUpdated();
    } catch (err) {
      alert(`Auto-solve error: ${err.message}`);
    } finally {
      setAutoSolving(false);
    }
  };

  // Handle Natural Language Chat Submit
  const handleChatSubmit = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || loading) return;

    const userText = inputMessage;
    setInputMessage('');
    setMessages(prev => [...prev, { role: 'user', content: userText }]);
    setLoading(true);

    try {
      const data = await sendChatMessage(userText);
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: data.response,
          tool: data.tool_executed
        }
      ]);
      if (data.tool_executed && data.tool_executed.success) {
        onTaskUpdated();
      }
    } catch (err) {
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: `Error processing request: ${err.response?.data?.detail || err.message}`,
          tool: null
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Handle Task Breakdown Request
  const handleGenerateBreakdown = async (e) => {
    e.preventDefault();
    if (!breakdownGoal.trim() || breakdownLoading) return;

    setBreakdownLoading(true);
    try {
      const data = await generateTaskBreakdown(breakdownGoal);
      setBreakdownResult(data);
    } catch (err) {
      alert(`Breakdown error: ${err.message}`);
    } finally {
      setBreakdownLoading(false);
    }
  };

  // Accept Subtask Breakdown Flow
  const handleAcceptBreakdown = async () => {
    if (!breakdownResult || savingBreakdown) return;

    setSavingBreakdown(true);
    try {
      await acceptTaskBreakdown({
        goal: breakdownResult.goal,
        category: 'Project',
        subtasks: breakdownResult.subtasks
      });
      alert(`Success! Goal '${breakdownResult.goal}' and ${breakdownResult.subtasks.length} subtasks saved to database.`);
      setBreakdownResult(null);
      setBreakdownGoal('');
      onTaskUpdated();
    } catch (err) {
      alert(`Error saving breakdown: ${err.message}`);
    } finally {
      setSavingBreakdown(false);
    }
  };

  // Handle AI Prioritization Analysis
  const handlePrioritize = async () => {
    setPriorityLoading(true);
    try {
      const data = await prioritizeTasks();
      setPriorityResult(data);
    } catch (err) {
      alert(`Prioritization error: ${err.message}`);
    } finally {
      setPriorityLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-fade-in">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left 2 Cols: Natural Language Chat Interface */}
        <div className="lg:col-span-2 glass-panel rounded-3xl border border-slate-800 flex flex-col h-[700px] overflow-hidden">
          {/* Chat Header */}
          <div className="px-6 py-4 border-b border-slate-800 bg-slate-900/80 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-cyan-500 flex items-center justify-center shadow-md">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-white text-base">Copilot Chat & Tool Engine</h3>
                <p className="text-xs text-slate-400">LLM Function-Calling Layer with Backend Validation</p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Safe Tool Execution</span>
            </div>
          </div>

          {/* Messages Box */}
          <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-slate-950/40">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-xl bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center shrink-0 mt-1">
                    <Bot className="w-4 h-4 text-indigo-300" />
                  </div>
                )}

                <div className={`max-w-xl space-y-2 ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                  <div
                    className={`p-4 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-indigo-600 text-white rounded-tr-none shadow-lg shadow-indigo-600/20'
                        : 'glass-card border border-slate-800 text-slate-200 rounded-tl-none'
                    }`}
                  >
                    {msg.content}
                  </div>

                  {/* Tool Execution Badge */}
                  {msg.tool && (
                    <div className="p-3 rounded-xl bg-slate-900 border border-cyan-500/30 text-xs text-slate-300 space-y-1.5 animate-fade-in">
                      <div className="flex items-center justify-between font-mono text-[11px] text-cyan-400">
                        <span className="flex items-center gap-1">
                          <Wrench className="w-3.5 h-3.5 text-cyan-400" /> Tool: {msg.tool.tool_name}()
                        </span>
                        <span className={`px-1.5 py-0.5 rounded text-[9px] uppercase font-bold ${msg.tool.success ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'}`}>
                          {msg.tool.success ? 'SUCCESS' : 'FAILED'}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400">
                        Args: <code className="text-indigo-300">{JSON.stringify(msg.tool.arguments)}</code>
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex items-center gap-2 text-xs text-indigo-400 italic">
                <Sparkles className="w-4 h-4 animate-spin" />
                <span>Evaluating natural language intent and selecting tool...</span>
              </div>
            )}
          </div>

          {/* Input Box */}
          <form onSubmit={handleChatSubmit} className="p-4 border-t border-slate-800 bg-slate-900/90 flex gap-3">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="e.g. 'Remind me to prepare presentation tomorrow at 5 PM' or 'Mark Python task complete'"
              className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs sm:text-sm text-white focus:outline-none focus:border-indigo-500 transition"
            />
            <button
              type="submit"
              disabled={loading}
              className="btn-primary py-3 px-5 flex items-center gap-2"
            >
              <Send className="w-4 h-4" />
              <span className="hidden sm:inline">Send</span>
            </button>
          </form>
        </div>

        {/* Right 1 Col: AI Task Breakdown & AI Priority Analyzer Widgets */}
        <div className="space-y-6">
          
          {/* Widget 1: AI Task Breakdown */}
          <div className="glass-panel rounded-3xl p-6 border border-slate-800 space-y-4">
            <div className="flex items-center gap-2">
              <ListTree className="w-5 h-5 text-cyan-400" />
              <h3 className="font-bold text-white text-base">AI Task Decomposition</h3>
            </div>
            <p className="text-xs text-slate-400">Enter a complex goal to automatically generate structured subtasks for review.</p>

            <form onSubmit={handleGenerateBreakdown} className="space-y-3">
              <input
                type="text"
                value={breakdownGoal}
                onChange={(e) => setBreakdownGoal(e.target.value)}
                placeholder="e.g. Build machine learning portfolio"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
              />
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="submit"
                  disabled={breakdownLoading || autoSolving}
                  className="btn-secondary text-xs py-2 flex items-center justify-center gap-1.5 border-cyan-500/30 text-cyan-300"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{breakdownLoading ? 'Breaking down...' : 'Generate Subtasks'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleAutoSolveGoal}
                  disabled={autoSolving || !breakdownGoal.trim()}
                  className="btn-primary text-xs py-2 flex items-center justify-center gap-1.5 bg-gradient-to-r from-indigo-600 to-cyan-600"
                >
                  <Cpu className="w-3.5 h-3.5" />
                  <span>{autoSolving ? 'Solving Subtasks...' : 'Auto-Solve Goal'}</span>
                </button>
              </div>
            </form>

            {/* Autonomous Subtask Solver Solutions Output Card */}
            {autoSolveResult && (
              <div className="p-4 rounded-2xl bg-slate-900 border border-indigo-500/30 space-y-3 animate-fade-in">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                    <Cpu className="w-3.5 h-3.5 text-indigo-400" /> Goal Execution Complete
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/30">
                    {autoSolveResult.completed_subtasks}/{autoSolveResult.total_subtasks} Solved
                  </span>
                </div>
                <p className="text-[11px] text-slate-300 italic">{autoSolveResult.summary}</p>

                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {autoSolveResult.solutions.map((sol, i) => (
                    <div key={sol.subtask_id} className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                      <div className="flex items-center justify-between text-xs font-semibold text-cyan-300">
                        <span>{i+1}. {sol.title}</span>
                        <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Solved</span>
                      </div>
                      <div className="text-[11px] text-slate-300 font-mono bg-slate-900/80 p-2 rounded border border-slate-800/80 overflow-x-auto whitespace-pre-wrap">
                        {sol.solution_output}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Generated Subtasks Review Panel */}
            {breakdownResult && (
              <div className="p-4 rounded-2xl bg-slate-900 border border-cyan-500/30 space-y-3 animate-fade-in">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">Subtask Suggestions</h4>
                  <span className="text-[10px] text-cyan-400 font-semibold">{breakdownResult.subtasks.length} subtasks</span>
                </div>

                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {breakdownResult.subtasks.map((st, i) => (
                    <div key={i} className="p-2 rounded-lg bg-slate-950 border border-slate-800 text-xs flex items-center justify-between">
                      <div className="truncate pr-2">
                        <p className="font-semibold text-slate-200 truncate">{i+1}. {st.title}</p>
                        {st.description && <p className="text-[10px] text-slate-400 truncate">{st.description}</p>}
                      </div>
                      <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">{st.estimated_priority}</span>
                    </div>
                  ))}
                </div>

                <button
                  onClick={handleAcceptBreakdown}
                  disabled={savingBreakdown}
                  className="w-full btn-primary text-xs py-2 flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-600 to-indigo-600"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{savingBreakdown ? 'Saving to Database...' : 'Accept & Add Tasks to DB'}</span>
                </button>
              </div>
            )}
          </div>

          {/* Widget 2: AI Priority Matrix Engine */}
          <div className="glass-panel rounded-3xl p-6 border border-slate-800 space-y-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-amber-400" />
              <h3 className="font-bold text-white text-base">AI Priority Engine</h3>
            </div>
            <p className="text-xs text-slate-400">Evaluate active tasks against deadlines, importance, urgency, and effort.</p>

            <button
              onClick={handlePrioritize}
              disabled={priorityLoading}
              className="w-full btn-secondary text-xs py-2 flex items-center justify-center gap-2 border-amber-500/30 text-amber-300"
            >
              <Target className="w-4 h-4" />
              <span>{priorityLoading ? 'Analyzing Priority Scores...' : 'Analyze Task Priorities'}</span>
            </button>

            {priorityResult && (
              <div className="p-4 rounded-2xl bg-slate-900 border border-amber-500/30 space-y-3 animate-fade-in">
                <p className="text-xs text-slate-300 font-medium italic">{priorityResult.summary}</p>
                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {priorityResult.priorities.map((item) => (
                    <div key={item.task_id} className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-white truncate">{item.title}</span>
                        <span className="font-mono text-[11px] font-semibold text-amber-400">Score: {item.score}</span>
                      </div>
                      <p className="text-[11px] text-slate-400 leading-snug">{item.rationale}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};

export default AIAssistantView;
