import React, { createContext, useContext, useEffect, useState } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { auth, db } from "../firebase";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  console.log("AuthProvider rendering, loading:", loading, "user:", user);

  // Sign up function
  const signup = async (email, password, role, additionalData = {}) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const firebaseUser = userCredential.user;

      await setDoc(doc(db, "users", firebaseUser.uid), {
        email: firebaseUser.email,
        role: role,
        createdAt: new Date().toISOString(),
        ...additionalData,
      });

      const userData = {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        role: role,
      };

      setUser(userData);
      localStorage.setItem("userRole", role);

      return { success: true, user: userData };
    } catch (error) {
      console.error("Signup error:", error);
      throw new Error(error.message);
    }
  };

  // Login function
  const login = async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const firebaseUser = userCredential.user;

      const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
      const userData = userDoc.data();
      const role = userData?.role || "community";

      const userWithRole = {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        role: role,
      };

      setUser(userWithRole);
      localStorage.setItem("userRole", role);

      return { success: true, user: userWithRole };
    } catch (error) {
      console.error("Login error:", error);
      throw new Error(error.message);
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      localStorage.removeItem("userRole");
      return { success: true };
    } catch (error) {
      console.error("Logout error:", error);
      throw new Error(error.message);
    }
  };

  // Simplified auth state listener
  useEffect(() => {
    console.log("Setting up auth state listener");

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      console.log(
        "Auth state changed:",
        firebaseUser ? "logged in" : "logged out"
      );

      try {
        if (firebaseUser) {
          try {
            const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
            const userData = userDoc.data();
            const role = userData?.role || "community";

            const userWithRole = {
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              role: role,
            };

            setUser(userWithRole);
            localStorage.setItem("userRole", role);
          } catch (error) {
            console.error("Error fetching user data:", error);
            const userWithRole = {
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              role: "community",
            };
            setUser(userWithRole);
            localStorage.setItem("userRole", "community");
          }
        } else {
          setUser(null);
          localStorage.removeItem("userRole");
        }
      } catch (error) {
        console.error("Auth state change error:", error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    });

    // Set timeout to prevent infinite loading
    const timeout = setTimeout(() => {
      console.log("Auth timeout reached, setting loading to false");
      setLoading(false);
    }, 3000);

    return () => {
      clearTimeout(timeout);
      unsubscribe();
    };
  }, []);

  const value = {
    user,
    loading,
    signup,
    login,
    logout,
  };

  // Simplified loading screen
  if (loading) {
    return (
      <div className="min-h-screen bg-blue-900 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="w-12 h-12 border-4 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin mx-auto mb-4"></div>
          <h1 className="text-2xl font-bold mb-2">AquaAlert</h1>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
