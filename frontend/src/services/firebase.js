import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
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
  query 
} from 'firebase/firestore';

// Default Firebase config reads from environment variables or saved local settings
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

  return {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
    appId: import.meta.env.VITE_FIREBASE_APP_ID || '',
  };
};

export const saveFirebaseConfig = (config) => {
  try {
    localStorage.setItem('spidy_firebase_config', JSON.stringify(config));
    // Trigger window event so other components update immediately
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

// Initial initialization attempt
initFirebase();

// 1-Click Google Sign-In
export const signInWithGoogle = async () => {
  const { auth } = initFirebase();
  if (!auth) {
    throw new Error('Firebase credentials are not configured yet. Please configure your Firebase project in Suit Config.');
  }
  const result = await signInWithPopup(auth, googleProviderInstance);
  const user = result.user;
  return {
    email: user.email,
    displayName: user.displayName || 'Hero Spider-Agent',
    photoURL: user.photoURL,
    uid: user.uid
  };
};

// Firebase Email Sign-In
export const signInWithFirebase = async (email, password) => {
  const { auth } = initFirebase();
  if (!auth) {
    throw new Error('Firebase credentials are not configured.');
  }
  const credential = await signInWithEmailAndPassword(auth, email, password);
  return credential.user;
};

// Firebase Email Sign-Up
export const signUpWithFirebase = async (email, password) => {
  const { auth } = initFirebase();
  if (!auth) {
    throw new Error('Firebase credentials are not configured.');
  }
  const credential = await createUserWithEmailAndPassword(auth, email, password);
  return credential.user;
};

// Firebase Sign Out
export const logoutFirebase = async () => {
  const { auth } = initFirebase();
  if (auth) {
    await signOut(auth);
  }
};

// Real-time Firestore Task Syncing
export const syncTaskToFirestore = async (userEmail, task) => {
  const { db } = initFirebase();
  if (!db || !userEmail || !task?.id) return;
  try {
    const taskRef = doc(db, 'users', userEmail, 'tasks', String(task.id));
    await setDoc(taskRef, {
      ...task,
      updated_at: new Date().toISOString()
    }, { merge: true });
  } catch (err) {
    console.warn('[Firestore Sync Notice]:', err);
  }
};

export const deleteTaskFromFirestore = async (userEmail, taskId) => {
  const { db } = initFirebase();
  if (!db || !userEmail || !taskId) return;
  try {
    const taskRef = doc(db, 'users', userEmail, 'tasks', String(taskId));
    await deleteDoc(taskRef);
  } catch (err) {
    console.warn('[Firestore Delete Notice]:', err);
  }
};

// Listen to Firestore tasks in real time
export const listenToFirestoreTasks = (userEmail, callback) => {
  const { db } = initFirebase();
  if (!db || !userEmail) return () => {};
  try {
    const tasksCollection = collection(db, 'users', userEmail, 'tasks');
    const q = query(tasksCollection);
    return onSnapshot(q, (snapshot) => {
      const items = [];
      snapshot.forEach((doc) => {
        items.push({ id: doc.id, ...doc.data() });
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
