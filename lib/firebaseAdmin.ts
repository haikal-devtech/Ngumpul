import * as admin from "firebase-admin";

const initializeFirebaseAdmin = () => {
  console.log("DIAGNOSTIC: initializeFirebaseAdmin called. Apps length:", admin.apps.length);
  
  if (admin.apps.length > 0) return admin.app();

  const key = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  
  if (!key) {
    console.error("DIAGNOSTIC: !!! FIREBASE_SERVICE_ACCOUNT_KEY IS TOTALLY MISSING !!!");
    return null;
  }

  try {
    let sanitizedKey = key.trim();
    
    // Clean wrapping quotes
    if (sanitizedKey.startsWith("'") && sanitizedKey.endsWith("'")) {
      sanitizedKey = sanitizedKey.slice(1, -1);
    }
    if (sanitizedKey.startsWith('"') && sanitizedKey.endsWith('"')) {
      sanitizedKey = sanitizedKey.slice(1, -1);
    }

    // JSON.parse requires actual newlines to be escaped as \\n.
    // If the string contains literal newlines, we escape them.
    sanitizedKey = sanitizedKey.replace(/\n/g, '\\n');

    const serviceAccount = JSON.parse(sanitizedKey);
    
    // Convert literal '\n' text into actual newline characters for the private key
    if (serviceAccount.private_key) {
      serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');
    }
    console.log("DIAGNOSTIC: JSON Parse Success. Project ID:", serviceAccount.project_id);

    return admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      databaseURL: `https://${serviceAccount.project_id}.firebaseio.com`,
    });
  } catch (error: any) {
    console.error("DIAGNOSTIC: JSON Parse or Init FAILED:", error.message);
    return null;
  }
};

// EXTREMELY IMPORTANT: Try to initialize at least once at module load
initializeFirebaseAdmin();

export const getAdminAuth = () => {
  const app = admin.apps.length > 0 ? admin.app() : initializeFirebaseAdmin();
  if (!app) throw new Error("Firebase Admin Auth could not be initialized. Check Environment Variables.");
  return admin.auth(app);
};

export const getAdminDb = () => {
  const app = admin.apps.length > 0 ? admin.app() : initializeFirebaseAdmin();
  if (!app) throw new Error("Firebase Admin DB could not be initialized. Check Environment Variables.");
  return admin.firestore(app);
};

export const getAdminStorage = () => {
  const app = admin.apps.length > 0 ? admin.app() : initializeFirebaseAdmin();
  if (!app) throw new Error("Firebase Admin Storage could not be initialized. Check Environment Variables.");
  return admin.storage(app);
};

// Fallback exports
export const adminAuth = admin.apps.length ? admin.auth() : null as any;
export const adminDb = admin.apps.length ? admin.firestore() : null as any;
export const adminStorage = admin.apps.length ? admin.storage() : null as any;
