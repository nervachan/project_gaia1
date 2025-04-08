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

    // Check if the images field exists and is an array
    let image = '';
    if (listing.images && Array.isArray(listing.images) && listing.images.length > 0) {
        // Use the first image from the array
        image = `<img src="${listing.images[0]}" alt="${listing.productName}" class="w-full h-48 object-cover rounded-md">`;
    }

    listingElement.innerHTML = `
        ${image}
        <h3 class="text-xl font-semibold text-gray-900 mt-4">${listing.productName}</h3>
        <p class="text-gray-600 mt-2">${listing.productDescription}</p>
        <p class="text-gray-700 mt-2">Category: ${listing.category}</p>
        <p class="text-gray-700 mt-2">Size: ${listing.garmentSize}</p>
        ${listing.rentPrice ? `<p class="text-gray-700 mt-2">Rent Price: ₱${listing.rentPrice}</p>` : ''}
        ${listing.sellPrice ? `<p class="text-gray-700 mt-2">Selling Price: ₱${listing.sellPrice}</p>` : ''}
        <div class="mt-4">
            <button class="view-details bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600" data-id="${listingId}">View Details</button>
            <button class="rent-button bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 ml-2" data-id="${listingId}">Rent</button>
        </div>
    `;

    return listingElement;
}

// Function to create action buttons based on listing condition
function createActionButton(listing, listingId) {
    if (listing.condition === 'rent') {
        return `<button class="rent-button bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 ml-2" data-id="${listingId}">Rent</button>`;
    }
    return '';
}


