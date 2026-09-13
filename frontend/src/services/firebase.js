import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  updateProfile,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  deleteDoc, 
  onSnapshot, 
  query,
  getDocs,
  writeBatch
} from 'firebase/firestore';

// Default project configuration for spidy-task
export const DEFAULT_FIREBASE_CONFIG = {
  apiKey: "AIzaSyC6Gr9EHvvV53wMptBV18YAxs2PKsbp0eM",
  authDomain: "spidy-task.firebaseapp.com",
  projectId: "spidy-task",
  storageBucket: "spidy-task.firebasestorage.app",
  messagingSenderId: "1033453207310",
  appId: "1:1033453207310:web:01f6fc44e98b3a7f8ee15f",
  measurementId: "G-TQPG80T1Y1"
};

// Retrieve active Firebase configuration with fallback
export const getActiveFirebaseConfig = () => {
  try {
    const saved = localStorage.getItem('spidy_firebase_config');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.apiKey && parsed.projectId) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('[Firebase Config Check]:', e);
  }

  // Check Vite environment variables, otherwise fall back to pre-configured spidy-task credentials
  const envConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
    appId: import.meta.env.VITE_FIREBASE_APP_ID || '',
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || ''
  };

  if (envConfig.apiKey && envConfig.projectId) {
    return envConfig;
  }

  return DEFAULT_FIREBASE_CONFIG;
};

export const saveFirebaseConfig = (config) => {
  try {
    localStorage.setItem('spidy_firebase_config', JSON.stringify(config));
    window.dispatchEvent(new Event('spidy_firebase_config_updated'));
    return true;
  } catch (e) {
    console.error('[Firebase Save Config Error]:', e);
    return false;
  }
};

export const isFirebaseConfigured = () => {
  const cfg = getActiveFirebaseConfig();
  return Boolean(cfg.apiKey && cfg.projectId && cfg.apiKey.length > 5);
};

// Singleton App, Auth, and Firestore instances
let appInstance = null;
let authInstance = null;
let dbInstance = null;
let googleProviderInstance = null;

export const initFirebase = () => {
  const config = getActiveFirebaseConfig();
  if (!isFirebaseConfigured()) {
    return { app: null, auth: null, db: null };
  }

  try {
    if (!getApps().length) {
      appInstance = initializeApp(config);
    } else {
      appInstance = getApp();
    }
    authInstance = getAuth(appInstance);
    dbInstance = getFirestore(appInstance);
    googleProviderInstance = new GoogleAuthProvider();
    googleProviderInstance.setCustomParameters({ prompt: 'select_account' });
    return { app: appInstance, auth: authInstance, db: dbInstance };
  } catch (err) {
    console.warn('[Firebase Init Warning]:', err);
    return { app: null, auth: null, db: null };
  }
};

// Initialize immediately on bundle load
initFirebase();

// 1-Click Google Sign-In
export const signInWithGoogle = async () => {
  const { auth, db } = initFirebase();
  if (!auth) {
    throw new Error('Firebase credentials are not configured.');
  }
  const result = await signInWithPopup(auth, googleProviderInstance);
  const user = result.user;

  const userProfile = {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName || 'Hero Spider-Agent',
    photoURL: user.photoURL,
    provider: 'google',
    lastLoginAt: new Date().toISOString()
  };

  // Sync profile to Firestore
  if (db) {
    try {
      const userRef = doc(db, 'users', user.uid);
      await setDoc(userRef, userProfile, { merge: true });
    } catch (e) {
      console.warn('[Firestore User Profile Sync Notice]:', e);
    }
  }

  return userProfile;
};

// Firebase Email Sign-In
export const signInWithFirebase = async (email, password) => {
  const { auth, db } = initFirebase();
  if (!auth) {
    throw new Error('Firebase credentials are not configured.');
  }
  const credential = await signInWithEmailAndPassword(auth, email, password);
  const user = credential.user;

  const userProfile = {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName || email.split('@')[0],
    provider: 'password',
    lastLoginAt: new Date().toISOString()
  };

  if (db) {
    try {
      const userRef = doc(db, 'users', user.uid);
      await setDoc(userRef, userProfile, { merge: true });
    } catch (e) {
      console.warn('[Firestore User Profile Sync Notice]:', e);
    }
  }

  return userProfile;
};

