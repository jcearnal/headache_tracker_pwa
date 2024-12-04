// Import Firebase methods
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.19.1/firebase-app.js";
import { 
  getDatabase, 
  ref, 
  set, 
  remove, 
  onValue 
} from "https://www.gstatic.com/firebasejs/9.19.1/firebase-database.js";
import { 
  getAuth, 
  GoogleAuthProvider 
} from "https://www.gstatic.com/firebasejs/9.19.1/firebase-auth.js";

// Initialize Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBs5BBaurAUW3H6BniAo122fuLoz1PYQgQ",
  authDomain: "tracker-24eae.firebaseapp.com",
  databaseURL: "https://tracker-24eae-default-rtdb.firebaseio.com",
  projectId: "tracker-24eae",
  storageBucket: "tracker-24eae.appspot.com",
  messagingSenderId: "857208368290",
  appId: "1:857208368290:web:d2c04dbdf41581e92e3bfb",
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

// General database utility functions
export const writeData = async (path, data) => {
  try {
    await set(ref(db, path), data);
    console.log(`[Firebase] Data written to path: ${path}`);
  } catch (error) {
    console.error(`[Firebase] Error writing to path: ${path}`, error.message);
    throw error;
  }
};

export const removeData = async (path) => {
  try {
    await remove(ref(db, path));
    console.log(`[Firebase] Data removed from path: ${path}`);
  } catch (error) {
    console.error(`[Firebase] Error removing data from path: ${path}`, error.message);
    throw error;
  }
};

export const onDataValue = (path, callback) => {
  const reference = ref(db, path);
  onValue(reference, callback, (error) => {
    console.error(`[Firebase] Error fetching data from path: ${path}`, error.message);
  });
};

// User-specific database utility functions
export const writeUserData = async (userId, path, data) => {
  const fullPath = `users/${userId}/${path}`;
  return await writeData(fullPath, data);
};

export const removeUserData = async (userId, path) => {
  const fullPath = `users/${userId}/${path}`;
  return await removeData(fullPath);
};

export const onUserDataValue = (userId, path, callback) => {
  const fullPath = `users/${userId}/${path}`;
  onDataValue(fullPath, callback);
};

// Export Firebase instances for use in other modules
export { app, db, auth, googleProvider };
