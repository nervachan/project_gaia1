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
window.openProfileModal=async function () {
  const modal = document.getElementById("profile-modal");
  const userProfileInfo = document.getElementById("user-profile-info");
  // Loader already shown above
  try {
    const user = auth.currentUser;
    if (!user) {
      console.error("No user is currently signed in.");
      return;
    }
    const loggedInUid = user.uid;

    // Query Firestore for the user document where 'uid' field matches the logged-in user's uid
    const userQuery = query(
      collection(db, "user-buyer"),
      where("uid", "==", loggedInUid)
    );
    const querySnapshot = await getDocs(userQuery);

    if (!querySnapshot.empty) {
      const userDoc = querySnapshot.docs[0]; // assuming only one match
      const userData = userDoc.data();
      userProfileInfo.innerHTML = `
        <p><strong>Name:</strong> ${userData.username}</p>
        <p><strong>Email:</strong> ${userData.email}</p>
        <p><strong>Account Type:</strong> ${userData.role}</p>
      `;
      if (modal) modal.classList.remove("hidden");
    } else {
      userProfileInfo.innerHTML = '<p class="text-red-500">User document not found.</p>';
      if (modal) modal.classList.remove("hidden");
      console.error("User document not found for UID:", loggedInUid);
    }
  } catch (error) {
    userProfileInfo.innerHTML = '<p class="text-red-500">Error loading profile.</p>';
    if (modal) modal.classList.remove("hidden");
    console.error("Error fetching user data: ", error);
  }
}

  // Function to close the modal
  document.getElementById("close-profile").addEventListener("click", function () {
    const modal = document.getElementById("profile-modal");
    modal.classList.add("hidden");
  });

  // Listen for changes in the authentication state
  onAuthStateChanged(auth, (user) => {
    if (user) {
      // User is signed in
      const loggedInEmail = user.email; // Use the logged-in user's email

      // Simulate opening the modal when the profile icon is clicked
      document.getElementById("profile-icon").addEventListener("click", async function (event) {
        event.preventDefault(); // Prevent the default link behavior
        loader.show();
        await openProfileModal();
        loader.hide();
      });
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