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
  Check, 
  Zap, 
  Radio 
} from 'lucide-react';
import { sendChatMessage, generateTaskBreakdown, acceptTaskBreakdown, prioritizeTasks, autoExecuteGoal } from '../services/api';

const AIAssistantView = ({ onTaskUpdated, initialPrompt = '' }) => {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Greetings Peter! Karen Suit AI online. Equipped with specialized tactical subroutines (Task Dispatcher, Wikipedia Encyclopedia Agent, Open-Meteo Weather Sensor, and Autonomous LLM Goal Solver). What objective are we tackling today?',
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
      alert(`Success! Directive '${breakdownResult.goal}' and ${breakdownResult.subtasks.length} subtasks saved to database.`);
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
        
        {/* Left 2 Cols: Spider-Man Suit AI Chat Interface (Karen Copilot) */}
        <div className="lg:col-span-2 glass-panel rounded-3xl border-2 border-rose-500/30 flex flex-col h-[700px] overflow-hidden shadow-2xl bg-[#070b16]/90">
          
          {/* Chat Header with Spider-Man Suit HUD */}
          <div className="px-6 py-4.5 border-b border-rose-900/30 bg-gradient-to-r from-rose-950/60 via-slate-900 to-blue-950/50 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-rose-600 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-rose-900/40 border border-rose-400/40">
                <Radio className="w-5 h-5 text-white animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-black text-white text-base tracking-tight">KAREN SUIT HUD</h3>
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-rose-600/30 text-rose-300 border border-rose-500/40">
                    AI CO-PILOT
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 font-mono">Real-Time Function-Calling & Subtask Automation</p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-mono font-bold">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>STARK PROTOCOLS ACTIVE</span>
            </div>
          </div>

          {/* Messages Box */}
          <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-[#050812]/90 web-pattern-bg">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-rose-600 to-blue-600 border border-rose-400/40 flex items-center justify-center shrink-0 mt-1 shadow-md">
                    <span className="text-xs">🕷️</span>
                  </div>
                )}

                <div className={`max-w-xl space-y-2 ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                  <div
                    className={`p-4 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-gradient-to-r from-rose-600 to-rose-700 text-white rounded-tr-none shadow-lg shadow-rose-900/40 border border-rose-400/30'
                        : 'suit-card border border-rose-500/20 text-slate-200 rounded-tl-none bg-[#0a0f20]/80'
                    }`}
                  >
                    {msg.content}
                  </div>

                  {/* Tool Execution Badge */}
                  {msg.tool && (
                    <div className="p-3 rounded-xl bg-slate-950 border border-rose-500/40 text-xs text-slate-300 space-y-1.5 animate-fade-in shadow-inner">
                      <div className="flex items-center justify-between font-mono text-[11px] text-rose-300">
                        <span className="flex items-center gap-1">
                          <Wrench className="w-3.5 h-3.5 text-rose-400" /> Tool: {msg.tool.tool_name}()
                        </span>
                        <span className={`px-2 py-0.5 rounded text-[9px] uppercase font-bold border ${
                          msg.tool.success 
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' 
                            : 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                        }`}>
                          {msg.tool.success ? 'EXECUTED' : 'FAILED'}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400">
                        Args: <code className="text-sky-300 font-mono">{JSON.stringify(msg.tool.arguments)}</code>
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex items-center gap-2 text-xs text-rose-400 italic font-mono animate-pulse">
                <Sparkles className="w-4 h-4 text-rose-400 animate-spin" />
                <span>Karen evaluating tactical intent and synthesizing tool response...</span>
              </div>
            )}
          </div>

          {/* Input Box */}
          <form onSubmit={handleChatSubmit} className="p-4 border-t border-rose-900/30 bg-[#070b16] flex gap-3">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="e.g. 'Remind me to submit project tomorrow at 5 PM' or 'Mark task completed'"
              className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs sm:text-sm text-white focus:outline-none focus:border-rose-500 transition"
            />
            <button
              type="submit"
              disabled={loading}
              className="btn-primary py-3 px-5 flex items-center gap-2 shadow-lg shadow-rose-900/30 cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span className="hidden sm:inline font-bold">Transmit</span>
            </button>
          </form>
        </div>

        {/* Right 1 Col: Spider-Man Suit Goal Weaving & Threat Matrix */}
        <div className="space-y-6">
          
          {/* Widget 1: Spider-Sense Goal Weaving */}
          <div className="glass-panel rounded-3xl p-6 border border-rose-500/30 space-y-4 bg-[#070b16]/90 shadow-xl">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-rose-600/20 border border-rose-500/30 flex items-center justify-center text-rose-400">
                <ListTree className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-black text-white text-base">Goal Web-Weaver</h3>
                <p className="text-[10px] text-slate-400 font-mono">Autonomous Subtask Decomposition</p>
              </div>
            </div>

            <p className="text-xs text-slate-300">
              Input a complex directive. Suit AI will weave an atomic breakdown and autonomously solve deliverables.
            </p>

            <form onSubmit={handleGenerateBreakdown} className="space-y-3">
              <input
                type="text"
                value={breakdownGoal}
                onChange={(e) => setBreakdownGoal(e.target.value)}
                placeholder="e.g. Develop AI drone defense project"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-500"
              />
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="submit"
                  disabled={breakdownLoading || autoSolving}
                  className="btn-secondary text-xs py-2 flex items-center justify-center gap-1.5 border-rose-500/30 text-rose-300 hover:bg-rose-950/30 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{breakdownLoading ? 'Weaving...' : 'Break Down'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleAutoSolveGoal}
                  disabled={autoSolving || !breakdownGoal.trim()}
                  className="btn-primary text-xs py-2 flex items-center justify-center gap-1.5 shadow-md shadow-rose-900/30 cursor-pointer"
                >
                  <Cpu className="w-3.5 h-3.5" />
                  <span>{autoSolving ? 'Solving...' : 'Auto-Solve'}</span>
                </button>
              </div>
            </form>

            {/* Autonomous Subtask Solver Solutions Card */}
            {autoSolveResult && (
              <div className="p-4 rounded-2xl bg-[#090e1c] border border-rose-500/40 space-y-3 animate-fade-in shadow-inner">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-rose-400" /> Mission Solved
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                    {autoSolveResult.completed_subtasks}/{autoSolveResult.total_subtasks} Cleared
                  </span>
                </div>
                <p className="text-[11px] text-slate-300 italic">{autoSolveResult.summary}</p>

                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {autoSolveResult.solutions.map((sol, i) => (
                    <div key={sol.subtask_id} className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                      <div className="flex items-center justify-between text-xs font-semibold text-rose-300">
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
              <div className="p-4 rounded-2xl bg-[#090e1c] border border-blue-500/40 space-y-3 animate-fade-in">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">Webbed Subtasks</h4>
                  <span className="text-[10px] text-blue-400 font-semibold">{breakdownResult.subtasks.length} nodes</span>
                </div>

                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {breakdownResult.subtasks.map((st, i) => (
                    <div key={i} className="p-2 rounded-lg bg-slate-950 border border-slate-800 text-xs flex items-center justify-between">
                      <div className="truncate pr-2">
                        <p className="font-semibold text-slate-200 truncate">{i+1}. {st.title}</p>
                        {st.description && <p className="text-[10px] text-slate-400 truncate">{st.description}</p>}
                      </div>
                      <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono font-bold">{st.estimated_priority}</span>
                    </div>
                  ))}
                </div>

                <button
                  onClick={handleAcceptBreakdown}
                  disabled={savingBreakdown}
                  className="w-full btn-primary text-xs py-2 flex items-center justify-center gap-2 cursor-pointer shadow-md"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{savingBreakdown ? 'Enrolling...' : 'Commit Tasks to Database'}</span>
                </button>
              </div>
            )}
          </div>

          {/* Widget 2: Spider-Sense Threat Level & Priority Analyzer */}
          <div className="glass-panel rounded-3xl p-6 border border-amber-500/30 space-y-4 bg-[#070b16]/90 shadow-xl">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <Target className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-black text-white text-base">Spider-Sense Threat Matrix</h3>
                <p className="text-[10px] text-slate-400 font-mono">Multi-Factor Urgency Evaluator</p>
              </div>
            </div>

            <p className="text-xs text-slate-300">
              Evaluates current missions against imminent deadlines, task effort, and critical urgency.
            </p>

            <button
              onClick={handlePrioritize}
              disabled={priorityLoading}
              className="w-full btn-secondary text-xs py-2 flex items-center justify-center gap-2 border-amber-500/30 text-amber-300 hover:bg-amber-950/30 cursor-pointer"
            >
              <Target className="w-4 h-4" />
              <span>{priorityLoading ? 'Scanning Threat Levels...' : 'Scan Mission Priorities'}</span>
            </button>

            {priorityResult && (
              <div className="p-4 rounded-2xl bg-[#090e1c] border border-amber-500/40 space-y-3 animate-fade-in shadow-inner">
                <p className="text-xs text-slate-300 font-medium italic">{priorityResult.summary}</p>
                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {priorityResult.priorities.map((item) => (
                    <div key={item.task_id} className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-white truncate">{item.title}</span>
                        <span className="font-mono text-[11px] font-bold text-amber-400">Score: {item.score}</span>
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
