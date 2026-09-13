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
import defaultTasksData from './data/defaultTasks.json';
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
  listenToFirestoreTasks,
  seedInitialTasksToFirestore,
  subscribeToAuthState,
  logoutFirebase
} from './services/firebase';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [tasks, setTasks] = useState(defaultTasksData || []);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUserAuthOpen, setIsUserAuthOpen] = useState(false);
  const [isUserProfileOpen, setIsUserProfileOpen] = useState(false);
  const [showWebIntro, setShowWebIntro] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);
  const [initialAIPrompt, setInitialAIPrompt] = useState('');

  // 1. Subscribe to Firebase Auth state
  useEffect(() => {
    const unsubscribeAuth = subscribeToAuthState((firebaseUser) => {
      if (firebaseUser) {
        setCurrentUser(prev => ({
          ...(prev || {}),
          ...firebaseUser,
          name: firebaseUser.displayName || prev?.name || 'Spider Hero'
        }));
        localStorage.setItem('spidy_user_email', firebaseUser.email);
        localStorage.setItem('spidy_user_name', firebaseUser.displayName || 'Spider Hero');
        if (firebaseUser.uid) {
          localStorage.setItem('spidy_user_uid', firebaseUser.uid);
        }
      }
    });

    return () => unsubscribeAuth();
  }, []);

  // 2. Initialize or restore session from localStorage or demo
  const initializeUserSession = async () => {
    const savedEmail = localStorage.getItem('spidy_user_email');
    const savedName = localStorage.getItem('spidy_user_name');
    const savedUid = localStorage.getItem('spidy_user_uid');

    if (savedEmail) {
      setCurrentUser({
        email: savedEmail,
        name: savedName || 'Spider Hero',
        displayName: savedName || 'Spider Hero',
        uid: savedUid || savedEmail
      });
      try {
        const userProfile = await getCurrentUser();
        setCurrentUser(prev => ({ ...(prev || {}), ...userProfile }));
      } catch (err) {
        console.log('[Direct Firebase Mode]: Session restored locally');
      }
    } else {
      // Out-of-the-box demo agent
      const demoUser = {
        email: 'demo@spidy.ai',
        name: 'Spider Hero',
        displayName: 'Spider Hero',
        uid: 'demo-hero-uid'
      };
      localStorage.setItem('spidy_user_email', demoUser.email);
      localStorage.setItem('spidy_user_name', demoUser.name);
      localStorage.setItem('spidy_user_uid', demoUser.uid);
      setCurrentUser(demoUser);
    }
  };

  // 3. Real-time Firestore sync for tasks
  useEffect(() => {
    const userIdentifier = currentUser?.uid || currentUser?.email;
    if (!userIdentifier) return;

    // Listen to real-time changes in Firestore
    const unsubscribeFirestore = listenToFirestoreTasks(userIdentifier, (firestoreTasks) => {
      if (firestoreTasks && firestoreTasks.length > 0) {
        setTasks(firestoreTasks);
      } else {
        // Seed default 25 tasks into user's Firestore on first connection
        seedInitialTasksToFirestore(userIdentifier, defaultTasksData);
        setTasks(defaultTasksData);
      }
    });

    return () => unsubscribeFirestore();
  }, [currentUser?.uid, currentUser?.email]);

  // 4. Load Tasks from Backend API (if available) with fallback to default tasks
  const loadTasks = async () => {
    try {
      const data = await fetchTasks({ search: searchQuery || undefined });
      if (data && data.length > 0) {
        setTasks(data);
        return;
      }
    } catch (err) {
      console.log('[Direct Firebase Mode]: Serving tasks from Cloud Firestore / cache');
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
    localStorage.removeItem('spidy_user_uid');
    localStorage.removeItem('spidy_auth_token');
    localStorage.removeItem('spidy_gemini_key');
    setCurrentUser(null);
    setIsUserProfileOpen(false);
    setIsUserAuthOpen(true);
  };

  // Task Actions
  const handleCreateOrUpdateTask = async (taskData) => {
    try {
      const userIdentifier = currentUser?.uid || currentUser?.email;
      let savedTask = null;
      try {
        if (selectedTask) {
          savedTask = await updateTask(selectedTask.id, taskData);
        } else {
          savedTask = await createTask(taskData);
        }
      } catch (backendErr) {
        // Direct client/cloud creation
        savedTask = {
          id: selectedTask ? selectedTask.id : Date.now(),
          ...taskData,
          status: selectedTask ? selectedTask.status : 'pending',
          created_at: selectedTask?.created_at || new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
      }

      // Sync to Cloud Firestore
      if (userIdentifier && savedTask) {
        await syncTaskToFirestore(userIdentifier, savedTask);
      }

      setSelectedTask(null);
      // Optimistic update
      setTasks(prev => {
        const index = prev.findIndex(t => String(t.id) === String(savedTask.id));
        if (index >= 0) {
          const copy = [...prev];
          copy[index] = savedTask;
          return copy;
        }
        return [savedTask, ...prev];
      });
      loadTasks();
    } catch (err) {
      alert(`Operation failed: ${err.message}`);
    }
  };

  const handleCompleteTask = async (taskId) => {
    try {
      const userIdentifier = currentUser?.uid || currentUser?.email;
      let updated = null;
      try {
        updated = await completeTask(taskId);
      } catch (backendErr) {
        const existing = tasks.find(t => String(t.id) === String(taskId));
        if (existing) {
          updated = { 
            ...existing, 
            status: existing.status === 'completed' ? 'pending' : 'completed',
            updated_at: new Date().toISOString()
          };
        }
      }

      if (userIdentifier && updated) {
        await syncTaskToFirestore(userIdentifier, updated);
      }

      setTasks(prev => prev.map(t => String(t.id) === String(taskId) ? (updated || { ...t, status: t.status === 'completed' ? 'pending' : 'completed' }) : t));
    } catch (err) {
      alert(`Complete task failed: ${err.message}`);
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm("Are you sure you want to delete this task?")) return;
    try {
      const userIdentifier = currentUser?.uid || currentUser?.email;
      try {
        await deleteTask(taskId);
      } catch (backendErr) {
        console.log('[Backend delete skipped, deleting from Firestore]');
      }
      if (userIdentifier) {
        await deleteTaskFromFirestore(userIdentifier, taskId);
      }
      setTasks(prev => prev.filter(t => String(t.id) !== String(taskId)));
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

  // Filter tasks if searchQuery is active
  const displayedTasks = searchQuery 
    ? tasks.filter(t => 
        (t.title && t.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (t.description && t.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (t.category && t.category.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : tasks;

  // Stats calculation
  const pendingCount = displayedTasks.filter(t => t.status === 'pending').length;
  const completedCount = displayedTasks.filter(t => t.status === 'completed').length;

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
              tasks={displayedTasks}
              onComplete={handleCompleteTask}
              onOpenModal={() => { setSelectedTask(null); setIsModalOpen(true); }}
              onSwitchToAI={handleSwitchToAI}
              onEditTask={handleOpenEditModal}
            />
          )}

          {activeTab === 'tasks' && (
            <TasksView
              tasks={displayedTasks}
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
