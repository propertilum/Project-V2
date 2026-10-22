/**
 * Firestore User Service
 * Handles persisting CardHub user profiles to Firestore under the "users" collection.
 * Each document ID is the Firebase Auth UID for easy lookups.
 * Safe timeout wrapper prevents unhandled offline or API permission hangs.
 */

import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  deleteDoc,
  collection,
  getDocs,
  query,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from './firebase';

const USERS_COLLECTION = 'users';
const FIRESTORE_TIMEOUT_MS = 6000;

function withTimeout(promise, ms = FIRESTORE_TIMEOUT_MS) {
  return Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error(`Firestore request timed out (${ms}ms)`)), ms)
    ),
  ]);
}

/**
 * Save a new user profile to Firestore (creates or overwrites)
 */
export async function createUserProfile(uid, profileData) {
  try {
    const userRef = doc(db, USERS_COLLECTION, uid);
    await withTimeout(
      setDoc(userRef, {
        ...profileData,
        uid,
        createdAt: profileData.createdAt || Date.now(),
        updatedAt: serverTimestamp(),
      })
    );
  } catch (err) {
    console.warn('[Firestore] createUserProfile skipped or failed:', err?.message || err);
  }
}

/**
 * Retrieve a user profile from Firestore by UID
 */
export async function getUserProfile(uid) {
  try {
    const userRef = doc(db, USERS_COLLECTION, uid);
    const snap = await withTimeout(getDoc(userRef));
    if (!snap.exists()) return null;
    return { id: snap.id, uid: snap.id, ...snap.data() };
  } catch (err) {
    console.warn('[Firestore] getUserProfile skipped or failed:', err?.message || err);
    return null;
  }
}

/**
 * Update specific fields on an existing user profile.
 * Falls back to setDoc (merge) if the document doesn't exist yet.
 */
export async function updateUserProfile(uid, fields) {
  try {
    const userRef = doc(db, USERS_COLLECTION, uid);
    await withTimeout(
      updateDoc(userRef, {
        ...fields,
        updatedAt: serverTimestamp(),
      })
    ).catch(async (err) => {
      // If document doesn't exist, create it (handles race conditions)
      if (err.code === 'not-found') {
        await withTimeout(
          setDoc(
            userRef,
            {
              uid,
              ...fields,
              updatedAt: serverTimestamp(),
            },
            { merge: true }
          )
        );
      } else {
        throw err;
      }
    });
  } catch (err) {
    console.warn('[Firestore] updateUserProfile skipped or failed:', err?.message || err);
  }
}

/**
 * Delete a user profile from Firestore
 */
export async function deleteUserProfile(uid) {
  try {
    const userRef = doc(db, USERS_COLLECTION, uid);
    await withTimeout(deleteDoc(userRef));
  } catch (err) {
    console.warn('[Firestore] deleteUserProfile skipped or failed:', err?.message || err);
  }
}

/**
 * Fetch all user profiles from Firestore (admin use)
 */
export async function getAllUserProfiles() {
  try {
    const q = query(collection(db, USERS_COLLECTION), orderBy('createdAt', 'desc'));
    const snapshot = await withTimeout(getDocs(q));
    return snapshot.docs.map((d) => ({ id: d.id, uid: d.id, ...d.data() }));
  } catch (err) {
    console.warn('[Firestore] Failed to fetch all user profiles:', err?.message || err);
    return [];
  }
}
