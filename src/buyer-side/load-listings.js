// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-analytics.js";
import { getFirestore, collection, query, where, getDocs, getDoc, doc, addDoc } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-firestore.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-auth.js";  // Import Firebase Authentication

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
const auth = getAuth();  // Initialize Firebase Authentication

// Function to load and display listings from Firestore
async function loadListings() {
    const listingsContainer = document.getElementById('listing-container');

    // Clear the container before adding new listings
    listingsContainer.innerHTML = '<p class="text-gray-500 text-center">Loading listings...</p>';

    try {
        // Query the "listed_items" collection where "isActive" is true
        const listingsQuery = query(collection(db, 'listed_items'), where("isActive", "==", true));
        const querySnapshot = await getDocs(listingsQuery);

        // Clear the loading message
        listingsContainer.innerHTML = '';

        if (querySnapshot.empty) {
            // Show a message if no active listings are found
            listingsContainer.innerHTML = `
                <p class="text-gray-500 text-center">No active listings available at the moment.</p>
            `;
            return;
        }

        // Loop through the documents and add them to the page
        querySnapshot.forEach((doc) => {
            const listing = doc.data();
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
                <p class="text-gray-700 mt-2">Size: ${listing.garmentSize || 'N/A'}</p>
                ${listing.rentPrice ? `<p class="text-gray-700 mt-2">Rent Price: ${listing.rentPrice}/day</p>` : ''}
                ${listing.sellPrice ? `<p class="text-gray-700 mt-2">Selling Price: ${listing.sellPrice}</p>` : ''}
                <button class="mt-4 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 view-details-btn">View Details</button>
            `;

            listingsContainer.appendChild(listingElement);

            // Add event listener for 'View Details' button
            const viewDetailsButton = listingElement.querySelector('.view-details-btn');
            viewDetailsButton.addEventListener('click', () => {
                showListingDetails(listing);
            });
        });
    } catch (error) {
        console.error('Error loading listings:', error);
        listingsContainer.innerHTML = `
            <p class="text-red-500 text-center">Failed to load listings. Please try again later.</p>
        `;
    }
}

// Function to show listing details in a modal
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
    modalCategory.innerText = `Size: ${listing.garmentSize || 'N/A'}`;
    modalRentPrice.innerText = listing.rentPrice ? `Rent Price: ${listing.rentPrice}/day` : '';
    modalSellPrice.innerText = listing.sellPrice ? `Selling Price: ${listing.sellPrice}` : '';

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

// Close modal functionality
document.getElementById('close-modal').addEventListener('click', () => {
    document.getElementById('listing-modal').classList.add('hidden');
});

document.getElementById('close-modal-footer').addEventListener('click', () => {
    document.getElementById('listing-modal').classList.add('hidden');
});

// Load listings when the page is loaded
window.onload = loadListings;

// Add onAuthStateChanged listener
onAuthStateChanged(auth, (user) => {
    if (user) {
        console.log("User is logged in:", user);
        // You can update the UI to show the user is logged in, such as displaying their username or showing logout options.
    } else {
        console.log("No user is logged in.");
        // You can redirect to a login page or show login options.
    }
});
