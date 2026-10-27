import { initializeApp } from 'firebase/app';
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDocFromServer,
  setDoc,
  getDoc,
  serverTimestamp,
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

export const SCOPES = ['https://www.googleapis.com/auth/drive.readonly'];

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);

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

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
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

async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error('Please check your Firebase configuration.');
    }
  }
}
testConnection();

const provider = new GoogleAuthProvider();
for (const scope of SCOPES) {
  provider.addScope(scope);
}

let isSigningIn = false;
// In-memory cache for the Google Drive OAuth access token (never stored in localStorage/sessionStorage)
let cachedAccessToken: string | null = null;

export const initAuth = (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user) {
      if (cachedAccessToken) {
        if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
      } else if (!isSigningIn) {
        cachedAccessToken = null;
        if (onAuthFailure) onAuthFailure();
      }
    } else {
      cachedAccessToken = null;
      if (onAuthFailure) onAuthFailure();
    }
  });
};

export async function syncFirebaseUserProfile(user: User) {
  if (!user || !user.uid || !user.email) return;
  const userPath = `users/${user.uid}`;
  try {
    const ref = doc(db, 'users', user.uid);
    const snap = await getDoc(ref);
    const isBootstrappedAdmin = user.email === 'pedrinho.pedro248@gmail.com';
    if (!snap.exists()) {
      await setDoc(ref, {
        uid: user.uid.slice(0, 128),
        name: (user.displayName || user.email.split('@')[0] || 'Alumno').slice(0, 100),
        email: user.email.slice(0, 120),
        role: isBootstrappedAdmin ? 'admin' : 'student',
        plan: isBootstrappedAdmin ? 'VIP' : 'ESENCIAL',
        blocked: false,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, userPath);
  }
}

export async function syncFirebaseUserProgress(
  completedVideoIds: string[],
  favoriteVideoIds: string[],
  lastWatchedVideoId: string | null
) {
  const currentUser = auth.currentUser;
  if (!currentUser || !currentUser.uid) return;
  const progressPath = `progress/${currentUser.uid}`;
  try {
    const ref = doc(db, 'progress', currentUser.uid);
    const snap = await getDoc(ref);
    const cleanCompleted = completedVideoIds.slice(0, 500).map((id) => String(id).slice(0, 128));
    const cleanFavorites = favoriteVideoIds.slice(0, 500).map((id) => String(id).slice(0, 128));
    const cleanLastWatched = (lastWatchedVideoId || '').slice(0, 128);

    if (!snap.exists()) {
      await setDoc(ref, {
        userId: currentUser.uid.slice(0, 128),
        completedVideoIds: cleanCompleted,
        favoriteVideoIds: cleanFavorites,
        lastWatchedVideoId: cleanLastWatched,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } else {
      await setDoc(
        ref,
        {
          userId: currentUser.uid.slice(0, 128),
          completedVideoIds: cleanCompleted,
          favoriteVideoIds: cleanFavorites,
          lastWatchedVideoId: cleanLastWatched,
          createdAt: snap.data().createdAt || serverTimestamp(),
          updatedAt: serverTimestamp(),
        }
      );
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, progressPath);
  }
}

export const googleSignIn = async (): Promise<{
  user: User;
  accessToken: string;
} | null> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('No se pudo obtener el token de acceso de Google Drive.');
    }

    cachedAccessToken = credential.accessToken;
    await syncFirebaseUserProfile(result.user);
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error) {
    console.error('Sign in error:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

export const getAccessToken = async (): Promise<string | null> => {
  return cachedAccessToken;
};

export const logoutGoogle = async () => {
  try {
    await auth.signOut();
  } catch {
    // ignore signout error if not signed into firebase
  }
  cachedAccessToken = null;
};
