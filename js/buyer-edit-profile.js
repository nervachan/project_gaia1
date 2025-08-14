// Import Firebase SDKs
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-app.js";
import { getAuth, updateProfile, onAuthStateChanged, updateEmail } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-auth.js";
import { getFirestore, collection, query, where, getDocs, doc, updateDoc } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-firestore.js";
import { loader } from './loader.js';

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyC7eaM6HrHalV-wcG-I9_RZJRwDNhin2R0",
    authDomain: "project-gaia1.firebaseapp.com",
    projectId: "project-gaia1",
    storageBucket: "project-gaia1.appspot.com",
    messagingSenderId: "832122601643",
    appId: "1:832122601643:web:1ab91b347704174f52b7ee",
    measurementId: "G-DX2L33NH4H"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// --- Functions ---

// Function to show a modal
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

// Function to fetch and inject user data
const fetchAndInjectUserData = async (email) => {
    try {
        const q = query(collection(db, "user-buyer"), where("email", "==", email));
        const querySnapshot = await loader.withLoader(
            () => getDocs(q),
            "Loading profile data..."
        );

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

// --- Auth State --- 

onAuthStateChanged(auth, (user) => {
    if (user) {
        console.log("User is logged in:", user);
        fetchAndInjectUserData(user.email);
    } else {
        console.log("No user is logged in.");
        window.location.href = "buyer-login.html";
    }
});

// --- Event Listeners ---

document.addEventListener('DOMContentLoaded', () => {

    // Edit buttons
    document.getElementById("buyer-username-edit").addEventListener("click", () => showModal("edit-modal-username"));
    

    // Cancel buttons
    document.getElementById("cancel-edit-username").addEventListener("click", () => hideModal("edit-modal-username"));
    document.getElementById("cancel-edit-email").addEventListener("click", () => hideModal("edit-modal-email"));

    // Save button for username
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
                await loader.withLoader(() => updateProfile(user, { displayName: newUsername }), "Updating username...");
                console.log("Username updated in Firebase Auth:", newUsername);

                const q = query(collection(db, "user-buyer"), where("email", "==", user.email));
                const querySnapshot = await loader.withLoader(() => getDocs(q), "Updating profile...");

                if (!querySnapshot.empty) {
                    const userDocRef = querySnapshot.docs[0].ref;
                    await loader.withLoader(() => updateDoc(userDocRef, { username: newUsername }), "Finalizing update...");
                    console.log("Username updated in Firestore:", newUsername);

                    document.getElementById("buyer-username").value = newUsername;
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
        }
    });

    // Close modals when clicking outside
    window.addEventListener("click", (event) => {
        const modals = document.querySelectorAll(".fixed.inset-0");
        modals.forEach((modal) => {
            if (event.target === modal) {
                hideModal(modal.id);
            }
        });
    });
});

