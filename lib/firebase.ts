import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// ============================================================
// PASTE YOUR FIREBASE CONFIG KEYS HERE.
// You can find these in the Firebase Console:
// Project Settings > General > Your apps > SDK setup and configuration
// ============================================================
const firebaseConfig = {
  apiKey: "AIzaSyD2Vd6z34GqpIAejFLtdG81DUELnLOEckE",
  authDomain: "scholix-247eb.firebaseapp.com",
  projectId: "scholix-247eb",
  storageBucket: "scholix-247eb.firebasestorage.app",
  messagingSenderId: "354309787800",
  appId: "1:354309787800:web:c46a3ff63ff20f0a1500ed",
  measurementId: "G-J0QFLS7B9K"
};
// ============================================================

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export default app;
