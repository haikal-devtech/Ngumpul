import * as admin from "firebase-admin";

const getServiceAccount = () => {
  const key = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  if (!key) {
    console.warn("FIREBASE_SERVICE_ACCOUNT_KEY is missing");
    return null;
  }
  try {
    return JSON.parse(key);
  } catch (e) {
    console.error("Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY:", e);
    return null;
  }
};

const serviceAccount = getServiceAccount();

if (!admin.apps.length && serviceAccount) {

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: `https://${serviceAccount.project_id}.firebaseio.com`,
  });
}

const adminAuth = admin.apps.length ? admin.auth() : null as any;
const adminDb = admin.apps.length ? admin.firestore() : null as any;
const adminStorage = admin.apps.length ? admin.storage() : null as any;

export { adminAuth, adminDb, adminStorage };

