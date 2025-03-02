// Import the necessary Firebase functions
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-app.js";
import { getFirestore, collection, query, where, getDocs, doc, setDoc, deleteDoc, getDoc } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-firestore.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-auth.js";  // Import Firebase Authentication

// Firebase Configuration (use the same config as your main app)
const firebaseConfig = {
    apiKey: "AIzaSyC7eaM6HrHalV-wcG-I9_RZJRwDNhin2R0",
    authDomain: "project-gaia1.firebaseapp.com",
    projectId: "project-gaia1",
    storageBucket: "project-gaia1.firebasestorage.app",
    messagingSenderId: "832122601643",
    appId: "1:832122601643:web:1ab91b347704174f52b7ee",
    measurementId: "G-DX2L33NH4H"
};

// Initialize Firebase and Firestore
const app = initializeApp(firebaseConfig);
const db = getFirestore();
const auth = getAuth();  // Initialize Firebase Authentication

// Function to fetch inactive listings for the logged-in user
async function fetchInactiveListings() {
    const user = auth.currentUser;

    if (!user) {
        console.log("No user is logged in.");
        return;
    }

    const listingsContainer = document.getElementById('inactive-listings-container');
    listingsContainer.innerHTML = ''; // Clear the container

    try {
        // Query to get inactive listings associated with the logged-in user
        const inactiveItemsQuery = query(collection(db, 'inactive_listings'), where('userId', '==', user.uid));
        const inactiveItemsSnapshot = await getDocs(inactiveItemsQuery);

        if (inactiveItemsSnapshot.empty) {
            listingsContainer.innerHTML = "<p>No inactive listings found.</p>";
            return;
        }

        // Loop through and display the inactive listings
        inactiveItemsSnapshot.forEach(doc => {
            const listing = doc.data();
            const listingElement = createInactiveListingElement(listing, doc.id);
            listingsContainer.appendChild(listingElement);
        });
    } catch (error) {
        console.error("Error fetching inactive listings: ", error);
    }
}

// Function to create an element for each inactive listing
function createInactiveListingElement(listing, listingId) {
    const listingElement = document.createElement('div');
    listingElement.classList.add('bg-white', 'p-4', 'rounded-lg', 'shadow-lg');

    const image = listing.image ? `<img src="${listing.image}" alt="${listing.productName}" class="w-full h-48 object-cover rounded-md">` : '';

    listingElement.innerHTML = `
        ${image}
        <h3 class="text-xl font-semibold text-gray-900 mt-4">${listing.productName}</h3>
        <p class="text-gray-600 mt-2">${listing.productDescription}</p>
        <p class="text-gray-700 mt-2">Category: ${listing.category}</p>
        <p class="text-gray-700 mt-2">Terms: ${listing.condition}</p>
        ${listing.rentPrice ? `<p class="text-gray-700 mt-2">Rent Price: ₱${listing.rentPrice}</p>` : ''}
        ${listing.sellPrice ? `<p class="text-gray-700 mt-2">Selling Price: ₱${listing.sellPrice}</p>` : ''}
        <div class="mt-4">
            <button class="relist-button bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600" data-id="${listingId}">Re-list</button>
        </div>
    `;

    return listingElement;
}

// Function to re-list the item from 'inactive_listings' to 'listed_items'
async function relistItem(listingId) {
    const user = auth.currentUser;

    if (!user) {
        console.log("No user is logged in.");
        return;
    }

    try {
        // Fetch the inactive listing
        const listingDocRef = doc(db, 'inactive_listings', listingId);
        const listingDocSnap = await getDoc(listingDocRef);

        if (listingDocSnap.exists()) {
            const listingData = listingDocSnap.data();
            listingData.userId = user.uid;  // Ensure the listing is associated with the logged-in user

            // Add the item to the "listed_items" collection
            await setDoc(doc(db, 'listed_items', listingId), listingData);
            console.log("Item re-listed successfully!");

            // Remove from the "inactive_listings" collection
            await deleteDoc(listingDocRef);
            console.log("Item removed from inactive listings.");

            // Refresh the list of inactive listings
            fetchInactiveListings();
        } else {
            console.error("No listing found with the provided ID.");
        }
    } catch (error) {
        console.error("Error re-listing item: ", error);
    }
}

// Add event listener for re-list buttons
document.body.addEventListener('click', (event) => {
    if (event.target.classList.contains('relist-button')) {
        const listingId = event.target.getAttribute('data-id');
        console.log("Re-list button clicked for listing ID:", listingId); // Debug log
        relistItem(listingId);
    }
});

// Load the inactive listings when the page is loaded
window.onload = fetchInactiveListings;

// Add onAuthStateChanged listener to fetch inactive listings when user is logged in
onAuthStateChanged(auth, (user) => {
    if (user) {
        console.log("User is logged in:", user);
        fetchInactiveListings(); // Fetch inactive listings once user is logged in
    } else {
        console.log("No user is logged in.");
    }

    // Call the function to fetch inactive listings when the page loads
document.addEventListener('DOMContentLoaded', function () {
    fetchInactiveListings();  // Load inactive listings once the DOM is ready
});
});

