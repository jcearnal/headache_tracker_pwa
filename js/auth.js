import { auth, googleProvider } from "./firebase.js";
import { 
  signInWithPopup, 
  signInWithRedirect, 
  getRedirectResult, 
  signOut, 
  onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/9.19.1/firebase-auth.js";

// Handle Google Sign-In (default: popup, fallback to redirect if needed)
export const signInWithGoogle = async () => {
  try {
    // Attempt to use popup for sign-in
    const result = await signInWithPopup(auth, googleProvider);
    console.log("User signed in via popup:", result.user);
    return result.user;
  } catch (error) {
    console.error("Error during Google Sign-In (popup):", error.message);
    // Fallback to redirect for browsers that block pop-ups
    if (error.code === "auth/popup-blocked") {
      console.warn("Popup blocked, falling back to redirect...");
      await signInWithRedirect(auth, googleProvider);
    } else {
      throw error; // Re-throw other errors
    }
  }
};

// Handle Redirect Result (if using redirect fallback)
export const handleRedirectResult = async () => {
  try {
    const result = await getRedirectResult(auth);
    if (result && result.user) {
      console.log("User signed in via redirect:", result.user);
      return result.user;
    }
    return null; // No redirect result available
  } catch (error) {
    console.error("Error handling redirect result:", error.message);
    throw error;
  }
};

// Handle Sign-Out
export const signOutUser = async () => {
  try {
    await signOut(auth);
    console.log("User signed out successfully");
  } catch (error) {
    console.error("Error during sign-out:", error.message);
    throw error;
  }
};

// Listen for Authentication State Changes
export const onAuthChange = (callback) => {
  onAuthStateChanged(auth, (user) => {
    if (user) {
      console.log("Authentication state changed: User signed in:", user);
    } else {
      console.log("Authentication state changed: No user signed in.");
    }
    callback(user);
  });
};

// Get the Currently Signed-In User
export const getCurrentUser = () => {
  return auth.currentUser; // Returns the currently authenticated user or null if not signed in
};
