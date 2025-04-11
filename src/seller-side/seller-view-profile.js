import { initializeApp } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-analytics.js";
import { getFirestore, collection, query, where, getDocs } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-firestore.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-auth.js"; // Import Firebase Authentication

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
  async function openProfileModal(email) {
    const modal = document.getElementById("profile-modal");
    const userProfileInfo = document.getElementById("user-profile-info");

    try {
      // Query Firestore for the user document matching the 'email' field
      const q = query(collection(db, "user-seller"), where("email", "==", email)); // Querying based on the 'email' field
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        // Assuming there's only one user with the provided email
        const userDoc = querySnapshot.docs[0]; // Get the first matched document
        const user = userDoc.data();

        // Populate the modal with the user's data from Firestore
        userProfileInfo.innerHTML = `
          <p><strong>Name:</strong> ${user.username}</p>
          <p><strong>Email:</strong> ${user.email}</p>
          <p><strong>Account Type:</strong> ${user.role}</p>
        `;

        // Show the modal
        modal.classList.remove("hidden");
      } else {
        console.error("User document not found!");
      }
    } catch (error) {
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
      document.getElementById("profile-icon").addEventListener("click", function (event) {
        event.preventDefault(); // Prevent the default link behavior
        openProfileModal(loggedInEmail); // Pass the logged-in user's email to the function
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