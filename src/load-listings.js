// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-analytics.js";
import { getFirestore, collection, query, where, getDocs ,getDoc, doc } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-firestore.js";

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


async function showListingDetails(listingId) {
    const modal = document.getElementById('listing-modal');
    const modalTitle = document.getElementById('modal-title');
    const modalContent = document.getElementById('modal-content');

    try {
        // Fetch the document from Firestore
        const listingDoc = (doc(db, 'listed items', listingId));
        const listingSnapshot = await getDoc(listingDoc);

        if (listingSnapshot.exists()) {
            const listing = listingSnapshot.data();
            modalTitle.innerText = listing.productName;
            modalContent.innerHTML = `
                <p>${listing.productDescription}</p>
                <p><strong>Category:</strong> ${listing.category}</p>
                <p><strong>Condition:</strong> ${listing.condition}</p>
                ${listing.image ? `<img src="${listing.image}" alt="${listing.productName}" class="w-full h-full object-cover rounded-md mt-4">` : ''}
                ${listing.rentPrice ? `<p><strong>Rent Price:</strong> $${listing.rentPrice}</p>` : ''}
                ${listing.sellPrice ? `<p><strong>Selling Price:</strong> $${listing.sellPrice}</p>` : ''}
            `;
            modal.classList.remove('hidden'); // Show the modal
            
        } else {
            console.error("No listing found with the provided ID.");
        }
    } catch (error) {
        console.error("Error fetching listing details: ", error);
    }

}
// Event delegation for closing the modal
document.body.addEventListener('click', (event) => {
    if (event.target.id === 'close-modal') {
        const modal = document.getElementById('listing-modal');
        modal.classList.add('hidden'); // Hide the modal
    }
});
// Add event listeners to all view details buttons
const viewDetailsButtons = document.querySelectorAll('.view-details');
viewDetailsButtons.forEach(button => {
    button.addEventListener('click', (event) => {
        const listingId = event.target.getAttribute('data-id');
        showListingDetails(listingId); // Show the modal with listing details
    });
});


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
                <button class="view-details mt-4 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600" data-id="${doc.id}">View Details</button>
            `;

            listingsContainer.appendChild(listingElement);
        });

       // Add event listeners to all view details buttons
    const viewDetailsButtons = document.querySelectorAll('.view-details');
    viewDetailsButtons.forEach(button => {
    button.addEventListener('click', (event) => {
        const listingId = event.target.getAttribute('data-id');
        showListingDetails(listingId); // Call the function to show the modal with listing details
    });
});




    } catch (error) {
        console.error("Error fetching listings: ", error);
    }
}

// Load listings when the page is loaded
window.onload = loadListings;


