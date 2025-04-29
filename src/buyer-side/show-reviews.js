// Import Firebase modules
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

// Initialize Firebase and Firestore
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Modal HTML for displaying reviews
const reviewModalHTML = `
    <div id="review-modal" class="hidden fixed inset-0 bg-gray-900 bg-opacity-50 flex justify-center items-center z-50">
        <div class="bg-white p-6 rounded-lg shadow-lg w-1/2">
            <h2 class="text-2xl font-bold" id="review-modal-title">Reviews</h2>
            <div id="review-content" class="mt-4 overflow-y-auto max-h-96">
                <p>Loading reviews...</p>
            </div>
            <button id="close-review-modal" class="mt-4 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600">Close</button>
        </div>
    </div>
`;

document.body.insertAdjacentHTML('beforeend', reviewModalHTML);

// Function to fetch and display reviews for a listing
async function showReviews(listingId) {
    const modal = document.getElementById('review-modal');
    const reviewContent = document.getElementById('review-content');
    reviewContent.innerHTML = '<p>Loading reviews...</p>';

    try {
        // Query Firestore for reviews related to this listing
        const reviewsQuery = query(collection(db, 'reviews'), where('listingId', '==', listingId));
        const reviewsSnapshot = await getDocs(reviewsQuery);

        if (!reviewsSnapshot.empty) {
            reviewContent.innerHTML = '';
            reviewsSnapshot.forEach(doc => {
                const review = doc.data();
                reviewContent.innerHTML += `
                    <div class="p-4 border-b border-gray-300">
                        <p><strong>${review.userName}:</strong> ${review.rating} ⭐</p>
                        <p>${review.comment}</p>
                    </div>
                `;
            });
        } else {
            reviewContent.innerHTML = '<p>No reviews yet.</p>';
        }
    } catch (error) {
        console.error("Error fetching reviews: ", error);
        reviewContent.innerHTML = '<p>Error loading reviews.</p>';
    }

    // Show the modal with reviews
    modal.classList.remove('hidden');
}

// Close review modal functionality
document.getElementById('close-review-modal')?.addEventListener('click', () => {
    const modal = document.getElementById('review-modal');
    modal.classList.add('hidden'); // Hide the modal when close button is clicked
});

// Modal for listing details
const listingModalHTML = `
    <div id="listing-modal" class="hidden fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-40">
        <div class="bg-white p-6 rounded-lg">
            <h2 id="modal-title" class="text-xl font-bold"></h2>
            <div id="modal-content"></div>
            <button id="view-reviews-button" class="mt-4 mr-6 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600" data-id="">
                View Reviews
            </button>
            <button id="close-modal" class="mt-4 bg-red-500 text-white px-4 py-2 rounded">Close</button>
        </div>
    </div>
`;

document.body.insertAdjacentHTML('beforeend', listingModalHTML);

// Event listener to open listing modal (for illustration purposes)
document.addEventListener('click', (event) => {
    if (event.target.classList.contains('view-details')) {
        const listingId = event.target.getAttribute('data-id'); // Assuming this is set to the listing ID
        const modal = document.getElementById('listing-modal');
        const modalTitle = document.getElementById('modal-title');
        const modalContent = document.getElementById('modal-content');
        const viewReviewsButton = document.getElementById('view-reviews-button');
        
        // Populate modal with listing details
        modalTitle.innerText = `Listing ID: ${listingId}`; // You could fetch more details like product name here
        modalContent.innerHTML = `<p>Details for listing ${listingId}</p>`; // Example content
        
        // Set data-id for the reviews button
        viewReviewsButton.setAttribute('data-id', listingId);
        
        modal.classList.remove('hidden'); // Show the listing modal
    }
});

// Close listing modal functionality
document.getElementById('close-modal')?.addEventListener('click', () => {
    const modal = document.getElementById('listing-modal');
    modal.classList.add('hidden'); // Hide the listing modal when close button is clicked
});

// Use event delegation for the "View Reviews" button
document.addEventListener('click', (event) => {
    if (event.target && event.target.id === 'view-reviews-button') {
        const listingId = event.target.getAttribute('data-id');
        showReviews(listingId); // Show reviews for the given listing
    }
});
