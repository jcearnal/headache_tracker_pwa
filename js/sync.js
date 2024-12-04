import { writeUserData } from "./firebase.js";
import { getFromIndexedDB, deleteFromIndexedDB } from "./indexeddb.js";
import { showNotification } from "./notifications.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/9.19.1/firebase-auth.js";

const auth = getAuth();

export const syncIndexedDBToFirebase = async () => {
  const user = auth.currentUser;
  if (!user) {
    console.warn("No authenticated user. Skipping sync.");
    return;
  }

  const logs = await getFromIndexedDB();
  if (logs.length > 0) {
    console.log(`Syncing ${logs.length} logs to Firebase for user ${user.uid}...`);
    let successCount = 0;

    for (const log of logs) {
      try {
        await writeUserData(user.uid, `headaches/${log.id}`, log);
        await deleteFromIndexedDB(log.id);
        successCount++;
      } catch (error) {
        console.error("Error syncing log:", error);
      }
    }

    showNotification(`${successCount} logs synced with Firebase.`);
  } else {
    console.log("No logs to sync.");
  }
};
