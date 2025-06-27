// Import the necessary Firebase SDKs
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-auth.js";
import { getFirestore, collection, query, where, getDocs, getDoc, doc, addDoc, setDoc } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-firestore.js";

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
const db = getFirestore(app);
const auth = getAuth(app);

// Load listings when the page is loaded
window.onload = loadListings;

// Function to load and display listings from Firestore
async function loadListings() {
    const listingsContainer = document.getElementById('listing-container');
    listingsContainer.innerHTML = ''; // Clear the container

    try {
        const listingsQuery = query(collection(db, 'listed_items'), where('isActive', '==', true));
        const listingsSnapshot = await getDocs(listingsQuery);

        listingsSnapshot.forEach(doc => {
            const listing = doc.data();
            const listingElement = createListingElement(listing, doc.id);
            listingsContainer.appendChild(listingElement);
        });

    } catch (error) {
        console.error("Error fetching listings: ", error);
    }
}

// Function to create a listing element
function createListingElement(listing, listingId) {
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
            <button class="view-details bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600" data-id="${listingId}">View Details</button>
            ${createActionButton(listing, listingId)} <!-- Correctly passing listingId here -->
        </div>
    `;

    return listingElement;
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

// Show listing details modal
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

document.body.addEventListener('click', (event) => {
    if (event.target.classList.contains('view-details')) {
        const listingId = event.target.getAttribute('data-id');
        showListingDetails(listingId);
    } else if (event.target.classList.contains('rent-button')) {
        const listingId = event.target.getAttribute('data-id');
        if (listingId) {
            openRentalModal(listingId); // Pass the listing ID to the modal function
        }
    } else if (event.target.id === 'close-modal') {
        closeModal('listing-modal');
    } else if (event.target.id === 'submitRental') {
        handleRentalSubmission();
    } else if (event.target.id === 'close-rent') {
        closeModal('rentModal');
    }
});

// Global variable to store the currently selected listing
let currentListing = null;

// Function to handle rental submission
async function handleRentalSubmission() {
    const user = auth.currentUser; // Get the current logged-in user

    if (!user) {
        alert("Please log in first.");
        return;
    }

    const userName = document.getElementById('userName').value;
    const startDate = document.getElementById('rentalStartDate').value;
    const endDate = document.getElementById('rentalEndDate').value;
    const price = document.getElementById('rentalPrice').value;
    const submissionTime = new Date().toISOString();

    // Validate form data
    if (!userName || !startDate || !endDate || !price) {
        alert("Please fill in all required fields.");
        return;
    }

    if (!currentListing) {
        alert("Unable to process request. Listing information is missing.");
        return;
    }

    const rentalData = {
        productName: currentListing.productName,
        productDescription: currentListing.productDescription,
        userName: userName,
        startDate: startDate,
        endDate: endDate,
        price: price,
        submissionTime: submissionTime,
        listingId: currentListing.id, // Store the listingId for reference
    };

    try {
        // Store the rental request in a subcollection under the current user's document
        const rentalRequestsRef = collection(db, 'users', user.uid, 'rental_requests');
        await addDoc(rentalRequestsRef, rentalData);

        alert("Your rental request has been submitted successfully!");
        closeModal('rentModal');
    } catch (error) {
        console.error("Error submitting rental request: ", error);
        alert("There was an error submitting your request. Please try again.");
    }
}

// Function to open the rental modal
async function openRentalModal(listingId) {
    const modal = document.getElementById('rentModal');

    try {
        const listingDoc = doc(db, 'listed_items', listingId);
        const listingSnapshot = await getDoc(listingDoc);

        if (listingSnapshot.exists()) {
            currentListing = { ...listingSnapshot.data(), id: listingId };
            document.getElementById('userName').value = '';
            document.getElementById('rentalPrice').value = currentListing.rentPrice;
            document.getElementById('totalPrice').innerText = '₱0.00';

            modal.classList.remove('hidden');
        }
    } catch (error) {
        console.error("Error fetching listing details: ", error);
    }
}

// Utility functions
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    modal.classList.add('hidden');
}

// Event listeners for date and price changes
document.getElementById('rentalStartDate').addEventListener('change', calculateTotalPrice);
document.getElementById('rentalEndDate').addEventListener('change', calculateTotalPrice);
document.getElementById('rentalPrice').addEventListener('input', calculateTotalPrice);

function calculateTotalPrice() {
    const startDateInput = document.getElementById('rentalStartDate').value;
    const endDateInput = document.getElementById('rentalEndDate').value;
    const pricePerDayInput = document.getElementById('rentalPrice').value;

    if (startDateInput && endDateInput) {
        const startDate = new Date(startDateInput);
        const endDate = new Date(endDateInput);
        const timeDiff = endDate - startDate;
        const daysDiff = timeDiff / (1000 * 3600 * 24);

        if (daysDiff >= 0) {
            const totalPrice = daysDiff * parseFloat(pricePerDayInput);
            document.getElementById('totalPrice').innerText = `₱${totalPrice.toFixed(2)}`;
        } else {
            document.getElementById('totalPrice').innerText = '₱0.00';
        }
    }
}