import * as admin from "firebase-admin";

const initializeFirebaseAdmin = () => {
  if (admin.apps.length > 0) return admin.app();

  try {
    let key = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
    
    if (!key) {
      console.error("DIAGNOSTIC: FIREBASE_SERVICE_ACCOUNT_KEY is UNDEFINED or EMPTY in Vercel.");
      return null;
    }

    console.log("DIAGNOSTIC: Found FIREBASE_SERVICE_ACCOUNT_KEY. Length:", key.length);

    // Clean quotes
    if (key.startsWith('"') && key.endsWith('"')) {
      key = key.slice(1, -1);
    }

    // Fix escaped newlines
    const sanitizedKey = key.replace(/\\n/g, '\n');

    const serviceAccount = JSON.parse(sanitizedKey);
    console.log("DIAGNOSTIC: Successfully parsed JSON. Project ID:", serviceAccount.project_id);

    return admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      databaseURL: `https://${serviceAccount.project_id}.firebaseio.com`,
    });
  } catch (error) {
    console.error("DIAGNOSTIC: CRITICAL failure in initializeFirebaseAdmin:", error);
    return null;
  }
};

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

export const adminAuth = admin.apps.length ? admin.auth() : null as any;
export const adminDb = admin.apps.length ? admin.firestore() : null as any;
export const adminStorage = admin.apps.length ? admin.storage() : null as any;
