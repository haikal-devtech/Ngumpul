import * as admin from "firebase-admin";

const initializeFirebaseAdmin = () => {
  if (admin.apps.length > 0) return;

  try {
    let key = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
    
    if (!key) {
      console.error("FIREBASE_SERVICE_ACCOUNT_KEY is missing from environment variables!");
      return;
    }

    // 1. Clean extra quotes if wrapped
    if (key.startsWith('"') && key.endsWith('"')) {
      key = key.slice(1, -1);
    }

    // 2. Handle escaped newlines (very common in Vercel/Docker)
    const sanitizedKey = key.replace(/\\n/g, '\n');

    // 3. Parse JSON
    const serviceAccount = JSON.parse(sanitizedKey);

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      databaseURL: `https://${serviceAccount.project_id}.firebaseio.com`,
    });

    console.log("Firebase Admin SDK initialized successfully.");
  } catch (error) {
    console.error("CRITICAL: Failed to initialize Firebase Admin SDK:", error);
  }
};

// Initialize immediately
initializeFirebaseAdmin();

const adminAuth = admin.apps.length ? admin.auth() : null as any;
const adminDb = admin.apps.length ? admin.firestore() : null as any;
const adminStorage = admin.apps.length ? admin.storage() : null as any;

export { adminAuth, adminDb, adminStorage };
