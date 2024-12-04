import { signInWithGoogle, signOutUser, onAuthChange } from "./auth.js";
import { showNotification } from "./notifications.js";
import { fetchAndDisplayLogs } from "./headache.js"; // Import log fetching function

document.addEventListener("DOMContentLoaded", () => {
  const signInButton = document.getElementById("googleSignIn");
  const printSignOutButton = document.getElementById("printSignOutButton"); // New Sign-Out Button
  const authContainer = document.getElementById("auth-container");
  const appContainer = document.getElementById("app-container");
  let welcomeMessage = document.getElementById("welcome-message");

  // Ensure critical elements exist in the DOM
  if (!signInButton || !printSignOutButton || !authContainer || !appContainer) {
    console.error("Authentication elements are missing from the DOM.");
    return;
  }

  // Handle Google Sign-In
  signInButton.addEventListener("click", async () => {
    try {
      console.log("Sign In button clicked");
      const user = await signInWithGoogle();
      console.log("User signed in:", user);
      showNotification(`Welcome, ${user.displayName || "User"}!`);
    } catch (error) {
      console.error("Error during sign-in:", error.message);
      showNotification("Failed to sign in. Please try again.");
    }
  });

  // Handle Sign-Out
  printSignOutButton.addEventListener("click", async () => {
    try {
      console.log("Sign Out button clicked");
      await signOutUser();
      console.log("User signed out successfully");
      showNotification("You have been signed out.");
    } catch (error) {
      console.error("Error during sign-out:", error.message);
      showNotification("Failed to sign out. Please try again.");
    }
  });

  // Handle Authentication State Changes
  onAuthChange((user) => {
    welcomeMessage = document.getElementById("welcome-message"); // Ensure it's fetched dynamically
    const historyList = document.getElementById("historyList"); // Clear logs on logout

    if (!welcomeMessage) {
      console.error("Welcome message element is missing from the DOM.");
      return;
    }

    if (user) {
      console.log("User is signed in:", user);
      authContainer.style.display = "none";
      appContainer.style.display = "block";
      welcomeMessage.textContent = `Hello, ${user.displayName || "User"}!`;

      // Show the sign-out button
      if (printSignOutButton) printSignOutButton.style.display = "inline-block";

      // Fetch and display logs after login
      fetchAndDisplayLogs();
    } else {
      console.log("No user is signed in.");
      authContainer.style.display = "block";
      appContainer.style.display = "none";
      welcomeMessage.textContent = ""; // Clear the welcome message

      // Hide the sign-out button
      if (printSignOutButton) printSignOutButton.style.display = "none";

      // Clear the headache history list
      if (historyList) {
        historyList.innerHTML = '<li class="collection-item grey lighten-5">Please sign in to view logs.</li>';
      }
    }
  });
});
