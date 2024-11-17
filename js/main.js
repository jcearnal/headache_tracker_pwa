// Import Firebase Realtime Database methods
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.19.1/firebase-app.js";
import { getDatabase, ref, set, remove, onValue, goOffline, goOnline } from "https://www.gstatic.com/firebasejs/9.19.1/firebase-database.js";
import { openDB } from "https://cdn.jsdelivr.net/npm/idb@8.0.0/+esm"; // Using the CDN for idb

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

// Initialize Firebase Realtime Database
const db = getDatabase(app);

const showNotification = (message) => {
  const notification = document.getElementById("notification");
  const notificationMessage = document.getElementById("notificationMessage");

  notificationMessage.textContent = message;
  notification.style.display = "block";

  // Hide the notification after 5 seconds
  setTimeout(() => {
    notification.style.display = "none";
  }, 5000);
};

// IndexedDB Initialization
const initIndexedDB = async () => {
  const db = await openDB("HeadacheTracker", 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains("headacheLogs")) {
        db.createObjectStore("headacheLogs", { keyPath: "id" });
        console.log("IndexedDB object store 'headacheLogs' created.");
      }
    },
  });
  return db;
};


// Save to IndexedDB
const saveToIndexedDB = async (log) => {
  try {
    const db = await initIndexedDB();
    const tx = db.transaction("headacheLogs", "readwrite");
    const store = tx.objectStore("headacheLogs");
    await store.put(log);
    console.log("Saved to IndexedDB:", log);
    await tx.done; // Ensure the transaction is complete
  } catch (error) {
    console.error("Error saving to IndexedDB:", error);
  }
};


// Fetch all records from IndexedDB
const getFromIndexedDB = async () => {
  try {
    const db = await initIndexedDB();
    const tx = db.transaction("headacheLogs", "readonly");
    const store = tx.objectStore("headacheLogs");
    const logs = await store.getAll();
    console.log("Fetched from IndexedDB:", logs);
    return logs;
  } catch (error) {
    console.error("Error fetching from IndexedDB:", error);
    return [];
  }
};


// Delete from IndexedDB
const deleteFromIndexedDB = async (id) => {
  const db = await initIndexedDB();
  await db.delete("headacheLogs", id);
  console.log("Deleted from IndexedDB:", id);
};

// Sync IndexedDB to Firebase
const syncIndexedDBToFirebase = async () => {
  const logs = await getFromIndexedDB();
  if (logs.length > 0) {
    console.log(`Syncing ${logs.length} logs from IndexedDB to Firebase...`);
    let successCount = 0;

    try {
      for (const log of logs) {
        await writeHeadacheLog(log.id, log); // Sync each log to Firebase
        await deleteFromIndexedDB(log.id); // Remove from IndexedDB after sync
        successCount++;
      }

      console.log("IndexedDB synced to Firebase.");
      showNotification(`${successCount} logs successfully synced with Firebase!`); // Notify on success
    } catch (error) {
      console.error("Error syncing with Firebase:", error);
      showNotification("Error syncing data with Firebase!"); // Notify on error
    }
  } else {
    console.log("No data to sync from IndexedDB.");
    showNotification("No offline data to sync with Firebase."); // Notify when no data is found
  }
};

// Write to Firebase
const writeHeadacheLog = (id, data) => {
  if (!navigator.onLine) {
    console.log("Offline: Skipping Firebase write.");
    return;
  }

  set(ref(db, 'headaches/' + id), data)
    .then(() => console.log("Headache log saved to Firebase."))
    .catch((error) => console.error("Error saving to Firebase:", error));
};

// Delete from Firebase
const deleteFromFirebase = async (id) => {
  if (!navigator.onLine) {
    console.log("Offline: Skipping Firebase delete.");
    return;
  }

  try {
    await remove(ref(db, 'headaches/' + id));
    console.log(`Headache log with ID ${id} deleted from Firebase.`);
  } catch (error) {
    console.error("Error deleting from Firebase:", error);
  }
};

