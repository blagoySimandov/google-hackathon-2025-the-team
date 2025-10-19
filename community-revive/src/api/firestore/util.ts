import { initializeApp, getApps, FirebaseApp } from "firebase/app";
import { getFirestore, Firestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyC4_YFmoBHs5ZYawyfyfRQle9FUwk7ntkQ",
  authDomain: "bgn-ie-hack25dub-703.firebaseapp.com",
  projectId: "bgn-ie-hack25dub-703",
  storageBucket: "bgn-ie-hack25dub-703.firebasestorage.app",
  messagingSenderId: "787975703727",
  appId: "1:787975703727:web:1f39d74ac5659dc91fd85a",
};

let app: FirebaseApp | null = null;
let db: Firestore | null = null;

export const initializeAppIfNeeded = () => {
  const apps = getApps();

  if (apps.length === 0) {
    app = initializeApp(firebaseConfig);
    db = getFirestore(app);
  } else {
    app = apps[0];
    db = getFirestore(app);
  }

  return { app, db };
};

export const getFirestoreInstance = () => {
  const { db } = initializeAppIfNeeded();
  if (!db) {
    throw new Error("Firestore instance not initialized");
  }
  return db;
};
