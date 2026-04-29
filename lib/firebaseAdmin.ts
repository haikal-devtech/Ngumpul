import * as admin from "firebase-admin";

const initializeFirebaseAdmin = () => {
  if (admin.apps.length > 0) return admin.app();

  try {
    let key = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
    
    if (!key) {
      console.error("FIREBASE_SERVICE_ACCOUNT_KEY is missing!");
      return null;
    }

    if (key.startsWith('"') && key.endsWith('"')) {
      key = key.slice(1, -1);
    }

    const sanitizedKey = key.replace(/\\n/g, '\n');
    const serviceAccount = JSON.parse(sanitizedKey);

    return admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      databaseURL: `https://${serviceAccount.project_id}.firebaseio.com`,
    });
  } catch (error) {
    console.error("CRITICAL: Failed to initialize Firebase Admin SDK:", error);
    return null;
  }
};

// Export getters to ensure we always get the initialized instance
export const getAdminAuth = () => {
  initializeFirebaseAdmin();
  return admin.auth();
};

export const getAdminDb = () => {
  initializeFirebaseAdmin();
  return admin.firestore();
};

export const getAdminStorage = () => {
  initializeFirebaseAdmin();
  return admin.storage();
};

// Keep old exports for compatibility but point to getters if needed, 
// or just export the initialized instances if they exist
export const adminAuth = admin.apps.length ? admin.auth() : null;
export const adminDb = admin.apps.length ? admin.firestore() : null;
export const adminStorage = admin.apps.length ? admin.storage() : null;
