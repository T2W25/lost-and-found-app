import React, { createContext, useState, useContext, useEffect } from 'react';
import { auth, db } from '../services/firebase/config';
import { 
  onAuthStateChanged, 
  signOut 
} from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { DEFAULT_ROLE } from '../utils/roles';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      try {
        if (user) {
          // Get user role from Firestore
          const userRef = doc(db, 'users', user.uid);
          const userSnap = await getDoc(userRef);
          
          let role = DEFAULT_ROLE;
          let userData = {};
          
          if (userSnap.exists()) {
            userData = userSnap.data();
            role = userData.role || DEFAULT_ROLE;
          }
          
          // Set user with role
          setCurrentUser({
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            photoURL: user.photoURL,
            role,
            ...userData
          });
        } else {
          setCurrentUser(null);
        }
        
        setError(null);
      } catch (err) {
        console.error("Error in auth state change:", err);
        setError(err.message);
        setCurrentUser(null);
      } finally {
        setLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  /**
   * Log out the current user
   * @returns {Promise<void>}
   */
  const logout = async () => {
    try {
      await signOut(auth);
      return true;
    } catch (error) {
      console.error("Error signing out:", error);
      setError(error.message);
      throw error;
    }
  };

  const value = {
    currentUser,
    loading,
    error,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}