import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import TaskModal from './components/TaskModal';
import UserAuthModal from './components/UserAuthModal';
import UserProfileModal from './components/UserProfileModal';
import SpiderWebIntro from './components/SpiderWebIntro';
import DashboardView from './pages/DashboardView';
import TasksView from './pages/TasksView';
import AIAssistantView from './pages/AIAssistantView';
import SettingsView from './pages/SettingsView';
import { 
  fetchTasks, 
  createTask, 
  updateTask, 
  deleteTask, 
  completeTask, 
  getCurrentUser,
  loginUser 
} from './services/api';
import {
  syncTaskToFirestore,
  deleteTaskFromFirestore,
  logoutFirebase
} from './services/firebase';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [tasks, setTasks] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUserAuthOpen, setIsUserAuthOpen] = useState(false);
  const [isUserProfileOpen, setIsUserProfileOpen] = useState(false);
  const [showWebIntro, setShowWebIntro] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);
  const [initialAIPrompt, setInitialAIPrompt] = useState('');

  // Initialize or restore user session
  const initializeUserSession = async () => {
    const savedEmail = localStorage.getItem('spidy_user_email');
    if (savedEmail) {
      try {
        const userProfile = await getCurrentUser();
        setCurrentUser(userProfile);
      } catch (err) {
        console.warn('Session verification error, trying auto-login:', err);
        try {
          const fallback = await loginUser(savedEmail);
          setCurrentUser(fallback);
        } catch (loginErr) {
          console.warn('Authentication required:', loginErr);
          setIsUserAuthOpen(true);
        }
      }
    } else {
      // Default to demo user for a frictionless out-of-the-box experience
      try {
        const demoUser = await loginUser('demo@spidy.ai', 'demo123');
        localStorage.setItem('spidy_user_email', demoUser.email);
        localStorage.setItem('spidy_user_name', demoUser.name);
        if (demoUser.token) localStorage.setItem('spidy_auth_token', demoUser.token);
        setCurrentUser(demoUser);
      } catch (e) {
        setIsUserAuthOpen(true);
      }
    }
  };

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
    initializeUserSession();
  }, []);

  useEffect(() => {
    loadTasks();
  }, [searchQuery, currentUser]);

  // Handle Logout
  const handleLogout = () => {
    logoutFirebase().catch(console.warn);
    localStorage.removeItem('spidy_user_email');
    localStorage.removeItem('spidy_user_name');
    localStorage.removeItem('spidy_auth_token');
    localStorage.removeItem('spidy_gemini_key');
    setCurrentUser(null);
    setIsUserProfileOpen(false);
    setIsUserAuthOpen(true);
  };

  // Task Actions
  const handleCreateOrUpdateTask = async (taskData) => {
    try {
      let savedTask;
      if (selectedTask) {
        savedTask = await updateTask(selectedTask.id, taskData);
      } else {
        savedTask = await createTask(taskData);
      }
      if (currentUser?.email && savedTask) {
        syncTaskToFirestore(currentUser.email, savedTask).catch(console.warn);
      }
      setSelectedTask(null);
      loadTasks();
    } catch (err) {
      alert(`Operation failed: ${err.message}`);
    }
  };

  const handleCompleteTask = async (taskId) => {
    try {
      const updated = await completeTask(taskId);
      if (currentUser?.email && updated) {
        syncTaskToFirestore(currentUser.email, updated).catch(console.warn);
      }
      loadTasks();
    } catch (err) {
      alert(`Complete task failed: ${err.message}`);
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm("Are you sure you want to delete this task?")) return;
    try {
      await deleteTask(taskId);
      if (currentUser?.email) {
        deleteTaskFromFirestore(currentUser.email, taskId).catch(console.warn);
      }
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
    <div className="flex min-h-screen bg-[#0b0f19] text-slate-100 font-sans relative">
      {/* Spider-Man Web Spray Opening Animation Overlay */}
      {showWebIntro && (
        <SpiderWebIntro
          isOpen={showWebIntro}
          onComplete={() => setShowWebIntro(false)}
        />
      )}

      {/* Navigation Sidebar */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        currentUser={currentUser}
        onOpenProfile={() => setIsUserProfileOpen(true)}
        onOpenUserAuth={() => setIsUserAuthOpen(true)}
      />

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
          currentUser={currentUser}
          onOpenUserAuth={() => setIsUserAuthOpen(true)}
          onOpenProfile={() => setIsUserProfileOpen(true)}
          onTriggerWebIntro={() => setShowWebIntro(true)}
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
              currentUserEmail={currentUser?.email}
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

      {/* User Authentication & Login/Registration Modal */}
      <UserAuthModal
        isOpen={isUserAuthOpen}
        onClose={() => setIsUserAuthOpen(false)}
        currentUserEmail={currentUser?.email}
        onUserAuthenticated={(profile) => {
          setCurrentUser(profile);
          loadTasks();
        }}
      />

      {/* User Profile & Account Drawer Modal */}
      <UserProfileModal
        isOpen={isUserProfileOpen}
        onClose={() => setIsUserProfileOpen(false)}
        currentUser={currentUser}
        onLogout={handleLogout}
        onProfileUpdated={() => {
          getCurrentUser().then(setCurrentUser).catch(console.error);
        }}
      />
    </div>
  );
}

export default App;
