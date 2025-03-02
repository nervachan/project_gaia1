// Import necessary functions from Firebase SDKs
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-analytics.js";
import { getFirestore, collection, query, where, getDocs, getDoc, doc, addDoc, updateDoc } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-firestore.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-auth.js";  // Import Firebase Authentication

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
const analytics = getAnalytics(app);
const db = getFirestore(app);
const auth = getAuth();  // Initialize Firebase Authentication

// Load pending items and other functionality when the page loads
window.onload = () => {
  const user = auth.currentUser;
  if (user) {
    showPendingItems(user.uid);  // Show pending items for logged-in user
  }
};

// Show pending items when the page loads
async function showPendingItems(userId) {
    const pendingItemsContainer = document.getElementById('pendingItemsContainer');
    pendingItemsContainer.innerHTML = ''; // Clear the container

    try {
        // Query the 'pending_items' collection for documents where the 'buyerId' matches the logged-in user's ID
        const pendingItemsQuery = query(collection(db, "pending_items"), where('buyerId', '==', userId));
        const pendingItemsSnapshot = await getDocs(pendingItemsQuery);

        pendingItemsSnapshot.forEach(doc => {
            const pendingData = doc.data();
            const pendingElement = createPendingItemElement(pendingData, doc.id);
            pendingItemsContainer.appendChild(pendingElement);
        });

    } catch (error) {
        console.error("Error fetching pending items: ", error);
    }
}

// Function to create pending item elements
function createPendingItemElement(pendingData, pendingId) {
    const pendingElement = document.createElement('div');
    pendingElement.classList.add('bg-white', 'p-4', 'rounded-lg', 'shadow-lg');

    pendingElement.innerHTML = `
        <h3 class="text-xl font-semibold text-gray-900">${pendingData.productName}</h3>
        <p class="text-gray-600 mt-2">${pendingData.productDescription}</p>
        <p class="text-gray-700 mt-2">Start Date: ${pendingData.startDate}</p>
        <p class="text-gray-700 mt-2">End Date: ${pendingData.endDate}</p>
        <p class="text-gray-700 mt-2">Price: ₱${pendingData.totalPrice}</p>
        <p class="text-gray-700 mt-2">Status: ${pendingData.status}</p>
        ${pendingData.status === 'returned' ? `
            <button class="leave-review bg-blue-500 text-white px-4 py-2 rounded-lg mt-4" data-id="${pendingId}">Leave a Review</button>
        ` : ''}
    `;

    return pendingElement;
}

// Event listener for review button click
document.body.addEventListener('click', async (event) => {
    if (event.target.classList.contains('leave-review')) {
        const pendingId = event.target.getAttribute('data-id');
        openReviewModal(pendingId); // Open the review modal for this pending item
    } else if (event.target.id === 'submitReview') {
        await handleReviewSubmission(); // Handle the review submission
    } else if (event.target.id === 'close-review') {
        closeModal('reviewModal'); // Close the review modal
    }
});

// Function to open the review modal
async function openReviewModal(pendingId) {
    const modal = document.getElementById('reviewModal');
    const reviewText = document.getElementById('reviewText');
    const ratingInput = document.getElementById('ratingInput');

    try {
        // Fetch pending item data from pending items collection
        const pendingDoc = doc(db, 'pending_items', pendingId);
        const pendingSnapshot = await getDoc(pendingDoc);

        if (pendingSnapshot.exists()) {
            const pendingData = pendingSnapshot.data();
            // Populate modal fields with pending item data
            document.getElementById('reviewProductName').innerText = pendingData.productName;
            reviewText.value = '';
            ratingInput.value = 5; // Default rating

            // Show the modal
            modal.classList.remove('hidden');
        } else {
            console.error("No pending item found with the provided ID.");
        }
    } catch (error) {
        console.error("Error fetching pending item details for review: ", error);
    }
}

// Function to handle review submission
async function handleReviewSubmission() {
    const user = auth.currentUser;
    if (!user) {
        alert("You must be logged in to submit a review.");
        return;
    }

    const reviewText = document.getElementById('reviewText').value;
    const rating = document.getElementById('ratingInput').value;
    const pendingId = document.getElementById('reviewProductName').getAttribute('data-id');

    if (!reviewText || !rating) {
        alert("Please fill in all fields.");
        return;
    }

    try {
        // Save the review to the "reviews" collection
        await addDoc(collection(db, "reviews"), {
            pendingId: pendingId,
            userId: user.uid,
            reviewText: reviewText,
            rating: parseInt(rating),
            timestamp: new Date().toISOString(),
        });

        // Update the pending item's status to 'reviewed'
        const pendingDoc = doc(db, "pending_items", pendingId);
        await updateDoc(pendingDoc, { status: 'reviewed' }); // Mark as reviewed

        alert("Your review has been submitted successfully!");

        // Close the review modal
        closeModal('reviewModal');
    } catch (error) {
        console.error("Error submitting review: ", error);
        alert("There was an error submitting your review. Please try again.");
    }
}

// Utility function to close modals
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    modal.classList.add('hidden');
}

// Add onAuthStateChanged listener
onAuthStateChanged(auth, (user) => {
    if (user) {
        console.log("User is logged in:", user);
        showPendingItems(user.uid);  // Show pending items for logged-in user
    } else {
        console.log("No user is logged in.");
    }
});

// Wait for the DOM to be ready before executing the script
document.addEventListener('DOMContentLoaded', () => {
    // Initialize Firebase and authentication
    const user = auth.currentUser;
    if (user) {
        showPendingItems(user.uid);  // Show pending items for logged-in user
    }
});
