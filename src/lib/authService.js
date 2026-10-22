/**
 * Firebase Authentication Service
 * Wraps Firebase Auth operations: sign up, sign in, sign out
 */

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  updateProfile,
  onAuthStateChanged as firebaseOnAuthStateChanged,
  sendEmailVerification,
  reload,
} from 'firebase/auth';
import { auth } from './firebase';

/**
 * Create a new user account in Firebase Auth
 * @param {string} email
 * @param {string} password
 * @param {string} displayName
 * @returns {Promise<import('firebase/auth').UserCredential>}
 */
export async function signUpWithEmail(email, password, displayName) {
  const credential = await createUserWithEmailAndPassword(auth, email, password);
  // Store display name on the Firebase Auth user profile
  await updateProfile(credential.user, { displayName });
  return credential;
}

/**
 * Sign in an existing user with email + password
 * @param {string} email
 * @param {string} password
 * @returns {Promise<import('firebase/auth').UserCredential>}
 */
export async function signInWithEmail(email, password) {
  return await signInWithEmailAndPassword(auth, email, password);
}

/**
 * Sign the current user out of Firebase Auth
 */
export async function signOut() {
  return await firebaseSignOut(auth);
}

/**
 * Send an email verification link to the currently signed in user
 * @param {import('firebase/auth').User} [user]
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function sendUserEmailVerification(user = null) {
  let targetUser = user || auth.currentUser;
  if (!targetUser && typeof auth.authStateReady === 'function') {
    await auth.authStateReady().catch(() => {});
    targetUser = auth.currentUser;
  }
  if (!targetUser) {
    return { success: false, error: 'No active authenticated user found.' };
  }
  try {
    await sendEmailVerification(targetUser);
    return { success: true };
  } catch (error) {
    console.warn('[CardHub Auth] Email verification send notice:', error);
    return { success: false, error: getAuthErrorMessage(error) };
  }
}

/**
 * Reload the current Firebase user to reflect refreshed emailVerified status
 * @param {import('firebase/auth').User} [user]
 * @returns {Promise<import('firebase/auth').User|null>}
 */
export async function reloadCurrentUser(user = null) {
  let targetUser = user || auth.currentUser;
  if (!targetUser && typeof auth.authStateReady === 'function') {
    await auth.authStateReady().catch(() => {});
    targetUser = auth.currentUser;
  }
  if (!targetUser) return null;
  try {
    await reload(targetUser);
    return auth.currentUser || targetUser;
  } catch (error) {
    console.warn('[CardHub Auth] User reload notice:', error);
    return auth.currentUser || targetUser;
  }
}

/**
 * Subscribe to Firebase Auth state changes
 * @param {function} callback - called with user or null
 * @returns {function} unsubscribe function
 */
export function onAuthStateChanged(callback) {
  return firebaseOnAuthStateChanged(auth, callback);
}

/**
 * Maps Firebase Auth error codes to friendly messages
 * @param {Error} error - Firebase Auth error
 * @returns {string} Human-readable error message
 */
export function getAuthErrorMessage(error) {
  const code = error?.code || '';

  const errorMap = {
    'auth/email-already-in-use':
      'An account with this email already exists. Please sign in instead.',
    'auth/invalid-email':
      "Email doesn't exist. Please enter a valid email address.",
    'auth/weak-password':
      'Password is too weak. Use at least 6 characters with a mix of letters and numbers.',
    'auth/user-not-found':
      'No account found with this email. Please sign up first.',
    'auth/wrong-password':
      'Incorrect password. Please try again.',
    'auth/invalid-credential':
      'Invalid email or password. Please check your credentials and try again.',
    'auth/too-many-requests':
      'Too many failed attempts. This account is temporarily locked. Try again in a few minutes.',
    'auth/network-request-failed':
      'Network error. Please check your internet connection and try again.',
    'auth/user-disabled':
      'This account has been suspended by the platform administrator.',
    'auth/operation-not-allowed':
      'Email/password sign-in is not enabled. Please contact support.',
    'auth/popup-closed-by-user':
      'Sign-in was cancelled.',
  };

  return errorMap[code] || error?.message || 'Authentication failed. Please try again.';
}
