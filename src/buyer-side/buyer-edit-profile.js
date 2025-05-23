// Import Firebase SDKs
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-app.js";
import { getAuth, updateProfile, onAuthStateChanged, updateEmail } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-auth.js";
import { getFirestore, collection, query, where, getDocs, doc, updateDoc } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-firestore.js";

// Firebase configuration
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
const auth = getAuth(app);
const db = getFirestore(app);

// Function to fetch and inject user data
const fetchAndInjectUserData = async (email) => {
    try {
        const q = query(collection(db, "user-buyer"), where("email", "==", email));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
            const userDoc = querySnapshot.docs[0];
            const userData = userDoc.data();

            const username = userData.username;

            document.getElementById("buyer-email").value = email;
            document.getElementById("buyer-username").value = username;

            console.log("User data injected into text boxes:", { email, username });
        } else {
            console.error("No document found for the user in 'user-buyer' collection.");
        }
    } catch (error) {
        console.error("Error fetching user data from Firestore:", error);
    }
};

// Listen for authentication state changes
onAuthStateChanged(auth, (user) => {
    if (user) {
        console.log("User is logged in:", user);
        fetchAndInjectUserData(user.email);
    } else {
        console.log("No user is logged in.");
        window.location.href = "/project_gaia1/src/buyer-login.html";
    }
});

// Function to show the modal
const showModal = (modalId) => {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove("hidden");
    }
};

// Function to hide a modal
const hideModal = (modalId) => {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add("hidden");
    }
};

// Event listeners for edit buttons
document.getElementById("buyer-username-edit").addEventListener("click", () => {
    showModal("edit-modal-username");
});

document.getElementById("buyer-email-edit").addEventListener("click", () => {
    showModal("edit-modal-email");
});

// Event listener for cancel button in the username modal
document.getElementById("cancel-edit-username").addEventListener("click", () => {
    hideModal("edit-modal-username");
});

// Event listener for cancel button in the email modal
document.getElementById("cancel-edit-email").addEventListener("click", () => {
    hideModal("edit-modal-email");
});

// Add event listeners to close modals when clicking outside
window.addEventListener("click", (event) => {
    const modals = document.querySelectorAll(".fixed.inset-0"); // Select modals by their class
    modals.forEach((modal) => {
        if (event.target === modal) {
            modal.classList.add("hidden");
        }
    });
});

// Event listener for saving the new username
document.getElementById("save-edit-username").addEventListener("click", async (event) => {
    event.preventDefault();

    const newUsername = document.getElementById("edit-input-username").value.trim();

    if (!newUsername) {
        alert("Username cannot be empty.");
        return;
    }

    const user = auth.currentUser;

    if (user) {
        try {
            // Update the username in Firebase Authentication
            await updateProfile(user, { displayName: newUsername });
            console.log("Username updated in Firebase Auth:", newUsername);

            // Query Firestore to find the document for the logged-in user
            const q = query(collection(db, "user-buyer"), where("email", "==", user.email));
            const querySnapshot = await getDocs(q);

            if (!querySnapshot.empty) {
                // Get the first matched document
                const userDoc = querySnapshot.docs[0];
                const userDocRef = userDoc.ref;

                // Update the username in Firestore
                await updateDoc(userDocRef, { username: newUsername });
                console.log("Username updated in Firestore:", newUsername);

                // Update the username in the UI
                document.getElementById("buyer-username").value = newUsername;

                // Close the modal
                hideModal("edit-modal-username");

                alert("Username updated successfully!");
            } else {
                console.error("No matching document found in Firestore.");
                alert("Failed to update username. User document not found.");
            }
        } catch (error) {
            console.error("Error updating username:", error);
            alert("Failed to update username. Please try again.");
        }
    } else {
        alert("No user is logged in.");
    }
});

