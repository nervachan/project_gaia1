// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-analytics.js";
import { getFirestore, collection, query, where, getDocs, getDoc, doc } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-firestore.js";

// Your web app's Firebase configuration
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

// Function to fetch seller name
async function getSellerName(sellerId) {
    let sellerName = 'N/A';
    if (sellerId) {
        const sellerDocRef = doc(db, 'user-seller', sellerId);
        const sellerDocSnap = await getDoc(sellerDocRef);
        if (sellerDocSnap.exists()) {
            const sellerData = sellerDocSnap.data();
            sellerName = sellerData.shopname || 'N/A';
        } else {
            console.warn('Seller document not found for ID:', sellerId);
        }
    }
    return sellerName;
}

// Function to create action buttons based on listing condition
function createActionButton(listing, listingId) {
    if (listing.condition === 'rent') {
        return `<button class="rent-button bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 ml-2" data-id="${listingId}">Rent</button>`;
    } else if (listing.condition === 'sale') {
        return `<button class="buy-button bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600 ml-2">Buy</button>`;
    } else if (listing.condition === 'rent or sale') {
        return `<button class="buy-button bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600 ml-2">Rent or Buy</button>`;
    }
    return '';
}

// Load listings when the page is loaded
window.onload = loadListings;

// Function to load and display listings from Firestore
async function loadListings() {
    const listingsContainer = document.getElementById('listing-container');
    listingsContainer.innerHTML = ''; // Clear the container

    try {
        const listingsQuery = query(collection(db, 'listed_items'), where('isActive', '==', true));
        const listingsSnapshot = await getDocs(listingsQuery);

        for (const doc of listingsSnapshot.docs) {
            const listing = doc.data();
            const sellerName = await getSellerName(listing.sellerId);
            const listingElement = createListingElement(listing, doc.id, sellerName);
            listingsContainer.appendChild(listingElement);
        }

    } catch (error) {
        console.error("Error fetching listings: ", error);
    }
}

// Function to create a listing element
function createListingElement(listing, listingId, sellerName) {
    const listingElement = document.createElement('div');
    listingElement.classList.add('bg-white', 'p-4', 'rounded-lg', 'shadow-lg');

    const image = listing.image ? `<img src="${listing.image}" alt="${listing.productName}" class="w-full h-48 object-cover rounded-md">` : '';

    listingElement.innerHTML = `
        ${image}
        <h3 class="text-xl font-semibold text-gray-900 mt-4">${listing.productName}</h3>
        <p class="text-gray-600 mt-2">${listing.productDescription}</p>
        <p class="text-gray-700 mt-2">Category: ${listing.category}</p>
        <p class="text-gray-700 mt-2">Seller: ${sellerName}</p>
        <p class="text-gray-700 mt-2">Terms: ${listing.condition}</p>
        ${listing.rentPrice ? `<p class="text-gray-700 mt-2">Rent Price: ₱${listing.rentPrice}</p>` : ''}
        ${listing.sellPrice ? `<p class="text-gray-700 mt-2">Selling Price: ₱${listing.sellPrice}</p>` : ''}
        <div class="mt-4">
            <button class="view-details bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600" data-id="${listingId}">View Details</button>
            ${createActionButton(listing, listingId)} <!-- Rent or Buy button here -->
        </div>
    `;

    return listingElement;
}

// Event listener for button clicks
document.body.addEventListener('click', (event) => {
    if (event.target.classList.contains('view-details')) {
        const listingId = event.target.getAttribute('data-id');
        console.log("View details clicked for listing ID:", listingId);
        showListingDetails(listingId);
    } else if (event.target.classList.contains('rent-button') || event.target.classList.contains('buy-button')) {
        const listingId = event.target.getAttribute('data-id');
        console.log("Rent or Buy button clicked for listing ID:", listingId);

        // Simply alert the user that they need to log in to proceed
        alert("You must be logged in to rent or buy an item.");
        window.location.href = '/login'; // Optionally redirect to login page
    }
});

// Function to show listing details
async function showListingDetails(listingId) {
    const modal = document.getElementById('listing-modal');
    const modalTitle = document.getElementById('modal-title');
    const modalContent = document.getElementById('modal-content');

    try {
        const listingDoc = doc(db, 'listed_items', listingId);
        const listingSnapshot = await getDoc(listingDoc);

        if (listingSnapshot.exists()) {
            const listing = listingSnapshot.data();
            modalTitle.innerText = listing.productName;
            modalContent.innerHTML = `
                <p>${listing.productDescription}</p>
                <p><strong>Category:</strong> ${listing.category}</p>
                <p><strong>Condition:</strong> ${listing.condition}</p>
                ${listing.image ? `<img src="${listing.image}" alt="${listing.productName}" class="w-full h-96 object-cover rounded-md mt-4">` : ''}
                ${listing.rentPrice ? `<p><strong>Rent Price:</strong> ₱${listing.rentPrice}</p>` : ''}
                ${listing.sellPrice ? `<p><strong>Selling Price:</strong> ₱${listing.sellPrice}</p>` : ''}
            `;
            modal.classList.remove('hidden'); // Show the modal
        } else {
            console.error("No listing found with the provided ID.");
        }
    } catch (error) {
        console.error("Error fetching listing details: ", error);
    }
}

// Function to close modal
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    modal.classList.add('hidden');
}