// Show listing details modal
async function showListingDetails(listingId) {
    const modal = document.getElementById('listing-modal');
    const modalTitle = document.getElementById('modal-title');
    const modalContent = document.getElementById('modal-content');

    try {
        // Fetch the listing document from Firestore
        const listingDoc = doc(db, 'listed_items', listingId);
        const listingSnapshot = await getDoc(listingDoc);

        if (listingSnapshot.exists()) {
            const listing = listingSnapshot.data();
            modalTitle.innerText = listing.productName;

            // Debugging: Check the images content
            console.log("Listing Images:", listing.images); // Assuming "images" is the field

            // Fetch the images: If it's a single image, convert it into an array
            const images = Array.isArray(listing.images) ? listing.images : [listing.images];

            let imagesHtml = '';

            // Check if there are multiple images, create a carousel
            if (images.length > 1) {
                imagesHtml = `
                    <div class="relative">
                        <div class="overflow-hidden relative">
                            <div class="flex transition-transform duration-300 ease-in-out" id="carousel-${listingId}">
                                ${images.map((img, index) => `
                                    <div class="carousel-item w-full ${index === 0 ? 'block' : 'hidden'}">
                                        <img src="${img}" alt="${listing.productName}" class="w-full h-96 object-cover rounded-md">
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                        <button class="absolute top-1/2 left-0 transform -translate-y-1/2 bg-gray-800 text-white p-2 rounded-full cursor-pointer" id="prev-${listingId}">&lt;</button>
                        <button class="absolute top-1/2 right-0 transform -translate-y-1/2 bg-gray-800 text-white p-2 rounded-full cursor-pointer" id="next-${listingId}">&gt;</button>
                    </div>
                `;
            } else if (images.length === 1) {
                // If only one image, display it normally
                imagesHtml = `
                    <img src="${images[0]}" alt="${listing.productName}" class="w-full h-96 object-cover rounded-md">
                `;
            }

            modalContent.innerHTML = `
                <p>${listing.productDescription}</p>
                <p><strong>Category:</strong> ${listing.category}</p>
                ${imagesHtml}
                ${listing.rentPrice ? `<p><strong>Rent Price:</strong> ₱${listing.rentPrice}</p>` : ''}
                ${listing.sellPrice ? `<p><strong>Selling Price:</strong> ₱${listing.sellPrice}</p>` : ''}
            `;

            // Initialize carousel logic if multiple images
            if (images.length > 1) {
                const prevButton = document.getElementById(`prev-${listingId}`);
                const nextButton = document.getElementById(`next-${listingId}`);
                const carousel = document.getElementById(`carousel-${listingId}`);
                const items = carousel.querySelectorAll('.carousel-item');
                let currentIndex = 0;

                // Show next item
                nextButton.addEventListener('click', () => {
                    currentIndex = (currentIndex + 1) % items.length;
                    updateCarousel();
                });

                // Show previous item
                prevButton.addEventListener('click', () => {
                    currentIndex = (currentIndex - 1 + items.length) % items.length;
                    updateCarousel();
                });

                function updateCarousel() {
                    items.forEach((item, index) => {
                        item.classList.toggle('block', index === currentIndex);
                        item.classList.toggle('hidden', index !== currentIndex);
                    });
                }
            }

            // Show the modal
            modal.classList.remove('hidden');
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
        console.log("View details clicked for listing ID:", listingId); // Debug log
        showListingDetails(listingId);
    } else if (event.target.classList.contains('rent-button')) {
        const listingId = event.target.getAttribute('data-id');
        console.log("Rent button clicked for listing ID:", listingId); // Debug log
        if (listingId) {
            openRentalModal(listingId); // Pass the listing ID to the modal function
        } else {
            console.error("Listing ID not found on Rent button.");
        }
    
    } 
    else if (event.target.classList.contains('view-reviews-button')){
        window.location.href = `/src/buyer-side/reviews.html`;
        console.log("clicked reviews");
    }
    else if (event.target.id === 'close-modal') {
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
    // Get the logged-in user
    const user = auth.currentUser;
    if (!user) {
        alert("You must be logged in to submit a rental request.");
        return;
    }

    // Get data from the form
    const userName = document.getElementById('userName').value; // Get the user's name
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

    // Get the seller's ID from the current listing
    const sellerId = currentListing.sellerId;

    // Calculate total price based on rental duration
    const startDateObj = new Date(startDate);
    const endDateObj = new Date(endDate);
    const timeDiff = endDateObj - startDateObj; // Difference in milliseconds
    const daysDiff = timeDiff / (1000 * 3600 * 24); // Convert to days

    if (daysDiff <= 0) {
        alert("End date must be after the start date.");
        return;
    }

    const totalPrice = daysDiff * parseFloat(price); // Total price based on the days rented

    // Get the images of the listing
    const images = currentListing.images || [];  // Fallback to empty array if no images

    // Prepare rental data
    const rentalData = {
        productName: currentListing.productName,
        productDescription: currentListing.productDescription,
        userName: userName,
        startDate: startDate,
        endDate: endDate,
        price: price,
        totalPrice: totalPrice.toFixed(2), // Store the total price
        submissionTime: submissionTime,
        listingId: currentListing.id, // Store the listingId for reference
        buyerId: user.uid, // Store the logged-in user's ID
        sellerId: sellerId, // Add the seller's ID to the rental data
        status: "pending",
        images: images  // Include the images in the rental data
    };

    try {
        // Push the rental data to the "pending_items" collection
        await addDoc(collection(db, "pending_items"), rentalData);
        alert("Your rental request has been submitted successfully!");

        // Close the modal after submission
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
            currentListing = { ...listingSnapshot.data(), id: listingId }; // Store the current listing
            console.log("Fetched listing:", currentListing);

            // Populate the modal fields
            document.getElementById('userName').value = ''; // Clear the name input
            document.getElementById('rentalPrice').value = currentListing.rentPrice; // Set the price per day
            document.getElementById('totalPrice').innerText = '₱0.00'; // Reset total price

            // Show the modal
            modal.classList.remove('hidden');
        } else {
            console.error("No listing found with the provided ID.");
        }
    } catch (error) {
        console.error("Error fetching listing details: ", error);
    }
}

// Event listener for form submission
document.getElementById('rentalForm').addEventListener('submit', async function (event) {
    event.preventDefault(); // Prevent default form submission
    await handleRentalSubmission(); // Call the submission handler
});

// Utility functions
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    modal.classList.add('hidden');
}

// Calculate total price
function calculateTotalPrice() {
    const startDateInput = document.getElementById('rentalStartDate').value;
    const endDateInput = document.getElementById('rentalEndDate').value;
    const pricePerDayInput = document.getElementById('rentalPrice').value;

    if (startDateInput && endDateInput) {
        const startDate = new Date(startDateInput);
        const endDate = new Date(endDateInput);
        const timeDiff = endDate - startDate; // Difference in milliseconds
        const daysDiff = timeDiff / (1000 * 3600 * 24); // Convert to days

        if (daysDiff >= 0) {
            const totalPrice = daysDiff * parseFloat(pricePerDayInput);
            document.getElementById('totalPrice').innerText = `₱${totalPrice.toFixed(2)}`;
        } else {
            document.getElementById('totalPrice').innerText = '₱0.00'; // Reset if dates are invalid
        }
    }
}

// Event listeners for date and price changes
document.getElementById('rentalStartDate').addEventListener('change', calculateTotalPrice);
document.getElementById('rentalEndDate').addEventListener('change', calculateTotalPrice);
document.getElementById('rentalPrice').addEventListener('input', calculateTotalPrice);

// Initialize Flatpickr
document.addEventListener('DOMContentLoaded', function () {
    flatpickr("#rentalStartDate", {
        dateFormat: "Y-m-d",
        onChange: calculateTotalPrice,
    });

    flatpickr("#rentalEndDate", {
        dateFormat: "Y-m-d",
        onChange: calculateTotalPrice,
    });
});

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
