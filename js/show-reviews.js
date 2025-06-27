// Import Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-app.js";
import { getFirestore, collection, query, where, getDocs, doc, getDoc } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-firestore.js";

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

// Show reviews using listingId
async function showReviews(listingId) {
    const modal = document.getElementById('review-modal');
    const reviewContent = document.getElementById('review-content');
    reviewContent.innerHTML = '<p class="text-gray-500">Loading reviews...</p>';

    console.log("[DEBUG] showReviews called with listingId:", listingId);

    try {
        const reviewsRef = collection(db, 'reviews');
        const reviewsQuery = query(reviewsRef, where('listingId', '==', listingId));
        console.log("[DEBUG] Running Firestore query on reviews with listingId:", listingId);

        const querySnapshot = await getDocs(reviewsQuery);
        console.log("[DEBUG] Query result - empty:", querySnapshot.empty);
        
        reviewContent.innerHTML = '';

        if (querySnapshot.empty) {
            reviewContent.innerHTML = '<p class="text-gray-500">No reviews yet for this listing.</p>';
        } else {
            querySnapshot.forEach(doc => {
                const data = doc.data();
                console.log("[DEBUG] Review data:", data);

                const userName = data.userName || "Anonymous";
                const rating = data.rating || 0;
                const comment = data.comment || "";

                const reviewHTML = `
                    <div class="p-4 border-b border-gray-300">
                        <p class="font-semibold">${userName} <span class="text-yellow-500">${'★'.repeat(rating)}${'☆'.repeat(5 - rating)}</span></p>
                        <p class="text-gray-700">${comment}</p>
                    </div>
                `;
                reviewContent.insertAdjacentHTML('beforeend', reviewHTML);
            });
        }

    } catch (error) {
        console.error("[ERROR] Failed to fetch reviews:", error);
        reviewContent.innerHTML = '<p class="text-red-500">Failed to load reviews. Please try again later.</p>';
    }

    modal.classList.remove('hidden');
}

// Close review modal
document.getElementById('close-review-modal')?.addEventListener('click', () => {
    const modal = document.getElementById('review-modal');
    modal.classList.add('hidden');
});

// Listing modal HTML
const listingModalHTML = `
    <div id="listing-modal" class="hidden fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-40">
        <div class="bg-white p-6 rounded-lg">
            <h2 id="modal-title" class="text-xl font-bold"></h2>
            <div id="modal-content"></div>
            <button id="view-reviews-button" class="mt-4 mr-6 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600" data-listingId="">
                View Reviews
            </button>
            <button id="close-modal" class="mt-4 bg-red-500 text-white px-4 py-2 rounded">Close</button>
        </div>
    </div>
`;
document.body.insertAdjacentHTML('beforeend', listingModalHTML);

// Open listing modal and attach listingId
document.addEventListener('click', async (event) => {
    if (event.target.classList.contains('view-details')) {
        const listingId = event.target.getAttribute('data-id'); // listingId from button
        console.log("[DEBUG] Clicked listing with ID:", listingId);

        const modal = document.getElementById('listing-modal');
        const modalTitle = document.getElementById('modal-title');
        const modalContent = document.getElementById('modal-content');
        const viewReviewsButton = document.getElementById('view-reviews-button');

        try {
            const listingRef = doc(db, 'listed_items', listingId);
            const listingDoc = await getDoc(listingRef);
            if (listingDoc.exists()) {
                const productName = listingDoc.data().productName || "No name";
                console.log("[DEBUG] Retrieved listing:", listingDoc.data());

                modalTitle.innerText = productName;
                modalContent.innerHTML = `<p>Details for ${productName}</p>`;
                viewReviewsButton.setAttribute('data-listingId', listingId); // Pass listingId directly
            } else {
                modalTitle.innerText = 'Listing not found';
                modalContent.innerHTML = '<p>This listing does not exist.</p>';
            }
        } catch (error) {
            console.error("[ERROR] Fetching listing details failed:", error);
        }

        modal.classList.remove('hidden');
    }
});

// Close listing modal
document.getElementById('close-modal')?.addEventListener('click', () => {
    const modal = document.getElementById('listing-modal');
    modal.classList.add('hidden');
});

// Handle View Reviews click
document.addEventListener('click', (event) => {
    if (event.target && event.target.id === 'view-reviews-button') {
        const listingId = event.target.getAttribute('data-listingId');
        console.log("[DEBUG] View Reviews clicked with listingId:", listingId);
        showReviews(listingId);
    }
});
