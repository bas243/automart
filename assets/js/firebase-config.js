// Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyAPFvG7RYlWFp74hvRYD91HG5huiLIejWk",
  authDomain: "automart-d0de4.firebaseapp.com",
  projectId: "automart-d0de4",
  messagingSenderId: "712170367229",
  appId: "1:712170367229:web:db224f5766c2b5586a7694",
  measurementId: "G-ZZQC3DNFRS"
};

// ── Import Firebase modules ─────────────────────────────────────────────
import { initializeApp }
from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";

import {
  getFirestore,
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  serverTimestamp,
  writeBatch,
  increment
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

import {
  getAuth,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  setPersistence,
  browserLocalPersistence
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

// ── Initialize Firebase ────────────────────────────────────────────────
const app = initializeApp(firebaseConfig);

const db = getFirestore(app);
const auth = getAuth(app);

// ── Export everything ──────────────────────────────────────────────────
export {
  app,
  db,
  auth,

  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  serverTimestamp,
  writeBatch,
  increment,

  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  setPersistence,
  browserLocalPersistence
};

// ── Firestore Security Rules ───────────────────────────────────────────
/*
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    match /cars/{carId} {
      allow read: if true;
      allow write: if request.auth != null &&
                   request.auth.token.email == 'admin@automart.in';
    }

    match /collections/{colId} {
      allow read: if true;
      allow write: if request.auth != null &&
                   request.auth.token.email == 'admin@automart.in';
    }

    match /settings/{doc} {
      allow read: if true;
      allow write: if request.auth != null &&
                   request.auth.token.email == 'admin@automart.in';
    }

    match /enquiries/{id} {
      allow create: if true;
      allow read, update, delete: if request.auth != null;
    }
  }
}
*/
