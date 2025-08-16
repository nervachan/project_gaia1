import { initializeApp } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-analytics.js";
import { getFirestore, collection, query, where, getDocs } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-firestore.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-auth.js"; // Import Firebase Authentication
import { loader } from './loader.js';

// Wait for the DOM to be fully loaded
document.addEventListener("DOMContentLoaded", function () {
  const firebaseConfig = {
    apiKey: "AIzaSyC7eaM6HrHalV-wcG-I9_RZJRwDNhin2R0",
    authDomain: "project-gaia1.firebaseapp.com",
    projectId: "project-gaia1",
    storageBucket: "project-gaia1.firebasestorage.app",
    messagingSenderId: "832122601643",
    appId: "1:832122601643:web:1ab91b347704174f52b7ee",
    measurementId: "G-DX2L33NH4H",
  };

  const app = initializeApp(firebaseConfig);
  const analytics = getAnalytics(app);
  const db = getFirestore(app);
  const auth = getAuth(); // Initialize Firebase Authentication

  // Function to open the modal and display user info from Firestore
  async function openProfileModal(uid) {
    const modal = document.getElementById("profile-modal");
    const userProfileInfo = document.getElementById("user-profile-info");
    loader.show();
    try {
      // Query Firestore for the user document matching the 'uid' field
      const q = query(collection(db, "user-seller"), where("uid", "==", uid));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        // Assuming there's only one user with the provided uid
        const userDoc = querySnapshot.docs[0]; // Get the first matched document
        const user = userDoc.data();
        // Populate the modal with the user's data from Firestore
        userProfileInfo.innerHTML = `
          <p><strong>Shop Name:</strong> ${user.shopname}</p>
          <p><strong>Email:</strong> ${user.email}</p>
          <p><strong>Shop Address:</strong> ${user.shopaddress}</p>
          <p><strong>Account Type:</strong> ${user.role}</p>
        `;
        // Show the modal
        modal.classList.remove("hidden");
      } else {
        userProfileInfo.innerHTML = '<p class="text-red-500">User document not found!</p>';
        modal.classList.remove("hidden");
        console.error("User document not found!");
      }
    } catch (error) {
      userProfileInfo.innerHTML = '<p class="text-red-500">Error loading profile.</p>';
      modal.classList.remove("hidden");
      console.error("Error fetching user data: ", error);
    } finally {
      loader.hide();
    }
  }

  // Function to close the modal
  document.getElementById("close-profile").addEventListener("click", function () {
    const modal = document.getElementById("profile-modal");
    modal.classList.add("hidden");
    loader.hide();
  });

  // Set up profile icon click listener (if element exists)
  const profileIcon = document.getElementById("profile-icon");
  if (profileIcon) {
    profileIcon.addEventListener("click", async function (event) {
      event.preventDefault();
      loader.show();
      if (auth.currentUser) {
        await openProfileModal(auth.currentUser.uid);
      } else {
        loader.hide();
      }
    });
  }

  // Listen for changes in the authentication state
  onAuthStateChanged(auth, (user) => {
    if (user) {
      // User is signed in
      console.log("User signed in:", user.uid);
    } else {
      // No user is signed in
      console.log("No user is signed in");
    }
  });

  // Close the modal if the user clicks outside the modal content
  window.addEventListener("click", function (event) {
    const modal = document.getElementById("profile-modal");
    if (event.target === modal) {
      modal.classList.add("hidden");
    }
  });
});