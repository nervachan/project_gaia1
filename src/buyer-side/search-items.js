// Import Firebase libraries
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-app.js";
import { getFirestore, collection, query, where, getDocs } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-firestore.js";

// Firebase configuration
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

// Function to load all listings
async function loadAllListings() {
    const listingsContainer = document.getElementById('listing-container');
    listingsContainer.innerHTML = '<p class="text-gray-500 text-center">Loading listings...</p>';

    try {
        // Query the "listed_items" collection for active listings
        const q = query(collection(db, 'listed_items'), where('isActive', '==', true));
        const querySnapshot = await getDocs(q);

        listingsContainer.innerHTML = ''; // Clear the container

        if (querySnapshot.empty) {
            listingsContainer.innerHTML = '<p class="text-gray-500 text-center">No active listings available.</p>';
            return;
        }

        // Loop through the documents and display each listing
        querySnapshot.forEach((doc) => {
            const listing = doc.data();
            const listingElement = createListingCard(listing);
            listingsContainer.appendChild(listingElement);
        });
    } catch (error) {
        console.error('Error loading listings:', error);
        listingsContainer.innerHTML = '<p class="text-red-500 text-center">Failed to load listings. Please try again later.</p>';
    }
}

// Function to handle search
async function handleSearch() {
    const searchInput = document.getElementById('searchInput').value.trim().toLowerCase();
    const listingsContainer = document.getElementById('listing-container');

    if (!searchInput) {
        // If search input is empty, load all listings
        loadAllListings();
        return;
    }

    listingsContainer.innerHTML = '<p class="text-gray-500 text-center">Searching...</p>';

    try {
        // Query the "listed_items" collection for active listings
        const q = query(collection(db, 'listed_items'), where('isActive', '==', true));
        const querySnapshot = await getDocs(q);

        listingsContainer.innerHTML = ''; // Clear the container

        let found = false;

        // Loop through the documents and filter results based on the search input
        querySnapshot.forEach((doc) => {
            const listing = doc.data();
            const productName = listing.productName.toLowerCase();
            const category = listing.category ? listing.category.toLowerCase() : '';

            if (productName.includes(searchInput) || category.includes(searchInput)) {
                found = true;

                const listingElement = createListingCard(listing);
                listingsContainer.appendChild(listingElement);
            }
        });

        if (!found) {
            listingsContainer.innerHTML = '<p class="text-gray-500 text-center">No listings found matching your search.</p>';
        }
    } catch (error) {
        console.error('Error searching listings:', error);
        listingsContainer.innerHTML = '<p class="text-red-500 text-center">Failed to search listings. Please try again later.</p>';
    }
}

// Function to create a listing card
function createListingCard(listing) {
    const listingElement = document.createElement('div');
    listingElement.classList.add('bg-white', 'p-4', 'rounded-lg', 'shadow-lg');

    // Check if the "images" field exists and is an array
    let image = '';
    if (listing.images && Array.isArray(listing.images) && listing.images.length > 0) {
        // Use the first image from the array
        image = `<img src="${listing.images[0]}" alt="${listing.productName}" class="w-full h-100 object-cover rounded-md">`;
    } else {
        // Fallback if no images are available
        image = `<div class="w-full h-full bg-gray-200 flex items-center justify-center rounded-md">
                    <p class="text-gray-500">No image available</p>
                 </div>`;
    }

    listingElement.innerHTML = `
        ${image}
        <h3 class="text-xl font-semibold text-gray-900 mt-4">${listing.productName}</h3>
        <p class="text-gray-700 mt-2">Category: ${listing.category || 'N/A'}</p>
        ${listing.rentPrice ? `<p class="text-gray-700 mt-2">Rent Price: $${listing.rentPrice}</p>` : ''}
        ${listing.sellPrice ? `<p class="text-gray-700 mt-2">Selling Price: $${listing.sellPrice}</p>` : ''}
        <button class="mt-4 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 view-details-btn">View Details</button>
    `;

    // Add event listener for 'View Details' button
    const viewDetailsButton = listingElement.querySelector('.view-details-btn');
    viewDetailsButton.addEventListener('click', () => {
        showListingDetails(listing);
    });

    return listingElement;
}

