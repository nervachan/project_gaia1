// Import Firebase libraries and initialize Firestore
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-app.js";
import { getFirestore, doc, getDoc, collection, getDocs, } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-firestore.js";

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

// Function to fetch data from Firestore and dynamically create rented items list
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);



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

// Function to fetch and display pending listings
async function fetchPendingListings() {
    const pendingListingsContainer = document.getElementById("rentedItemsList");
    pendingListingsContainer.innerHTML = "<p>Loading...</p>";

    try {
        // Fetch all documents from the "pending items" collection
        const pendingListingsSnapshot = await getDocs(collection(db, "pending items"));
        pendingListingsContainer.innerHTML = ""; // Clear loading text

        if (pendingListingsSnapshot.empty) {
            pendingListingsContainer.innerHTML = "<p>No pending listings found.</p>";
            return;
        }

        // Loop through the documents and display each pending listing
        for (const docSnapshot of pendingListingsSnapshot.docs) {
            const listingData = docSnapshot.data();
            const itemDiv = document.createElement("div");
            itemDiv.className = "bg-white shadow-md rounded p-6 mb-4";

            // Fetch image from another collection
            let imageUrl = "";
            if (listingData.imageDocumentId) {
                imageUrl = await fetchImageFromOtherCollection(
                    "listed items", // Replace with the actual collection name
                    listingData.imageDocumentId,
                    "image" // Replace with the actual field name
                );
            }

            // Populate item HTML
            itemDiv.innerHTML = `
                <h3 class="text-xl font-semibold text-gray-800">${listingData.productName}</h3>
                <p class="text-gray-600">${listingData.productDescription}</p>
                <p class="text-gray-600">Price: ₱${listingData.price}</p>
                <p class="text-gray-600">Start Day of Rental: ${listingData.startDate}</p>
                <p class="text-gray-600">End Day of Rental: ${listingData.endDate}</p>
                <p class="text-gray-600">Time of Reservation: ${listingData.submissionTime}</p>
                <p class="text-gray-600">Name of Reserver: ${listingData.userName}</p>
                ${imageUrl ? `<img src="${image}" alt="Product Image" class="w-full h-auto mt-4 rounded">` : ""}
            `;

            pendingListingsContainer.appendChild(itemDiv);
        }
    } catch (error) {
        console.error("Error fetching pending listings:", error);
        pendingListingsContainer.innerHTML = "<p>Error loading pending listings. Please try again later.</p>";
    }
}

// Call fetchPendingListings when the page loads
document.addEventListener("DOMContentLoaded", fetchPendingListings);
