// Import the necessary Firebase SDKs
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-app.js";
import { getAuth, signOut } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-auth.js";

// Your Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyC7eaM6HrHalV-wcG-I9_RZJRwDNhin2R0",
    authDomain: "project-gaia1.firebaseapp.com",
    projectId: "project-gaia1",
    storageBucket: "project-gaia1.firebasestorage.app",
    messagingSenderId: "832122601643",
    appId: "1:832122601643:web:1ab91b347704174f52b7ee",
    measurementId: "G-DX2L33NH4H"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication 
const auth = getAuth(app);

// Function to log the user out using Firebase Authentication
function logoutUser() {
    // Sign the user out using Firebase Auth
    signOut(auth)  // Use `signOut` from the modular SDK
      .then(() => {
        // Redirect the user to index.html after successful logout
        window.location.href = '/project_gaia1/src/login-out/logout.html';  // Adjust path if necessary
      })
      .catch((error) => {
        // Handle any errors that occur during logout
        console.error('Error during logout:', error);
      });
}
  
// Attach the logoutUser function to the logout link with ID 'logout'
document.getElementById('logout').addEventListener('click', logoutUser);