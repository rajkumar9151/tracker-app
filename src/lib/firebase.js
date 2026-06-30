import { initializeApp, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

const apps = getApps();

let app;
if (!apps.length) {
  try {
    app = initializeApp({
      projectId: 'tracker-app-2a551',
    });
  } catch (error) {
    console.error('Firebase initialization error', error.stack);
  }
} else {
  app = apps[0];
}

export const db = getFirestore(app);
