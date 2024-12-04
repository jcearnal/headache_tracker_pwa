import { getCurrentUser } from "./auth.js";
import { onUserDataValue, writeUserData, removeUserData } from "./firebase.js";
import { saveToIndexeddb, getFromIndexeddb, deleteFromIndexeddb } from "./indexeddb.js";
import { showNotification } from "./notifications.js";

document.addEventListener("DOMContentLoaded", () => {
  const headacheForm = document.getElementById("headacheForm");

  // Fetch and display logs on page load
  fetchAndDisplayLogs();

  // Handle form submission for logging headaches
  if (headacheForm) {
    headacheForm.addEventListener("submit", async (event) => {
        event.preventDefault();
      
        const user = getCurrentUser();
        if (!user) {
          alert("You must be signed in to log a headache.");
          return;
        }
      
        const duration = document.getElementById("duration").value;
        const severity = document.getElementById("severity").value;
        const leaveWork = document.getElementById("leaveWork").checked;
        const layDown = document.getElementById("layDown").checked;
      
        if (!duration || !severity) {
          alert("Please fill out all required fields.");
          return;
        }
      
        const headacheLog = {
          id: Date.now(),
          userId: user.uid, // Associate log with the user
          duration,
          severity,
          leaveWork,
          layDown,
          date: new Date().toISOString(),
        };
      
        try {
          if (navigator.onLine) {
            await writeUserData(user.uid, `headacheLogs/${headacheLog.id}`, headacheLog);
            showNotification("Headache log saved online!");
          } else {
            await saveToIndexeddb(headacheLog);
            showNotification("Offline: Headache log saved locally and will sync when online.");
          }
      
          fetchAndDisplayLogs(); // Refresh the logs
          headacheForm.reset(); // Clear the form
        } catch (error) {
          console.error("Error logging headache:", error.message);
          alert("Failed to log headache. Please try again.");
        }
      });
      
  }

  // Sync IndexedDB data to Firebase when online
  window.addEventListener("online", async () => {
    console.log("[Sync] App is back online. Syncing offline changes...");
    try {
      const user = getCurrentUser();
      if (!user) return;

      // Sync offline logs
      const offlineLogs = await getFromIndexeddb();
      for (const log of offlineLogs) {
        try {
          await writeUserData(user.uid, `headacheLogs/${log.id}`, log);
          await deleteFromIndexeddb(log.id); // Remove the log from IndexedDB after successful sync
        } catch (error) {
          console.error("Error syncing log to Firebase:", error.message);
        }
      }

      // Sync offline deletes
      const deleteQueue = await getFromIndexeddb("deleteQueue");
      for (const { id } of deleteQueue) {
        try {
          await removeUserData(user.uid, `headacheLogs/${id}`);
          await deleteFromIndexeddb(id, "deleteQueue");
          await deleteFromIndexeddb(id); // Ensure the record is removed
        } catch (error) {
          console.error("Error syncing delete to Firebase:", error.message);
        }
      }

      fetchAndDisplayLogs(); // Refresh logs to reflect synced data
      showNotification("Offline changes synced with Firebase!");
    } catch (error) {
      console.error("Error during online sync:", error.message);
      showNotification("Failed to sync offline changes. Please try again.");
    }
  });
});

// Fetch and display headache logs
export const fetchAndDisplayLogs = async () => {
    const historyList = document.getElementById("historyList");
    const user = getCurrentUser();
  
    if (!user) {
      historyList.innerHTML = '<li class="collection-item grey lighten-5">Please sign in to view logs.</li>';
      return;
    }
  
    try {
      let logs = [];
  
      if (navigator.onLine) {
        console.log("[fetchAndDisplayLogs] Online: Fetching logs from Firebase...");
        // Fetch logs from Firebase
        onUserDataValue(user.uid, "headacheLogs", async (snapshot) => {
          const data = snapshot.val();
          if (data) {
            logs = Object.entries(data).map(([id, log]) => ({ id, ...log }));
            renderLogs(logs);
  
            // Save logs to IndexedDB for offline access
            for (const log of logs) {
              await saveToIndexeddb({ ...log, userId: user.uid });
            }
          } else {
            renderLogs([]);
          }
        });
      } else {
        console.log("[fetchAndDisplayLogs] Offline: Fetching logs from IndexedDB...");
        logs = await getFromIndexeddb(); // Fetch all logs from IndexedDB
        logs = logs.filter((log) => log.userId === user.uid); // Filter logs by userId
        renderLogs(logs);
      }
    } catch (error) {
      console.error("[fetchAndDisplayLogs] Error fetching logs:", error.message);
      historyList.innerHTML = '<li class="collection-item grey lighten-5">Failed to load logs. Please try again later.</li>';
    }
  };
  

// Render headache logs in the UI
const renderLogs = (logs) => {
    const historyList = document.getElementById("historyList");
    historyList.innerHTML = ""; // Clear the existing list
  
    if (logs.length === 0) {
      historyList.innerHTML = '<li class="collection-item grey lighten-5">No headache logs found.</li>';
      return;
    }
  
    logs.forEach((log) => {
      const listItem = document.createElement("li");
      listItem.className = "collection-item grey lighten-5";
      listItem.innerHTML = `
        <div class="row">
          <div class="col s12 m2"><strong>Duration:</strong> ${log.duration} hours</div>
          <div class="col s12 m2"><strong>Severity:</strong> ${log.severity}</div>
          <div class="col s12 m3"><strong>Left Work/School:</strong> ${log.leaveWork ? "Yes" : "No"}</div>
          <div class="col s12 m3"><strong>Laid Down:</strong> ${log.layDown ? "Yes" : "No"}</div>
          <div class="col s12 m2"><strong>Date:</strong> ${new Date(log.date).toLocaleString()}</div>
        </div>
        <button class="btn red delete-button" data-id="${log.id}">Delete</button>
      `;
  
      historyList.appendChild(listItem);
  
      // Attach delete button event listener
      const deleteButton = listItem.querySelector(".delete-button");
      deleteButton.addEventListener("click", async () => {
        const id = log.id;
        const user = getCurrentUser();
  
        try {
          if (navigator.onLine) {
            await removeUserData(user.uid, `headacheLogs/${id}`);
          } else {
            await saveToIndexeddb({ id }, "deleteQueue"); // Save delete request offline
          }
  
          await deleteFromIndexeddb(id); // Remove from IndexedDB
          listItem.remove(); // Remove from the DOM immediately
          showNotification("Headache log deleted successfully.");
        } catch (error) {
          console.error("Error deleting headache log:", error.message);
          showNotification("Failed to delete headache log. Please try again.");
        }
      });
    });
  };
  
