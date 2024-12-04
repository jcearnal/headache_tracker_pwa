import { openDB } from "https://cdn.jsdelivr.net/npm/idb@8.0.0/+esm";

// Initialize IndexedDB
const initDB = async () => {
  const db = await openDB("HeadacheTracker", 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains("headacheLogs")) {
        db.createObjectStore("headacheLogs", { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains("deleteQueue")) {
        db.createObjectStore("deleteQueue", { keyPath: "id" });
      }
    },
  });
  return db;
};

// CRUD Operations
export const saveToIndexeddb = async (data, storeName = "headacheLogs") => {
  try {
    if (!data || !data.id) {
      throw new Error("Data must have an 'id' field.");
    }
    const db = await initDB();
    const tx = db.transaction(storeName, "readwrite");
    await tx.objectStore(storeName).put(data);
    await tx.done;
    console.log(`[IndexedDB] Saved to ${storeName}:`, data);
  } catch (error) {
    console.error(`[IndexedDB] Error saving to ${storeName}:`, error.message, data);
    throw error;
  }
};

export const getFromIndexeddb = async (storeName = "headacheLogs") => {
  try {
    const db = await initDB();
    const data = await db.transaction(storeName, "readonly").objectStore(storeName).getAll();
    console.log(`[IndexedDB] Fetched from ${storeName}:`, data);
    return data;
  } catch (error) {
    console.error(`[IndexedDB] Error fetching from ${storeName}:`, error.message);
    throw error;
  }
};

export const deleteFromIndexeddb = async (id, storeName = "headacheLogs") => {
  try {
    if (!id) {
      throw new Error("ID is required to delete an item.");
    }
    const db = await initDB();
    const tx = db.transaction(storeName, "readwrite");
    await tx.objectStore(storeName).delete(id);
    await tx.done;
    console.log(`[IndexedDB] Deleted from ${storeName}:`, id);
  } catch (error) {
    console.error(`[IndexedDB] Error deleting from ${storeName}:`, error.message, id);
    throw error;
  }
};

// Utility Function: Clear Store (Optional)
export const clearIndexeddbStore = async (storeName) => {
  try {
    const db = await initDB();
    const tx = db.transaction(storeName, "readwrite");
    await tx.objectStore(storeName).clear();
    await tx.done;
    console.log(`[IndexedDB] Cleared store: ${storeName}`);
  } catch (error) {
    console.error(`[IndexedDB] Error clearing store ${storeName}:`, error.message);
    throw error;
  }
};
