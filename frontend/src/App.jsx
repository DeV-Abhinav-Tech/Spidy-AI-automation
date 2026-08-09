import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import TaskModal from './components/TaskModal';
import UserAuthModal from './components/UserAuthModal';
import DashboardView from './pages/DashboardView';
import TasksView from './pages/TasksView';
import AIAssistantView from './pages/AIAssistantView';
import SettingsView from './pages/SettingsView';
import { fetchTasks, createTask, updateTask, deleteTask, completeTask, loginOrRegisterUser } from './services/api';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [tasks, setTasks] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUserAuthOpen, setIsUserAuthOpen] = useState(false);
  const [currentUserEmail, setCurrentUserEmail] = useState(localStorage.getItem('spidy_user_email') || 'student@example.com');
  const [selectedTask, setSelectedTask] = useState(null);
  const [initialAIPrompt, setInitialAIPrompt] = useState('');

  // Load Tasks from Backend API
  const loadTasks = async () => {
    try {
      const data = await fetchTasks({ search: searchQuery || undefined });
      setTasks(data);
    } catch (err) {
      console.error("Failed to load tasks:", err);
    }
  };

  useEffect(() => {
    if (currentUserEmail) {
      localStorage.setItem('spidy_user_email', currentUserEmail);
      loginOrRegisterUser(currentUserEmail).catch(err => console.error(err));
    }
    loadTasks();
  }, [searchQuery, currentUserEmail]);

  // Task Actions
  const handleCreateOrUpdateTask = async (taskData) => {
    try {
      if (selectedTask) {
        await updateTask(selectedTask.id, taskData);
      } else {
        await createTask(taskData);
      }
      setSelectedTask(null);
      loadTasks();
    } catch (err) {
      alert(`Operation failed: ${err.message}`);
    }
  };

  const handleCompleteTask = async (taskId) => {
    try {
      await completeTask(taskId);
      loadTasks();
    } catch (err) {
      alert(`Complete task failed: ${err.message}`);
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm("Are you sure you want to delete this task?")) return;
    try {
      await deleteTask(taskId);
      loadTasks();
    } catch (err) {
      alert(`Delete task failed: ${err.message}`);
    }
  };

  const handleOpenEditModal = (task) => {
    setSelectedTask(task);
    setIsModalOpen(true);
  };

  const handleSwitchToAI = (promptText = '') => {
    setInitialAIPrompt(promptText);
    setActiveTab('ai');
  };

  // Stats calculation
  const pendingCount = tasks.filter(t => t.status === 'pending').length;
  const completedCount = tasks.filter(t => t.status === 'completed').length;

  return (
    <div className="flex min-h-screen bg-[#0b0f19] text-slate-100 font-sans">
      {/* Navigation Sidebar */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header
          title={
            activeTab === 'dashboard' ? 'Dashboard Overview' :
            activeTab === 'tasks' ? 'Task Workspace' :
            activeTab === 'ai' ? 'Spidy Task Automation Assistant' : 'Settings & Infrastructure'
          }
          onOpenNewTask={() => { setSelectedTask(null); setIsModalOpen(true); }}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          stats={{ pending: pendingCount, completed: completedCount }}
          currentUserEmail={currentUserEmail}
          onOpenUserAuth={() => setIsUserAuthOpen(true)}
        />

        <main className="flex-1 overflow-y-auto pb-12">
          {activeTab === 'dashboard' && (
            <DashboardView
              tasks={tasks}
              onComplete={handleCompleteTask}
              onOpenModal={() => { setSelectedTask(null); setIsModalOpen(true); }}
              onSwitchToAI={handleSwitchToAI}
              onEditTask={handleOpenEditModal}
            />
          )}

          {activeTab === 'tasks' && (
            <TasksView
              tasks={tasks}
              onComplete={handleCompleteTask}
              onDelete={handleDeleteTask}
              onEdit={handleOpenEditModal}
              onOpenModal={() => { setSelectedTask(null); setIsModalOpen(true); }}
            />
          )}

          {activeTab === 'ai' && (
            <AIAssistantView
              onTaskUpdated={loadTasks}
              initialPrompt={initialAIPrompt}
            />
          )}

          {activeTab === 'settings' && (
            <SettingsView
              currentUserEmail={currentUserEmail}
              onOpenUserAuth={() => setIsUserAuthOpen(true)}
            />
          )}
        </main>
      </div>

      {/* Create / Edit Task Modal */}
      <TaskModal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setSelectedTask(null); }}
        onSave={handleCreateOrUpdateTask}
        task={selectedTask}
      />

      {/* User Authentication & Credentials Modal */}
      <UserAuthModal
        isOpen={isUserAuthOpen}
        onClose={() => setIsUserAuthOpen(false)}
        currentUserEmail={currentUserEmail}
        onUserAuthenticated={(profile) => {
          setCurrentUserEmail(profile.email);
          loadTasks();
        }}
      />
    </div>
  );
}

export default App;
