# Headache Tracker PWA

This Progressive Web App (PWA) allows users to log and track their headaches, including details such as duration, severity, and whether they had to leave work or lay down. The app features offline functionality using IndexedDB and cloud storage with Firebase, ensuring a seamless experience for users even without an internet connection.

## Screenshots

### App Screenshot (Wide)

![Wide Screenshot](img/screenshot-wide.png)

### App Screenshot (Narrow)

![Narrow Screenshot](img/screenshot-narrow.png)

## Live Demo
You can view and install the app by navigating to the following URL:  
`https://jcearnal.github.io/headache_tracker_pwa/`

## Features

- **Log Headaches**: Users can log headaches by entering details such as duration, severity, and other relevant information.
- **Headache History**: View a list of previously logged headaches with details such as date, severity, and actions taken.
- **Print**: Users can print their headache history for personal records.
- **Installability**: The app can be installed on mobile and desktop devices like a native app.
- **Offline Access**: The PWA works offline, allowing users to log and view headache history even without an internet connection.
- **Firebase Integration**: The app stores headache logs in Firebase Realtime Database when online, ensuring data is synced across devices.
- **IndexedDB Integration**: The app uses IndexedDB for offline storage, allowing users to continue logging headaches even when disconnected, and syncing the data when online again.

## PWA Functionality

This PWA is built using HTML, CSS (Materialize Framework), and JavaScript. It incorporates core PWA features, such as:

- **Service Worker**:
  - A service worker is registered to enable offline access and caching of essential assets.
  - It implements a caching strategy to store resources like HTML, CSS, JavaScript, and images, ensuring that the app remains functional without an internet connection.
  - The service worker intercepts network requests and serves cached assets when offline, providing a smooth user experience.

- **Firebase Integration**:
  - **Firebase Realtime Database**: Headache logs are saved to Firebase when the app is online.
  - The app creates, reads, updates, and deletes records from Firebase in real-time, syncing the data across devices when connected to the internet.
  - Firebase ensures that data is not lost, even when the app switches between offline and online states.

- **IndexedDB Integration**:
  - IndexedDB is used to store headache logs locally when the app is offline.
  - It allows the app to operate fully without internet connectivity by storing data locally, which is synced with Firebase once the app reconnects to the internet.
  - The app can also update or delete records in IndexedDB as needed.

- **Manifest**:
  - The `manifest.json` file contains metadata about the app, allowing users to install it on their devices.
  - Key properties include:
    - **name**: The full name of the app, displayed on the user's home screen.
    - **short_name**: A shorter version of the name for the home screen icon.
    - **icons**: Specifies different sizes of icons for various devices, ensuring a responsive design.
    - **start_url**: Defines the starting point of the app when launched from the home screen.
    - **display**: Set to `standalone` to make the app look like a native application.

## How to Use

### Headache Log

- **Log a Headache**:
  - Enter the duration of the headache (in hours).
  - Select the severity of the headache (Mild, Moderate, Severe).
  - Optionally check whether you left work/school or had to lay down.
  - Click the "Log Headache" button to save the entry.
  - The log will be saved either in Firebase when online or in IndexedDB when offline.

### Headache History

- **View Past Entries**: The headache history section displays a list of past headache logs.
- **Print**: Click the "Print" button to print your headache history.

## Offline Mode

- **Caching**: The service worker caches important assets (HTML, CSS, JS, images) so the app remains accessible offline.
- **Usage**: Once loaded, the app can be used offline to view and log headaches. Logged data will be stored locally until an internet connection is available. Once online, any locally stored data is automatically synced to Firebase.

## Installation

1. Visit the app URL in a supported browser (Chrome, Edge, or Safari).
2. A prompt will appear to "Install" the app. Click the install button.
3. Once installed, you can launch the app from your home screen or desktop.

## Technology Stack

- **HTML**: Used for structuring the app content.
- **CSS (Materialize Framework)**: Used for styling the app and making it responsive.
- **JavaScript**: Handles the interactive functionality, including Firebase and IndexedDB integration, and service worker registration.
- **Service Worker**: Caches assets for offline use and intercepts network requests.
- **IndexedDB**: Stores data locally when offline, syncing with Firebase when the app is online.
- **Firebase Realtime Database**: Cloud storage for headache logs, ensuring data is synced and available across devices.
- **Manifest**: Provides metadata for the app and enables installability, making the app accessible from the home screen.

## How to Run Locally

1. Clone the repository:  
   `git clone https://github.com/jcearnal/headache-tracker-pwa.git`
   
2. Navigate to the project directory:  
   `cd headache-tracker-pwa`
   
3. Open the `index.html` file in a browser to view and test the app.

4. Optionally, you can host the app on a local server (like Live Server in VS Code) to test installability and PWA features.
