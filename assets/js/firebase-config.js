/**
 * AutoMart - Firebase Configuration
 * 
 * SETUP INSTRUCTIONS:
 * 1. Go to https://console.firebase.google.com
 * 2. Create a new project named "automart"
 * 3. Enable Firestore Database (start in test mode, then apply rules below)
 * 4. Enable Firebase Storage
 * 5. Enable Firebase Authentication → Email/Password
 * 6. Go to Project Settings → General → Your Apps → Add Web App
 * 7. Copy your config values below
 * 8. Replace EVERY placeholder value with your actual Firebase config
 */

// ⚠️  REPLACE THESE WITH YOUR ACTUAL FIREBASE CONFIG VALUES
const firebaseConfig = {
  apiKey:            "YOUR_API_KEY",
  authDomain:        "YOUR_PROJECT_ID.firebaseapp.com",
  projectId:         "YOUR_PROJECT_ID",
  storageBucket:     "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId:             "YOUR_APP_ID",
  measurementId:     "YOUR_MEASUREMENT_ID"
};

// ── Import Firebase modules (ES modules via CDN) ─────────────────────────────
import { initializeApp }                         from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getFirestore, collection, doc,
         getDocs, getDoc, addDoc, updateDoc,
         deleteDoc, query, where, orderBy,
         limit, onSnapshot, serverTimestamp,
         writeBatch, increment }                 from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { getStorage, ref, uploadBytesResumable,
         getDownloadURL, deleteObject,
         listAll }                               from "https://www.gstatic.com/firebasejs/10.12.0/firebase-storage.js";
import { getAuth, signInWithEmailAndPassword,
         signOut, onAuthStateChanged,
         setPersistence, browserLocalPersistence} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

// ── Initialize ────────────────────────────────────────────────────────────────
const app  = initializeApp(firebaseConfig);
const db   = getFirestore(app);
const storage = getStorage(app);
const auth = getAuth(app);

// ── Export everything ─────────────────────────────────────────────────────────
export {
  app, db, storage, auth,
  collection, doc, getDocs, getDoc, addDoc, updateDoc, deleteDoc,
  query, where, orderBy, limit, onSnapshot, serverTimestamp, writeBatch, increment,
  ref, uploadBytesResumable, getDownloadURL, deleteObject, listAll,
  signInWithEmailAndPassword, signOut, onAuthStateChanged,
  setPersistence, browserLocalPersistence
};

// ── Firestore Security Rules (paste in Firebase Console → Firestore → Rules) ─
/*
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Cars collection — public read, admin write only
    match /cars/{carId} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.token.email == 'admin@automart.in';
    }

    // Collections
    match /collections/{colId} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.token.email == 'admin@automart.in';
    }

    // Settings
    match /settings/{doc} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.token.email == 'admin@automart.in';
    }

    // Enquiries — public write (forms), admin read
    match /enquiries/{id} {
      allow create: if true;
      allow read, update, delete: if request.auth != null;
    }
  }
}
*/

// ── Storage Rules (paste in Firebase Console → Storage → Rules) ──────────────
/*
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /cars/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
*/