// Function to show listing details in a modal (reuse from load-listings.js)
function showListingDetails(listing) {
    const modal = document.getElementById('listing-modal');
    const modalTitle = document.getElementById('modal-title');
    const modalImageContainer = document.getElementById('modal-image-container');
    const modalDescription = document.getElementById('modal-description');
    const modalCategory = document.getElementById('modal-category');
    const modalRentPrice = document.getElementById('modal-rent-price');
    const modalSellPrice = document.getElementById('modal-sell-price');
    const modalFooter = document.getElementById('modal-footer'); // Footer for the buttons

    // Populate modal content
    modalTitle.innerText = listing.productName;

    // Handle images
    if (listing.images && Array.isArray(listing.images) && listing.images.length > 0) {
        if (listing.images.length === 1) {
            // Single image
            modalImageContainer.innerHTML = `
                <div class="w-full h-full overflow-hidden rounded-md">
                    <img src="${listing.images[0]}" alt="${listing.productName}" class="w-full h-full object-contain">
                </div>
            `;
        } else {
            // Carousel for multiple images
            modalImageContainer.innerHTML = `
                <div class="relative w-full h-full overflow-hidden rounded-md">
                    <div id="carousel-images" class="flex transition-transform duration-300 ease-in-out">
                        ${listing.images.map((img, index) => `
                            <div class="carousel-item w-full ${index === 0 ? 'block' : 'hidden'}">
                                <img src="${img}" alt="${listing.productName}" class="w-full h-full object-contain">
                            </div>
                        `).join('')}
                    </div>
                    <button id="prev-image" class="absolute top-1/2 left-2 transform -translate-y-1/2 bg-gray-800 text-white p-2 rounded-full">&lt;</button>
                    <button id="next-image" class="absolute top-1/2 right-2 transform -translate-y-1/2 bg-gray-800 text-white p-2 rounded-full">&gt;</button>
                </div>
            `;

            // Initialize carousel functionality
            const carousel = document.getElementById('carousel-images');
            const items = carousel.querySelectorAll('.carousel-item');
            let currentIndex = 0;

            document.getElementById('next-image').addEventListener('click', () => {
                items[currentIndex].classList.add('hidden');
                currentIndex = (currentIndex + 1) % items.length;
                items[currentIndex].classList.remove('hidden');
            });

            document.getElementById('prev-image').addEventListener('click', () => {
                items[currentIndex].classList.add('hidden');
                currentIndex = (currentIndex - 1 + items.length) % items.length;
                items[currentIndex].classList.remove('hidden');
            });
        }
    } else {
        // Fallback if no images are available
        modalImageContainer.innerHTML = `
            <div class="w-full h-auto bg-gray-200 flex items-center justify-center rounded-md">
                <p class="text-gray-500">No image available</p>
            </div>
        `;
    }

    modalDescription.innerText = listing.productDescription || 'No description available.';
    modalCategory.innerText = `Category: ${listing.category || 'N/A'}`;
    modalRentPrice.innerText = listing.rentPrice ? `Rent Price: $${listing.rentPrice}` : '';
    modalSellPrice.innerText = listing.sellPrice ? `Selling Price: $${listing.sellPrice}` : '';

    // Add Rent and View Reviews buttons to the modal footer
    modalFooter.innerHTML = `
        <div class="flex justify-between w-full">
            <button id="view-reviews-button" class="px-8 py-4 bg-blue-500 text-white text-lg font-semibold rounded-md hover:bg-blue-600">View Reviews</button>
            <button id="rent-button" class="px-8 py-4 bg-green-500 text-white text-lg font-semibold rounded-md hover:bg-green-600">Rent</button>
        </div>
    `;

    // Show the modal
    modal.classList.remove('hidden');
}

// Add event listener to the search button
document.getElementById('searchButton').addEventListener('click', handleSearch);

// Add event listener to the search input for real-time updates
document.getElementById('searchInput').addEventListener('input', (event) => {
    if (!event.target.value.trim()) {
        loadAllListings(); // Reload all listings if the search input is cleared
    }
});

// Add event listener to the search input for "Enter" key press
document.getElementById('searchInput').addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
        handleSearch(); // Trigger search when Enter is pressed
    }
});

// Load all listings on page load
loadAllListings();