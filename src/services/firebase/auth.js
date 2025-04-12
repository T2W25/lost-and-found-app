// Firebase Authentication and Firestore integration for user management
 
// This module provides functions to register, sign in, sign out, and manage user profiles in a Firebase application.
// It includes functions for creating user accounts, updating user information, and handling authentication state.
// It also includes error handling and user role management.
import { auth, db } from './config';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile as updateAuthProfile,
  updateEmail as updateAuthEmail,
  updatePassword as updateAuthPassword,
  reauthenticateWithCredential,
  EmailAuthProvider
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { ROLES, DEFAULT_ROLE } from '../../utils/roles';
 
/**
 * Register a new user
 * @param {string} email - User's email
 * @param {string} password - User's password
 * @param {string} displayName - User's display name
 * @returns {Promise<Object>} User data
 */
export const registerUser = async (email, password, displayName) => {
  try {
    // Create user in Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
   
    // Update profile with display name
    await updateAuthProfile(user, { displayName });
   
    // Create user document in Firestore
    const userRef = doc(db, 'users', user.uid);
    await setDoc(userRef, {
      email,
      displayName,
      role: DEFAULT_ROLE,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
   
    return {
      uid: user.uid,
      email: user.email,
      displayName
    };
  } catch (error) {
    console.error("Error registering user:", error);
    throw error;
  }
};
 
/**
 * Sign in a user
 * @param {string} email - User's email
 * @param {string} password - User's password
 * @returns {Promise<Object>} User data
 */
export const signInUser = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
   
    // Get user role from Firestore
    const userRef = doc(db, 'users', user.uid);
    const userSnap = await getDoc(userRef);
   
    let role = DEFAULT_ROLE;
    if (userSnap.exists()) {
      role = userSnap.data().role || DEFAULT_ROLE;
    }
   
    return {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      role
    };
  } catch (error) {
    console.error("Error signing in:", error);
    throw error;
  }
};
 
/**
 * Sign out the current user
 * @returns {Promise<void>}
 */
export const signOutUser = async () => {
  try {
    await signOut(auth);
    return true;
  } catch (error) {
    console.error("Error signing out:", error);
    throw error;
  }
};
 
/**
 * Send password reset email
 * @param {string} email - User's email
 * @returns {Promise<void>}
 */
export const resetPassword = async (email) => {
  try {
    await sendPasswordResetEmail(auth, email);
    return true;
  } catch (error) {
    console.error("Error sending password reset email:", error);
    throw error;
  }
};
 
/**
 * Update user's email
 * @param {string} newEmail - New email address
 * @param {string} password - Current password for verification
 * @returns {Promise<void>}
 */
export const updateEmail = async (newEmail, password) => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error('No user is signed in');
   
    // Re-authenticate user before changing email
    const credential = EmailAuthProvider.credential(user.email, password);
    await reauthenticateWithCredential(user, credential);
   
    // Update email in Auth
    await updateAuthEmail(user, newEmail);
   
    // Update email in Firestore
    const userRef = doc(db, 'users', user.uid);
    await updateDoc(userRef, {
      email: newEmail,
      updatedAt: serverTimestamp()
    });
   
    return true;
  } catch (error) {
    console.error("Error updating email:", error);
    throw error;
  }
};
 
/**
 * Update user's password
 * @param {string} currentPassword - Current password
 * @param {string} newPassword - New password
 * @returns {Promise<void>}
 */
export const updatePassword = async (currentPassword, newPassword) => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error('No user is signed in');
   
    // Re-authenticate user before changing password
    const credential = EmailAuthProvider.credential(user.email, currentPassword);
    await reauthenticateWithCredential(user, credential);
   
    // Update password
    await updateAuthPassword(user, newPassword);
   
    return true;
  } catch (error) {
    console.error("Error updating password:", error);
    throw error;
  }
};
 
/**
 * Get current authenticated user
 * @returns {Object|null} Current user or null if not authenticated
 */
export const getCurrentUser = () => {
  return auth.currentUser;
};