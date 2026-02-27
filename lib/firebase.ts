import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Initialize Firebase with your config
// Add your Firebase config here
const firebaseConfig = {
  apiKey: "AIzaSyCxCQkiJH5J7YE_HZyLYBmy5OAqBgdOczg",
  authDomain: "trading-b3f9f.firebaseapp.com",
  projectId: "trading-b3f9f",
  storageBucket: "trading-b3f9f.firebasestorage.app",
  messagingSenderId: "493660398070",
  appId: "1:493660398070:web:d468310159212104aba7d7",
  measurementId: "G-SZ70GZXYWQ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication
export const auth = getAuth(app);

// Initialize Firestore
export const db = getFirestore(app);

export default app;
