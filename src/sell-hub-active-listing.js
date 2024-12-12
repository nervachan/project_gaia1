// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-analytics.js";
import { getFirestore, collection, query, where, getDocs, doc, deleteDoc, setDoc  } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-firestore.js";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
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
const analytics = getAnalytics(app);
const db = getFirestore(app);

// Function to render active listings
async function renderActiveListings() {
    const activeListingsContainer = document.getElementById('activeListings');
    activeListingsContainer.innerHTML = ''; // Clear previous listings

    try {
        // Create a query to get active listings
        const listingsQuery = query(collection(db, 'listed items'), where('isActive', '==', true));
        const querySnapshot = await getDocs(listingsQuery);

        if (querySnapshot.empty) {
            activeListingsContainer.innerHTML = '<p class="text-gray-500">No active listings available.</p>';
            return;
        }

        querySnapshot.forEach(doc => {
            const listing = doc.data();
            const listingCard = document.createElement('div');
            listingCard.classList.add('bg-white', 'rounded-lg', 'shadow-lg', 'overflow-hidden', 'text-center');

            const image = listing.image ? `<img src="${listing.image}" alt="${listing.productName}" class="w-full h-48 object-cover rounded-md">` : '';
            listingCard.innerHTML = `
                ${image}
                <div class="p-4">
                    <p class="text-gray-700 mt-2">${listing.category}</p>
                    <h3 class="text-xl font-semibold text-gray-800">${listing.productName}</h3>
                    <p class="text-lg font-medium text-gray-600">${listing.condition}</p>
                    ${listing.rentPrice ? `<p class="text-gray-700 mt-2">Rent Price: $${listing.rentPrice}</p>` : ''}
                    ${listing.sellPrice ? `<p class="text-gray-700 mt-2">Selling Price: $${listing.sellPrice}</p>` : ''}
                    <a href="#" class="inline-block mt-4 py-2 px-6 bg-blue-600 text-white rounded-full text-sm hover:bg-blue-700 deactivate-btn" data-id="${doc.id}" data-listing='${JSON.stringify(listing)}'>
                        Deactivate Listing
                    </a>
                </div>
            `;

            activeListingsContainer.appendChild(listingCard);
        });

        // Add event listeners to deactivate buttons
        const deactivateButtons = document.querySelectorAll('.deactivate-btn');
        deactivateButtons.forEach(button => {
            button.addEventListener('click', handleDeactivate);
        });
    } catch (error) {
        console.error("Error fetching listings: ", error);
        activeListingsContainer.innerHTML = '<p class="text-red-500">Error loading listings.</p>';
    }
}

// Function to handle deactivating a listing
async function handleDeactivate(event) {
    event.preventDefault();
    const listingId = event.target.getAttribute('data-id');
    const listingData = JSON.parse(event.target.getAttribute('data-listing'));

    // Confirm deactivation
    const confirmDeactivation = confirm("Are you sure you want to deactivate this listing?");
    if (!confirmDeactivation) return;

    try {
        // Remove the listing from the "listed items" collection
        await deleteDoc(doc(db, 'listed items', listingId));

        // Add the listing to the "inactive listings" collection
        await setDoc(doc(db, 'inactive listings', listingId), {
            ...listingData,
            isActive: false // Set isActive to false for inactive listings
        });

        // Re-render the active listings
        renderActiveListings();
    } catch (error) {
        console.error("Error deactivating listing: ", error);
    }
}

// Call the function to render active listings
renderActiveListings();