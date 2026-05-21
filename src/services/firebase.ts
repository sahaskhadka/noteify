import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged 
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  where, 
  orderBy, 
  onSnapshot,
  getDocs,
  serverTimestamp 
} from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Your Firebase config - REPLACE WITH YOUR ACTUAL CONFIG
const firebaseConfig = {
  apiKey: "AIzaSyApJsQKdVeRUQlh51rSGlRdmh55fBRsX3M",

  authDomain: "notes-app-6db3f.firebaseapp.com",

  projectId: "notes-app-6db3f",

  storageBucket: "notes-app-6db3f.firebasestorage.app",

  messagingSenderId: "905447887896",

  appId: "1:905447887896:web:c5cb89f48225f1fbe9df6d",

  measurementId: "G-NJY2YQTP5B"

};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const googleProvider = new GoogleAuthProvider();

// Export all the functions you need
export { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  where, 
  orderBy, 
  onSnapshot,
  getDocs,
  serverTimestamp,
  signInWithPopup,
  signOut,
  onAuthStateChanged
};

// Export User type
export type { User } from 'firebase/auth';