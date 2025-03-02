// Import necessary Firebase libraries
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-app.js";
import { getFirestore, doc, getDoc, deleteDoc, setDoc, collection } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-auth.js";

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
// Initialize Firestore and Firebase Authentication
const db = getFirestore();
const auth = getAuth();

// Function to move the listing to "inactive listings"
async function moveToInactive(docId) {
    const user = auth.currentUser;
    if (!user) {
        alert("You need to log in to perform this action.");
        return;
    }

    try {
        // Get the document to move
        const listingRef = doc(db, "listed_items", docId);
        const listingSnap = await getDoc(listingRef);

        if (!listingSnap.exists()) {
            alert("This listing no longer exists.");
            return;
        }

        const listingData = listingSnap.data();

        // Add the listing to the "inactive listings" collection
        const inactiveListingsRef = collection(db, "inactive_listings");
        const newListingRef = doc(inactiveListingsRef);

        // Move the listing to the "inactive listings"
        await setDoc(newListingRef, listingData);

        // Delete the listing from the "listed_items" collection
        await deleteDoc(listingRef);

        alert("Listing has been deactivated.");

        location.reload()
    } catch (error) {
        console.error("Error deactivating listing:", error);
        alert("There was an error while deactivating the listing. Please try again.");
    }
}

// Add event listener for remove buttons
document.addEventListener("click", (event) => {
    if (event.target && event.target.classList.contains("deactivate-btn")) {
        const listingId = event.target.getAttribute("data-id");
        moveToInactive(listingId);
    }
});