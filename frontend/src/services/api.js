import axios from 'axios';

const API_BASE_URL = 'http://127.0.0.1:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const userEmail = localStorage.getItem('spidy_user_email');
  if (userEmail) {
    config.headers['X-User-Email'] = userEmail;
  }
  return config;
});

export const fetchHealth = async () => {
  const res = await api.get('/health');
  return res.data;
};

export const loginOrRegisterUser = async (email, name = null, credentials = null) => {
  const res = await api.post('/api/users/login', { email, name, credentials });
  return res.data;
};

export const updateUserCredentials = async (email, credentials) => {
  const res = await api.put('/api/users/credentials', { email, credentials });
  return res.data;
};

export const fetchUserAnalytics = async (email) => {
  const res = await api.get('/api/users/analytics', { params: { email } });
  return res.data;
};

export const fetchTasks = async (params = {}) => {
  const res = await api.get('/api/tasks', { params });
  return res.data;
};

export const fetchTaskById = async (taskId) => {
  const res = await api.get(`/api/tasks/${taskId}`);
  return res.data;
};

export const createTask = async (taskData) => {
  const res = await api.post('/api/tasks', taskData);
  return res.data;
};

export const updateTask = async (taskId, updateData) => {
  const res = await api.patch(`/api/tasks/${taskId}`, updateData);
  return res.data;
};

export const deleteTask = async (taskId) => {
  const res = await api.delete(`/api/tasks/${taskId}`);
  return res.data;
};

export const completeTask = async (taskId) => {
  const res = await api.post(`/api/tasks/${taskId}/complete`);
  return res.data;
};

export const sendChatMessage = async (message, conversationId = null) => {
  const res = await api.post('/api/ai/chat', { message, conversation_id: conversationId });
  return res.data;
};

export const generateTaskBreakdown = async (goal, category = 'general') => {
  const res = await api.post('/api/ai/task-breakdown', { goal, category });
  return res.data;
};

export const acceptTaskBreakdown = async (breakdownData) => {
  const res = await api.post('/api/ai/accept-breakdown', breakdownData);
  return res.data;
};

export const prioritizeTasks = async () => {
  const res = await api.post('/api/ai/prioritize');
  return res.data;
};

export const autoExecuteGoal = async (goal, category = 'Project') => {
  const userEmail = localStorage.getItem('spidy_user_email') || 'default@example.com';
  const res = await api.post('/api/ai/auto-execute-goal', { goal, category, email: userEmail });
  return res.data;
};

export const solveParentSubtasks = async (parentTaskId) => {
  const res = await api.post(`/api/ai/solve-subtasks/${parentTaskId}`);
  return res.data;
};

export default api;