// Firebase Email Sign-Up
export const signUpWithFirebase = async (name, email, password) => {
  const { auth, db } = initFirebase();
  if (!auth) {
    throw new Error('Firebase credentials are not configured.');
  }
  const credential = await createUserWithEmailAndPassword(auth, email, password);
  const user = credential.user;

  if (name && auth.currentUser) {
    try {
      await updateProfile(auth.currentUser, { displayName: name });
    } catch (e) {
      console.warn('[Firebase UpdateProfile]:', e);
    }
  }

  const userProfile = {
    uid: user.uid,
    email: user.email,
    displayName: name || user.displayName || email.split('@')[0],
    provider: 'password',
    createdAt: new Date().toISOString(),
    lastLoginAt: new Date().toISOString()
  };

  if (db) {
    try {
      const userRef = doc(db, 'users', user.uid);
      await setDoc(userRef, userProfile, { merge: true });
    } catch (e) {
      console.warn('[Firestore User Profile Sync Notice]:', e);
    }
  }

  return userProfile;
};

// Firebase Auth State Observer
export const subscribeToAuthState = (callback) => {
  const { auth } = initFirebase();
  if (!auth) return () => {};
  return onAuthStateChanged(auth, (firebaseUser) => {
    if (firebaseUser) {
      callback({
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        displayName: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Spider Hero',
        photoURL: firebaseUser.photoURL,
        isAnonymous: firebaseUser.isAnonymous
      });
    } else {
      callback(null);
    }
  });
};

// Firebase Sign Out
export const logoutFirebase = async () => {
  const { auth } = initFirebase();
  if (auth) {
    await signOut(auth);
  }
};

// Real-time Firestore Task Syncing
export const syncTaskToFirestore = async (userId, task) => {
  const { db } = initFirebase();
  if (!db || !userId || !task?.id) return;
  try {
    const taskRef = doc(db, 'users', String(userId), 'tasks', String(task.id));
    await setDoc(taskRef, {
      ...task,
      updated_at: new Date().toISOString()
    }, { merge: true });
  } catch (err) {
    console.warn('[Firestore Task Sync Notice]:', err);
  }
};

export const deleteTaskFromFirestore = async (userId, taskId) => {
  const { db } = initFirebase();
  if (!db || !userId || !taskId) return;
  try {
    const taskRef = doc(db, 'users', String(userId), 'tasks', String(taskId));
    await deleteDoc(taskRef);
  } catch (err) {
    console.warn('[Firestore Task Delete Notice]:', err);
  }
};

// Listen to Firestore tasks in real time
export const listenToFirestoreTasks = (userId, callback) => {
  const { db } = initFirebase();
  if (!db || !userId) return () => {};
  try {
    const tasksCollection = collection(db, 'users', String(userId), 'tasks');
    const q = query(tasksCollection);
    return onSnapshot(q, (snapshot) => {
      const items = [];
      snapshot.forEach((docSnap) => {
        items.push({ id: docSnap.id, ...docSnap.data() });
      });
      callback(items);
    }, (error) => {
      console.warn('[Firestore Listener Notice]:', error);
    });
  } catch (err) {
    console.warn('[Firestore Listener Error]:', err);
    return () => {};
  }
};

// Seed default initial tasks into user's Firestore collection if empty
export const seedInitialTasksToFirestore = async (userId, defaultTasks) => {
  const { db } = initFirebase();
  if (!db || !userId || !defaultTasks?.length) return;
  try {
    const tasksCollection = collection(db, 'users', String(userId), 'tasks');
    const existing = await getDocs(tasksCollection);
    if (!existing.empty) return; // Already has tasks

    const batch = writeBatch(db);
    defaultTasks.forEach((task) => {
      const taskRef = doc(db, 'users', String(userId), 'tasks', String(task.id));
      batch.set(taskRef, {
        ...task,
        created_at: task.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
    });
    await batch.commit();
    console.log(`[Firestore] Successfully seeded ${defaultTasks.length} initial tasks for user ${userId}`);
  } catch (err) {
    console.warn('[Firestore Seed Notice]:', err);
  }
};
