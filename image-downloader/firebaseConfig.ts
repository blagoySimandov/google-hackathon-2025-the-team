import admin from "firebase-admin";

const app = admin.initializeApp();

export const db = admin.firestore(app);
export const storage = admin.storage(app);
export const bucket = storage.bucket(
  "bgn-ie-hack25dub-703.firebasestorage.app",
);
