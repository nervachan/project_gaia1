// Import Firebase libraries and initialize Firestore
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-app.js";
import { getFirestore, collection, getDocs, query, where } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-firestore.js";
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

// Function to fetch and display user-specific listings from "listed_items"
async function fetchUserListings() {
    const user = auth.currentUser;
    const userId = user ? user.uid : null;

    // Log the logged-in user details for debugging
    console.log("Logged in user:", user);

    if (!userId) {
        console.log("No user is logged in.");
        return;
    }

    const listingsContainer = document.getElementById("activeListings");
    listingsContainer.innerHTML = "<p>Loading...</p>";

    try {
        // Query the "listed_items" collection where userId matches the logged-in user's ID
        const listingsQuery = query(collection(db, "listed_items"), where("userId", "==", userId));
        const listingsSnapshot = await getDocs(listingsQuery);
        listingsContainer.innerHTML = ""; // Clear loading text

        if (listingsSnapshot.empty) {
            listingsContainer.innerHTML = "<p>No listings found for this user.</p>";
            return;
        }

        // Loop through the documents and display each listing
        for (const docSnapshot of listingsSnapshot.docs) {
            const listingData = docSnapshot.data();
            const itemDiv = document.createElement("div");
            itemDiv.className = "bg-white shadow-md rounded p-6 mb-4";

            // Dynamically generate the HTML with template literals
            const image = listingData.image ? `<img src="${listingData.image}" alt="${listingData.productName}" class="w-full h-48 object-cover rounded-md">` : '';

            itemDiv.innerHTML = `
                ${image}
                <div class="p-4">
                    <p class="text-gray-700 mt-2">${listingData.category}</p>
                    <h3 class="text-xl font-semibold text-gray-800">${listingData.productName}</h3>
                    <p class="text-lg font-medium text-gray-600">${listingData.condition}</p>
                    ${listingData.garmentSize ? `<p class="text-gray-700 mt-2">Garment Size: ${listingData.garmentSize}</p>` : ''}
                    ${listingData.rentPrice ? `<p class="text-gray-700 mt-2">Rent Price: $${listingData.rentPrice}</p>` : ''}
                    ${listingData.sellPrice ? `<p class="text-gray-700 mt-2">Selling Price: ${listingData.sellPrice}</p>` : ''}
                    <div class="flex justify-between mt-4">
                        <a href="#" class="inline-block py-2 px-6 bg-blue-600 text-white rounded-full text-sm hover:bg-blue-700 deactivate-btn" data-id="${docSnapshot.id}" data-listing='${JSON.stringify(listingData)}'>
                            Deactivate Listing
                        </a>
                        <button class="inline-block py-2 px-6 bg-orange-600 text-white rounded-full text-sm hover:bg-orange-700 edit-btn" data-id="${docSnapshot.id}" data-listing='${JSON.stringify(listingData)}'>
                            Edit Listing
                        </button>
                    </div>
                </div>
            `;

            listingsContainer.appendChild(itemDiv);
        }

    } catch (error) {
        console.error("Error fetching user listings:", error);
        listingsContainer.innerHTML = "<p>Error loading listings. Please try again later.</p>";
    }
}

// Listen for authentication state changes
onAuthStateChanged(auth, (user) => {
    if (user) {
        // If the user is logged in, fetch their listings
        fetchUserListings();
    } else {
        // Handle case where no user is logged in (e.g., show a message or redirect)
        console.log("User is not logged in.");
        const listingsContainer = document.getElementById("rentedItemsList");
        listingsContainer.innerHTML = "<p>You need to log in to view your listings.</p>";
    }
});

// Call fetchUserListings when the page loads, if the user is already logged in
document.addEventListener("DOMContentLoaded", () => {
    const user = auth.currentUser;
    if (user) {
        fetchUserListings(); // Fetch listings if the user is already logged in
    } else {
        console.log("User is not logged in yet.");
    }
});
