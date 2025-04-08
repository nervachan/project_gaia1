// Import Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-app.js";
import { getFirestore, collection, query, where, getDocs } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-firestore.js";

// Your Firebase configuration
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

// Add this modal HTML structure to your page
const reviewModalHTML = `
    <div id="review-modal" class="hidden fixed inset-0 bg-gray-900 bg-opacity-50 flex justify-center items-center">
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

// Function to fetch and display reviews
async function showReviews(listingId) {
    const modal = document.getElementById('review-modal');
    const reviewContent = document.getElementById('review-content');
    reviewContent.innerHTML = '<p>Loading reviews...</p>';

    try {
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

    modal.classList.remove('hidden');
}

// Event listener to open the review modal
document.getElementById('view-reviews-button')?.addEventListener('click', () => {
    const listingId = document.getElementById('view-reviews-button').getAttribute('data-id');
    showReviews(listingId);
});

document.getElementById('close-review-modal')?.addEventListener('click', () => {
    document.getElementById('review-modal').classList.add('hidden');
});

// Update listing modal to include data-id for reviews
const listingModalHTML = `
<div id="listing-modal" class="hidden fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
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

document.getElementById('view-reviews-button')?.addEventListener('click', () => {
    const listingId = document.getElementById('view-reviews-button').getAttribute('data-id');
    showReviews(listingId);
});
