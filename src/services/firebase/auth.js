import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    updateProfile
  } from 'firebase/auth';
  import { doc, setDoc, Timestamp } from 'firebase/firestore';
  import { auth, db } from './config';
  
  // Register a new user
  export const registerUser = async (email, password, displayName) => {
    try {
      // Create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Update profile with displayName
      await updateProfile(user, { displayName });
      
      // Create user document in Firestore
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        email,
        displayName,
        createdAt: Timestamp.now(),
        notifications: true
      });
      
      return user;
    } catch (error) {
      console.error('Error registering user:', error);
      throw error;
    }
  };
  
  // Login user
  export const loginUser = (email, password) => {
    try {
      return signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      console.error('Error logging in:', error);
      throw error;
    }
  };
  
  // Logout user
  export const logoutUser = () => {
    try {
      return signOut(auth);
    } catch (error) {
      console.error('Error logging out:', error);
      throw error;
    }
  };