import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDocFromServer,
  setDoc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
} from 'firebase/firestore';
import firebaseAppletConfig from '../../firebase-applet-config.json';

const firebaseConfig = {
  ...firebaseAppletConfig,
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY?.trim() || firebaseAppletConfig.apiKey,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN?.trim() || firebaseAppletConfig.authDomain,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID?.trim() || firebaseAppletConfig.projectId,
  appId: import.meta.env.VITE_FIREBASE_APP_ID?.trim() || firebaseAppletConfig.appId,
};

const app = initializeApp(firebaseConfig);

/* Use a named Firestore database when explicitly configured, otherwise use the default */
const _dbId = firebaseConfig.firestoreDatabaseId;
export const db = _dbId && _dbId !== '(default)'
  ? getFirestore(app, _dbId)
  : getFirestore(app);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Initial connection test according to skill guidelines
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (_error) {
    // Probing test document may be denied by firestore rules; silently proceed
  }
}
testConnection();

export {
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
  onAuthStateChanged,
  type FirebaseUser,
};
