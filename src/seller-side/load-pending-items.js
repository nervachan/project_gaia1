// Import Firebase libraries and initialize Firestore
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-app.js";
import { getFirestore, collection, getDocs, query, where, doc, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-firestore.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-auth.js";

// Firebase configuration and initialization
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
const db = getFirestore(app);
const auth = getAuth(app);

// Function to fetch image from another collection
async function fetchImageFromOtherCollection(collectionName, documentId, imageField) {
    try {
        const docRef = doc(db, collectionName, documentId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const imageUrl = docSnap.get(imageField);
            return imageUrl || null;
        } else {
            console.log("No such document for image!");
            return null;
        }
    } catch (error) {
        console.error("Error fetching image:", error);
        throw error;
    }
}

// Function to update item status (picked up, returned, or relisted)
async function updateItemStatus(itemId, newStatus) {
    const itemRef = doc(db, "", itemId);
    try {
        await updateDoc(itemRef, {
            status: newStatus // Updating the status based on the argument passed
        });
        alert(`Item marked as ${newStatus}!`);
        fetchUserPendingItems(); // Refresh the list after status update
    } catch (error) {
        console.error(`Error marking item as ${newStatus}:`, error);
        alert("Error updating item status. Please try again.");
    }
}

// Function to fetch and display user-specific pending items from "rentals"
async function fetchUserPendingItems(userId) {
    if (!userId) {
        console.log("No user is logged in.");
        return;
    }

    const pendingItemsContainer = document.getElementById("pendingItemsList");
    if (!pendingItemsContainer) {
        console.error("pendingItemsList element not found.");
        return;
    }

    pendingItemsContainer.innerHTML = "<p>Loading...</p>";

    try {
        // Query the "rentals" collection where sellerId matches the logged-in user's ID
        const pendingItemsQuery = query(collection(db, "rentals"), where("sellerId", "==", userId));
        const pendingItemsSnapshot = await getDocs(pendingItemsQuery);
        pendingItemsContainer.innerHTML = ""; // Clear loading text

        if (pendingItemsSnapshot.empty) {
            pendingItemsContainer.innerHTML = "<p>No pending items found for this seller.</p>";
            return;
        }

        // Loop through the documents and display each pending item
        for (const docSnapshot of pendingItemsSnapshot.docs) {
            const itemData = docSnapshot.data();
            const itemDiv = document.createElement("div");
            itemDiv.className = "bg-white shadow-md rounded p-6 mb-4";

            // Use the "image" field directly from the rentals collection
            const imageUrl = itemData.image || "";

            // Populate item HTML
            itemDiv.innerHTML = `
                <h3 class="text-xl font-semibold text-gray-800">${itemData.listingName}</h3>
                <p class="text-gray-600">Price: ₱${itemData.finalPrice}</p>
                <p class="text-gray-600">Start Day of Rental: ${itemData.startDate}</p>
                <p class="text-gray-600">End Day of Rental: ${itemData.endDate}</p>
                <p class="text-gray-600">Name of Reserver: ${itemData.name}</p>
                <p class="text-gray-600">Status: ${itemData.status}</p>
                ${imageUrl ? `<img src="${imageUrl}" alt="Product Image" class="w-full h-auto mt-4 rounded">` : ""}
            `;

            // Create the dynamic button based on the status
            const button = document.createElement("button");
            button.className = "bg-blue-500 text-white px-4 py-2 rounded mt-4";

            // Set button text and functionality based on the current status
            if (itemData.status === "picked up") {
                button.textContent = "Mark as Returned";
                button.onclick = () => updateItemStatus(docSnapshot.id, "returned");
            } else if (itemData.status === "returned") {
                button.textContent = "Relist Item";
                button.onclick = () => updateItemStatus(docSnapshot.id, "relisted");
            } else {
                button.textContent = "Mark as Picked Up";
                button.onclick = () => updateItemStatus(docSnapshot.id, "picked up");
            }

            itemDiv.appendChild(button);
            pendingItemsContainer.appendChild(itemDiv);
        }
    } catch (error) {
        console.error("Error fetching user pending items:", error);
        pendingItemsContainer.innerHTML = "<p>Error loading pending items. Please try again later.</p>";
    }
}

// Function to fetch and display rentals for the logged-in user
async function fetchUserRentals(userId) {
    if (!userId) {
        console.log("No user is logged in.");
        return;
    }

    const rentalsContainer = document.getElementById("rentalsList");
    if (!rentalsContainer) {

        return;
    }

    rentalsContainer.innerHTML = "<p>Loading...</p>";

    try {
        // Query the "rentals" collection where uid matches the logged-in user's ID
        const rentalsQuery = query(collection(db, "rentals"), where("uid", "==", userId));
        const rentalsSnapshot = await getDocs(rentalsQuery);
        rentalsContainer.innerHTML = ""; // Clear loading text

        if (rentalsSnapshot.empty) {
            rentalsContainer.innerHTML = "<p>No rentals found for this user.</p>";
            return;
        }

        // Loop through the documents and display each rental item
        for (const docSnapshot of rentalsSnapshot.docs) {
            const rentalData = docSnapshot.data();
            const rentalDiv = document.createElement("div");
            rentalDiv.className = "bg-white shadow-md rounded p-6 mb-4";

            // Fetch image from another collection if imageDocumentId exists
            let imageUrl = "";
            if (rentalData.imageDocumentId) {
                imageUrl = await fetchImageFromOtherCollection(
                    "listed-items", // Collection where image is stored
                    rentalData.imageDocumentId,
                    "image" // Field name for the image URL in that collection
                );
            }

            // Populate rental item HTML
            rentalDiv.innerHTML = `
                <h3 class="text-xl font-semibold text-gray-800">${rentalData.productName}</h3>
                <p class="text-gray-600">${rentalData.productDescription}</p>
                <p class="text-gray-600">Price: ₱${rentalData.price}</p>
                <p class="text-gray-600">Start Day of Rental: ${rentalData.startDate}</p>
                <p class="text-gray-600">End Day of Rental: ${rentalData.endDate}</p>
                <p class="text-gray-600">Time of Reservation: ${rentalData.submissionTime}</p>
                <p class="text-gray-600">Status: ${rentalData.status}</p>
                ${imageUrl ? `<img src="${imageUrl}" alt="Product Image" class="w-full h-auto mt-4 rounded">` : ""}
            `;

            rentalsContainer.appendChild(rentalDiv);
        }
    } catch (error) {
        console.error("Error fetching user rentals:", error);
        rentalsContainer.innerHTML = "<p>Error loading rentals. Please try again later.</p>";
    }
}

// Listen for changes in authentication state
onAuthStateChanged(auth, (user) => {
    if (user) {
        // User is logged in
        console.log("Logged in user:", user);
        fetchUserPendingItems(user.uid); // Pass the user ID to the fetch function
        fetchUserRentals(user.uid); // Pass the user ID to the fetch function
    } else {
        // User is not logged in
        console.log("No user logged in.");
        const pendingItemsList = document.getElementById("pendingItemsList");
        if (pendingItemsList) {
            pendingItemsList.innerHTML = "<p>Please log in to view your pending items.</p>";
        } else {
            console.error("pendingItemsList element not found.");
        }

        const rentalsList = document.getElementById("rentalsList");
        if (rentalsList) {
            rentalsList.innerHTML = "<p>Please log in to view your rentals.</p>";
        } else {
            console.error("rentalsList element not found.");
        }
    }
});

// Ensure DOM content is fully loaded before running any code
document.addEventListener("DOMContentLoaded", function() {
    // All DOM manipulation related code should be inside here
});