// Fetch logs from Firebase or IndexedDB depending on online/offline status
const fetchHeadacheLogs = async () => {
  const historyList = document.getElementById('historyList');
  const loadingIndicator = `<li class="collection-item grey lighten-5">Loading...</li>`;
  historyList.innerHTML = loadingIndicator;

  console.log("Checking network status:", navigator.onLine);

  if (navigator.onLine) {
    // Online - Fetch from Firebase
    console.log("Online: Fetching logs from Firebase...");
    const headachesRef = ref(db, 'headaches/');
    onValue(
      headachesRef,
      async (snapshot) => {
        const data = snapshot.val();
        console.log("Logs fetched from Firebase:", data);

        historyList.innerHTML = ''; // Clear previous content
        if (data) {
          const sortedLogs = Object.entries(data).sort(
            (a, b) => new Date(b[1].date).getTime() - new Date(a[1].date).getTime()
          );

          // Save fetched logs to IndexedDB for offline access
          const logsArray = sortedLogs.map(([id, log]) => ({ id, ...log }));
          for (const log of logsArray) {
            await saveToIndexedDB(log); // Save each log to IndexedDB
          }

          // Render the logs
          sortedLogs.forEach(([id, log]) => {
            const listItem = `
              <li class="collection-item grey lighten-5">
                <div class="row">
                  <div class="col s12 m2"><strong>Duration:</strong> ${log.duration} hours</div>
                  <div class="col s12 m2"><strong>Severity:</strong> ${log.severity}</div>
                  <div class="col s12 m3"><strong>Left Work/School:</strong> ${log.leaveWork ? 'Yes' : 'No'}</div>
                  <div class="col s12 m3"><strong>Laid Down:</strong> ${log.layDown ? 'Yes' : 'No'}</div>
                  <div class="col s12 m2"><strong>Date:</strong> ${new Date(log.date).toLocaleString()}</div>
                </div>
                <button class="btn red" onclick="deleteLog('${id}')">Delete</button>
              </li>
            `;
            historyList.insertAdjacentHTML('beforeend', listItem);
          });
        } else {
          historyList.innerHTML = '<li class="collection-item grey lighten-5">No headache logs found.</li>';
        }
      },
      (error) => {
        console.error("Error fetching logs:", error);
        historyList.innerHTML = '<li class="collection-item grey lighten-5">Failed to load logs. Please try again later.</li>';
      }
    );
  } else {
    // Offline - Fetch from IndexedDB
    console.log("Offline: Fetching logs from IndexedDB...");
    const logs = await getFromIndexedDB();
    console.log("Logs fetched from IndexedDB:", logs);

    historyList.innerHTML = ''; // Clear previous content
    if (logs.length > 0) {
      logs.forEach((log) => {
        const listItem = `
          <li class="collection-item grey lighten-5">
            <div class="row">
              <div class="col s12 m2"><strong>Duration:</strong> ${log.duration} hours</div>
              <div class="col s12 m2"><strong>Severity:</strong> ${log.severity}</div>
              <div class="col s12 m3"><strong>Left Work/School:</strong> ${log.leaveWork ? 'Yes' : 'No'}</div>
              <div class="col s12 m3"><strong>Laid Down:</strong> ${log.layDown ? 'Yes' : 'No'}</div>
              <div class="col s12 m2"><strong>Date:</strong> ${new Date(log.date).toLocaleString()}</div>
            </div>
            <button class="btn red" onclick="deleteLog('${log.id}')">Delete</button>
          </li>
        `;
        historyList.insertAdjacentHTML('beforeend', listItem);
      });
    } else {
      historyList.innerHTML = '<li class="collection-item grey lighten-5">No headache logs found.</li>';
    }
  }
};

// Function to delete a log
window.deleteLog = (id) => {
  if (confirm("Are you sure you want to delete this log?")) {
    deleteFromFirebase(id);
  }
};


// Handle form submission 
document.addEventListener('DOMContentLoaded', function () {
  const form = document.getElementById('headacheForm');

  // Form submission logic
  const handleFormSubmit = async (event) => {
    event.preventDefault();
  
    const duration = document.getElementById("duration").value;
    const severity = document.getElementById("severity").value;
    const leaveWork = document.getElementById("leaveWork").checked;
    const layDown = document.getElementById("layDown").checked;
  
    if (!duration || !severity) {
      alert("Please fill out all required fields.");
      return;
    }
  
    const headacheData = {
      id: Date.now(),
      duration,
      severity,
      leaveWork,
      layDown,
      date: new Date().toISOString(),
    };
  
    if (navigator.onLine) {
      console.log("Online: Writing to Firebase");
      writeHeadacheLog(headacheData.id, headacheData);
    } else {
      console.log("Offline: Saving to IndexedDB");
      await saveToIndexedDB(headacheData);
      alert("You're offline. Your headache log was saved locally and will sync when you're online.");
    }
  
    // Reset form fields
    event.target.reset();
    M.updateTextFields();
  };
  
  // Attach the new form submission handler
  document.getElementById("headacheForm").addEventListener("submit", handleFormSubmit);

  // Fetch logs on page load
  fetchHeadacheLogs();

  // Monitor online/offline status
  const handleConnectionChange = () => {
    if (navigator.onLine) {
      console.log("Online: Syncing data and enabling Firebase...");
      goOnline(db);
      syncIndexedDBToFirebase(); // Trigger sync
    } else {
      console.log("Offline: Disabling Firebase connections...");
      goOffline(db);
    }
  };

  window.addEventListener("online", handleConnectionChange);
  window.addEventListener("offline", handleConnectionChange);

  // Initial connection state
  handleConnectionChange();
});
