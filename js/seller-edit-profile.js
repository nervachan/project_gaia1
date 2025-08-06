// Import Firebase SDKs
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-auth.js";
import { getFirestore, collection, query, where, getDocs, doc, updateDoc } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-firestore.js";
import { loader } from './loader.js';

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

// Function to fetch and inject user data by email
const fetchAndInjectUserData = async (email) => {
    try {
        const q = query(collection(db, "user-seller"), where("email", "==", email));
        const querySnapshot = await loader.withLoader(
            () => getDocs(q),
            "Loading profile data..."
        );

        if (!querySnapshot.empty) {
            const userDoc = querySnapshot.docs[0];
            const userData = userDoc.data();

            // Populate the fields with user data
            document.getElementById("seller-username").value = userData.username;
            document.getElementById("seller-shoploc").value = userData.shopaddress;
            document.getElementById("seller-shopname").value = userData.shopname;

            console.log("User data injected into text boxes:", userData);
        } else {
            console.error("No document found for the user with the specified email in 'user-seller' collection.");
        }
    } catch (error) {
        console.error("Error fetching user data from Firestore:", error);
    }
};

// Generic function to update a field in Firestore by UID
const updateFieldByUID = async (uid, field, newValue) => {
    try {
        const q = query(collection(db, "user-seller"), where("uid", "==", uid));
        const querySnapshot = await loader.withLoader(
            () => getDocs(q),
            "Loading profile..."
        );

        if (!querySnapshot.empty) {
            const userDoc = querySnapshot.docs[0];
            const userDocRef = doc(db, "user-seller", userDoc.id);

            // Update the specified field
            await loader.withLoader(
                () => updateDoc(userDocRef, { [field]: newValue }),
                `Updating ${field}...`
            );
            console.log(`${field} updated successfully in Firestore.`);
            alert(`${field} updated successfully!`);
            location.reload(); // Refresh the page after the alert
        } else {
            console.error(`No document found for the user with the specified UID.`);
            alert(`No user data found to update the ${field}.`);
        }
    } catch (error) {
        console.error(`Error updating ${field} in Firestore:`, error);
        alert(`Failed to update the ${field}. Please try again.`);
    }
};

// Function to handle username change
const handleUsernameChange = async () => {
    const user = auth.currentUser;
    if (user) {
        const newUsername = prompt("Enter your new username:");
        if (newUsername && newUsername.trim()) {
            await updateFieldByUID(user.uid, "username", newUsername.trim());
        } else {
            alert("Username cannot be empty.");
        }
    } else {
        alert("No user is logged in.");
    }
};

// Function to handle shop location change
const handleShopLocationChange = async () => {
    const user = auth.currentUser;
    if (user) {
        const newShopLocation = prompt("Enter your new shop location:");
        if (newShopLocation && newShopLocation.trim()) {
            await updateFieldByUID(user.uid, "shopaddress", newShopLocation.trim());
        } else {
            alert("Shop location cannot be empty.");
        }
    } else {
        alert("No user is logged in.");
    }
};

// Function to handle shop name change
const handleShopNameChange = async () => {
    const user = auth.currentUser;
    if (user) {
        const newShopName = prompt("Enter your new shop name:");
        if (newShopName && newShopName.trim()) {
            await updateFieldByUID(user.uid, "shopname", newShopName.trim());
        } else {
            alert("Shop name cannot be empty.");
        }
    } else {
        alert("No user is logged in.");
    }
};

// Listen for authentication state changes
onAuthStateChanged(auth, (user) => {
    if (user) {
        console.log("User is logged in:", user);

        const email = user.email;
        if (email) {
            fetchAndInjectUserData(email); // Fetch and inject user data
        } else {
            console.error("No email found for the logged-in user.");
        }
    } else {
        console.log("No user is logged in.");
        window.location.href = "seller-hub-main.html"; // Redirect to main hub if not logged in
    }
});

// Event listeners for edit buttons
document.getElementById("seller-username-edit").addEventListener("click", handleUsernameChange);
document.getElementById("seller-shoploc-edit").addEventListener("click", handleShopLocationChange);
document.getElementById("seller-shopname-edit").addEventListener("click", handleShopNameChange);