// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-analytics.js";
import { getFirestore, collection, query, where, getDocs } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-firestore.js";

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

// Function to load and display listings from Firestore
async function loadListings() {
    const listingsContainer = document.getElementById('listing-container');

    // Clear the container before adding new listings
    listingsContainer.innerHTML = '';

    try {
        // Create a query to fetch active listings from Firestore
        const listingsQuery = query(collection(db, 'listed items'), where('isActive', '==', true));
        const listingsSnapshot = await getDocs(listingsQuery);

        // Loop through the listings and add them to the page
        listingsSnapshot.forEach(doc => {
            const listing = doc.data();
            const listingElement = document.createElement('div');
            listingElement.classList.add('bg-white', 'p-4', 'rounded-lg', 'shadow-lg');

            // If the listing has an image, display it
            const image = listing.image ? `<img src="${listing.image}" alt="${listing.productName}" class="w-full h-48 object-cover rounded-md">` : '';
            
            listingElement.innerHTML = `
                ${image}
                <h3 class="text-xl font-semibold text-gray-900 mt-4">${listing.productName}</h3>
                <p class="text-gray-600 mt-2">${listing.productDescription}</p>
                <p class="text-gray-700 mt-2">Category: ${listing.category}</p>
                <p class="text-gray-700 mt-2">Terms: ${listing.condition}</p>
                ${listing.rentPrice ? `<p class="text-gray-700 mt-2">Rent Price: $${listing.rentPrice}</p>` : ''}
                ${listing.sellPrice ? `<p class="text-gray-700 mt-2">Selling Price: $${listing.sellPrice}</p>` : ''}
                <button class="view-details mt-4 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600" id="view-details">View Details</button>
            `;

            listingsContainer.appendChild(listingElement);
});
    } catch (error) {
        console.error("Error fetching listings: ", error);
    }
    const viewDetailsButton = document.getElementById(`view-details`);
        viewDetailsButton.addEventListener('click', () => {
            // Redirect to listing-page.html with the index or a unique identifier as a query parameter
            window.location.href = `/src/listing-page.html`;
          });
}

// Load listings when the page is loaded
window.onload = loadListings;

