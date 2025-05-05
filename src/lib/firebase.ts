// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  onAuthStateChanged, 
  signOut, 
  User,
  GoogleAuthProvider,
  signInWithPopup
} from "firebase/auth";
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  deleteDoc, 
  updateDoc, 
  addDoc, 
  serverTimestamp
} from "firebase/firestore";

// Your web app's Firebase configuration
// Replace these with your actual Firebase config values
const firebaseConfig = {
    apiKey: "AIzaSyClOkPNMu0NI-8Y-v6Mv_3h2YL9JLqXBo8",
    authDomain: "traveling-6361c.firebaseapp.com",
    projectId: "traveling-6361c",
    storageBucket: "traveling-6361c.firebasestorage.app",
    messagingSenderId: "949226939838",
    appId: "1:949226939838:web:e89fae487ba24af212c5ef",
    measurementId: "G-1CR7P4F9Q8"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

// Don't attempt to use emulators in production
// We're removing the emulator connections since they're not running
// If you want to use emulators, you need to start them first with:
// firebase emulators:start

export { 
  auth, 
  db,
  googleProvider,
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  onAuthStateChanged, 
  signOut,
  signInWithPopup,
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  deleteDoc,
  updateDoc,
  addDoc,
  serverTimestamp
}; 