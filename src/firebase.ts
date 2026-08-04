import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, getDocs, setDoc, updateDoc, query, where, addDoc, getDoc, getDocFromServer } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import config from '../firebase-applet-config.json';

// Initialize Firebase
const app = initializeApp(config);
export const db = getFirestore(app, config.firestoreDatabaseId);
export const auth = getAuth(app);

// Collection helper exports
export const usersRef = collection(db, 'users');
export const transactionsRef = collection(db, 'transactions');
export const platformsRef = collection(db, 'platforms');
export const settingsRef = collection(db, 'settings');

